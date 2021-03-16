jest.mock('messagelib')

const { sendCreateBidMessage, sendLargeBidMessage, sendOutbidMessage, sendDeleteBidMessage } = require('../../lib/events')
const { Message } = require('messagelib');
const helper = require('./helper')

// sendCreateBidMessage
test("sendCreateBidMessage_missingLegacyData_returnNext", async () => {
    //Arrange
    const createParams = {};

    const req = helper.MockRequest(createParams)

    const res = helper.MockResponse('event')

    //Mock next error handler
    let next = jest.fn((err) => {
        return res;
    });

    // Act
    sendCreateBidMessage(req, res, next)

    // Assert
    expect(next).toHaveBeenCalled();
});

test("sendCreateBidMessage_SuccessfullyCallNextHandler_returnNext", async () => {
    //Arrange
    const createParams = {};
    const mockSend = Message.prototype.send = jest.fn()

    const req = helper.MockRequest('eventCreateBid', createParams)

    const res = helper.MockResponse()

    //Mock next error handler
    let next = jest.fn((err) => {
        return res;
    });

    // Act
    sendCreateBidMessage(req, res, next)
    helper.mockAnonymousFunction(mockSend.mock.calls[0][0])

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
});

// sendLargeBidMessage
test("sendLargeBidMessage_currentLessThenInternalNotification_returnNext", async () => {
    //Arrange
    const result = {
        current: 3
    };
    const bidProfile = {
        internalNotification: 5
    }

    const req = helper.MockRequest('eventLargeBid', result, bidProfile)

    const res = helper.MockResponse('event')

    //Mock next error handler
    let next = jest.fn((err) => {
        return res;
    });

    // Act
    sendLargeBidMessage(req, res, next)

    // Assert
    expect(next).toHaveBeenCalled();
});

test("sendLargeBidMessage_SuccessfullyCallNextHandler_returnNext", async () => {
    //Arrange
    const result = {
        current: 6
    };
    const bidProfile = {
        internalNotification: 5
    }

    const mockSend = Message.prototype.send = jest.fn()

    const req = helper.MockRequest('eventLargeBid', result, bidProfile)

    const res = helper.MockResponse()

    //Mock next error handler
    let next = jest.fn((err) => {
        return res;
    });

    // Act
    sendLargeBidMessage(req, res, next)
    helper.mockAnonymousFunction(mockSend.mock.calls[0][0])

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
});

// sendOutbidMessage
test("sendOutbidMessage_itemPreBidDisplaywinnerEqualToItemPostBidDisplaywinner_returnNext", async () => {
    //Arrange
    const itemPreBid = {
        displaywinner: 3
    };
    const itemPostBid = {
        displaywinner: 3
    }

    const req = helper.MockRequest('eventOutBid', itemPreBid, itemPostBid)

    const res = helper.MockResponse('event')

    //Mock next error handler
    let next = jest.fn((err) => {
        return res;
    });

    // Act
    sendOutbidMessage(req, res, next)

    // Assert
    expect(next).toHaveBeenCalled();
});

test("sendOutbidMessage_SuccessfullyCallNextHandler_returnNext", async () => {
    //Arrange
    const itemPreBid = {
        displaywinner: 3
    };
    const itemPostBid = {
        displaywinner: 6
    }

    const mockSend = Message.prototype.send = jest.fn()

    const req = helper.MockRequest('eventOutBid', itemPreBid, itemPostBid)

    const res = helper.MockResponse()

    //Mock next error handler
    let next = jest.fn((err) => {
        return res;
    });

    // Act
    sendOutbidMessage(req, res, next)
    helper.mockAnonymousFunction(mockSend.mock.calls[0][0])

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
});

// sendDeleteBidMessage
test("sendDeleteBidMessage_SuccessfullyCallNextHandler_returnNext", async () => {
    //Arrange
    const itemDeleteBid = {};

    const mockSend = Message.prototype.send = jest.fn()

    const req = helper.MockRequest('eventDeleteBid', itemDeleteBid)

    const res = helper.MockResponse()

    //Mock next error handler
    let next = jest.fn((err) => {
        return res;
    });

    // Act
    sendDeleteBidMessage(req, res, next)
    helper.mockAnonymousFunction(mockSend.mock.calls[0][0])

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
});