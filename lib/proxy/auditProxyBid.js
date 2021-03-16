var trackingAudit = require("../../../common/models").trackingAudit;

function auditProxyBid(req, res, next){
  // Adds record in tblAudit for the customer with all proxy bid actions in req.proxyData.actions.
  var proxyData = req.proxyData || {};
  var body = req.body || {};
  var user = req.user || {};
  var bids = req.results || {};

  var accountId = body.accountId;
  var icn = body.icn;
  var auction = body.auction;

  var bid = body.bid;
  var maximum = body.max;

  var actionHeader = "Proxy Bid:: ICN:" + icn + " Auction: " + auction ;

  var bidActions = [];
  if (bid)
    bidActions.push("Bid: " + bid);
  if (maximum)
    bidActions.push("Maximum: " + maximum);

  bidActions = bidActions.concat(proxyData.actions);
  var payloadAction = ( bidActions.length > 0 ? ", Submitted: " + bidActions.join(", ") : "");
  trackingAudit.create({
    user: user.employee.userName,
    action: actionHeader + payloadAction,
    archive: JSON.stringify({body:body,bid_result:bids}),
    type: "customer",
    fid: accountId
  }).then(function(){next();}).catch(function(){next();})
}
module.exports = auditProxyBid;
