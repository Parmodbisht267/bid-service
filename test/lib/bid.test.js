jest.useFakeTimers();
jest.mock('../../lib/buildItemInfo');
jest.mock('../../lib/redis');
jest.mock('../../lib/db');
jest.mock('ioredis')

//method under test
const { create, maybeUpdateItemAndGroupsEndtime, isTheSellerAlsoTheBidderProm, getBidderProfileProm, getItemInfo, validateBidData, insertBidDB, updateItemCurrentBid, hasAcceptedTermsProm, isBidValid, retrieveStatuses } = require("../../lib/bid");
const buildIteminfo = require('../../lib/buildItemInfo');
const redis = require('../../lib/redis');
const { DateTime } = require('luxon');
const db = require('../../lib/db');
const helper = require('./helper')

test("isTheSellerAlsoTheBidderProm_sellerNotABidderSuccess_throwException", async () => {
    //Arrange
    let item = {
        seller: 999
    }
    let bidObj = {
        customer: 999
    }
    let spy = {}

    db.query.mockReturnValue(Promise.resolve('Not'))
    spy.console = jest.spyOn(console, 'error').mockReturnValue('succcess');

    // Assert
    return expect(isTheSellerAlsoTheBidderProm(bidObj, item)).rejects.toThrow('You cannot bid on an item when you are the seller!');
});

test("isTheSellerAlsoTheBidderProm_sellerIsNotCustomer_throwException", async () => {
    //Arrange
    let item = {
        seller: 999
    }
    let bidObj = {
        customer: 99
    }

    const result = await isTheSellerAlsoTheBidderProm(bidObj, item)

    // Assert
    expect(result).toBeFalsy()
});

test("maybeUpdateItemAndGroupsEndtime_maxRaiseFails_returnFalse", async () => {
    //Arrange
    let itemInfo = {
        maxbidder: 12,
        bidorder: [{ bidder: 12, bid_amount: 23 }],

    }
    let bidObj = {
        customer: 12,
        current: 0,
        maximum: 9
    }
    let auctionInfo = {}

    //Act
    const result = await maybeUpdateItemAndGroupsEndtime(bidObj, itemInfo, auctionInfo)

    // Assert
    expect(result).toBeFalsy();
});

test("maybeUpdateItemAndGroupsEndtime_ifNoRowAffected&ItemInfoClosed_throwExceptionItemNotFound", async () => {
    //Arrange
    let itemInfo = {
        maxbidder: 12,
        bidorder: [{ bidder: 12 }],
        closing:true

    }
    let bidObj = {
        customer: 12,
        current: 0,
        maximum: 9
    }
    let auctionInfo = {}

    db.query.mockReturnValue(Promise.resolve({affectedRows : 0}))

    // Assert
    return expect(maybeUpdateItemAndGroupsEndtime(bidObj, itemInfo, auctionInfo)).rejects.toThrow('Item is closed');
});

test("getBidderProfileProm_ErrorNotAuthorize_throwException", async () => {
    //Arrange
    const customer = '';

    db.query.mockReturnValue(Promise.reject('Not'))

    // Assert
    return expect(getBidderProfileProm(customer)).rejects.toThrow('Not Authorized');
});

test("getBidderProfileProm_returnSuccessResult_throwException", async () => {
    //Arrange
    const customer = 12;

    const result = [{
        'auction': 999,
        'customer': 9999
    }]
    
    db.query.mockReturnValue(Promise.resolve(result))

    try {
        // Act
        var Result = await getBidderProfileProm(customer)

        // Assert
        expect(Result).toBeCalledWith(
            expect.objectContaining({
                auction: expect.any(Number),
                customer: expect.any(Number),
            }));
    } catch (error) { }
});

test("validateBidData_missingCurrentAndMaximum_throwException", async () => {
    //Arrange
    const createParams = {
        auction: "999956A",
        accountId: "9999",
        item: "AB9999",
        placedBid: 9999,
        placedMaxBid: 0
    };

    try {
        // Act
        await validateBidData(createParams)

    } catch (error) {
        // Assert
        expect(error.debug).toEqual('Please provide a bid or max bid');
    }
});

test("validateBidData_missingAuction_throwException", async () => {
    //Arrange
    const createParams = {
        accountId: "9999",
        currentBid: 1221,
        item: "AB9999",
        placedBid: 9999,
        placedMaxBid: 0,
        maxBid: 121
    };

    try {
        // Act
        await validateBidData(createParams)

    } catch (error) {
        // Assert
        expect(error.debug).toEqual('Missing required parameters');
    }
});

