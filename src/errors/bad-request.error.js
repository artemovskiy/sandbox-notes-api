const ApiError = require('./api-error')

class BadRequestError extends ApiError {

  constructor(message = 'bad request', path, errors) {
    super(message)
    this.status = 400
    this.path = path
    this.errors = errors
  }

  getDetails() {
    return {
      path: this.path,
      errors: this.errors,
    }
  }

}

module.exports = BadRequestError
