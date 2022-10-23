const redis = require('ioredis');
let redisClient;

redisClient = redis.createClient({
    host: process.env.REDIS_HOSTNAME,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD
});

redisClient.on('error', function(err) {
    console.log('*Redis Client Error: ' + err.message);
});
redisClient.on('connect', function(){
    console.log('Connected to redis instance');
});

module.exports = redisClient;