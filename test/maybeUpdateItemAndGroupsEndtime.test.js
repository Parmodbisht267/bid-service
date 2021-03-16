jest.mock('axios');
jest.mock('mariadb');
jest.mock('../lib/db');
jest.mock('messagelib');
jest.mock('ioredis');
jest.mock('../lib/redis');
const db = require('../lib/db');
const { maybeUpdateItemAndGroupsEndtime } = require('../lib/bid');
const axios = require('axios');
const messagelib = require('messagelib');

test(`Bid will extend grouped items`, () => {
    let bidObj = {
        customer: 1,
        current: 1,
        maximum: 0,
        auction: '123456A',
        item: 'AB1234'
    };
    let itemInfo = {
        group_id: 1,
        maxbidder: 1,
        bidorder: [
            { bidder: 1, bid_amount: 1}
        ]
    }
    let auctionInfo = {
        extend: 300
    }

    db.query.mockResolvedValueOnce('ignored update response');
    // response from db for items updated with uuid
    let groupedItems = [
        {auction: '123456A', item: 'AB1234', endtime: 1607637285},
        {auction: '123456A', item: 'AB2345', endtime: 1607637285},
        {auction: '123456A', item: 'AB3456', endtime: 1607637285},
    ]
    db.query.mockResolvedValueOnce(groupedItems);
    return maybeUpdateItemAndGroupsEndtime(bidObj, itemInfo, auctionInfo)
        .then(data => {
            expect(axios.post.mock.calls.length).toBe(3);
            groupedItems.forEach((item, i) => {
                expect(axios.post.mock.calls[i][0].includes(item.item)).toBe(true);
                expect(messagelib.Message.mock.calls[i][2].item).toBe(item.item);
            });
            expect(messagelib.Message.mock.calls.length).toBe(3);
            expect(data).toBe(true);
    })
})

test(`Bid will reject if item does not extend`, () => {
    let bidObj = {
        customer: 1,
        current: 1,
        maximum: 0,
        auction: '123456A',
        item: 'AB1234'
    };
    let itemInfo = {
        group_id: 1,
        maxbidder: 1,
        bidorder: [
            { bidder: 1, bid_amount: 1}
        ],
        closing: 1
    }
    let auctionInfo = {
        extend: 300
    }

    db.query.mockResolvedValueOnce({affectedRows: 0});
    // response from db for items updated with uuid
    let groupedItems = []
    db.query.mockResolvedValueOnce(groupedItems);
    return expect(maybeUpdateItemAndGroupsEndtime(bidObj, itemInfo, auctionInfo)).rejects.toThrow('Item is closed')

})

test(`Winning bidder raising max will not extend endtime`, () => {
    let bidObj = {
        customer: 1,
        current: 0,
        maximum: 100,
        auction: '123456A',
        item: 'AB1234'
    };
    let itemInfo = {
        group_id: 1,
        maxbidder: 1,
        bidorder: [
            { bidder: 1, bid_amount: 10}
        ]
    }
    let auctionInfo = {
        extend: 300
    }

    return maybeUpdateItemAndGroupsEndtime(bidObj, itemInfo, auctionInfo)
        .then(data => {
            expect(data).toBe(false);
        })
})
