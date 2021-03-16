/*
Here we have routines for preparing a proxy bid for entry into the system.
*/
const _ = require('lodash');
const increment = require("../../../common/BidIncrements");
const { orm: sql } = require("../../../common/models/orm");
const auditProxyBid = require("./auditProxyBid");


function checkIsEmployee(req, res, next) {
     if (req.user && req.user.employee)
     {
         req.proxyData = {actions:[]};
         return next();
     }
     else
     {
         res.status(403).json({error: "Must be an employee to place a proxy bid"});
     }
}

function determineAuction(req, res, next) {
    console.log("in determineAuction");
    if (typeof(req.params.icn) != 'undefined')
        req.body.icn = req.params.icn;

    if (typeof(req.body.icn) == 'undefined') {
        res.status(400).json({error: "Missing icn value in POST data"});
        return;
    }

    //   const query = "select auction from tblInventory where item=:icn and closed = 0 and endtime > now()";
    const query =
        "select  a.auction, a.title as auction_title, i.item, i.first_line_description "+
        "from tblAuctions a "+
        "left join tblInventory i on a.auction = i.auction "+
        "where date(a.endtime) >= curdate() and i.closed = 0 and  i.item=:icn "+
        "order by auction, item";

    return sql.query(query, {type:sql.QueryTypes.SELECT, replacements: { icn: req.body.icn }})
    .then(function (results)  {
        if (results.length > 0)
        {
            req.body.auctionList = [];
            results.forEach(function (oneRow) {
                req.body.auctionList.push(oneRow);
            } );

            return next();
        }
        else
        {
            res.status(406).json({error: "Auction not determined from item " + req.body.icn + " or item is closed."});
        }

    })
    .catch(function (error)   {
        console.log(error);
        res.status(400).json({error: "Problems determining auction from item, or item is closed: " + error});
    });
}
function maybeLowerMaxBid(req, res, next) {
    const trace = true;

    if (!req.body.maximum)
    {
        //  If we done have a maximum in the post data or it is zero, then we
        //  aren't going to be setting it and we can move on.
        return next();
    }

    const revisedMaximum = increment.roundBid(req.body.maximum);

    if (typeof(req.body.accountId) == 'undefined')
        req.body.accountId = req.params.accountId;

    const sqlParms = { icn : req.body.icn, auction: req.body.auction, accountId : req.body.accountId };
    const maxQuery = "select ge.id as bidId, ge.maximum, i.closed from tblGlobalEntries ge "+
        "left join tblInventory i on ge.item = i.item  "+
        "where ge.auction = :auction and  ge.item = :icn and ge.customer = :accountId and ge.maximum > 0 and ge.del = 0 " +
        "order by ge.maximum desc limit 1";
    return sql.query(maxQuery, {type:sql.QueryTypes.SELECT,  replacements: sqlParms})
    .then(function (maxResults) {
        // Save the max results in a string so we have access to them  from the inner query, later.  When that query
        //  runs, it whipes out these results.
        const maxResultsString = JSON.stringify(maxResults[0]);
        if (maxResults.length == 0) {
            //  They don't have a maximum bid on record for this item.  So we do nothing and let the
            //  downstream processes take care of it.
            return next();
        }
        else
        if (maxResults[0].closed == 1) {
            res.send(404, {
                message:  "The item is closed",
                maximum : req.body.maximum, accountId: req.body.accountId });
        }
        else
        if (maxResults[0].maximum < revisedMaximum)
        {
            return next();
        }
        else
        {

            //  We have the max bid for this account and it passes inspection.  Let's move on to the next
            //  query and continue.
            const currentQuery = " select current from tblGlobalEntries where auction=:auction and  item=:icn order by current and del = 0  desc limit 1";
            return sql.query(currentQuery, {type:sql.QueryTypes.SELECT,  replacements: sqlParms})
            .then(function(currentBidResults) {


              //  We have a maximum, need to see if it is an acceptable value, between the current high bid and their
                //  old maximum.
                if (currentBidResults.length > 0)
                {
                    //  convert the results objects into results rows for easy access to the values therein.
                    const maxResults = JSON.parse(maxResultsString);
                    const currentBidResults = currentBidResults[0];
                    if (currentBidResults.current < revisedMaximum) {
                        //  all is set for the update
                        const updateStmt = "update tblGlobalEntries set maximum = :maximum, modifiedDate=now(), modifiedByAccount= :account where id = :bidId";
                        const updateParams = {  maximum : revisedMaximum, account: req.user.employee.accountId, bidId: maxResults.bidId}
                        sql.query(updateStmt, {type:sql.QueryTypes.UPDATE,  replacements: updateParams} ).then(function(updateResults) {
                            req.proxyData.actions.push("Lowered Max Bid");
                            auditProxyBid(req, res, function(){
                                res.send(200, {
                                    message:  "Lower maximum bid established",
                                    maximum : req.body.maximum,
                                    revisedMaximum: revisedMaximum,
                                    accountId: req.body.accountId,
                                    icn : req.body.icn, auction: req.body.auction,
                                    globalEntryId : maxResults.bidId});
                            });
                        });
                    }
                    else {
                        return next();
                    }
                }
                else
                {
                    if (trace) console.log("no bids by other people");

                    return next();
                }
            });

        };
    });

}

