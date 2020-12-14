const ApiError = require('./api-error')

class UnauthorizedError extends ApiError {

  constructor(message = 'Unauthorized') {
    super(message)
    this.status = 401
  }

}

module.exports = UnauthorizedError