test("validateBidData_missingCustomer_throwException", async () => {
    //Arrange
    const createParams = {
        auction: "999956A",
        currentBid: 1221,
        item: "AB9999",
        placedBid: 9999,
        placedMaxBid: 0,
        maxBid: 121
    };

    try {
        // Act
        await validateBidData(createParams)

    } catch (error) {
        // Assert
        expect(error.debug).toEqual('Missing required parameters');
    }
});

test("validateBidData_missingItem_throwException", async () => {
    //Arrange
    const createParams = {
        auction: "999956A",
        accountId: 9999,
        currentBid: 1221,
        placedBid: 9999,
        placedMaxBid: 0,
        maxBid: 121
    };

    try {
        // Act
        await validateBidData(createParams)

    } catch (error) {
        // Assert
        expect(error.debug).toEqual('Missing required parameters');
    }
});

test("getItemInfo_successItemNotFound_throwException", async () => {
    //Arrange
    let spy = {};

    db.query.mockReturnValue(Promise.resolve([]))
    spy.console = jest.spyOn(console, 'error').mockReturnValue('succcess');

    // Assert
    return expect(getItemInfo('', '')).rejects.toThrow('Item not found.');
});

test("insertBidDB_bidDBSuccess_throwBidDBException", async () => {
    //Arrange
    let spy = {};

    const res = {
        insertId: 999
    };

    db.query.mockReturnValue(Promise.resolve(res))
    spy.console = jest.spyOn(console, 'error').mockReturnValue('succcess');

    try {
        // Act
        let result = await insertBidDB({ date: DateTime.local() })

        // Assert
        expect(result.insertId).toEqual(999);
    } catch (error) { }
});

test("insertBidDB_missingInsertId_throwBidDBException", async () => {
    //Arrange
    let spy = {};

    db.query.mockReturnValue(Promise.resolve('insertBidDB failed'))
    spy.console = jest.spyOn(console, 'error').mockReturnValue('succcess');

    // Assert
    return expect(insertBidDB({ date: DateTime.local() })).rejects.toThrow('insertBidDB failed');
});

test("updateItemCurrentBid_unableToUpdateBid_throwException", async () => {
    //Arrange
    let spy = {};
    db.query.mockReturnValue(Promise.reject('Unable to update current bid'))
    spy.console = jest.spyOn(console, 'error').mockReturnValue('succcess');

    try {
        // Act
        await updateItemCurrentBid({}, {})
    } catch (error) {
        // Assert
        expect(error).toEqual('Unable to update current bid');
    }
});

test("hasAcceptedTermsProm_termAccepted_throwException", async () => {
    //Arrange
    let spy = {};

    db.query.mockReturnValue(Promise.resolve([]))
    spy.console = jest.spyOn(console, 'error').mockReturnValue('succcess');

    // Assert
    return expect(hasAcceptedTermsProm({}, {})).rejects.toThrow('Terms must be accepted');
});

test("hasAcceptedTermsProm_errorInTermAccepted_throwException", async () => {
    //Arrange
    let spy = {};

    db.query.mockReturnValue(Promise.resolve())
    spy.console = jest.spyOn(console, 'error').mockReturnValue('succcess');

    // Assert
    return expect(hasAcceptedTermsProm({}, {})).rejects.toThrow('Problem trying to validate acceptance of terms');
});

test("isBidValid_nextBidGreaterThenCurrentOrMaximumBid_throwException", async () => {
    //Arrange
    let bidObj = {
        current: 999,
        maximum: 9999
    }
    let item = {
        nextbid: 99995
    }

    // Act
    function isValid() {
        isBidValid(bidObj, item, {});
    }
    // Assert  
    expect(isValid).toThrowError('Bid must be >= 99995');
});

test("isBidValid_maximumBidLessthanMyPreviousBid_throwException", async () => {
    // Arrange
    let bidObj = {
        current: 999,
        maximum: 9999,
        customer: 9999
    }
    let item = {
        nextbid: 999
    }
    let rawResults = [{
        bids_customer: 9999,
        bids_maximum: 99995,
        bids_del: 0
    }]
    // Act
    function isValid() {
        isBidValid(bidObj, item, rawResults);
    }
    // Assert  
    expect(isValid).toThrowError('Your max bid must be greater than your current max bid of $99995.');
});

