const _ = require('lodash');
const { Message } = require('messagelib');

const serviceName = 'bidService';

const sendCreateBidMessage = (req, res, next) => {
	const { legacyData, results } = req;

	if (!legacyData) {
		return next();
	}

	const data = {
		...(_.pick(
			results.result,
			[ 'auction', 'item', 'customer', 'current_bid', 'next_bid',
				'winning_bidder', 'bid_count', 'unique_bidders'])),
		...(_.pick(legacyData, ['user_agent', 'ip_address']))
	};

	if (req.params.recommendations) {
	  data.recommendations = 'true';
	}

	const message = new Message(serviceName, 'bid.created', data, req.transactionId);
	message.send(() => {
		return next();
	})
}

const sendLargeBidMessage = (req, res, next) => {
	const { results, bidProfile } = req;

	if (!results || !bidProfile || results.current < _.get(bidProfile,'internalNotification',0)) {
		return next();
	}

	const data = {
    	...(_.pick(results, ['auction','item','customer','current','maximum'])),
		accountId: _.get(results,'customer'),
		user_agent: _.get(req,'legacyData.user_agent') || req.headers['user-agent'] || '',
		ip_address: _.get(req,'legacyData.ip_address') || req.headers['x-forwarded-for'] || ''
	};

	const message = new Message(serviceName, 'bid.createdLarge', data, req.transactionId);

	message.send(() => {
		return next();
	})
}

const sendOutbidMessage = (req, res, next) => {
	const { itemPreBid, itemPostBid } = req;

	if (!itemPreBid || !itemPostBid || itemPreBid.displaywinner === itemPostBid.displaywinner) {
		return next();
	}

	const data = {
		accountId: itemPreBid.displaywinner,
		auction: itemPreBid.auction,
		item: itemPreBid.item
	};
	const message = new Message(serviceName, 'bid.outbid', data, req.transactionId);

	message.send(() => {
		return next();
	})
}

const sendDeleteBidMessage = (req, res, next) => {
	const { itemDeleteBid } = req;
	const data = {...itemDeleteBid}

	if (!data) {
		return next();
	}

	const message = new Message(serviceName, 'bid.deleted', data, req.transactionId);

	message.send(() => {
		return next();
	})
}

exports.sendCreateBidMessage = sendCreateBidMessage;
exports.sendLargeBidMessage = sendLargeBidMessage;
exports.sendOutbidMessage = sendOutbidMessage;
exports.sendDeleteBidMessage = sendDeleteBidMessage;
