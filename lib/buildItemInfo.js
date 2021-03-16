const _ = require('lodash');
const numeral = require('numeral');

const { nextBid, current } = require('../../common/BidIncrements');

const buildItemInfo = (rawResults) => {
    // return undefined if no data
    if (!(rawResults.length >= 1)) {
        return undefined;
    }

    let testRawResults = {...rawResults[rawResults.length-1]}
    delete testRawResults.biddata;
    
    const itemInfo = {
        halted: _.get(rawResults, '[0].ti_halted', 0),
        haltedmessage: _.get(rawResults, '[0].ti_halted_message', null),
        seller: _.get(rawResults, '[0].ti_seller'),
        displaynextbid: '10.00',
        displayprice: '0.00',
        displaywinner: null,
        displayendtime: null,
        overridewinner: null,
        overrideprice: null,
        max: null,
        runnerup: null,
        maxbid: null,
        increment: '0.00',
        totalbidcount: 0,
        ended: false,
        nextbid: '10.00',
        bidcount: 0,
        current: numeral(0).format('0'),
        lastbidtime: 0,
        bidorder: null,
        maxbidder: null,
        maximum: '0.00',
        rawprice: '0.00',
        resultswinner: null,
        lastbid: null,
        resultsprice: null,
        item: rawResults[0].ti_item,
        auction: rawResults[0].ti_auction,
        endtime: rawResults[0].ti_endtime > 0 ? rawResults[0].ti_endtime.toString() : null,
        group_id: rawResults[0].group_id,
        closing: rawResults[0].ti_closing
    };

    const startingBid = Number(rawResults[0].ti_starting_bid);
    const closed = rawResults[0].ti_closed;

    let bidcount = 0,
        maximum = 0;
    let current_price = 0.0,
        current_maxbid = 0.0,
        current_winner = null;
    let runnerup = null,
        lastbid = 0.0;

    // if there are bids...
    if (!_.isNull(rawResults[0].bids_id)) {
        itemInfo.bidorder = [];
        
        // build bid tree
        _.forEach(rawResults, (biddata) => {
            // get item's last bid time
            // console.log("loop: ", biddata.bids_current, biddata.bids_maximum)

            if (biddata.bids_timestamp > Number(itemInfo.lastbidtime)) {
                itemInfo.lastbidtime = biddata.bids_timestamp.toString();
            }

            // Setting current bid if a new max bid is placed
            if (
                biddata.bids_current == 0 &&
                biddata.bids_maximum > 0 &&
                current_winner !== biddata.bids_customer
            ) {
                biddata.bids_current = _.max([parseFloat(nextBid(current_price)), startingBid]);
            }

            // handling soft delete cases TODO: look at deleted bids in bid tree
            let currentDeleted = false,
                maxDeleted = false;
            if (biddata.bids_del === 1) {
                if (biddata.bids_current > 0 && biddata.bids_maximum > 0) {
                    currentDeleted = true;
                }
            } else if (biddata.bids_del === 2) {
                if (biddata.bids_current > 0 && biddata.bids_maximum > 0) {
                    maxDeleted = true;
                }
            } else if (biddata.bids_del === 3) {
                currentDeleted = true;
                maxDeleted = true;
            }

            if (biddata.bids_current > 0) {
                const bid = {
                    bidder: biddata.bids_customer.toString(),
                    timestamp: biddata.bids_timestamp.toString(),
                    bidtype: '',
                    bid_amount: biddata.bids_current.toString(),
                    amount: biddata.bids_current,
                    deleted: '',
                    id: biddata.bids_id
                };

                if (currentDeleted) {
                    bid.bid_amount = '0';
                    bid.amount = biddata.bids_current;
                    bid.deleted = `deleted ${ biddata.bids_current }`;
                } else {
                    bidcount++;
                    // if bid beats current price
                    if (biddata.bids_current > current_price) {
                        if (biddata.bids_current > current_maxbid) {
                            // if bid beats current max
                            runnerup = current_winner;
                            lastbid = current_price;

                            current_winner = biddata.bids_customer;
                            current_price = biddata.bids_current;
                        } else if (biddata.bids_current === current_maxbid) {
                            // if current bid equals current max
                            runnerup = biddata.bids_customer;
                            lastbid = current_price;

                            current_price = biddata.bids_current;
                        } else {
                            // if current bid is less than current max
                            runnerup = biddata.bids_customer;
                            lastbid = current_price;

                            current_price = nextBid(biddata.bids_current);
                        }
                        itemInfo.maxbid = null; // if current bid is not max TODO:why?
                    }
                    if (biddata.bids_current > maximum) {
                        maximum = biddata.bids_current;
                    }
                }
                itemInfo.bidorder.push(bid);
            }

            if (biddata.bids_maximum > 0) {
                const bid = {
                    bidder: biddata.bids_customer.toString(),
                    timestamp: biddata.bids_timestamp.toString(),
                    bidtype: 'm',
                    bid_amount: biddata.bids_maximum.toString(),
                    amount: biddata.bids_maximum,
                    deleted: '',
                    id: biddata.bids_id
                };

                if (maxDeleted) {
                    bid.bid_amount = '0';
                    bid.amount = biddata.bids_maximum;
                    bid.deleted = `deleted ${ biddata.bids_maximum }`;
                } else {
                    if (biddata.bids_maximum >= current_price) {
                        if (biddata.bids_customer !== current_winner) {
                            if (biddata.bids_maximum > current_maxbid) {
                                // new winner new max beats old max
                                runnerup = current_winner;
                                lastbid = current_price;

                                current_price = _.max([
                                    parseFloat(nextBid(current_maxbid)),
                                    startingBid
                                ]);
                                current_winner = biddata.bids_customer;
                                current_maxbid = biddata.bids_maximum;
                            } else if (biddata.bids_maximum < current_maxbid) {
                                // new max but doesn't beat current max
                                runnerup = biddata.bids_customer;
                                lastbid = current_price;

                                current_price = nextBid(biddata.bids_maximum);
                            } else {
                                // if new max is equal to current max
                                runnerup = biddata.bids_customer;
                                lastbid = current_price;

                                current_price = biddata.bids_maximum;
                            }
                            itemInfo.maxbid = 'm';
                        } else if (biddata.bids_maximum > current_maxbid) {
                            // if current winner is placing or raising a max bid
                            current_maxbid = biddata.bids_maximum;
                        }
                    }
                    if (biddata.bids_maximum > maximum) {
                        maximum = biddata.bids_maximum;
                    }
                }
                itemInfo.bidorder.push(bid);
            }
        });

        // console.log("---------- itemInfo -----------")
        // console.log(itemInfo.item, " - current_price: ", current_price, " | maximum: ", maximum)
        // console.log("---------------------")

        itemInfo.current = numeral(current_price).format('0.00');
        itemInfo.nextbid = numeral(
            _.max([parseFloat(nextBid(current_price)), startingBid])
        ).format('0.00');
        itemInfo.rawprice = numeral(current_price).format('0.00');
        itemInfo.lastbid = numeral(lastbid).format('0.00');

        itemInfo.displayprice = numeral(current_price).format('0,0.00');
        itemInfo.displaynextbid = numeral(
            _.max([parseFloat(nextBid(current_price)), startingBid])
        ).format('0,0.00');

        if (current_winner) {
            itemInfo.maxbidder = _.toString(current_winner);
            itemInfo.displaywinner = itemInfo.maxbidder;
        } else {
            delete itemInfo.maxbidder;
            delete itemInfo.displaywinner;
        }

        if (runnerup) {
            itemInfo.runnerup = _.toString(runnerup);
        } else {
            delete itemInfo.runnerup;
        }

        itemInfo.increment = numeral(current(current_price)).format('0.00');

        if (itemInfo.maxbid === 'm') {
            itemInfo.max = current_maxbid ? _.toString(current_maxbid) : null;
        } else if (!closed) {
            delete itemInfo.max;
        }

        if (!itemInfo.halted) {
            delete itemInfo.halted;
            delete itemInfo.haltedmessage;
            delete itemInfo.ended;
            delete itemInfo.resultswinner;
            delete itemInfo.resultsprice;
        }

        itemInfo.bidcount = bidcount;
        itemInfo.totalbidcount = itemInfo.bidorder.length;
        itemInfo.maximum = numeral(maximum).format('0.00');
    }

    // console.log("=============== ===============")

    return itemInfo;
};

module.exports = buildItemInfo;