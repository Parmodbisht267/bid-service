// setup db
// with a test auction
// auction terms
// and item with a specified endtime of 1min from now
// redis stuff
// call restcron
// verify item is closing
// fire bid at the last second
// verify item extended

const now = new Date()


const testAuctionConfig = {
    auction: ``
}

const createAuctionQuery = `
insert into tblAuctions 
set auction = '210226test', title = 'test',
branch = 1, timestamp = now(),
endtime = now(), timezone = -1, 
io = 1, homegame = 0, ml = 1, 
autosort = 0, automaticregistration = 0, 
shipping = 0, barcode = 0, \`update\` = now(), 
real_estate = 0, video = 0`;

const createItemQuery = ``


const axios = require('axios');
const delay = require('delay');
const { getItemInfo } = require('../lib/bid');
const { getAuthed, acceptTerms} = require('./helpers');


const icn = 'ZZ0002';
const auction = '210301Z';
const user = {
    username: 'alex.neises@purplewave.com',
    password: 'Neises4811177'
};


const snipe = (user, icn, auction, amount) => {
    return getAuthed(user).then(user => {
        return acceptTerms(user,auction).then(r => {
            return getItemInfo(icn,auction).then(({ itemInfo })=> {
                let placeBid = () => axios({
                    method: 'POST',
                    url: 'https://dev-v2.cliquidator.info/v1/bids',
                    headers: {
                        Authorization: user.bearer
                    },
                    data: {
                        auction,
                        currentBid: parseFloat(itemInfo.nextbid),
                        customer: user.account_id + '',
                        item: icn
                    }
                }).then(bidResp => {
                    console.log(bidResp);
                }).catch(error => {
                    console.log(error);
                });
                let now = parseInt((new Date()) - 0);
                let time_diff = (itemInfo.endtime*1000 - now) - amount;
                return delay(time_diff).then(()=>placeBid())
            })
        })
    })

}
// test
module.exports = {
    snipe,
    user,
    auction,
    icn
}