test("retrieveStatuses_onSuccess_returnNext", async () => {
    // Arrange
    const req = helper.MockRequest({})

    const res = helper.MockResponse()

    //Mock next error handler
    const next = jest.fn((err) => {
        return res;
    });

    db.query.mockReturnValue(Promise.resolve('hello'))

    // Act
    await retrieveStatuses(req, res, next);

    // Assert  
    expect(next).toHaveBeenCalledTimes(1);
});

test("create_bidDataMissingAuction_throwMissingParametersException", async () => {
    //Arrange
    const createParams = {
        currentBid: 1234,
        maxBid: 1234,
        accountId: 1234,
        item: "AB1234",
        placedBid: 1234,
        placedMaxBid: 0,
    };

    const req = helper.MockRequest('bid',createParams);

    const res = helper.MockResponse()

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        res.error = err.debug
        return res;
    });

    // Act
    create(req, res, next)

    // Assert
    expect(res.error).toEqual('Missing required parameters');
});

test("create_bidDataMissingCustomer_throwMissingParametersException", async () => {
    //Arrange
    const createParams = {
        auction: 456,
        currentBid: 1234,
        maxBid: 1234,
        item: "AB1234",
        placedBid: 1234,
        placedMaxBid: 0,
    };

    const req = helper.MockRequest('bid',createParams);;

    const res = helper.MockResponse()

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        res.error = err.debug
        return res;
    });

    // Act
    create(req, res, next)

    // Assert
    expect(res.error).toEqual('Missing required parameters');
});

test("create_bidDataMissingItem_throwMissingParametersException", async () => {
    //Arrange
    const createParams = {
        auction: 456,
        currentBid: 1234,
        maxBid: 1234,
        accountId: 1234,
        placedBid: 1234,
        placedMaxBid: 0,
    };

    const req = helper.MockRequest('bid',createParams);;

    const res = helper.MockResponse()

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        res.error = err.debug
        return res;
    });

    // Act
    create(req, res, next)

    // Assert
    expect(res.error).toEqual('Missing required parameters');
});

test("create_bidDataMissingCurrentAndMaximum_throwMissingParametersException", async () => {
    //Arrange
    const createParams = {
        auction: 1234,
        accountId: 1234,
        item: "AB1234",
        placedBid: 1234,
        placedMaxBid: 0,
    };

    const req = helper.MockRequest('bid',createParams);;

    const res = helper.MockResponse()

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        res.error = err.debug
        return res;
    });

    // Act
    create(req, res, next)

    // Assert
    expect(res.error).toEqual('Please provide a bid or max bid');
});

test("create_nextBidGreaterThenCurrentOrMaximumBid_throwException", async () => {
    //Arrange
    const createParams = {
        auction: "123456A",
        currentBid: 1234,
        accountId: "1234",
        item: "AB1234",
        placedBid: 1234,
        placedMaxBid: 0
    };

    const req = helper.MockRequest('bid',createParams);;

    db.query.mockReturnValueOnce(Promise.resolve([{ result: "true" }])).mockReturnValueOnce(Promise.resolve(true)).mockReturnValue(Promise.resolve(helper.resultMockDb()))

    buildIteminfo.mockReturnValue(helper.itemInfo())
    const res = helper.MockResponse()

    //Mock next error handler
    let next = jest.fn((err) => {
        let errResponse = err.toString()
        let errResult = errResponse.split('Error: ')
        res.status = 400;
        res.error = errResult[1]
        return res;
    });

    // Act
    let result = await create(req, res, next)

    // Assert
    expect(result.error).toEqual('Bid must be >= 10000000')
});

test("create_biddernotauthorized_throwExcxeption", async () => {
    //Arrange
    const createParams = {
        auction: "123456A",
        currentBid: 1234,
        accountId: "1234",
        item: "AB1234",
        placedBid: 1234,
        placedMaxBid: 0
    };

    const req = helper.MockRequest('bid',createParams);

    const res = helper.MockResponse()

    db.query.mockReturnValue(Promise.reject('Not Authorized'));

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        res.error = err;
        return res;
    });

    // Act
    let result = await create(req, res, next)

    // Assert
    expect(result.error).toEqual('Not Authorized');
});

