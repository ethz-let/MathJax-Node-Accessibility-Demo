const EXPRESS = require('express');
const APP = EXPRESS();
const HELMET = require('helmet');
const BODYPARSER = require('body-parser');
const TIMEOUT = require('connect-timeout');

const LOGGER = require('./modules/logger');
const TIMER = require('./modules/timer');
const ACCESSOR = require('./modules/accessor');
const PROCESSOR = require('./modules/processor');
const VALIDATOR = require('./modules/validator');
const CONFIG = require('./modules/config');

// =============================================================
// Middleware layers.
// =============================================================

APP.use(TIMEOUT(CONFIG.mstimeout || 15000));

APP.use(HELMET());

APP.use(BODYPARSER.json({ limit: "50mb" }));

APP.use(BODYPARSER.urlencoded({
  limit: "50mb",
  extended: true,
  parameterLimit: 50000
}));

APP.use((error, req, res, next) => {

  if (error instanceof SyntaxError) {

    LOGGER.logfile.log({ level: 'error', message: error });
    res.status(400).send({
      html: null,
      errorCode: 2,
      errorMsg: 'Request includes invalid JSON syntax'
    });
    return;
  } else {
    next();
  }
});

process.on('uncaughtException', (error) => {
  LOGGER.logfile.log({ level: 'error', message: error });
});

// =============================================================
// App listening to port.
// =============================================================

APP.listen(CONFIG.serverport || process.env.PORT, () => {
  console.log('===============');
  console.log('Service started');
  console.log('===============');
  LOGGER.logfile.log({ level: 'info', message: 'Service started' });
});

// =============================================================
// Routes.
// =============================================================

APP.get('/hello', (req, res) => {
  req.clearTimeout();
  req.setTimeout(CONFIG.mstimeout || 15000);
  res.status(200).send('hello');
  return;
});

APP.post('/process', TIMER.start, ACCESSOR.verifyApiKey, VALIDATOR.validate, (req, res) => {
  req.clearTimeout();
  req.setTimeout(CONFIG.mstimeout || 15000);
  PROCESSOR.processRequest(req, res);
  return;
});

APP.get('*', TIMER.start, (req, res) => {
  req.clearTimeout();
  req.setTimeout(CONFIG.mstimeout || 15000);
  res.status(404).send({
    html: null,
    timeMS: TIMER.end(req.body.starttime),
    errorCode: 2,
    errorMsg: 'no such route'
  });
  return;
});

APP.post('*', TIMER.start, (req, res) => {
  req.clearTimeout();
  req.setTimeout(CONFIG.mstimeout || 15000);
  res.status(404).send({
    html: null,
    timeMS: TIMER.end(req.body.starttime),
    errorCode: 2,
    errorMsg: 'no such route'
  });
  return;
});