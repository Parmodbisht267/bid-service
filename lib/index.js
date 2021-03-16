//const newrelic = require('newrelic');
const _ = require('lodash');
const express = require('express');
const compression = require('compression');
const bodyParser = require('body-parser');
const middle = require('../../common/middleware');
const { INCREMENTS } = require('../../common/BidIncrements');
const { owner, send } = require('./helpers');
const bids = require('./bid');
const events = require('./events');
const pkg = require('../package.json');
const { ProxyBids, auditProxyBid, BidListWithNames } = require('./proxy');
const version = 'v1';
const baseurl = `/${version}/bids`;
const fullurl = `/${ version }/auctions/:auction/items/:icn/bids`;
const accept = ['json', 'xml', 'txt'];
const oauth = middle.createOAuthServer();
const app = express();
app.enable('trust proxy');
app.use(middle.virtual(accept));
app.use(middle.acceptable(accept));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(middle.bearerAuth());
app.use(compression());

// unauthed routes
app.get(`${ baseurl }/info`, (req, res, next) => {
    req.results = _.pick(pkg, 'name', 'version', 'description');
    return next();
}, send);
app.get(`/api/increments`, (req, res, next) => {
    req.results = INCREMENTS;
    return next();
}, send);
app.get(`${ baseurl }/increments`, (req, res, next) => {
    req.results = INCREMENTS;
    return next();
}, send);

app.get(
    `${ fullurl }`, 
    bids.retrieve, 
    send
); //BidHistory

// only accesible from localhost: port
app.delete(`auction/:auction/item/:item`, bids.getPostDeleteItemInfo, events.sendDeleteBidMessage, send);
// authed

app.use(oauth.authorise());
app.get(`${ baseurl }/statuses/:id?`, bids.retrieveStatuses, send);

app.post(
    `/api/bid`,
    bids.create,
    events.sendCreateBidMessage,
    events.sendLargeBidMessage,
    events.sendOutbidMessage,
    send
);
app.post(
    `${ fullurl }`,
    owner,
    bids.create,
    events.sendCreateBidMessage,
    events.sendLargeBidMessage,
    events.sendOutbidMessage, 
    send
);
app.post(
    `${ baseurl }`,
    owner,
    bids.create,
    events.sendCreateBidMessage,
    events.sendLargeBidMessage,
    events.sendOutbidMessage, 
    send
);
// employee only
app.use(middle.employee());
app.get(
    `${ baseurl }/statuses/:id?`,
    bids.retrieveStatuses,
    send
);
app.get(
    `${ baseurl }/determineAuction/:icn`,
    ProxyBids.checkIsEmployee,
    ProxyBids.determineAuction,
    BidListWithNames.send
);
app.get(
    `${ baseurl }/bidList/:icn/:auction/:accountId?`,
    ProxyBids.checkIsEmployee,
    BidListWithNames.fetchBidList,
    BidListWithNames.send
);
// app.post(`${ baseurl }/statuses`, todo); // not used?
app.post(
    `${ baseurl }/proxy`,
    ProxyBids.checkIsEmployee,
    ProxyBids.determineAuction,
    ProxyBids.maybeLowerMaxBid,
    owner,
    bids.create,
    events.sendCreateBidMessage,
    events.sendLargeBidMessage,
    events.sendOutbidMessage,
    auditProxyBid,
    send
);
app.post(`${ baseurl }/proxyTest`, ProxyBids.checkIsEmployee, ProxyBids.determineAuction, ProxyBids.maybeLowerMaxBid, auditProxyBid, send); //check if needed
app.put(`${ baseurl }/proxyEdit/:bidId`, ProxyBids.checkIsEmployee, ProxyBids.editBid, auditProxyBid, ProxyBids.sendEditResponse);
// app.put(`${ baseurl }/statuses/:id?`, todo); // not used?
// app.delete(`${ baseurl }`, todo); // not used?
// app.delete(`${ fullurl }`, todo); // not used?
// Error middleware
app.use(middle.errorHandler());
app.use(middle.errorLogger());
app.use(middle.errorResponse());
module.exports = app;