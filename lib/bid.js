const _ = require('lodash');
const ip = require('ip');
const {v4: uuidv4} = require('uuid');
const {Message} = require('messagelib');
const axios = require('axios');
const {DateTime} = require('luxon');
const { logger } = require('../logger');
const db = require('./db');
const redis = require('./redis');
const {round, nextBid} = require('../../common/BidIncrements');
const sanitize = require('../../common/sanitize');
const error = require('../../common/Error');
// const { FileFront } = require('../../common/FileFront');

const buildItemInfo = require('./buildItemInfo');


const isTheSellerAlsoTheBidderProm = (bidObj, item) => {

    if (item.seller === bidObj.customer) {
        const sql = `INSERT INTO tblSellerBidAttempts
            (auction, item, seller, current, max)
            VALUES (:auction, :item, :customer, :current, :maximum)`;
        let replacements = _.pick(bidObj, ['auction', 'item', 'customer', 'current', 'maximum']);
        return db
            .query({ sql, namedPlaceholders: true}, replacements)
            .catch((error) => {
                logger.info('isBidderSeller', { bidObj: { ...bidObj }, error: 'Error inserting record into database' });
                console.error('isTheSellerAlsoTheBidder', error);
                return {error}
            })
            .then((res) => {
                if (res.error) {
                    logger.info('isBidderSeller', { bidObj: { ...bidObj }, error: 'Error inserting to tblSellerBidAttempts' });
                    console.error('Error inserting to tblSellerBidAttempts', res.error);
                }
                logger.info('isBidderSeller', { bidObj: { ...bidObj }, error: 'You cannot bid on an item when you are the seller!' });
                throw new Error('You cannot bid on an item when you are the seller!');
            });
    }
    logger.info('isBidderSeller', { bidObj: { ...bidObj } });
    return Promise.resolve(false);
};

const getBidderProfileProm = (customer, bidObj = null) => {
    const accountId = customer;
    const sql = `SELECT bp.*
                 FROM BidProfile bp
                 INNER JOIN BidStatus bs ON bp.statusId = bs.id
                 WHERE bp.accountId = :accountId
                     AND bp.authorizedLimit > 0
                     AND bp.disabledDate IS NULL
                     AND bs.allowBidding = 'T'
                 ORDER BY bp.id
                 LIMIT 1`;
    return db
        .query({ sql, namedPlaceholders: true}, {accountId})
        .then((results) => {
            if (results.length !== 1) {
                throw new Error('Not Authorized');
            }
            logger.info('getBidderProfile', { bidObj: { ...bidObj } });
            return results[0];
        })
        .catch((error) => {
            logger.info('getBidderProfile', { bidObj: { ...bidObj }, error: 'Not Authorized' });
            throw new Error('Not Authorized');
        });
};


const getItemInfo = (item, auction) => {
    const query = `SELECT
        bids.id AS bids_id,
        bids.customer AS bids_customer,
        bids.current AS bids_current,
        bids.maximum AS bids_maximum,
        UNIX_TIMESTAMP(bids.date) AS bids_timestamp,
        bids.del AS bids_del,
        ti.item AS ti_item,
        ti.auction AS ti_auction,
        ti.seller AS ti_seller,
        UNIX_TIMESTAMP(ti.endtime) AS ti_endtime,
        ti.startingBid AS ti_starting_bid,
        ti.closing AS ti_closing,
        ti.closed AS ti_closed,
        ti.halted AS ti_halted,
        ti.group_id as group_id,
        ti.halted_message AS ti_halted_message,
        UNIX_TIMESTAMP(ta.endtime) AS ta_endtime,
        ta.curdir AS ta_curdir,
        ta.extend AS ta_extend,
        ta.stagger AS ta_stagger
    FROM tblInventory ti
        INNER JOIN tblAuctions ta
            ON ta.auction = ti.auction
        LEFT JOIN tblGlobalEntries bids
            ON bids.auction = ti.auction
            AND bids.item = ti.item
    WHERE
        ti.auction = :auction AND ti.item = :item
    ORDER BY bids_id`;
    return db.query({sql: query, namedPlaceholders: true}, {auction, item}).then((results) => {
        if (results.length === 0) {
            throw new Error('Item not found.');
        }
        return {
            rawResults: results,
            itemInfo: buildItemInfo(results),
            
            auctionInfo: {
                curdir: results[0].ta_curdir,
                extend: results[0].ta_extend
            }
        };
    })
        .catch((error) => {
            console.error('getItemInfo', error);
            throw error;
        });
};

