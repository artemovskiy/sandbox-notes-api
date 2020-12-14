class AuthError extends Error {

  constructor(code, decription) {
    super('Auth Error: ' + code + decription ? ' ' + decription : '')
    this.description = decription
    this.code = code
  }
}

module.exports = AuthError

