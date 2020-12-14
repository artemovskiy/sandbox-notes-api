const UserEntity = require('./user.entity')
const crypto = require('crypto')
const {BadRequestError} = require('../errors')

const AuthError = require('./auth-error')

class AuthService {

  constructor(connection, createPasswordHash, secretKey) {
    this.repository = connection.getRepository(UserEntity)
    this.tokenRepository = connection.getRepository('Token')
    this.createPasswordHash = createPasswordHash
    this._secretKey = secretKey
  }

  async register(credentials) {
    const existentUser = await this.repository.findOne({username: credentials.username})
    if (existentUser) {
      throw new BadRequestError('Username is aready taken')
    }
    const entity = this.repository.create({
      username: credentials.username,
      password: this.createPasswordHash(credentials.password),
    })
    await this.repository.save(entity)
    entity.password = undefined
    return entity
  }

  async issueToken(credentials) {
    const where = {
      username: credentials.username,
      password: this.createPasswordHash(credentials.password),
    }
    const user = await this.repository.findOne({where})
    if (!user) {
      throw new AuthError('invalid_grant')
    }
    const token = await this._createTokenForUser(user)
    return {
      accessToken: this._signToken(token.value),
      expiresIn: token.expiresIn,
    }
  }

  async authenticate(accessToken) {
    const value = this._verifyToken(accessToken)
    const tokenEntity = await this.tokenRepository.findOne({
      where: {
        value,
      },
      relations: ['user'],
    })
    if (!tokenEntity) {
      throw new Error('invalid token')
    }
    const expirationTime = Number(tokenEntity.issuedAt) + tokenEntity.expiresIn * 1000
    if (expirationTime < Date.now()) {
      throw new Error('Token expired')
    }
    return tokenEntity.user
  }

  async logout(user) {
    await this.tokenRepository.delete({
      user,
    })
  }

  _verifyToken(accessToken) {
    const parts = accessToken.split('.')
    if (parts.length !== 2) {
      throw new Error('invalid token')
    }
    const hmac = this._createTokenHMAC(parts[0])
    if (parts[1] !== hmac) {
      throw new Error('invalid token')
    }
    return parts[0]
  }

  _signToken(tokenValue) {
    return tokenValue + '.' + this._createTokenHMAC(tokenValue)
  }

  _createTokenHMAC(tokenValue) {
    return crypto.createHmac('sha256', this._secretKey)
      .update(tokenValue)
      .digest('base64')
  }

  async _createTokenForUser(user) {
    const value = await this._generateTokenValue()
    const tokenEntity = this.tokenRepository.create({
      value,
      expiresIn: 3600,
      user,
    })
    await this.tokenRepository.save(tokenEntity)
    return tokenEntity
  }

  _generateTokenValue() {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(64, (error, buffer) => {
        if (error) {
          reject(error)
        } else {
          resolve(buffer.toString('base64'))
        }
      })
    })
  }

}

module.exports = AuthService
