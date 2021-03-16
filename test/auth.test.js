// const request = require('supertest');
// const axios = require('axios')

// const app = require('../lib');
// const helpers = require('./helpers');


// const testBid = {
//     currentBid: 100,
//     item: "DH1615",
//     auction: "201202",
//     placedBid: 100,
//     placedMaxBid: 0
// };


// // test('if unauthed user can post a bid', () => {
// //     return request(app)
// //         .post('/v1/bids')
// //         .send(testBid)
// //         .expect(401)
// // })
// //
// // test('if authed user can get bid status 1', () => {
// //     return helpers.getAuth(helpers.testUser)
// //         .then(resp => {
// //             return request(app)
// //                 .get('/v1/bids/statuses/1')
// //                 .set('Authorization', `bearer ${resp.access_token}`)
// //                 .expect(200);
// //         })
// // })

// test('mock', () => {
//     expect(true).toBeTruthy();
// })