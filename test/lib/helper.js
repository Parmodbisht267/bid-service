const { mockRequest } = require("mock-req-res");

const MockRequest = (type, createParamsDelegate, otherParamsDelegate = null) => {
    switch (type) {
        case 'owner':
            return mockRequest({
                body: {},
                params: createParamsDelegate
            })
        case 'send':
            return mockRequest({
                body: {},
                params: {},
                results: createParamsDelegate
            });
        case 'eventCreateBid':
            return mockRequest({
                body: {},
                results: createParamsDelegate,
                transactionId: '23',
                legacyData: {
                    user_agent: 'me',
                    ip_address: '123.345.456.45'
                }
            })
        case 'eventLargeBid':
            return mockRequest({
                body: {},
                results: createParamsDelegate,
                bidProfile: otherParamsDelegate
            })
        case 'eventOutBid':
            return mockRequest({
                body: {},
                itemPreBid: createParamsDelegate,
                itemPostBid: otherParamsDelegate
            })
        case 'eventDeleteBid':
            return mockRequest({
                body: {},
                itemDeleteBid: createParamsDelegate,
            })
        case 'bid':
            return mockRequest({
                body: {},
                params: createParamsDelegate,
                headers: {
                    'x-forwarded-for': '000.0.000.000, 00.00.0.00'
                }
            });
        default:
            return mockRequest({
                body: {},
                query: createParamsDelegate
            })
    }
};

var MockResponse = (type = null) => {
    switch (type) {
        case 'owner':
            const Ownerres = {};
            Ownerres.status = () => 200;
            Ownerres.json = () => res;
            return Ownerres;
        case 'send':
            const Sendres = {
                send: function (sData) {
                    this.sendData = sData
                    return this
                },
                json: function (jdata) {
                    this.json = jdata
                    return this
                },
                format: function (obj) {
                    var keys = Object.keys(obj);
                    obj[keys[0]](this)
                    this.result = obj
                    return this
                },
                status: function (stdata) {
                    this.status = stdata
                    return this
                }
            };
            return Sendres;
        default:
            const res = {};
            res.status = () => 200;
            res.json = () => res;
            return res;
    }

};

var mockAnonymousFunction = (data) => {
    var keys = data(this)
    this.result = keys
    return this
}

var itemInfo = () => {
    return {
        seller: undefined,
        displaynextbid: '0.00',
        displayprice: '0.00',
        displayendtime: null,
        overridewinner: null,
        overrideprice: null,
        maxbid: null,
        increment: '2.50',
        totalbidcount: 0,
        nextbid: 10000000,
        bidcount: 0,
        current: '0.00',
        lastbidtime: 0,
        bidorder: [],
        maximum: '0.00',
        rawprice: '0.00',
        lastbid: '0.00',
        item: undefined,
        auction: undefined,
        endtime: null,
        group_id: undefined
    }
}

var itemInfoSellerException = () => {
    return {
        seller: 1234,
        displaynextbid: '0.00',
        displayprice: '0.00',
        displayendtime: null,
        overridewinner: null,
        overrideprice: null,
        maxbid: null,
        increment: '2.50',
        totalbidcount: 0,
        nextbid: 10,
        bidcount: 0,
        current: '0.00',
        lastbidtime: 0,
        bidorder: [],
        maximum: '0.00',
        rawprice: '0.00',
        lastbid: '0.00',
        item: undefined,
        auction: undefined,
        endtime: null,
        group_id: undefined
    }
}

var itemInfoSuccess = () => {
    return {
        seller: undefined,
        displaynextbid: '0.00',
        displayprice: '0.00',
        displayendtime: null,
        overridewinner: null,
        overrideprice: null,
        maxbid: null,
        increment: '2.50',
        totalbidcount: 0,
        nextbid: 10,
        bidcount: 0,
        current: '0.00',
        lastbidtime: 0,
        bidorder: [],
        maximum: '0.00',
        rawprice: '0.00',
        lastbid: '0.00',
        item: undefined,
        auction: undefined,
        endtime: null,
        group_id: undefined
    }
}

const resultMockDb = () => {
    return [
        {
            ta_curdir: "foo",
            ta_extend: "bar",
            itemInfo: {},
            auctionInfo: {},
            rawResults: {
                bids_customer: 1234
            }
        }
    ]
}

const exportFunction = {
    MockRequest,
    MockResponse,
    mockAnonymousFunction,
    itemInfo,
    resultMockDb,
    itemInfoSellerException,
    itemInfoSuccess
}

module.exports = exportFunction