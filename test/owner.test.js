// const request = require('supertest');
// const _ = require('lodash');

// const app = require('../lib');
// const { nextBid } = require('../../common/BidIncrements');
// const error = require('../../common/Error');
// const { owner } = require('../lib/helpers');

// const {
//     getAuthTestUser,
//     getAuthEmployee,
//     acceptTerms,
//     getOpenItems } = require('./helpers');

// jest.setTimeout(10000);

// const makeCurrentBid = (item, userId) => {
//     return {
//         currentBid: nextBid(item.current_bid),
//         auction: item.auction,
//         customer: `${userId}`,
//         item: item.item
//     }
// }

// // test('if user placing bid for themselves succeeds', ()=>{
// //     return Promise.all([getAuthTestUser(), getOpenItems()]).then(([user, items]) => {
// //         let item = _.find(items, item => item.id == 618613);
// //         return acceptTerms(user, item.auction).then(() => {
// //             return request(app)
// //                 .post('/v1/bids')
// //                 .set('Authorization', user.bearer)
// //                 .send(makeCurrentBid(item, user.account_id))
// //                 .expect(200)
// //         })
// //
// //     })
// // })
// //
// // test('if user placing bid for someone else fails', ()=>{
// //     return Promise.all([getAuthTestUser(), getOpenItems()]).then(([user, items]) => {
// //         let item = _.shuffle(items)[0];
// //         return acceptTerms(user, item.auction).then((resp) => {
// //             return request(app)
// //                 .post('/v1/bids')
// //                 .set('Authorization', user.bearer)
// //                 .send(makeCurrentBid(item, user.account_id + 1))
// //                 .expect(403);
// //         });
// //     });
// // })

// test('if non-employees can proxy bid', () => {
//     let testReq = {
//         user: {
//             id: 47
//         },
//         body: {
//             currentBid: 0,
//             auction: 'test',
//             customer: `36`,
//             item: 'test'
//         },
//         query : {}
//     }
//     owner(testReq, {}, resp => {
//         expect(resp.code).toBe(403);
//         expect(resp.status).toBe('Forbidden')
//         //expect(resp.message).toBe('You lack permission to the requested document');
//     })

// })

// test('If employees can proxy bid', () => {
//     let testReq = {
//         user: {
//             employee: 'test employee',
//             id: 47
//         },
//         body: {
//             currentBid: 0,
//             auction: 'test',
//             customer: `36`,
//             item: 'test'
//         },
//         query : {}
//     }
//     owner(testReq, {}, resp => {
//         expect(resp).toBeUndefined();
//     })
// })
