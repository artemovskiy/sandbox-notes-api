const express = require('express')
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const bearerToken = require('express-bearer-token')
const typeorm = require('typeorm')
const OpenApiValidator = require('express-openapi-validator')

const swaggerDocument = YAML.load('./api-docs.yaml')
const {AuthService, createPasswordHash, UserEntity, TokenEntity, authMiddleware, router: authRouter} = require('./auth')
const {NoteEntity, NotesService, router: notesRouter, PointerEntity} = require('./notes')
const {router: linkRouter} = require('./link')
const {errorHandlerMiddleware} = require('./errors')

;(async () => {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({extended: true}))
  app.use(bearerToken())

  const connection = await typeorm.createConnection({
    type: 'mysql',
    url: process.env.DATABASE_URL,
    synchronize: true,
    entities: [
      UserEntity,
      TokenEntity,
      NoteEntity,
      PointerEntity,
    ],
  })
  app.set('dbConnection', connection)

  const authService = new AuthService(
    connection,
    createPasswordHash,
    process.env.TOKEN_SECRET,
    Number(process.env.TOKEN_TTL)
  )
  app.set('authService', authService)

  const notesService = new NotesService(connection)
  app.set('notesService', notesService)

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.use(
    OpenApiValidator.middleware({
      apiSpec: swaggerDocument,
    }),
  )
  app.use(authMiddleware)
  app.use('/auth', authRouter)
  app.use('/notes', notesRouter)
  app.use(linkRouter)

  const port = process.env.PORT

  app.use(errorHandlerMiddleware)

  app.listen(port, () => {
    console.info('app is listening on: ' + port)
  })
})()


