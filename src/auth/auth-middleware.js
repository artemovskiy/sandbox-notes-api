const {UnauthorizedError} = require('../errors')

module.exports = (req, res, next) => {
  if(!req.token) {
    next()
    return
  }
  const authService = req.app.get('authService')
  authService.authenticate(req.token)
    .then(user => {
      req.user = user
      next()
    })
    .catch(() => {
      next(new UnauthorizedError())
    })
}
