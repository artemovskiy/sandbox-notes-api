const express = require('express')

const router = express.Router()

const NotFoundError = require('../errors/not-found.error')

router.get('/p/:code', function (req, res, next) {
  const connection = req.app.get('dbConnection')
  const repo = connection.getRepository('Pointer')
  repo.findOne({
    where: {
      code: req.params.code,
    },
    relations: ['note'],
  })
    .then(pointer => {
      if(!pointer) {
        throw new NotFoundError()
      }
      res.json(pointer.note)
    })
    .catch(next)
})

module.exports = router
