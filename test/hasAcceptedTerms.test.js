// const _ = require('lodash');
// const { chance } = require('./helpers');
// const { hasAcceptedTermsProm } = require('../lib/bid');
// const db = require('../lib/db');

// jest.setTimeout(10000);


// // optional configurations ----------------------------

// const userApproved = true; // true is for approved bidders; false for unapproved bidders
// const auctionClosed = 1; // 0 is open auction, 1 is closed
// const auctionsLimit = 60; // number of random auctions to use for test

// const testAuction = undefined; // manual override of random auction
//     // - test this one only, eg: [{ auction: '200506' }]  [{ auction: undefined }]

// const testCustomer = undefined; // manual override of random customer
//     //  - test this one only, eg: { id: 12345 }

// // ---------------------------------------------


// const getRandomAuctions = async () => {
//     let query = `SELECT auction FROM tblAuctions WHERE closed = ${auctionClosed} 
//         ${(auctionClosed == 0) ? ' AND endtime >= NOW()' : ''}
//         ORDER BY id DESC  LIMIT ${auctionsLimit}`;
    
//     // console.log("query: ", query)

//     return db.query(query)
//         .then(results => {
//             if (!results) {
//                 return new Error('No auction found')
//             }            
//             // return chance.pickone(results);
//             return results;
//         })
//         .catch(err => {
//             return new Error('No auction found');
//         })
// };


// const getRandomCust = async () => {
//     let query = `
//         SELECT bp.accountId id
//         FROM BidProfile bp
//         WHERE bp.authorizedLimit > 0
//         AND bp.disabledDate IS NULL 
//         AND ${userApproved ? ' bp.statusId = 1' : ' bp.statusId NOT IN(1, 13)'}
//     `;

//     return db.query(query)
//         .then(bidders => {
//             return chance.pickone(bidders);
//         })
//         .catch(err => {
//             return new Error('No customer found');
//         })
// };


// test('if bidder has accepted Terms', async () => {
//     auctions = testAuction || await getRandomAuctions();
//     customer = testCustomer || await getRandomCust();

//     return Promise.all(
//         _.map(auctions, (auction) => {
//         return hasAcceptedTermsProm({auction: auction.auction, customer: customer.id})
//             .then(res => {
//                 console.log(" - \x1b[32m ACCEPTED \x1b[0m | auction: ", auction.auction, " / customer: ", customer.id)
//                 return expect(res).toBeTruthy();
//             }).catch(error => {
//                 // console.log(" - \x1b[36m NOT accepted or other ERROR \x1b[0m | auction: ", auction.auction, " / customer: ", customer.id)
//                 console.log(` - \x1b[36m ${error.message} \x1b[0m | auction: ${auction.auction} / customer: ${customer.id}`)
//                 return expect(['Terms must be accepted','Problem trying to validate acceptance of terms']).toContain(error.message);
//             });

//         })
//     ) // loop through random auctions

// });


// afterAll(() => {
//     db.pool.end();
// }) 
