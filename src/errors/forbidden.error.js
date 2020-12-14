const ApiError = require('./api-error')

class ForbiddenError extends ApiError {

  constructor(message = 'Forbidden') {
    super(message)
    this.status = 403
  }

}

module.exports = ForbiddenError
