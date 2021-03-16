const os = require('os');
const { createLogger, transports } = require('winston');
const { Client } = require('@elastic/elasticsearch');
const { ElasticsearchTransport } = require('winston-elasticsearch');
const { format } = require('logform');
const { combine, timestamp, label, metadata, json, errors } = format;
const pkg = require('./package.json');

const transportsArr = [new transports.Console()];
//console.log(process.env);
if (false && process.env && process.env.NODE_ENV && process.env.NODE_ENV.toString().toUpperCase() === 'PRODUCTION') { // Change to === before release!
	const client = new Client({
        node: 'http://54.81.189.211:9200' // place this in cliqutility
    });

    const esTransport = new ElasticsearchTransport({
        level: 'info',
        indexPrefix: 'new-bid-service',
        client,
        transformer: (logData) => {
            const transformed = {};
            transformed['@timestamp'] = new Date().toISOString();
            transformed.message = logData.message;
            transformed.severity = logData.level;
            transformed.fields = logData.meta;
            transformed.hostname = os.hostname();

            return transformed;
        }
    });

    esTransport.on('warning', (error) => {
        console.error('Error caught', error);
    });

    transportsArr.push(esTransport);
}

const logger = createLogger({
    level: 'info',
    format: combine(
        label({ label: pkg.name }),
        errors({ stack: true }),
        timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        metadata(),
        json()
    ),
    transports: transportsArr
});

logger.on('error', (error) => {
    console.error('Error caught', error);
});
exports.logger = logger;
//const enterThunderdome = () => {
    // TODO: escaping patching if in testing environment
    // console.log = (...args) => logger.info.call(logger, ...args);
  //  console.info = (...args) => logger.info.call(logger, ...args);
    // Won't work with the logger.on('error'... console.error...
    // console.error = (...args) => logger.error.call(logger, ...args);
//};
//enterThunderdome();
