const ApiError = require('./api-error')
const InternalServerError = require('./internal-server-error')
const BadRequestError = require('./bad-request.error')
const OpenApiValidator = require('express-openapi-validator')

const respondApiError = (res, error) => {
  res.status(error.status)
  res.json({
    error: {
      name: error.name,
      message: error.message,
      details: error.getDetails(),
    },
  })
}

module.exports = (error, req, res, next) => {
  if (error instanceof ApiError) {
    respondApiError(res, error)
  } else if (error instanceof OpenApiValidator.error.BadRequest) {
    const wrappedError = new BadRequestError(error.message, error.path, error.errors)
    respondApiError(res, wrappedError)
  } else {
    console.error(error)
    const wrappedError = new InternalServerError()
    respondApiError(res, wrappedError)
  }
}
