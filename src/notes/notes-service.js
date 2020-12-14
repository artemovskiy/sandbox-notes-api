const crypto = require('crypto')

const NoteEntity = require('./note.entity')
const PointerEntity = require('./pointer.entity')
const {ForbiddenError, NotFoundError} = require('../errors')

class NotesService {

  constructor(connection) {
    this.notesRepo = connection.getRepository(NoteEntity)
    this.pointersRepo = connection.getRepository(PointerEntity)
  }

  async listNotes(user, pagination) {
    const take = pagination && typeof pagination.limit === 'number' ? pagination.limit : 10
    const skip = pagination && typeof pagination.offset === 'number' ? pagination.offset : 0
    return this.notesRepo.find({
      where: {
        user,
      },
      skip,
      take,
    })
  }

  async getNote(user, id) {
    const note = await this._findNote(id)
    this._checkAccess(user, note)
    return note
  }

  async createNote(user, draft) {
    const noteEntity = this.notesRepo.create({
      text: draft.text,
      user,
    })
    await this.notesRepo.save(noteEntity)
    return noteEntity
  }

  async deleteNote(user, id) {
    const note = await this._findNote(id)
    this._checkAccess(user, note)
    await this.notesRepo.remove(note)
  }

  async patchNote(user, id, draft) {
    const note = await this._findNote(id)
    this._checkAccess(user, note)
    note.text = draft.text
    await this.notesRepo.save(note)
    return note
  }

  async listPointers(user, id) {
    const note = await this._findNote(id)
    this._checkAccess(user, note)
    return await note.pointers
  }

  async createPointer(user, noteId) {
    const note = await this._findNote(noteId)
    this._checkAccess(user, note)
    const code = crypto.randomBytes(16).toString('base64')
    const pointer = this.pointersRepo.create({
      code,
      note,
    })
    await this.pointersRepo.save(pointer)
    return pointer
  }

  async removePointer(user, noteId, id) {
    const pointer = await this.pointersRepo.findOne(id, {
      relations: ['note', 'note.user'],
    })
    if(!pointer) {
      throw new NotFoundError()
    }
    if(pointer.note.id !== Number(noteId)) {
      throw new Error('invalid req')
    }
    this._checkAccess(user, pointer.note)
    await this.pointersRepo.remove(pointer)
  }

  _checkAccess(user, note) {
    if (note.user.id !== user.id) {
      throw new ForbiddenError()
    }
  }

  async _findNote(id) {
    const note = await this.notesRepo.findOne(id, {
      relations: ['user'],
    })
    if(!note) {
      throw new NotFoundError()
    }
    return note
  }

}

module.exports = NotesService
