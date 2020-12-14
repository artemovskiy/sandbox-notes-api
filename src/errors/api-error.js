class ApiError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }

  getDetails() {
    return {}
  }
}

module.exports = ApiError
