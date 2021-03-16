const { mockRequest } = require("mock-req-res");

var MockResponse = (type = null) => {
    switch(type){
        case 'employee' :
            const employeeres = {};
            employeeres.status = () => 200;
            employeeres.json = () => res;
            return employeeres;
        default :
        const res = {
            send: function (sData) {
                this.sendData = sData
                return this
            },
            json: function (data) {
                this.json = data
                return this
            },
            status: function (data) {
                this.status = data
                return this
            }
        };
        return res;
    }
    
};

const MockRequest = (type = null,createParamsDelegate,createParamsDelegate1=null) => {
    switch(type){
        case 'employee' :
        return mockRequest({
            body: {},
            params: {},
            user: createParamsDelegate,
            headers: {}
        });
        case 'auction' :
        return mockRequest({
            body: {},
            params: createParamsDelegate,
            user: {},
            headers: {}
        });
        case 'editBid' :
        return mockRequest({
            body: createParamsDelegate,
            params: {},
            user: createParamsDelegate1,
            headers: {},
            proxyData:{
                actions:[]
            }
        });
        default : 
        return mockRequest({
            body: createParamsDelegate,
            params: {},
            user: {},
            headers: {}
        });

    }
};

var mockAnonymousFunction = (data) => {
    var keys = data(this)
    this.result = keys
    return this
}

const exportFunction = {
    MockResponse,
    MockRequest,
    mockAnonymousFunction
}

module.exports = exportFunction