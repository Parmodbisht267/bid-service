// const { chance, getOpenItems } = require("./helpers");
// const { isTheSellerAlsoTheBidderProm, validateBidData } = require("../lib/bid");
// const { pool } = require("../lib/db");
// jest.setTimeout(10000);

// test("when bidder is the seller", async () => {
// 	try {
// 		const items = await getOpenItems();
// 		const item_data = chance.pickone(items);
// 		const bid = await chance.bid({ userId: item_data.seller });
		
// 		let response = await isTheSellerAlsoTheBidderProm(validateBidData(bid), item_data);
// 		expect(response).toBeUndefined();
// 	}
// 	catch (err) {
// 		expect(err.message).toBe("You cannot bid on an item when you are the seller!");
// 	}
// });

// test("when bidder is not the seller", async () => {
// 	try {
// 		const items = await getOpenItems();
// 		const item_data = chance.pickone(items);
// 		const bid = await chance.bid({ userId: item_data.seller - 1 });
		
// 		let response = await isTheSellerAlsoTheBidderProm(validateBidData(bid), item_data);
// 		expect(response).toBeFalsy();

// 	}
// 	catch (err) {
// 		expect(err).toBeUndefined();
// 	}
// });

// afterAll(async () => {
// 	await pool.end();
// });