test("create_bidderIsAlsoTheSeller_throwException", async () => {
    //Arrange
    const createParams = {
        auction: "123456A",
        currentBid: 1234,
        accountId: "1234",
        item: "AB1234",
        placedBid: 1234,
        placedMaxBid: 0
    };

    const req = helper.MockRequest('bid',createParams);

    const res = helper.MockResponse()

    db.query.mockReturnValueOnce(Promise.resolve([{ result: "true" }])).mockReturnValueOnce(Promise.resolve(true)).mockReturnValueOnce(Promise.resolve(helper.resultMockDb())).mockReturnValue(Promise.resolve('You cannot bid on an item when you are the seller!'))

    buildIteminfo.mockReturnValue(helper.itemInfoSellerException())

    //Mock next error handler
    let next = jest.fn((err) => {
        let errResponse = err.toString()
        let errResult = errResponse.split('Error: ')
        res.status = 400;
        res.error = errResult[1]
        return res;
    });

    // Act
    let result = await create(req, res, next)
    // Assert
    expect(result.error).toEqual('You cannot bid on an item when you are the seller!');
});

test("create_bidderHasNotAcceptedTerms_throwException", async () => {
    //Arrange
    const createParams = {
        auction: "123456A",
        currentBid: 1234,
        accountId: "1234",
        item: "AB1234",
        placedBid: 1234,
        placedMaxBid: 0
    };

    const req = helper.MockRequest('bid',createParams);

    const res = helper.MockResponse()

    db.query.mockReturnValueOnce(Promise.resolve([{ result: "true" }])).mockReturnValue(Promise.reject('When given bidder/accountId has not accepted the terms of agreement yet'));

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        res.error = err
        return res;
    });

    // Act
    var result = await create(req, res, next)

    // Assert
    expect(result.error).toEqual('When given bidder/accountId has not accepted the terms of agreement yet');
});

test("create_validData_returnSuccessfulResultList", async () => {
    //Arrange
    const createParams = {
        auction: "123456A",
        currentBid: 1234,
        maxBid: 1234,
        accountId: 1234,
        item: "AB1234",
        placedBid: 1234,
        placedMaxBid: 0,
    };

    const req = helper.MockRequest('bid',createParams);

    const res = helper.MockResponse()

    db.query.mockReturnValueOnce(Promise.resolve([{ result: "true" }])).mockReturnValueOnce(Promise.resolve(true)).mockReturnValueOnce(Promise.resolve(helper.resultMockDb())).mockReturnValueOnce(Promise.resolve(false)).mockReturnValueOnce(Promise.resolve(true)).mockReturnValueOnce(Promise.resolve({ insertId: 'true' })).mockReturnValue(Promise.resolve(true))

    redis.append.mockReturnValue(Promise.resolve(true))

    buildIteminfo.mockReturnValue(helper.itemInfoSuccess());

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        return res;
    });

    // Act
    const result = await create(req, res, next);

    // Assert
    expect(req.results.message).toEqual('Thank you! Your bid was successfully placed.');
});

test("create_validData_returnSuccessfulLegacyData", async () => {
    //Arrange
    const createParams = {
        auction: "123456A",
        currentBid: 1234,
        maxBid: 1234,
        accountId: 1234,
        item: "AB1234",
        placedBid: 1234,
        placedMaxBid: 0,
    };

    const req = helper.MockRequest('bid',createParams);
    const res = helper.MockResponse()

    db.query.mockReturnValueOnce(Promise.resolve([{ result: "true" }])).mockReturnValueOnce(Promise.resolve(true)).mockReturnValueOnce(Promise.resolve(helper.resultMockDb())).mockReturnValueOnce(Promise.resolve(false)).mockReturnValueOnce(Promise.resolve(true)).mockReturnValueOnce(Promise.resolve({ insertId: 'true' })).mockReturnValue(Promise.resolve(true))

    redis.append.mockReturnValue(Promise.resolve(true))

    buildIteminfo.mockReturnValue(helper.itemInfoSuccess());

    //Mock next error handler
    let next = jest.fn((err) => {
        res.status = 400;
        return res;
    });

    // Act
    const result = await create(req, res, next);

    // Assert
    expect.objectContaining([
        expect(req.legacyData).toHaveProperty('seller'),
        expect(req.legacyData).toHaveProperty('displaynextbid'),
        expect(req.legacyData).toHaveProperty('displayprice'),
        expect(req.legacyData).toHaveProperty('increment'),
    ])
   
});

