const {EntitySchema} = require('typeorm')

module.exports = new EntitySchema({
  name: 'Pointer',
  tableName: 'pointers',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    code: {
      type: 'varchar',
      unique: true,
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
  },
  relations: {
    note: {
      target: 'Note',
      type: 'many-to-one',
      cascade: true,
      onDelete: 'CASCADE',
    },
  },
})
