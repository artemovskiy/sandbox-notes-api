const express = require('express')

const AuthError = require('./auth-error')

const router = express.Router()

router.post('/register', (req, res, next) => {
  const authService = req.app.get('authService')
  authService.register(req.body)
    .then(user => {
      res.json(user)
    })
    .catch(next)
})

router.get('/logout', (req, res, next) => {
  const authService = req.app.get('authService')
  authService.logout(req.user)
    .then(() => {
      res.status(204).end()
    })
    .catch(next)
})

router.post('/token', async (req, res, next) => {
  const authService = req.app.get('authService')
  try {
    if(req.body.grant_type !== 'password') {
      throw new AuthError('unsupported_grant_type')
    }
    const user = await authService.issueToken(req.body)

    /* eslint-disable camelcase */
    res.json({
      access_token: user.accessToken,
      expires_in: user.expiresIn,
    })
    /* eslint-enable camelcase */
  } catch (error) {
    if (error instanceof AuthError) {
      /* eslint-disable camelcase */
      res.status(400).json({
        error: error.code,
        error_description: error.decription,
      })
      /* eslint-enable camelcase */
    } else {
      next(error)
    }
  }
})

module.exports = router
