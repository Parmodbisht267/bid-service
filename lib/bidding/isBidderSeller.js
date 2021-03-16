
const isTheSellerAlsoTheBidderProm = (bidObj, item) => {

    if (item.seller === bidObj.customer) {
        const sql = `INSERT INTO tblSellerBidAttempts
            (auction, item, seller, current, max)
            VALUES (:auction, :item, :customer, :current, :maximum)`;
        return db
            .query(sql, {
                replacements: _.pick(bidObj, ['auction', 'item', 'customer', 'current', 'maximum'])
            })
            .catch((error) => {
                console.error('isTheSellerAlsoTheBidder', error);
                return {error}
            })
            .then((res) => {
                // console.log("res: ", res)
                if (res.error) {
                    console.error('Error inserting to tblSellerBidAttemps', res.error);
                }
                throw new Error('You cannot bid on an item when you are the seller!');
            });
    }
    return Promise.resolve(false);
};