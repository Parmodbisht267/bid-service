// const _ = require('lodash');
// //const { chance } = require('./helpers');
// const { validateBidData } = require('../lib/bid');

// const exampleParams = {
//     auction: "201210",
//     accountId: "178062", // owner transforms 'customer' to 'accountId'
//     item: "FA9430",
//     icn: 'AB1234',
//     currentBid: 8200,
//     placedBid: 8200,
//     max: 0,
//     maxBid: 0,
//     placedMaxBid: 0,
//     headers: {},
//     ips: [],
//     ip: ''
// };

// test('valid current bid post', () => {
//     let bid = {
//         auction: "123456A",
//         currentBid: 1234,
//         accountId: "1234",
//         item: "AB1234",
//         placedBid: 1234,
//         placedMaxBid: 0
//     };

//     let result = validateBidData(bid)
//     // type checking
//     expect(_.isString(result.auction)).toBe(true);
//     expect(_.isInteger(result.customer)).toBe(true);
//     expect(_.isInteger(result.current)).toBe(true);
//     expect(_.isInteger(result.maximum)).toBe(true)
//     expect(_.isString(result.item)).toBe(true);
//     expect(_.isObject(result.date)).toBe(true);

//     // data checking
//     expect(result.auction).toBe("123456A");
//     expect(result.customer).toBe(1234);
//     expect(result.current).toBe(1200); //rounding
//     expect(result.maximum).toBe(0); // no max
//     expect(result.item).toBe('AB1234');
// })

// test('valid max bid post', () => {
//     let bid = {
//         auction: "123456A",
//         maxBid: 1234,
//         accountId: "1234",
//         item: "AB1234",
//         placedBid: 0,
//         placedMaxBid: 1234
//     };

//     let result = validateBidData(bid)
//     // type checking
//     expect(_.isString(result.auction)).toBe(true);
//     expect(_.isInteger(result.customer)).toBe(true);
//     expect(_.isInteger(result.current)).toBe(true);
//     expect(_.isInteger(result.maximum)).toBe(true)
//     expect(_.isString(result.item)).toBe(true);
//     expect(_.isObject(result.date)).toBe(true);

//     // data checking
//     expect(result.auction).toBe("123456A");
//     expect(result.customer).toBe(1234);
//     expect(result.maximum).toBe(1200); //rounding
//     expect(result.current).toBe(0); // no current
//     expect(result.item).toBe('AB1234');
// })

// test('no bid should throw errror', () => {
//     let bid = {
//         auction: "123456A",
//         accountId: "1234",
//         item: "AB1234",
//         currentBid: 0
//     };
//     expect(() => validateBidData(bid)).toThrow();
// })