// const _ = require('lodash')
// const { isBidValid, pool, getItemInfo} = require('../lib/bid')
// jest.setTimeout(10000);

// let randomCustomer = Math.floor(Math.random() * (300000 - 100000))
// let currentBid = Math.floor(Math.random() * (400000 - 500))
// let maximum = Math.floor(Math.random() * (400000 - 500))


// let bids = [
//     {
//         // should always return true
//         customer: randomCustomer,
//         current: currentBid,
//         item: 'DF4541',
//         auction: '201209',
//         maximum: maximum
//     },
//     {
//         customer: randomCustomer,
//         current: 0,
//         item: 'DF4541',
//         auction: '201209',
//         maximum: maximum
//     },
//     {
//         customer: randomCustomer,
//         current: '0',
//         item: 'DF4541',
//         auction: '201209',
//         maximum: 0
//     },
//     {
//         customer: null,
//         current: 0,
//         item: 'DF4541',
//         auction: '201209',
//         maximum: 0
//     },
//     {
//         customer: randomCustomer,
//         current: 0,
//         item: 'DF4541',
//         auction: '201209',
//         maximum: 0
//     },
//     {
//         customer: 75219,
//         current: 0,
//         item: 'DF4541',
//         auction: '201209',
//         maximum: 63000
//     }
// ]

// test('Determine wether or not we have a valid bid', () => {
//     return Promise.all(
//         _.map(bids, (bidObj) => {
//         return getItemInfo(bidObj.item, bidObj.auction) 
//             .then((itemRes) => {
//                 const {itemInfo, auctionInfo, rawResults} = itemRes;
//                 return Promise.all([isBidValid(bidObj, itemInfo, rawResults)])
//                     .then(res => {
//                         console.log('success')
//                         return expect(res).toBeTruthy()
//                     })
//                 })
//                 .catch(error => {
//                     console.log(error.message)
//                     return expect(error.message).toMatch(/[\w\s]*id must be.*/)
//                 })
                    
//         })
//     )
// })

