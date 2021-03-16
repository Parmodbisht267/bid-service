const _ = require("lodash");
const axios = require("axios");
const orm = require("../../../common/models/orm");
const sql = orm.orm;

function fetchBidList(req, res, next) {
     if (typeof(req.body.accountId) != 'undefined')
        req.params.accountId = req.body.accountId;


    const query = "select  ge.id as bidId, ge.current, ge.maximum,  `date` as bidDate, ge.customer as account, p.firstName, p.lastName, i.first_line_description " +
        "from tblGlobalEntries ge  " +
        "left join Account a on ge.customer = a.id " +
        "left join Person p on p.id = a.personId " +
        "left join tblInventory i on i.item = ge.item " +
        "where ge.item = :icn  and ge.auction = :auction and i.auction = :auction and del != 3 " +
        "order by current desc";
    //  console.log(query);
    return sql.query(query, {type:sql.QueryTypes.SELECT,  replacements: { icn : req.params.icn, auction: req.params.auction }})
    .then(function (results)  {
        if (typeof(req.body.accountId) == 'undefined')
            req.body.accountId = req.params.accountId;
        req.body.bidList = [];
        if (results.length > 0)
        {
            // console.log("  ... and got data");
            req.body.itemTitle = results[0].first_line_description;
            let foundAccountName = false;
            results.forEach(function (oneRow) {
                req.body.bidList.push(_.pick(oneRow, ['bidId', 'current', 'maximum', 'bidDate', 'account', 'firstName', 'lastName']));

                //  If this is bid is for the account of interest, preserve the first and last name.
                //  If the account has multiple bids, the assignment will occur multiple times -- who cares.

                if (oneRow.account == req.params.accountId) {
                    req.body.firstName = oneRow.firstName;
                    req.body.lastName = oneRow.lastName;

                    //  If we don't have a maximum recorded for this account (in the return data) but we
                    //  have a maximum set in the database record, remember it.  Or we found a higher one.
                    //  Save the id along with it so the GUI has it for requesting an update.
                    if (typeof(req.body.accountMaximum) == 'undefined')
                    {
                        if (oneRow.maximum > 0)
                            req.body.accountMaximum = { bidId : oneRow.bidId, maximum: oneRow.maximum };
                    }
                    else
                    {
                        if (req.body.accountMaximum.maximum < oneRow.maximum)
                            req.body.accountMaximum = { bidId : oneRow.bidId, maximum: oneRow.maximum };
                    }


                    foundAccountName = true;
                }

                //  Establish the global maximum across all bidders.
                if (typeof(req.body.maximum) == 'undefined' || req.body.maximum < oneRow.maximum)
                    req.body.maximum = oneRow.maximum;

            });
            const opt = {
                url: "http://localhost:7070/workspace/" + req.params.auction + "/item/" + req.params.icn + "/current"
            };
            // console.log("opt: ", opt);
            return axios.get(opt.url)
                .then(body => {
                    // console.log('body: ', body)
                    // if (err) {
                    //     console.log('!! Error contacting item service', err);
                    //     return next(err);
                    // }
                    
                    // console.log("body.data: ", body.data)

                    // const parsedBody = JSON.parse(body);
                    const parsedBody = _.get(body,'data', {});
                    
                    // // console.log("parsedBody: ", parsedBody);

                    req.body.current = parsedBody.current;
                    req.body.nextbid = parsedBody.nextbid;
                    req.body.maxbidder = parsedBody.maxbidder;
                    req.body.nextbid = parsedBody.nextbid;
                    if (!foundAccountName) {
                        //  need to fetch it with a separate call.  This will happen when there are bids on the item, but
                        //  none by the account of interest.
                        return _fetchAccountName(req, req.params.accountId).then(function(found) {
                            if (found) {
                                console.log(" _fetchAccountName found ")
                                return next();
                            } else {
                                res.status(400).json({error: "Account "+ req.params.accountId+"  was not found"});
                            }
                        });
                    }
                    else {
                        // console.log("finished bid list: " , req.body);

                        //  NOTE:  This module has it's own send() command,which expects data in req.body
                        return next();
                    }
            }).catch(error => {
                console.log("Error contacting item service: " + error);
                // res.status(400).json({error: "Error contacting item service: " + error});
                return next(error);
            });
        }
        else
        {
            //  We didn't find any rows because we didn't have any bids by anybody.  So have to look up the
            //  customer name and item title separately

            // req.body.firstName = '** edge case (no bids) **';
            // req.body.lastName = '** edge case (no bids) **';
            // req.body.itemTitle = '** edge case (no bids) **';


            itemQuery = "select first_line_description from tblInventory where item = :icn";
            return sql.query(itemQuery, {type:sql.QueryTypes.SELECT, replacements: { icn : req.params.icn }})
            .then(function (results)  {
                // console.log("ran name lookup query");
                if (results.length > 0)
                {
                    //  ok, we got the item description.  save that and look for the account name
                    req.body.itemTitle = results[0].first_line_description;

                }
                else
                {
                    //  If the item isn't found, well, that should have been caught in a prior
                    //  step, to determine the auction from the item.
                    req.body.itemTitle = "** should not see this message **";

                }

                return _fetchAccountName(req, req.params.accountId).then(function(found) {
                        if (found) {
                            return next();
                        } else {
                            res.status(400).json({error: "Account "+ req.params.accountId+" was not found "});
                        }
                    });
                });
        }
    })
    .catch((error) => {
        console.log("fetchBidList: ", error);
        res.status(400).json({error: "Problems getting a bid list for the item: " + error});
    });
}

function _fetchAccountName(req, accountNumber) {
    //  We din't find the account, and hence the name, when looking for bids, so do it now.
    //  Look for the person first and last name in the Person table.
    if (!accountNumber) {
        req.body.firstName = '';
        req.body.lastName = '';
        return orm.Sequelize.Promise.resolve(true);
    }
    personQuery = "select p.firstName, p.lastName from Account a  left join Person p on p.id = a.personId where a.id = :accountId";
    return sql.query(personQuery, {type:sql.QueryTypes.SELECT, replacements: { accountId : accountNumber }}).then(function(results) {
        if (results.length > 0) {
            req.body.firstName = results[0].firstName;
            req.body.lastName = results[0].lastName;
            return true;
        } else {
            req.body.firstName = "Unknown";
            req.body.lastName  = "Unknown";
            return false;
        }
    }).catch(function(err) {
        console.log('Error getting account name', err);
        req.body.firstName = "Unknown";
        req.body.lastName  = "Unknown";
        return false;
    });
}

function send(req, res, next) {
    return res.format({
      'json': function() {
        // return res.send(200, req.body);
        res.status(200).send(req.body);
      },
      'text/xml': function() {
        // return res.send(200, XML.stringify(req.body));
        res.status(200).send(XML.stringify(req.body));
      },
      'default': function() {
        // return res.send(200, req.body);
        res.status(200).send(req.body);
      }
    });
  };


exports.fetchBidList = fetchBidList;
exports.send = send;
