jest.mock('../../../common/models/orm')
jest.mock("../../../common/BidIncrements")
jest.mock('../../lib/proxy/auditProxyBid',() =>{
    return jest.fn().mockImplementation(() => {
        return false;
      });
})

const proxyHelper = require('./proxy.helper')
const { checkIsEmployee, determineAuction, editBid, maybeLowerMaxBid } = require('../../lib/proxy/ProxyBid');
const { orm: sql } = require("../../../common/models/orm");

test("checkIsEmployee_ifNotEmployee_throwException403", async () => {

    //Arrange
    const req = proxyHelper.MockRequest('employee', {});

    const res = proxyHelper.MockResponse()

    // Act
    checkIsEmployee(req, res, {});

    // Assert
    expect(res.status).toEqual(403);
    expect(res.json.error).toEqual('Must be an employee to place a proxy bid');
});

test('checkIsEmployee_ifEmployee_callNext', async () => {
    //Arrange
    const createParams = {
        employee: 22
    };
    const req = proxyHelper.MockRequest('employee', createParams);

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        return res;
    });

    const res = proxyHelper.MockResponse()

    // Act
    checkIsEmployee(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();

})

test("determineAuction_missingIcnValue_throwException400", async () => {
    //Arrange
    const createParams = {};

    const req = proxyHelper.MockRequest('auction', createParams);

    const res = proxyHelper.MockResponse()

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        res.error = err.debug
        return res;
    });

    // Act
    determineAuction(req, res, next);

    // Assert
    expect(res.status).toEqual(400);
    expect(res.json.error).toEqual('Missing icn value in POST data');
});

test("determineAuction_errorInAuctionItem_throwException400", async () => {
    //Arrange
    const createParams = {
        icn: '12'
    };
    const spy = {}
    const req = proxyHelper.MockRequest('auction', createParams);

    const res = proxyHelper.MockResponse()

    

    sql.query.mockReturnValue(Promise.reject({}))

    //Mock next error handler
    let next = jest.fn((err) => {
        res.error = err.debug
        return res;
    });

    // Act
    await determineAuction(req, res, next)
    // Assert
    expect(res.status).toEqual(400);
    expect(res.json.error).toEqual('Problems determining auction from item, or item is closed: [object Object]');

});

test("determineAuction_ItemClosedForThisICN_throwException406", async () => {
    //Arrange
    const createParams = {
        icn: '12'
    };
    const spy = {}
    const req = proxyHelper.MockRequest('auction', createParams);

    const res = proxyHelper.MockResponse()

    sql.query.mockReturnValue(Promise.resolve([]))

    //Mock next error handler
    let next = jest.fn((err) => {
        res.error = err.debug
        return res;
    });

    // Act
    await determineAuction(req, res, next)

    // Assert
    expect(res.status).toEqual(406);
    expect(res.json.error).toEqual('Auction not determined from item 12 or item is closed.');

});

test("determineAuction_auctionItemSuccess_returnNext", async () => {
    //Arrange
    const createParams = {
        icn: '12'
    };
    const spy = {}
    const req = proxyHelper.MockRequest('auction', createParams);

    const res = proxyHelper.MockResponse()

    sql.query.mockReturnValue(Promise.resolve([{result:'true'}]))

    //Mock next error handler
    let next = jest.fn((err) => {
        // res.error = err.debug
        return res;
    });

    // Act
    await determineAuction(req, res, next)

    // Assert
    expect(next).toHaveBeenCalledTimes(1)
});

test("maybeLowerMaxBid_missingMaximum_callNext", async () => {
    //Arrange
    const params = {
        maximum: ''
    }
    const req = proxyHelper.MockRequest('dummy', params);

    const res = proxyHelper.MockResponse('employee')

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        return res;
    });

    // Act
    maybeLowerMaxBid(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
});

test("maybeLowerMaxBid_missingMaximum_throwException404", async () => {
    //Arrange
    const createParams = {
        maximum: 12
    };

    const req = proxyHelper.MockRequest('dummy', createParams);

    const res = proxyHelper.MockResponse()

    sql.query.mockReturnValue(Promise.resolve([{closed:1}]))

    //Mock next error handler
    let next = jest.fn((err) => {
        return res;
    });

    // Act
    await maybeLowerMaxBid(req, res, next)

    // Assert
    expect(res.sendData).toEqual(404);
});

test("maybeLowerMaxBid_currentBidResultNotFound_callNext", async () => {
    //Arrange
    const createParams = {
        maximum: 12
    };

    const req = proxyHelper.MockRequest('dummy', createParams);

    const res = proxyHelper.MockResponse()

    sql.query.mockReturnValueOnce(Promise.resolve([{current:3}])).mockReturnValue(Promise.resolve({}))

    //Mock next error handler
    let next = jest.fn((err) => {
        return res;
    });

    // Act
    await maybeLowerMaxBid(req, res, next)

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
});

test("editBid_missingBidAndMaximum_throwException400", async () => {
    //Arrange
    const params = {
        bid: 1,
        maximum: 2
    }
    const req = proxyHelper.MockRequest(params);

    const res = proxyHelper.MockResponse()

    // Act
    editBid(req, res, {});

    // Assert
    expect(res.status).toEqual(400);
    expect(res.json.error).toEqual('Must provide a new value for bid and/or maximum');
});

test("editBid_errorToUpdatingBid_throwException400", async () => {
    //Arrange
    const params = {
        bid: 1,
        maximum: 2
    }
    const params1 = {
        employee:{
            accountId:23
        }
    }
    const req = proxyHelper.MockRequest('editBid',params,params1);

    const res = proxyHelper.MockResponse()

    sql.query.mockReturnValue(Promise.reject({}))

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        return res;
    });


    // Act
    await editBid(req, res, next);

    // Assert
    expect(res.status).toEqual(400);
    expect(res.json.error).toEqual('Problems updating the bid: [object Object]');
});

test("editBid_bidUpdatedSuccessfully_returnNext", async () => {
    //Arrange
    const params = {
        bid: 1,
        maximum: 2
    }
    const params1 = {
        employee:{
            accountId:23
        }
    }
    const req = proxyHelper.MockRequest('editBid',params,params1);

    const res = proxyHelper.MockResponse()

    sql.query.mockReturnValue(Promise.resolve([{account:'',auction:'',item:''}]))

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        return res;
    });


    // Act
    await editBid(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
});