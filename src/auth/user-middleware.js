const {UnauthorizedError} = require('../errors')

module.exports = (req, res, next) => {
  if(!req.user) {
    next(new UnauthorizedError())
  } else {
    next()
  }
}