const addBidToRawResults = (bidObj, rawResults) => {
    const newBid = {
        ...rawResults[0],
        bids_id: bidObj.id,
        bids_customer: bidObj.customer,
        bids_current: bidObj.current,
        bids_maximum: bidObj.maximum,
        bids_timestamp: bidObj.date.toFormat('X').toString(),
        bids_del: 0
    };
    if (rawResults.length === 1 && _.isNull(rawResults[0].bids_id)) {
        return [newBid];
    }
    logger.info('addBidToRawResults', { bidObj: { ...bidObj }, rawResults: { ..._.omit(rawResults, 'meta') } });
    return [...rawResults, newBid];
};

const validateBidData = (params, uuid = null) => {
    
    let {currentBid, bid, maxBid, max} = params;
    currentBid = currentBid || bid;
    maxBid = maxBid || max;

    const bidObj = {
        auction: _.toUpper(_.get(params, 'auction')), // Check for empty strings at some point
        current: currentBid ? round(parseFloat(currentBid)) : 0,
        maximum: maxBid ? round(parseFloat(maxBid)) : 0,
        customer: _.toSafeInteger(_.get(params, 'accountId')),
        item: _.toString(_.get(params, 'item') || _.get(params, 'icn')),
        date: DateTime.local(),
    };

    if (bidObj.current == 0 && bidObj.maximum == 0) {
        throw new error.BadRequest('Please provide a bid or max bid');
    }

    let sanIp = 0;
    if (_.get(params, 'headers') || _.get(params, 'ips') || _.get(params, 'ip')) {
        
        sanIp =
            sanitize.ip_address(params.headers['x-forwarded-for']) ||
            ip.toLong(_.last(params.ips) || params.ip);
    }
    bidObj.ip = sanIp !== 0 ? ip.toLong(sanIp) : sanIp;
    
    if (
        !bidObj.customer ||
        !bidObj.auction ||
        !bidObj.item ||
        !(bidObj.current || bidObj.maximum)
    ) {
        //TODO: confirm bidObj representation
        const err = {
            required: ['customer', 'auction', 'item', 'bid or max'],
            received: bidObj
        };
        logger.info('bidValidated', { bidObj: { ...bidObj }, uuid, error: 'Missing required parameters' });
        throw new error.BadRequest('Missing required parameters', err);
    }
    logger.info('bidValidated', { bidObj: { ...bidObj }, uuid });
    return bidObj;
};

