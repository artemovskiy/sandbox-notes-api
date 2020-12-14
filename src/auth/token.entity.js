const {EntitySchema} = require('typeorm')

module.exports = new EntitySchema({
  name: 'Token',
  tableName: 'tokens',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    value: {
      type: 'varchar',
      unique: true,
    },
    expiresIn: {
      type: 'int',
    },
    issuedAt: {
      type: 'datetime',
      createDate: true,
    },
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      cascade: true,
      onDelete: 'CASCADE',
    },
  },
})
