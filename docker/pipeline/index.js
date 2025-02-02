const path = require('path');

const Ingestion = require('../../src/core/ingestion');
const Encoding = require('../../src/core/encoding');
const Routing = require('../../src/core/routing');

const JsonModel = require('../../src/core/util/jsonModel');

const config = new JsonModel(require('./config/config.json'));

const Logger = require('../../src/core/util/logger');

process.env.LOG_LEVEL = config.get('loglevel', Logger.ENV_LOG_LEVEL.WARN);

let pipelineLogger = undefined;
const platformId = config.get('platformId', 'default');

pipelineLogger = new Logger(`IoT Event Analytics Pipeline (${platformId})`);
pipelineLogger.info(`Starting...`);

const ing = new Ingestion(config.get('protocolGateway'), platformId);
const enc = new Encoding(config.get('protocolGateway'));
const rou = new Routing(config.get('protocolGateway'), platformId);

ing.start(path.resolve(__dirname, 'config', 'channels'))
    .then(() => enc.start())
    .then(() => rou.start())
    .then(() => {
        pipelineLogger.info(`IoT Event Analytics Pipeline started successfully`);
    })
    .catch(err => {
        pipelineLogger.error(err.message, null, err);
    });