const maybeUpdateItemAndGroupsEndtime = (bidObj, itemInfo, auctionInfo) => {
    // console.log(bidObj)
    const {group_id} = itemInfo;
    const extendTime = auctionInfo.extend;
    let currentmax = 0;

    _.forEach(itemInfo.bidorder, (value) => {
        if (bidObj.customer.toString() == value.bidder && currentmax < parseInt(value.bid_amount)) {
            currentmax = parseInt(value.bid_amount);
        }
    });

    const maxRaise =
        bidObj.current === 0 && bidObj.maximum > 0 && currentmax && bidObj.customer == itemInfo.maxbidder
            ? true
            : false;

    if (maxRaise) {
        return Promise.resolve(false);
    }

    const update_uuid = uuidv4();

    let query;
    let replacements;
    if (group_id && group_id > 0) {
        query = 'UPDATE tblInventory SET endtime = DATE_ADD(NOW(), INTERVAL ? MINUTE), update_uuid = ? WHERE auction = ? AND (item = ?' +
            ' OR group_id = ?) AND NOW() >= DATE_SUB(endtime, INTERVAL ? MINUTE) AND NOW() < endtime';
        replacements = [extendTime, update_uuid, bidObj.auction, bidObj.item, group_id, extendTime];
    } else {
        query = 'UPDATE tblInventory SET endtime = DATE_ADD(NOW(), INTERVAL ? MINUTE), update_uuid = ? WHERE auction = ? AND item = ?' +
            ' AND NOW() >= DATE_SUB(endtime, INTERVAL ? MINUTE) AND NOW() < endtime';
        replacements = [extendTime, update_uuid, bidObj.auction, bidObj.item, extendTime];
    }

    return db.query(query, replacements)
        .then((resp) => {
            if (!maxRaise && itemInfo.closing
                && resp.affectedRows === 0) {
                throw new Error("Item is closed");
            }
            const requery =
                'SELECT `auction`, `item`, UNIX_TIMESTAMP(`endtime`) AS `endtime` FROM `tblInventory` WHERE `update_uuid` = ? AND `update_uuid` IS NOT NULL';
            return db.query(requery, [update_uuid]);
        })
        .then((updatedItems) => {
            return Promise.all(
                _.map(updatedItems, (item) => {
                    return Promise.all([
                        axios.post(
                            `http://localhost:4550/workspace/${item.auction}/item/${item.item}/extend`
                        ),
                        new Message('item_service', 'item.extend', item).send()
                    ]);
                })
            );
        })
        .then(() => {
            logger.info('updateItemEndtimes', { bidObj: { ...bidObj }, itemInfo: { ..._.omit(itemInfo, 'meta') }, auctionInfo: { ..._.omit(auctionInfo, 'meta') } });
            return true;
        });
};

