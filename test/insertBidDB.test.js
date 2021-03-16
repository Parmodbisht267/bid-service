// const _ = require('lodash')
// const { insertBidDB, pool } = require('../lib/bid')
// const {DateTime} = require('luxon');

// jest.setTimeout(10000);

// let randomCustomer = Math.floor(Math.random() * (300000 - 100000))
// let currentBid = Math.floor(Math.random() * (400000 - 500))
// let maximum = Math.floor(Math.random() * (400000 - 500))

// // bidObj.auction, bidObj.item, bidObj.customer, bidObj.current, bidObj.maximum, bidObj.date, bidObj.ip

// let goodBids = [
//     {
//         customer: randomCustomer,
//         current: currentBid,
//         item: 'DH5298',
//         auction: '200130',
//         maximum: maximum,
//         date: DateTime.local(),
//         ip: ''
//     },
//     {
//         customer: randomCustomer,
//         current: 0,
//         item: 'DH5298',
//         auction: '200130',
//         maximum: maximum,
//         date: DateTime.local(),
//         ip: ''
//     },
//     {
//         customer: randomCustomer,
//         current: 0,
//         item: 'DH5298',
//         auction: '200130',
//         maximum: 0,
//         date: DateTime.local(),
//         ip: ''
//     },
//     {
//         customer: randomCustomer,
//         current: 0,
//         item: 'DH5298',
//         auction: '200130',
//         maximum: 0,
//         date: DateTime.local(),
//         ip: ''
//     },
//     {
//         customer: 246105,
//         current: 0,
//         item: 'DH5298',
//         auction: '200130',
//         maximum: 31500,
//         date: DateTime.local(),
//         ip: ''
//     },
//     {
//         customer: 246105,
//         current: 33000,
//         item: 'DH5298',
//         auction: '200130',
//         maximum: 34000,
//         date: DateTime.local(),
//         ip: ''
//     },
//     {
//         customer: '246105A',
//         current: '35000B',
//         item: 'DH5298',
//         auction: 200130,
//         maximum: '50000C',
//         date: DateTime.local(),
//         ip: ''
//     }
// ]

// test('Test Good bidObj SUCCESSFUL insert of bid into tblGlobalEntries', () => {
//     return Promise.all(
//         _.map(goodBids, (bidObj) => {
//             return insertBidDB(bidObj) 
//                 .then((res) => {
//                     // console.log('res: ', res)
//                     return expect(res).toHaveProperty('insertId')
//                 })
//                 .catch(err => {
//                     console.log('insert err: ', err)
//                 })
                    
//         })
//     )
// })



// let noCustBids = [
//     {
//         customer: null,
//         current: 0,
//         item: 'DH5298',
//         auction: '200130',
//         maximum: 0,
//         date: DateTime.local(),
//         ip: ''
//     }
// ]

// test('Test No Customer FAILURE to insert of bid into tblGlobalEntries', () => {
//     return Promise.all(
//         _.map(noCustBids, (bidObj) => {
//             return insertBidDB(bidObj) 
//                 .then((res) => {
//                     // console.log('res: ', res)
//                 })
//                 .catch(error => {
//                     // console.log('error: ', error)
//                     return expect(error.message).toMatch(/insertBidDB.*/)
//                 })
                    
//         })

//     )
// })



// let noDateBid = [
//     {
//         customer: randomCustomer,
//         current: 'currentBid',
//         item: 'DH5298',
//         auction: 200130,
//         maximum: 'maximum',
//         date: '',
//         ip: ''
//     }
// ]

// test('Test No Date FAILURE to insert of bid into tblGlobalEntries', () => {
//     return Promise.all(
//         _.map(noDateBid, (bidObj) => {
//             return expect(() => insertBidDB(bidObj)).toThrow();                    
//         })

//     )
// })