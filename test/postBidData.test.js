// const { getItemInfo, addBidToRawResults, buildItemInfo, updateItemCurrentBid, insertBidDB } = require('../lib/bid')
// const {DateTime} = require('luxon');
// const axios = require('axios');
// const db = require('../lib/db')

// let randomCustomer = Math.floor(Math.random() * (300000 - 100000))
// let currentBid = Math.floor(Math.random() * (400000 - 500))
// let maximum = Math.floor(Math.random() * (400000 - 500))


// const getAuctionItem = () => {
//     let query = `
//     SELECT auction, item
//     FROM tblInventory
//     WHERE endtime > CURDATE() 
//     ORDER BY RAND() 
//     LIMIT 1;
//     `;
//     return db.query({ sql: query });
// };


// beforeAll(() => {
//     return getAuctionItem().then(results => {
//         bidObj.auction = results[0].auction;
//         bidObj.item = results[0].item;
//     });
// });


// let bidObj = {
//         customer: randomCustomer,
//         current: currentBid,
//         maximum: maximum,
//         date: DateTime.local(),
//         ip:''
//     }

// test('if the item after the bid matches item service', () => {
//     return getItemInfo(bidObj.item, bidObj.auction)
//         .then((itemRes) => {
//             const {itemInfo, auctionInfo, rawResults} = itemRes;
//             return insertBidDB(bidObj)
//                 .then((insertResults) => {
//                     bidObj.id = insertResults.insertId;
//                     let newRawResults = addBidToRawResults(bidObj, rawResults);
//                     let itemPostBid = buildItemInfo(newRawResults);
                   
//                     return updateItemCurrentBid(bidObj, itemPostBid)
//                     .then(() => {
//                         return axios.get(`http://localhost:7070/workspace/${bidObj.auction}/item/${bidObj.item}/current`)
//                         .then((res) => {
//                             delete itemPostBid.seller
//                             delete itemPostBid.auction
//                             delete itemPostBid.item
//                             delete itemPostBid.group_id

//                             expect(res.data).toStrictEqual(itemPostBid)
//                         })
                        
//                     })
//                 })
//         })
//     })