function editBid(req, res, next) {
    // console.log("editBid...")
    // console.log("editBid, have header? " + res.headerSent);

    let newBid = _.get(req,'body.bid');
    let newMax = _.get(req,'body.maximum') || _.get(req,'body.max');

    //  have one bid on record, so update the current bid, max bid or both.
    if (!newBid && !newMax) {
        res.status(400).json({error: "Must provide a new value for bid and/or maximum"});
    }
    else {
        // console.log('AAAAAAAAAAA')
        // newBid = increment.roundBid(newBid)
        // console.log('this is new bid', newBid)
        // newMax = increment.roundBid(newMax)
        // console.log('this is Max bid', newMax)


        //  Assemble the update statement based on the stuff we have.
        //  NOTE:  we do not change the 'date' or the 'ip' field, to preserve that information for the original
        //  bid.  Date and proxy user will be in the audit table in the tracking database.
        let sqlParams = { bidId : req.params.bidId, account: req.user.employee.accountId };
        let updateQuery = "UPDATE tblGlobalEntries set modifiedDate=now(), modifiedByAccount= :account, ";
        let auditMessage = "Changed "
        if (newBid) {
            newBid = increment.roundBid(newBid)
            console.log('this is new bid', newBid)

            updateQuery += "current=:bid ";
            auditMessage += "current bid to " + newBid;
            sqlParams.bid=newBid;
            if (newMax) {
                newMax = increment.roundBid(newMax)
                console.log('this is Max bid', newMax)

                updateQuery += ",";
                auditMessage += " and ";
            }
        }
        if (newMax) {
            newMax = increment.roundBid(newMax)
            console.log('this is Max bid', newMax)

            sqlParams.maximum = newMax;
            updateQuery += " maximum=:maximum";
            auditMessage += " maximum to " + newMax;
        }
        updateQuery += " WHERE id=:bidId";

        // console.log("update SQL is " + updateQuery);
        // console.log("updating with SQL params: ", sqlParams);
        return sql.query(updateQuery, {type:sql.QueryTypes.UPDATE,  replacements: sqlParams})
        .then(function(results) {
            //  Now read the updated record and add a few other values for the return structure.
            const reReadSQL = "Select id as bidId, auction, item, customer as account, current, maximum from tblGlobalEntries where id=:bidId";
            // console.log("rereading record with " + reReadSQL);
            return sql.query(reReadSQL, {type:sql.QueryTypes.SELECT, replacements: sqlParams})
            .then(function(results) {
                res.returnStructure = {
                    status: 200,
                    results: results[0],
                    message : auditMessage,
                    meta: {},
                };

                //  Prepares some data for the audit logging step
                req.proxyData.actions.push(auditMessage);
                req.body.accountId =  results[0].account;
                req.body.auction =  results[0].auction;
                req.body.icn =  results[0].item;


                // console.log("return structure is " , res.returnStructure);
                return next();

            });
        })
        .catch(function (error)   {
            console.log(error);
            res.status(400).json({error: "Problems updating the bid: " + error});
        });
    }


}

// function auditProxyEdit(req, res, next){
//     // console.log("auditProxyEdit, have header? " + res.headerSent);

//     // Adds record in tblAudit for the customer with all proxy bid actions in req.proxyData.actions.
//     // console.log("in auditProxyEdit");
//     const auction = req.params.auction;

//     const actionHeader = "Proxy edit bid and/or maximum";

//     const auditRecord = {
//         user: req.user.employee.userName,
//         action: actionHeader,
//         archive: JSON.stringify(res.returnStructure),
//         type: "customer",
//         fid: res.returnStructure.results.account
//     };

//     query = "INSERT into tblAudit set user=:user, action=:action, archive=:archive, type=:type, fid=:fid";
//     // console.log("Audit Edit data: ", auditRecord);
//     return trckingSQL.query(query, {type:sql.QueryTypes.INSERT,  replacements: auditRecord})
//     .then(function (results)  {
//         // console.log("audit record inserted");
//         return next();
//     }).catch(function(err) {
//         // console.log("error posting audit record: " + err);
//         return  next(err);
//     });
// }

function sendEditResponse(req, res, next) {
    // console.log("sendEditResponse, have header? " + res.headersSent);
    // console.log("sending response, from res structure of " , res.getHeaders());
    res.send(200, res.returnStructure);

};

exports.checkIsEmployee = checkIsEmployee;
exports.determineAuction = determineAuction;
exports.maybeLowerMaxBid = maybeLowerMaxBid;
exports.editBid = editBid;
// exports.auditProxyEdit = auditProxyEdit;
exports.sendEditResponse = sendEditResponse;
