import 'dotenv/config'
import { readFileSync } from 'fs'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import sequelize from './app/sequelize'
import Redis from '@fastify/redis'
import jwt from '@fastify/jwt'
import routes from './routes'

// DB connection MySQL
try {
  await sequelize.authenticate()
  // await sequelize.sync() // add databasess
  console.log('MySQL connection has been established successfully.')
} catch (e) {
  console.log('MySQL connection error...', e)
}

// Init fastify instance
const fastify = Fastify({
  logger: false,
  http2: true,
  https: {
    key: readFileSync('../key.pem'),
    cert: readFileSync('../cert.pem')
  }
})

// --- @@@ Registers
fastify.register(Redis, { host: '127.0.0.1' })
fastify.register(cors, {
  origin: (origin, cb) => cb(null, origin || '*'),
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept',
//  exposedHeaders: '*',
  credentials: true,
})

fastify.register(jwt, {
  secret: process.env.SESSION_SECRET,
})

// Hooks
fastify.addHook('onRequest', async (req) => {
  req.fastify = fastify
})


// --- @@@ Routes
fastify.get('/', async(req, reply) => {
  let data = {}
  data.status = 200
  data.message = 'Auth server from jgame system'

  //const r = await fastify.redis.xadd(['my awesome fastify stream name', '*', 'hello', 'fastify is awesome'])
  //console.log('LOGIN!!!', r)

  reply.code(200).send(data)
})

routes.map(route => fastify.route(route))

// --- @@@ Listen server
fastify.listen({ port: process.env.SERVER_PORT, host: 'localhost' }, (err, address) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  } else console.log('Server listening ', address)
})

