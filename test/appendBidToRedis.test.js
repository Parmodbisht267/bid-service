// jest.mock('axios');
// jest.mock('mariadb');
// jest.mock('../lib/db');
// jest.mock('messagelib');
// jest.mock('ioredis');
// jest.mock('../lib/redis');
// const db = require('../lib/db');
// const redis = require('../lib/redis');
// const { appendBidToRedis } = require('../lib/bid');
// const axios = require('axios');
// const messagelib = require('messagelib');
// const {DateTime} = require('luxon');

// // redis.append.mockImplementation(() => {
// //     return Promise.resolve(true);
// // });
// //console.log(redis.mock)
// jest.setTimeout(4000);

// test(`if appending to Redis takes longer than 500ms it resolves false`, () => {
//     let bidObj = {
//         customer: 1,
//         current: 1,
//         maximum: 0,
//         auction: '123456A',
//         item: 'AB1234',
//         date: DateTime.local()
//     };
//     let itemInfo = {
//         group_id: 1,
//         maxbidder: 1,
//         nextbid: 1,
//         bidorder: [
//             { bidder: 1, bid_amount: 1}
//         ]
//     }
//     let auctionInfo = {
//         extend: 300,
//         curdir: 'purple/auctions/2021/210211'
//     }

//     redis.append.mockImplementation((key, data) => {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => resolve(0), 1000)
//         });
//     });
//     return appendBidToRedis(bidObj, itemInfo, auctionInfo)
//         .then(resp => {
//             expect(resp).toBe(false);
//         })
//         // .catch(error => {
//         //     console.log(error);
//         //     expect(error).toBeFalsy();
//         // })
// })

// test(`if appending to Redis takes less than 500ms it resolves true`, () => {
//     let bidObj = {
//         customer: 1,
//         current: 1,
//         maximum: 0,
//         auction: '123456A',
//         item: 'AB1234',
//         date: DateTime.local()
//     };
//     let itemInfo = {
//         group_id: 1,
//         maxbidder: 1,
//         nextbid: 1,
//         bidorder: [
//             { bidder: 1, bid_amount: 1}
//         ]
//     }
//     let auctionInfo = {
//         extend: 300,
//         curdir: 'purple/auctions/2021/210211'
//     }

//     redis.append.mockImplementation((key, data) => {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => resolve(0), 400)
//         });
//     });
//     return appendBidToRedis(bidObj, itemInfo, auctionInfo)
//         .then(resp => {
//             expect(resp).toBe(true);
//         })
//     // .catch(error => {
//     //     console.log(error);
//     //     expect(error).toBeFalsy();
//     // })
// })