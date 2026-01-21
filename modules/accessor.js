const TIMER = require('./timer');
const LOGGER = require('./logger');

module.exports = {

  verifyApiKey: async (req, res, next) => {

    try {
      const apiKey = req.headers['api-key'];

      if (!apiKey) {
        res.status(401).send({
          html: null,
          timeMS: TIMER.end(req.body.starttime),
          errorCode: 2,
          errorMsg: 'no API Key entered in message header'
        });
        return;
      }

      if (!process?.env?.API_KEY) {
        res.status(500).send({
          html: null,
          timeMS: TIMER.end(req.body.starttime),
          errorCode: 1,
          errorMsg: 'Could not find API Keys on server'
        });
        return;
      }

      if (process.env.API_KEY == apiKey) {
        next();
      } else {
        res.status(403).send({
          html: null,
          timeMS: TIMER.end(req.body.starttime),
          errorCode: 2,
          errorMsg: 'no valid API Key in message header'
        });
        return;
      }
    } catch (error) {
      LOGGER.logfile.log({ level: 'error', message: error });
      res.status(500).send({
        html: null,
        timeMS: TIMER.end(req.body.starttime),
        errorCode: 1,
        errorMsg: 'an error occured in verifyToken()'
      });
      return;
    }
  }
}