const typeorm = require('typeorm')
const crypto = require('crypto')

const User = require('./user.entity')
const Token = require('./token.entity')
const AuthService = require('./auth-service')

const testHasher = s => s + '_hash'

const secretKey = 'my_secret'

function createTestHMAC(value) {
  return crypto.createHmac('sha256', secretKey)
    .update(value)
    .digest('base64')
}
/*eslint-env jest */
describe('AuthServices', () => {

  let connection, userRepo, tokenRepo, authService
  const createPasswordHash = jest.fn(testHasher)

  beforeAll(async () => {
    connection = await typeorm.createConnection({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'notes-api',
      password: 'password',
      database: 'notes-test',
      synchronize: true,
      dropSchema: true,
      entities: [
        User,
        Token,
      ],
    })
    userRepo = connection.getRepository('User')
    tokenRepo = connection.getRepository('Token')
  })

  afterAll(() => connection.close())

  beforeEach(async () => {
    authService = new AuthService(connection, createPasswordHash, secretKey)
  })

  afterEach(async () => {
    createPasswordHash.mockClear()
    await connection.query('SET FOREIGN_KEY_CHECKS = 0; ')
    await userRepo.clear()
    await tokenRepo.clear()
    await connection.query('SET FOREIGN_KEY_CHECKS = 1; ')
  })

  describe('user registration', () => {

    test('should register new user', async () => {

      await authService.register({username: 'my_test_user', password: 'my_password'})

      const entity = await userRepo.findOneOrFail({
        where: {
          username: 'my_test_user',
        },
        select: ['password'],
      })
      expect(createPasswordHash).toBeCalledTimes(1)
      expect(createPasswordHash).toBeCalledWith('my_password')
      expect(entity.password).toBe('my_password_hash')
    })

    test('should throw error when username already taken', async () => {
      const existentUser = userRepo.create({
        username: 'my_test_user',
        password: 'my_password_hash',
      })
      await userRepo.save(existentUser)

      await expect(() => authService.register({
        username: 'my_test_user',
        password: 'my_password',
      })).rejects.toThrow()
    })
  })

  describe('token issuance', () => {

    beforeEach(async () => {
      const existentUser = userRepo.create({
        username: 'my_test_user',
        password: testHasher('my_password'),
      })
      await userRepo.save(existentUser)
    })

    test('should issue an authorization token', async () => {
      const {accessToken, expiresIn} = await authService.issueToken({
        username: 'my_test_user',
        password: 'my_password',
      })

      expect(typeof accessToken).toBe('string')
      expect(typeof expiresIn).toBe('number')
      expect(createPasswordHash).toBeCalledWith('my_password')
      expect(createPasswordHash).toBeCalledTimes(1)
      const [value, signature] = accessToken.split('.')

      const testSignature = createTestHMAC(value)
      expect(signature).toBe(testSignature)
      const tokenEntity = await tokenRepo.findOneOrFail({
        where: {value},
        relations: ['user'],
      })
      tokenEntity.user.username = 'my_test_user'
    })

    test('should throw if presented username is not registered', async () => {
      await expect(() => authService.issueToken({
        username: 'not_existent_user',
        password: 'smth',
      })).rejects.toThrow()
    })

    test('should throw if presented password is wrong', async () => {
      await expect(() => authService.issueToken({
        username: 'my_test_user',
        password: 'wrong_password',
      })).rejects.toThrow()
    })
  })

  describe('token authentication', () => {

    let user

    beforeEach(async () => {
      user = userRepo.create({
        username: 'my_test_user',
        password: testHasher('my_password'),
      })
      await userRepo.save(user)
    })

    const createTestToken = async issuedAt => {
      const value = crypto.randomBytes(64).toString('base64')
      const tokenEntity = tokenRepo.create({
        value,
        expiresIn: 3600,
        issuedAt,
        user,
      })
      await tokenRepo.save(tokenEntity)
      return value + '.' + createTestHMAC(value)
    }

    test('should authenticate user by token', async () => {
      const accessToken = await createTestToken(new Date())

      const authorizedUser = await authService.authenticate(accessToken)

      expect(authorizedUser.id).toBe(user.id)
    })

    test('should throw if token is expired', async () => {
      const accessToken = await createTestToken(new Date(Date.now() - 3601 * 1000))

      await expect(() => authService.authenticate(accessToken)).rejects.toThrow()
    })

    test('should throw if token signature is invalid', async () => {
      const value = crypto.randomBytes(64).toString('base64')
      const tokenEntity = tokenRepo.create({
        value,
        expiresIn: 3600,
        user,
      })
      await tokenRepo.save(tokenEntity)
      const accessToken = value + '.' + 'invalidSignature'

      await expect(() => authService.authenticate(accessToken)).rejects.toThrow()
    })

    test('should throw if token is does not exist', async () => {
      const value = crypto.randomBytes(64).toString('base64')
      const accessToken = value + '.' + createTestHMAC(value)

      await expect(() => authService.authenticate(accessToken)).rejects.toThrow()
    })
  })

  describe('closing sessions', () => {

    let user

    beforeEach(async () => {
      user = userRepo.create({
        username: 'my_test_user',
        password: testHasher('my_password'),
      })
      await userRepo.save(user)
    })

    test('should remove all users tokens', async () => {
      const tokenDrafts = []
      for (let i = 0; i < 5; i++) {
        tokenDrafts.push({
          user,
          value: crypto.randomBytes(64).toString('base64'),
          expiresIn: 3600,
        })
      }
      const tokens = tokenRepo.create(tokenDrafts)
      await tokenRepo.save(tokens)

      await authService.logout(user)

      const foundTokens = await tokenRepo.find({
        where: {
          user,
        },
      })
      expect(foundTokens).toEqual([])
    })
  })
})
