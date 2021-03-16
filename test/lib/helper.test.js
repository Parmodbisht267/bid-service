//method under test
const { owner, send } = require('../../lib/helpers')
const helper = require('./helper')

test("create_notOwner_throwException", async () => {
    const createParams = {
        user: {
            id: 47
        },
        body: {
            currentBid: 0,
            auction: 'test',
            customer: 36,
            item: 'test'
        },
        query: {}
    };

    //Arrange
    const req = helper.MockRequest('owner', createParams)

    const res = helper.MockResponse('owner')

    //Mock next error handler
    let next = jest.fn((err) => {
        res.error = err.debug
        res.status = 400;
        return res;
    });

    // Act
    owner(req, res, next)

    // Assert
    expect(res.error).toEqual('You lack permission to the requested document');
});

test("send_ifCodeIsMissing_CodeNotfound", async () => {
    const createParams = {
        error: {
            message: 'results.code not found'
        }
    };

    //Arrange
    const req = helper.MockRequest('send', createParams)

    const res = helper.MockResponse('send')

    // Act
    send(req, res, {})

    // Assert
    expect(res.status).toEqual(200);
    expect(res.sendData).toEqual('results.code not found');
});

test("send_missingCodeAndError_CodeAndErrorNotfound", async () => {
    const createParams = {
        error: 'results.code and results.error.message not found'
    };

    //Arrange
    const req = helper.MockRequest('send', createParams)

    const res = helper.MockResponse('send')

    // Act
    send(req, res, {})

    // Assert
    expect(res.status).toEqual(200);
    expect(res.sendData.error).toEqual('results.code and results.error.message not found');
});

test("send_missingError_errorMessageNotFound", async () => {
    const createParams = {
        code: 400,
        error: 'Error message not found'
    };

    //Arrange
    const req = helper.MockRequest('send', createParams)

    const res = helper.MockResponse('send')

    // Act
    send(req, res, {})

    // Assert
    expect(res.status).toEqual(400);
    expect(res.sendData.error).toEqual('Error message not found');
});

test("send_StatusCode&ErrorMessageBothExists_returnStatusCode403", async () => {
    const createParams = {
        code: 403,
        error: {
            message: 'Code and Error both present'
        }
    };

    //Arrange
    const req = helper.MockRequest('send', createParams)

    const res = helper.MockResponse('send')

    // Act
    send(req, res, {})

    // Assert
    expect(res.status).toEqual(403);
    expect(res.sendData).toEqual('Code and Error both present');
});