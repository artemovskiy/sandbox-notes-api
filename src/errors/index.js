const NotFoundError = require('./not-found.error')
const ForbiddenError = require('./forbidden.error')
const UnauthorizedError = require('./unauthorized.error')
const BadRequestError = require('./bad-request.error')
const errorHandlerMiddleware = require('./errorHandlerMiddleware')

module.exports = {
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  BadRequestError,
  errorHandlerMiddleware,
}
