// const _ = require('lodash');
// const { getRandomItem } = require('./helpers');
// const { getItemInfo } = require('../lib/bid');
// const db = require('../lib/db');

// jest.setTimeout(10000);
// let auction, item;

// beforeAll(() => {
//     return getRandomItem().then(results => {
//         auction = results[0].auction;
//         item = results[0].item;
//     });
// });

// test('if item data matches on itemInfo.auction', () => {
//     return getItemInfo(item, auction).then(res => {
//         return expect(res).toHaveProperty('itemInfo.auction', auction);
//     });
// });
// test('if item data matches on itemInfo.item', () => {
//     return getItemInfo(item, auction).then(res => {
//         return expect(res).toHaveProperty('itemInfo.item', item);
//     });
// });
// test('if item data contains rawResults array', () => {
//     return getItemInfo(item, auction).then(res => {
//         return expect.arrayContaining([
//             expect(res.rawResults[0]).toHaveProperty('bids_id'),
//             expect(res.rawResults[0]).toHaveProperty('bids_customer'),
//             expect(res.rawResults[0]).toHaveProperty('bids_current'),
//             expect(res.rawResults[0]).toHaveProperty('bids_maximum'),
//             expect(res.rawResults[0]).toHaveProperty('bids_timestamp'),
//             expect(res.rawResults[0]).toHaveProperty('bids_del'),
//             expect(res.rawResults[0]).toHaveProperty('ti_item'),
//             expect(res.rawResults[0]).toHaveProperty('ti_auction'),
//             expect(res.rawResults[0]).toHaveProperty('ti_seller'),
//             expect(res.rawResults[0]).toHaveProperty('ti_endtime'),
//             expect(res.rawResults[0]).toHaveProperty('ti_starting_bid'),
//             expect(res.rawResults[0]).toHaveProperty('ti_closed'),
//             expect(res.rawResults[0]).toHaveProperty('ti_halted'),
//             expect(res.rawResults[0]).toHaveProperty('group_id'),
//             expect(res.rawResults[0]).toHaveProperty('ti_halted_message'),
//             expect(res.rawResults[0]).toHaveProperty('ta_endtime'),
//             expect(res.rawResults[0]).toHaveProperty('ta_curdir'),
//             expect(res.rawResults[0]).toHaveProperty('ta_extend'),
//             expect(res.rawResults[0]).toHaveProperty('ta_stagger')
//         ])
//     });
// });
// test('if item data contains auctionInfo properties', () => {
//     return getItemInfo(item, auction).then(res => {
//         return expect.objectContaining([
//             expect(res.auctionInfo).toHaveProperty('curdir'),
//             expect(res.auctionInfo).toHaveProperty('extend')
//         ])
//     });
// });
// test('if item data contains itemInfo properties', () => {
//     return getItemInfo(item, auction).then(res => {
//         return expect.objectContaining([
//             expect(res.itemInfo).toHaveProperty('seller'),
//             expect(res.itemInfo).toHaveProperty('displaynextbid'),
//             expect(res.itemInfo).toHaveProperty('displayprice'),
//             expect(res.itemInfo).toHaveProperty('displaywinner'),
//             expect(res.itemInfo).toHaveProperty('displayendtime'),
//             expect(res.itemInfo).toHaveProperty('overridewinner'),
//             expect(res.itemInfo).toHaveProperty('overrideprice'),
//             expect(res.itemInfo).toHaveProperty('max'),
//             expect(res.itemInfo).toHaveProperty('runnerup'),
//             expect(res.itemInfo).toHaveProperty('maxbid'),
//             expect(res.itemInfo).toHaveProperty('increment'),
//             expect(res.itemInfo).toHaveProperty('totalbidcount'),
//             expect(res.itemInfo).toHaveProperty('nextbid'),
//             expect(res.itemInfo).toHaveProperty('bidcount'),
//             expect(res.itemInfo).toHaveProperty('current'),
//             expect(res.itemInfo).toHaveProperty('lastbidtime'),
//             expect(res.itemInfo).toHaveProperty('maxbidder'),
//             expect(res.itemInfo).toHaveProperty('maximum'),
//             expect(res.itemInfo).toHaveProperty('rawprice'),
//             expect(res.itemInfo).toHaveProperty('lastbid'),
//             expect(res.itemInfo).toHaveProperty('item'),
//             expect(res.itemInfo).toHaveProperty('auction'),
//             expect(res.itemInfo).toHaveProperty('endtime')
//         ])
//     });
// });
// test('if item data contains itemInfo bidorder properties', () => {
//     return getItemInfo(item, auction).then(res => {
//         return expect.arrayContaining([
//             expect(res.itemInfo.bidorder[0]).toHaveProperty('bidder'),
//             expect(res.itemInfo.bidorder[0]).toHaveProperty('timestamp'),
//             expect(res.itemInfo.bidorder[0]).toHaveProperty('bidtype'),
//             expect(res.itemInfo.bidorder[0]).toHaveProperty('bid_amount'),
//             expect(res.itemInfo.bidorder[0]).toHaveProperty('amount'),
//             expect(res.itemInfo.bidorder[0]).toHaveProperty('deleted'),
//             expect(res.itemInfo.bidorder[0]).toHaveProperty('id')
//         ])
//     });
// });

// afterAll(() => {
//     return db.pool.end();
// });
