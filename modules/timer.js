module.exports = {

  start: (req, res, next) => {
    req.body.starttime = new Date();
    next();
  },

  end: (start) => {
    if (!start) {
      return 'error calculating time';
    } else {
      return new Date() - start;
    }
  }
}