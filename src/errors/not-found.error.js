const ApiError = require('./api-error')

class NotFoundError extends ApiError {

  constructor(message = 'Not found') {
    super(message)
    this.status = 404
  }

}

module.exports = NotFoundError
