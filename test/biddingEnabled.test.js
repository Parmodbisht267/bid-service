// const _ = require('lodash')
// const {orm: db} = require('../../common/models/orm');
// const { chance, pool: hpool } = require('./helpers');
// const { getBidderProfileProm, pool } = require('../lib/bid');

// jest.setTimeout(10000)

// const limit = 100
// let randomCustomers = []
// while (randomCustomers.length < limit ) {
//     let random = Math.floor(Math.random() * (300000 - 100000))
//     if (randomCustomers.indexOf(random) < 0) {
//         randomCustomers.push(random)
//     }
// }


// test('if bidder has bidding enabled', async () => {
    
//     return Promise.all(
//         _.map(randomCustomers, (customer) => {
//             return getBidderProfileProm(customer)
//                 .then(res => {
//                     console.log(`Authorized: ${customer}`)
//                     return expect(res).toBeTruthy()
//                 })
//                 .catch(error => {
//                     console.log(`${error.message}, customer: ${customer}`)
//                     return expect(['Not Authorized', 'Not Authorized to Bid']).toContain(error.message)
//                 })
//         })
//     )
// })