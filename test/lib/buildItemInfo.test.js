const buildItemInfo = require('../lib/buildItemInfo');

rawResults = [ { bids_id: 6365152,
    bids_customer: 219748,
    bids_current: 800,
    bids_maximum: 0,
    bids_timestamp: 1603505191,
    bids_del: 0,
    ti_item: 'DG4629',
    ti_auction: '201201',
    ti_endtime: 1606838400,
    ti_starting_bid: 10,
    ti_closed: 0,
    ti_halted: 0,
    group_id: null,
    ti_halted_message: null,
    ta_endtime: 1606838400,
    ta_curdir: 'purple/auctions/2020/201201',
    ta_extend: '5',
    ta_stagger: 'y' },
    { bids_id: 6365596,
        bids_customer: 3282,
        bids_current: 825,
        bids_maximum: 1000,
        bids_timestamp: 1603513414,
        bids_del: 0,
        ti_item: 'DG4629',
        ti_auction: '201201',
        ti_endtime: 1606838400,
        ti_starting_bid: 10,
        ti_closed: 0,
        ti_halted: 0,
        group_id: null,
        ti_halted_message: null,
        ta_endtime: 1606838400,
        ta_curdir: 'purple/auctions/2020/201201',
        ta_extend: '5',
        ta_stagger: 'y' },
    { bids_id: 6366099,
        bids_customer: 219748,
        bids_current: 900,
        bids_maximum: 0,
        bids_timestamp: 1603546255,
        bids_del: 0,
        ti_item: 'DG4629',
        ti_auction: '201201',
        ti_endtime: 1606838400,
        ti_starting_bid: 10,
        ti_closed: 0,
        ti_halted: 0,
        group_id: null,
        ti_halted_message: null,
        ta_endtime: 1606838400,
        ta_curdir: 'purple/auctions/2020/201201',
        ta_extend: '5',
        ta_stagger: 'y' },
    { bids_id: 6366100,
        bids_customer: 219748,
        bids_current: 2000,
        bids_maximum: 0,
        bids_timestamp: 1603546269,
        bids_del: 0,
        ti_item: 'DG4629',
        ti_auction: '201201',
        ti_endtime: 1606838400,
        ti_starting_bid: 10,
        ti_closed: 0,
        ti_halted: 0,
        group_id: null,
        ti_halted_message: null,
        ta_endtime: 1606838400,
        ta_curdir: 'purple/auctions/2020/201201',
        ta_extend: '5',
        ta_stagger: 'y' },
    { bids_id: 6380142,
        bids_customer: 274527,
        bids_current: 2050,
        bids_maximum: 6500,
        bids_timestamp: 1603867447,
        bids_del: 0,
        ti_item: 'DG4629',
        ti_auction: '201201',
        ti_endtime: 1606838400,
        ti_starting_bid: 10,
        ti_closed: 0,
        ti_halted: 0,
        group_id: null,
        ti_halted_message: null,
        ta_endtime: 1606838400,
        ta_curdir: 'purple/auctions/2020/201201',
        ta_extend: '5',
        ta_stagger: 'y' }
    ]

dummyOut = { displaynextbid: '2,100.00',
    displayprice: '2,050.00',
    displaywinner: '274527',
    displayendtime: null,
    overridewinner: null,
    overrideprice: null,
    runnerup: '219748',
    maxbid: null,
    increment: '50.00',
    totalbidcount: 7,
    group_id: null,
    nextbid: '2100.00',
    bidcount: 5,
    current: '2050.00',
    lastbidtime: '1603867447',
    bidorder:
        [ { bidder: '219748',
            timestamp: '1603505191',
            bidtype: '',
            bid_amount: '800',
            amount: 800,
            deleted: '',
            id: 6365152 },
            { bidder: '3282',
                timestamp: '1603513414',
                bidtype: '',
                bid_amount: '825',
                amount: 825,
                deleted: '',
                id: 6365596 },
            { bidder: '3282',
                timestamp: '1603513414',
                bidtype: 'm',
                bid_amount: '1000',
                amount: 1000,
                deleted: '',
                id: 6365596 },
            { bidder: '219748',
                timestamp: '1603546255',
                bidtype: '',
                bid_amount: '900',
                amount: 900,
                deleted: '',
                id: 6366099 },
            { bidder: '219748',
                timestamp: '1603546269',
                bidtype: '',
                bid_amount: '2000',
                amount: 2000,
                deleted: '',
                id: 6366100 },
            { bidder: '274527',
                timestamp: '1603867447',
                bidtype: '',
                bid_amount: '2050',
                amount: 2050,
                deleted: '',
                id: 6380142 },
            { bidder: '274527',
                timestamp: '1603867447',
                bidtype: 'm',
                bid_amount: '6500',
                amount: 6500,
                deleted: '',
                id: 6380142 } ],
    maxbidder: '274527',
    maximum: '6500.00',
    rawprice: '2050.00',
    lastbid: '2000.00',
    item: 'DG4629',
    auction: '201201',
    endtime: '1606838400' }

test('building item info', () => {
    expect(buildItemInfo(rawResults)).toEqual(dummyOut);
});