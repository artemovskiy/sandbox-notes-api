const {EntitySchema} = require('typeorm')

module.exports = new EntitySchema({
  name: 'Note',
  tableName: 'notes',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    text: {
      type: 'varchar',
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true,
    },
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      cascade: true,
      onDelete: 'CASCADE',
    },
    pointers: {
      target: 'Pointer',
      type: 'one-to-many',
      lazy: true,
      inverseSide: pointer => pointer.note,
    },
  },
})
