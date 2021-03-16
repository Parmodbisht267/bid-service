// // example of running this using node v 10:  ./mocha '/home/risnerj/api/bid-service-v2/test/bidtreetest.js'
// // ensure using node version 10 
// // must use from inside bin folder inside node_modules

// const _ = require('lodash');
// const assert = require('assert');
// const { getItemInfo, validateBidData, insertBidDB } = require('../lib/bid');
// const https = require('https');
// const { orm, Sequelize } = require('../../common/models/orm');
// const axios = require('axios');

// const getBidTree = (auction, item) => {
//     let timer = Date.now();
//     return axios.get(`https://risnerj-dev.cliquidator.info/v1/auctions/${auction}/items/${item}/bids`).then((res) => {
//         let data = { 'item': item, 'bidtree': _.get(res,'data',{}) , time: Date.now() - timer };
//         return data;
//     });
// }

// const getBidTreeV2 = (auction, item) => {
//     let timer = Date.now();
//     return axios.get(`https://thomasm-v2.cliquidator.info/v1/auctions/${auction}/items/${item}/bids`).then((res) => {
//         let data = { 'item': item, 'bidtree': _.get(res,'data',{}), time: Date.now() - timer };
//         // data.bidtree.push({});
//         return data;
//     });
// }

// const showDifferences = (differences) => {
//     console.log('---------------- \n DIFFERENCES: ', differences );
// }


// describe('Get items for given auction', () => {
//     let results;
//     let resp;
//     let differences = [];

//     it('compare bid tree from legacy and bid-service v2', function(done) {

//         const sql = `SELECT auction, item FROM tblInventory WHERE auction='200901'  `;
//         orm.query(sql, { type: Sequelize.QueryTypes.SELECT }).then((resp) => {

//             return Promise.all(_.map(resp, (v) => {
//                 // console.log(v.auction, ' / ', v.item);
//                 return setTimeout(() => { 
//                     return Promise.all([getBidTree(v.auction, v.item), getBidTreeV2(v.auction, v.item)])
//                         .then(([bidTree, bidTreeV2]) => {
//                             // assert.deepStrictEqual(bidTree, bidTreeV2, `not equal: ${v.auction} - ${v.item}` );
//                             let faster = ((bidTree.time < bidTreeV2.time) ? '\x1b[36m legacy \x1b[0m' : '\x1b[36m new \x1b[0m');
//                             let comparison = (_.isEqual(bidTree.bidtree, bidTreeV2.bidtree) ? '\x1b[32m same \x1b[0m' : '\x1b[31m Differences found \x1b[0m');
//                             console.log(v.auction,'/',v.item,' | ', faster , comparison )

//                             if (!_.isEqual(bidTree.bidtree, bidTreeV2.bidtree)) {
//                                 differences.push(v.item);
//                             }
//                         });
//                 }, 3000); // throttling calls to services

//             })
//             ).then(() => {
//                 done();
//             }).catch(err => {
//                 done(err);
//             });

//         }).then(() => {
//             showDifferences(differences)
//         });


//     });

//     // after(() => {
//     //     console.log('---------------- \n DIFFERENCES: ', differences );
//     // });

// });

