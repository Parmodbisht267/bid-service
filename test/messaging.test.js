// const { sendCreateBidMessage, sendLargeBidMessage, sendOutbidMessage, sendDeleteBidMessage } = require('../lib/events')
// const { getPostDeleteItemInfo } = require('../lib/bid')
// const {DateTime} = require('luxon');
// const axios = require('axios');


// let randomCustomer = Math.floor(Math.random() * (300000 - 100000))
// let currentBid = Math.floor(Math.random() * (400000 - 500))
// let maximum = Math.floor(Math.random() * (400000 - 500))

// test('sendCreateBidMessage test', () => {
//     let req = {
//         params: {},
//         legacyData: {
//             'user_agent': 'potatoes',
//             'ip_address': '12345'
//         },
//         results: {
//             result: {
//                 'auction': '201216',
//                 'item': 'FW9887',
//                 'customer': randomCustomer,
//                 'current_bid': 2200,
//                 'next_bid': 2300, 
//                 'winning_bidder': 198477,
//                 'bid_count': 11,
//                 'unique_bidders': 3
//             }
//         }
//     }

//     return Promise.all([sendCreateBidMessage(req, () => {}, () => { return true; })])
//         .then((res) => {
//             expect(res).toBeTruthy();
//         })
    
// })



// test('sendLargeBidMessage test', () => {
//     let req = {
//         bidProfile: {},
//         legacyData: {
//             'user_agent': 'potatoes',
//             'ip_address': '12345'
//         },
//         results: {
//                 'auction': '201216',
//                 'item': 'FW9887',
//                 'customer': randomCustomer,
//                 'current': 2200,
//                 'maximum': 2300
//         }
//     }

//     return Promise.all([sendLargeBidMessage(req, () => {}, () => { return true; })])
//         .then((res) => {
//             expect(res).toBeTruthy();
//         })
    
// })



// test('sendOutbidMessage test', () => {
//     let req = {
//         itemPreBid: {
//             displaywinner: randomCustomer,
//             auction: '201216',
//             item: 'FW9887'
//         },
//         itemPostBid: {
//             displaywinner: 68792
//         }
//     }

//     return Promise.all([sendOutbidMessage(req, () => {}, () => { return true; })])
//         .then((res) => {
//             expect(res).toBeTruthy();
//         })
    
// })



// test('sendDeleteBidMessage test', () => {
//     const req = {
//         params: {
//             auction: '201216',
//             item: 'FW9887'
//         }
//     }

//     return Promise.all([getPostDeleteItemInfo(req, () => {}, () => { return true; })])
//         .then(() => {
//             // console.log('req: ', req)

//             return Promise.all([sendDeleteBidMessage(req, () => {}, () => { return true; })])
//             .then((res) => {
//                 expect(res).toBeTruthy();
//             })

//         })
    
// })
