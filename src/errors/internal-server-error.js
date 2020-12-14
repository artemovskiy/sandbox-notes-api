const ApiError = require('./api-error')

class InternalServerError extends ApiError {

  constructor(message = 'Internal server error') {
    super(message)
    this.status = 500
  }

}

module.exports = InternalServerError
