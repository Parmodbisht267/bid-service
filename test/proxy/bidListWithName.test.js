jest.mock('../../../common/models/orm')
jest.mock("../../../common/BidIncrements")
jest.mock('../../lib/proxy/auditProxyBid',() =>{
    return jest.fn().mockImplementation(() => {
        return false;
      });
})

const proxyHelper = require('./proxy.helper')
const { orm: sql } = require("../../../common/models/orm");
const { fetchBidList } = require('../../lib/proxy/BidListWithNames');

test("fetchBidList_errorGettingBidList_throwException400", async () => {
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
    await fetchBidList(req, res, next)
    // Assert
    expect(res.status).toEqual(400);
    expect(res.json.error).toEqual('Problems getting a bid list for the item: [object Object]');

});

test("fetchBidList_accountNotFound_throwException400", async () => {
    //Arrange
    const createParams = {
        accountId: '12'
    };

    const req = proxyHelper.MockRequest('auction', createParams);

    const res = proxyHelper.MockResponse()

    

    sql.query.mockReturnValue(Promise.resolve({}))

    //Mock next error handler
    let next = jest.fn((err) => {
        res.error = err.debug
        return res;
    });

    // Act
    await fetchBidList(req, res, next)
    // Assert
    expect(res.status).toEqual(400);
    expect(res.json.error).toEqual('Account 12 was not found ');

});