const insertBidDB = (bidObj) => {
    const insert = `INSERT INTO tblGlobalEntries
        (auction, item, customer, current, maximum, date, ip)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // TODO: assess using db date
    const replacements = [bidObj.auction, bidObj.item, bidObj.customer, bidObj.current, bidObj.maximum, bidObj.date.toISO(), bidObj.ip];
    return db.query(insert, replacements)
        .then((res) => {
            if (_.get(res,'insertId')) {
                logger.info('bidInserted', { bidObj: { ...bidObj } });
                return res;
            } else {
                logger.info('bidInserted', { bidObj: { ...bidObj }, error: 'insertBidDB failed' });
                throw new Error('insertBidDB failed')
            }
        })
        .catch(error => {
            console.error('insertBidDB error: ', error);
            throw error;
        });
};

const updateItemCurrentBid = (bidObj, itemInfo) => {
    const update = `UPDATE tblInventory SET current_bid = ? WHERE auction = ? AND item = ?`;
    const replacements = [itemInfo.current, bidObj.auction, bidObj.item];
    return db.query(update, replacements)
        .then(() => {
            logger.info('bidUpdated', { bidObj: { ...bidObj } });
            return true;
        })
        .catch(error => {
            logger.info('bidUpdated', { bidObj: { ...bidObj }, error: 'Unable to update current bid' });
            console.error('updateItemCurrentBid', error);
            throw error;
        });
};

const hasAcceptedTermsProm = (bidObj) => {
    const accountId = bidObj.customer;
    const {auction} = bidObj;

    const sql = `SELECT id
            FROM tblParticipation
            WHERE customer = ?
            AND auction = ?`;
    return db.query(sql, [accountId, auction])
        .then((results) => {
            if (!results) {
                logger.info('acceptedTerms', { bidObj: { ...bidObj }, error: 'Problem trying to validate acceptance of terms' });
                throw new Error('Problem trying to validate acceptance of terms');
            }
            if (results.length < 1 ) {
                logger.info('acceptedTerms', { bidObj: { ...bidObj }, error: 'Terms must be accepted' });
                throw new Error('Terms must be accepted');
            }
            logger.info('acceptedTerms', { bidObj: { ...bidObj } });
            return true;
        });
};

const isBidValid = (bidObj, item, rawResults) => {
    if (_.max([bidObj.current, bidObj.maximum]) < item.nextbid) {
	throw new Error('Bid must be >= ' + item.nextbid);
    }

    // rawResults should already be sorted from the sql query that gets this data
    let myMaxBids = _.filter(
        rawResults,
        b => (b.bids_customer == bidObj.customer && b.bids_maximum > 0 && (b.bids_del === 0 || b.bids_del === 1))
    )

    let myPrevMax = 0;
    let myMaxPrevObj = {};

    if (myMaxBids) {
        myMaxPrevObj= _.maxBy(myMaxBids, bid => bid.bids_maximum) || {}; // grab the MAX max bid

        if (myMaxPrevObj.bids_maximum) {
            myPrevMax = myMaxPrevObj.bids_maximum;
        }
    
    }
    if (bidObj.current > 0 && bidObj.current < item.nextbid && bidObj.maximum > item.nextbid) {
	bidObj.current = 0;
    }
    if (bidObj.current === 0) {
        if (bidObj.customer === parseInt(item.maxbidder)) {
            bidObj.current = 0;
        } else {
            bidObj.current = _.max([parseFloat(item.nextbid), 10]);
        }
    }

    if (bidObj.maximum && bidObj.maximum < myPrevMax) {
        logger.info('validBid', { bidObj: { ...bidObj }, error: `Your max bid must be greater than your current max bid of $${ myPrevMax }.` });
        throw new Error(`Your max bid must be greater than your current max bid of $${myPrevMax}.`);
    }
    if ((bidObj.current || 0) < item.nextbid && (bidObj.maximum || 0) < item.nextbid) {
        logger.info('validBid', { bidObj: { ...bidObj }, error: `Bid must be >= ${ item.nextbid }` });
        throw new Error('Bid must be >= ' + item.nextbid);
    } else {
        logger.info('validBid', { bidObj: { ...bidObj }, itemObj: { ...item }, rawResults: { ..._.omit(rawResults, 'meta') } });
        return true
    }
};

const prepareRedisData = (bidObj, itemInfo) => {
    const append = [];

    let insertbid = true;

    // Clears current bid if it does not meet the item's next bid but the maxBid does
    if (
        ((!_.isNull(bidObj.current) && !_.isUndefined(bidObj.current)) || bidObj.current === 0) &&
        !_.isNull(bidObj.maximum) &&
        !_.isUndefined(bidObj.maximum) &&
        bidObj.current < parseInt(itemInfo.nextbid)
    ) {
        bidObj.current = null;
    }

    // No current bid
    if (
        (_.isNull(bidObj.current) || _.isUndefined(bidObj.current)) &&
        !_.isUndefined(bidObj.maximum) &&
        !_.isNull(bidObj.maximum)
    ) {
        if (bidObj.customer === parseInt(itemInfo.maxbidder)) {
            insertbid = false;
        }
    }

    if (insertbid) {
        append.push(
            [
                bidObj.customer,
                bidObj.current || itemInfo.nextbid || 10,
                bidObj.date.toFormat('yyyyMMddHHmm'),
                null,
                null,
                null
            ].join('|')
        );
    }

    if (bidObj.maximum) {
        append.push(
            [
                bidObj.customer,
                bidObj.current || itemInfo.nextbid || 10,
                bidObj.date.toFormat('yyyyMMddHHmm'),
                'm',
                null,
                null
            ].join('|')
        );
    }
    return append;
};

const timer = (delay) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(false), delay);
    })
}

const appendBidToRedis = (bidObj, itemInfo, auctionInfo) => {
    const data = prepareRedisData(bidObj, itemInfo).join('\n');

    if (data === '') {
        logger.info('appendToRedis', { bidObj: { ...bidObj }, error: `appendBidToRedis missing data for ${ bidObj.auction } ${ bidObj.item }` });
        console.log(`appendBidToRedis missing data for ${bidObj.auction} ${bidObj.item}`);
        return Promise.resolve(false);
    }
    return Promise.race([
        redis
            .append(`/var/www/private/${auctionInfo.curdir}/bids/${bidObj.item}.dat`, data)
            .then(() => {
                logger.info('appendToRedis', { bidObj: { ...bidObj } });
                return true;
            })
            .catch(err => {
                logger.info('appendToRedis', { bidObj: { ...bidObj }, error: 'appendBidToRedis failure' });
                console.log('appendBidToRedis failure: ', err);
                return false;
            }),
        timer(500)
    ]);
};

// const appendBidToFileFront = (bidObj, itemObj, auctionInfo) => {
//     // Stuff we need: auctionInfo.curdir
//     return new Promise((resolve, reject) => {
//         try {
//             const file = new FileFront({
//                 file: `/var/www/private/${auctionInfo.curdir}/bids/${bidObj.item}.dat`,
//                 type: 'bids'
//             });
//             const append = prepareRedisData(bidObj, itemObj, auctionInfo);
//             file.append({ data: append.join('\n') }, (err, result) => {
//                 if (err) {
//                     console.error(err);
//                     return resolve(aresults);
//                 }
//                 return resolve(aresults);
//             });
//         } catch (err) {
//             console.log('Unable to connect to redis via filefront.');
//             console.log(err);
//             return resolve(aresults);
//         }
//     });
// };

const create = (req, res, next) => {
    const extendedParams = _.extend({}, req.query, req.body, req.params, req.headers);
    const bidV4 = uuidv4();
    const params = _.pick(extendedParams, [
        'auction',
        'currentBid',
        'bid',
        'accountId',
        'item',
        'icn',
        'maxBid',
        'max',
        'placedBid',
        'placedMaxBid',
        'headers',
        'ips',
        'ip'
    ]);

    let bidObj;
	logger.info('bidCreated', {..._.pick(params, ['auction', 'currentBid', 'bid', 'accountId', 'item', 'icn', 'maxBid', 'max', 'placedBid', 'placedMaxBid']), ip: _.get(req, 'headers.x-forwarded-for'), 'referer': _.get(req, 'headers.referer'), 'user-agent': _.get(req, 'headers.user-agent'), uuid: bidV4});
    params.headers = req.headers
    //logger.info(params);
    try {
        bidObj = validateBidData(params, bidV4); //validates required bid data
        bidObj.uuid = bidV4;
    } catch (err) {
        return next(err);
    }
// console.log(bidObj);
    return Promise.all([getBidderProfileProm(bidObj.customer, bidObj), hasAcceptedTermsProm(bidObj)])
        .then(results => {
            req.bidProfile = results[0];
            return getItemInfo(bidObj.item, bidObj.auction) //gets item info: tblInventory, auction, bid state
                .then((itemRes) => {
                    if (itemRes.rawResults[0].ti_halted || itemRes.rawResults[0].ti_closed) {
                        throw new Error('Item is closed.');
                    }
                    const {itemInfo, auctionInfo, rawResults} = itemRes;
                    req.itemPreBid = {...itemInfo}; //historical reference
                    isBidValid(bidObj, itemInfo, rawResults); //satisfies next bid - need currentmax so probably needs to go after the maybeUpdateItemAndGroupsEndtime function call
                    return isTheSellerAlsoTheBidderProm(bidObj, itemInfo)
                        .then(() => maybeUpdateItemAndGroupsEndtime(bidObj, itemInfo, auctionInfo))
                        .then(() => insertBidDB(bidObj))
                        .then((insertResults) => {
                            bidObj.id = insertResults.insertId;
                            req.bid = {...bidObj};
                            let displayItemInfo = {...itemInfo};
                            delete displayItemInfo.bidorder
                            let newRawResults = addBidToRawResults(bidObj, rawResults);
                            let itemPostBid = buildItemInfo(newRawResults);
                            req.itemPostBid = {...itemPostBid};
                            return updateItemCurrentBid(bidObj, itemPostBid)
                        })
                        .then(() => appendBidToRedis(bidObj, itemInfo, auctionInfo))
                        .then(() => {
                            let {itemPostBid, body} = req;
                            let keyMap = {
                                'current': 'current_bid',
                                'nextbid': 'next_bid',
                                'displaywinner': 'winning_bidder',
                                'bidcount': 'bid_count'
                            }
                            let legacyData = _.mapKeys(itemPostBid, (val, key) => {
                                return keyMap[key] ? keyMap[key] : key;
                            });
                            legacyData.customer = body.accountId;
                            legacyData.unique_bidders = _.uniq(
                                _.map(
                                    _.filter(itemPostBid.bidorder, bid => !bid.deleted),
                                    bid => bid.bidder
                                )
                            )
                            legacyData.user_agent = req.headers['user-agent'] || '';
                            legacyData.ip_address = req.headers['x-forwarded-for'] || '';
                            req.results = {
                                ...(_.pick(bidObj, ["auction", "item", "customer", "current", "maximum", "ip"])),
                                message: "Thank you! Your bid was successfully placed.",
                                result: {
                                    ...(_.pick(legacyData, ["auction", "item", "customer", "unique_bidders"])),
                                    current_bid: parseFloat(_.get(legacyData, "current_bid", 0)),
                                    next_bid: parseFloat(_.get(legacyData, "next_bid", 10)),
                                    winning_bidder: parseInt(_.get(legacyData, "winning_bidder")) || null,
                                    bid_count: parseInt(_.get(legacyData, "bid_count", 0))
                                }
                            };
                            req.legacyData = legacyData;
                            return next();
                        });
                });
        })
        .catch((error) => {
            error.code = error.code || 400
            return next(error);
            
        });
};


const retrieve = (req, res, next) => {
    const extendedParams = _.extend({}, req.params, req.body, req.query);
    const {auction, icn: item} = extendedParams;

    getItemInfo(item, auction).then((results) => {
        const resp = results.itemInfo.bidorder
        const current = Number(results.itemInfo.current);
        const _bidorder = [];
        _.forEach(resp, (v) => {
            _bidorder.push({
                createdDate: DateTime.fromSeconds(parseInt(v.timestamp)).toUTC().toISO(),
                bidder: parseInt(v.bidder),
                deleted: !!v.deleted,
                bid_amount: parseFloat(v.bid_amount),
                maxbid: v.bidtype === 'm'
            });
        });

        const bidorder = _.compact(_bidorder);
        // console.log(bidorder)

        const bids = _.filter(bidorder, v => !v.maxbid && !v.deleted);
        const computed = [];
        _.forEach(bids, (value) => {
            const isLast = value === _.last(bids);
            const idx = bidorder.indexOf(value);

            let maxs;
            if (isLast) {
                maxs = _.filter(bidorder, v => v.maxbid && !v.deleted);
            } else {
                maxs = _.filter(_.take(bidorder, idx), v => v.maxbid && !v.deleted);

                const nextbid = bidorder[idx + 1];

                if (nextbid && (
                    value.bidder === nextbid.bidder &&
                    value.createdDate === nextbid.createdDate &&
                    Boolean(nextbid.maxbid) && !Boolean(nextbid.deleted))
                ) {
                    maxs.push(nextbid);
                }
            }

            let auto;

            auto = _.filter(maxs || [], (v) => {
                const has = _.map(auto, 'bid_amount').indexOf(v.bid_amount) > -1;
                return !has && v.bid_amount >= value.bid_amount;
            });

            auto.sort((x, y) => {
                if (x.bid_amount === y.bid_amount) {
                    return 1;
                }
                return x.bid_amount > y.bid_amount ? 1 : -1;
            });

            auto = _.uniqBy(auto.reverse(), v => v.bidder);
            auto.reverse();

            computed.push({
                createdDate: value.createdDate,
                bidder: value.bidder,
                amount: value.bid_amount,
                auto: false
            });

            if (isLast && auto.length === 1 && value.bidder !== _.last(auto).bidder) {
                computed.push({
                    createdDate: value.createdDate,
                    bidder: _.last(auto).bidder,
                    amount: _.min([current, _.last(auto).bid_amount, nextBid(_.last(computed).amount)]),
                    auto: true
                });
            } else if (auto.length > 1) {
                const win = auto.pop();
                computed.push({
                    createdDate: value.createdDate,
                    bidder: _.last(auto).bidder,
                    amount: _.last(auto).bid_amount,
                    auto: true
                });

                computed.push({
                    createdDate: value.createdDate,
                    bidder: win.bidder,
                    amount: _.min([current, win.bid_amount, nextBid(_.last(auto).bid_amount)]),
                    auto: true
                });
            } else if (auto.length && value.bidder !== _.last(auto).bidder) {
                computed.push({
                    createdDate: value.createdDate,
                    bidder: _.last(auto).bidder,
                    amount: _.min([nextBid(value.bid_amount), _.last(auto).bid_amount]),
                    auto: true
                });
            }
        });
        req.results = computed;
        return next();
    }).catch((error) => {
        next(error);
    });
};


const retrieveStatuses = (req, res, next) => {
    let extendedParams = _.extend({}, req.params, req.body, req.query);
    let allowed = _.pick(extendedParams, ['id', 'locked', 'label', 'message', 'allowBidding', 'updateEnabled', 'upgradeEnabled', 'offset', 'limit']);
    let {offset, limit, ...values} = allowed;
    if (offset) {
        delete values.id;
    }
    let conditions = _.reduce(values, (acc, value, key) => {
        if (value) {
            return [...acc, (`${key} = :${key}`)];
        }
        return acc;
    }, []);

    conditions = conditions.join(' AND ');

    let query = `SELECT *
                 FROM BidStatus
                 ${conditions ? 'WHERE ' + conditions : ''}
                 ${limit ? 'LIMIT :limit' : ''}${offset ? ' OFFSET :offset' : ''}`;
    db.query({sql: query, namedPlaceholders: true}, allowed)
        .then(results => {
            if (!results.length) {
                return new Error('Not Found')
            }
            req.results = results;
            return next();
        })
        .catch(err => {
            console.error('retrieveStatuses', err);
            return new Error('Error with data store', err);
        })
}

const getPostDeleteItemInfo = (req, res, next) => {
    let auction = _.get(req, 'params.auction');
    let item = _.get(req, 'params.item');

    return getItemInfo(item, auction)
        .then(({itemInfo}) => {
            let itemDeleteBid = {
                auction,
                item,
                current_bid: parseFloat(itemInfo.current),
                next_bid: parseFloat(itemInfo.nextbid),
                winning_bidder: parseInt(itemInfo.maxbidder),
                bid_count: parseInt(itemInfo.bidcount) || 0,
                unique_bidders: _.uniq(
                    _.map(
                        _.filter(itemInfo.bidorder, bid => !bid.deleted),
                        bid => bid.bidder
                    )
                )
            };
            req.itemDeleteBid = itemDeleteBid;
            return next();
        })
}

module.exports = {
    create,
    retrieve,
    retrieveStatuses,
    getItemInfo,
    validateBidData,
    insertBidDB,
    getPostDeleteItemInfo,
    hasAcceptedTermsProm,
    isTheSellerAlsoTheBidderProm,
    getBidderProfileProm,
    isBidValid,
    addBidToRawResults,
    buildItemInfo,
    updateItemCurrentBid,
    maybeUpdateItemAndGroupsEndtime,
    appendBidToRedis
}
