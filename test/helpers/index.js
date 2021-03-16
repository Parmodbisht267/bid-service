const axios = require('axios');
const _ = require('lodash');
const Chance = require('chance');

const db = require('../../lib/db');
const { nextBid } = require('../../../common/BidIncrements');


const chance = new Chance();


const testUser = {
    username: 'alex.neises@purplewave.com',
    password: 'Neises4811177'
};

const testEmployee = {
    username: 'ryan.mccants@purplewave.com',
    password: '' //TODO: change this
}

const getAuth = user => {
    return axios({
        method: 'POST',
        url: 'https://dev-v2.cliquidator.info/login',
        data: user
    })
        .then(resp => resp.data)
}

const getAuthed = (user) => {
    return getAuth(user)
        .then(auth => {
            return {
                ...user,
                ...auth,
                bearer: `bearer ${auth.access_token}`,
            }
        })
}
const getAuthTestUser = () => {
    return getAuthed(testUser);
}

const getAuthEmployee = () => {
    return getAuthed(testEmployee);
}

const getOpenItems = () => {
    let query = `
    SELECT id, item, auction, current_bid, seller
    FROM tblInventory
    WHERE closed = 0 AND endtime > NOW() AND halted = 0;
    `;
    return db.query({sql: query});
}

const getRandomItem = () => {
    // let query = `
    // SELECT auction, item
    // FROM tblInventory
    // WHERE endtime > '2012-01-01' ORDER BY RAND() LIMIT 1;
    // `;
    let query = `
    SELECT auction, item
    FROM tblInventory
    WHERE endtime > '2020-01-01' ORDER BY RAND() LIMIT 1;
    `;
    return db.query({ sql: query });
};

const getEnabledBidder = () => {
    let query = `
    SELECT bp.accountId id
    FROM BidProfile bp
    WHERE bp.authorizedLimit > 0
     AND bp.disabledDate IS NULL
     AND bp.statusId = 1
    `
    return db.query({sql:query})
        .then(bidders => {
            return chance.pickone(bidders);
        });
}

const acceptTerms = (user, auction) => {
    return axios({
        method: 'POST',
        url: `https://dev-v2.cliquidator.info/v1/terms/me/auctions/${auction}/terms/accept`,
        headers: {
            'Authorization': user.bearer
        }
    })
}


chance.mixin({
    'bidValue': () => {
        let num = chance.natural()
        return chance.pickone([
            num,
            `${num}`
        ])
    },
    'bid': async (opts) => {
        let { bidType, userId } = opts || {};
        let bidTypes = ['current', 'currentBid','maxBid', 'max'];
        if (!bidTypes.includes(bidType)){
            bidType = chance.pickone(bidTypes);
        }
        if (!userId) {
            userId = await getEnabledBidder();
        }
        return getOpenItems()
            .then(items => {
                let item = chance.pickone(items);
                return {
                    [bidType]: nextBid(item.current_bid),
                    auction: item.auction,
                    accountId: `${userId}`,
                    item: item.item
                }
            })

    },
    'enableBidderId': () => {
        return getEnabledBidder();
    }
})

module.exports = {
    chance,
    getAuthed,
    getAuthEmployee,
    getAuthTestUser,
    acceptTerms,
    getOpenItems,
    testUser,
    testEmployee,
    getAuth,
    getRandomItem
}