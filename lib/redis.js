const Redis = require('ioredis');

const redisConfig = {
    sentinels: [{host: 'localhost', port: 26379}],
    maxRetriesPerRequest: 3,
    sentinelRetryStrategy: (times) => {
        return null;
    }
};

if (process.env.NODE_ENV && process.env.NODE_ENV.toString().toUpperCase() === 'PRODUCTION') {
    redisConfig.name = 'redis-prdmaster';
} else {
    redisConfig.name = 'redis-devmaster';
}

const redis = new Redis(redisConfig);
// redis.on('error', (error) => {
//     console.log(error);
//     return false;
// })
module.exports = redis;