const express = require('express')

const {userMiddleware} = require('../auth')

const router = express.Router()

router.use(userMiddleware)

router.get('/', (req, res, next) => {
  const notesService = req.app.get('notesService')
  notesService.listNotes(req.user, req.query)
    .then(notes => res.json(notes))
    .catch(next)
})

router.post('/', (req, res, next) => {
  const notesService = req.app.get('notesService')
  notesService.createNote(req.user, req.body)
    .then(note => res.json(note))
    .catch(next)
})

router.get('/:id', (req, res, next) => {
  const notesService = req.app.get('notesService')
  notesService.getNote(req.user, req.params.id)
    .then(note => res.json(note))
    .catch(next)
})

router.patch('/:id', (req, res, next) => {
  const notesService = req.app.get('notesService')
  notesService.patchNote(req.user, req.params.id, req.body)
    .then(note => res.json(note))
    .catch(next)
})

router.delete('/:id', (req, res, next) => {
  const notesService = req.app.get('notesService')
  notesService.deleteNote(req.user, req.params.id)
    .then(() => res.status(204).end())
    .catch(next)
})

router.get('/:id/pointers', (req, res, next) => {
  const notesService = req.app.get('notesService')
  notesService.listPointers(req.user, req.params.id)
    .then(pointers => res.json(pointers))
    .catch(next)
})

router.post('/:id/pointers', (req, res, next) => {
  const notesService = req.app.get('notesService')
  notesService.createPointer(req.user, req.params.id)
    .then(pointer => res.json(pointer))
    .catch(next)
})

router.delete('/:id/pointers/:pointerId', (req, res, next) => {
  const notesService = req.app.get('notesService')
  notesService.removePointer(req.user, req.params.id, req.params.pointerId)
    .then(() => res.status(204).end())
    .catch(next)
})

module.exports = router
