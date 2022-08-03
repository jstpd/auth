import 'dotenv/config'
import { Op } from 'sequelize'
import { Logger, Hash, Validator, Cookie } from 'jgame-core'
import User from '../models/User'
import svgCaptcha from 'svg-captcha'


const loginMethod = async(req, reply) => {
  Logger('Route: auth: loginMethod').log()
  // validators add!!!...
  const Redis = req.fastify.redis
  let data = {}
  try {
    const { email, password } = req.body
    if ( !Validator.isEmailValid(email) || !Validator.isPasswordValid(password) ) throw 'Invalid password | email'
    const user = await User.findOne({ where: { email }, attributes: ['id', 'name', 'password', 'status'] })
    if ( !user ) {
      data.error = 'User not found'
      throw 'email not fount in DB'
    }
    if ( user.password !== passToHash(password) ) {
      await user.securitySet(0, {ipaddr: req.ip, agent: req.headers['user-agent']})
      data.error = 'Password incorrect'
      throw 'bad password'
    }
    await user.securitySet(1, {ipaddr: req.ip, agent: req.headers['user-agent']})
    data.token = await reply.jwtSign({uid: user.id})
    data.userid = user.id
    data.username = user.name
    data.status = user.status
    // DEFINE SESSION!
    const rd = await Redis.set('sess:'+user.id, JSON.stringify(data))
    if ( rd !== 'OK' ) throw Error('Redis session not save')
    reply.header('set-cookie', 'sid='+data.token+'; Path=/; Samesite=none; Secure=true')
    Logger('Login user successfully', data).success()
  } catch (e) {
    data.status = false
    Logger('Login user error...', e).error()
  }
  reply.code(200).send({action: 'login', data})
}

const logoutMethod = async(req, reply) => {
  // DEFINE SESSION!
  try {
    const sid = Cookie.getCookie(req.headers.cookie, 'sid')
    if ( !sid ) 
      throw 'No cookie data'
    const user = await req.fastify.jwt.decode(sid)
    if ( !user.uid ) 
      throw 'Uncorrect cookie key'
    const rkey = 'sess:'+user.uid
    const ruser = await req.fastify.redis.get(rkey)
    if ( user.token !== ruser.token ) 
      throw 'Token not defined'
    await req.fastify.redis.del(rkey)
    reply.code(200).send({action: 'logout', status: true})
  } catch (e) {
    reply.code(200).send({action: 'logout', error: e})
  }
}

const registerMethod = async (req, reply) => {
  // validators add!!!... drre23Er$e
  let status = false
  let message = ''
  const { name, email, password, verify, hash } = req.body
  if ( !codeImageHash(verify, req.ip).check(hash) ) {
    return reply.status(200).send({action: 'register', status, message: 'Verify code not valid'})
  }
  if ( !Validator.isEmailValid(email) || !Validator.isLoginValid(name) || !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=(.*[a-zA-Z]){4}).{8,20}$/.test(password) ) {
    return reply.status(200).send({action: 'register', status, message: 'It is impossible to use incorrect data'})
  }
  try { // --
    const isDuplicate = await User.findAll({ where: { [Op.or]: [ { name }, { email } ] }, attributes: ['id'] })
    if ( isDuplicate.length > 0 ) {
      console.log('Duplicate Date', isDuplicate)
      message = 'This user already exists'
      throw 'This user already exists'
    }
    const user = await User.create({name, email, password: passToHash(password), status: 2})
    await user.securitySet(9, {ipaddr: req.ip, agent: req.headers['user-agent']})
    Logger('Create user:', user.getDataValue()).success()
    status = true
  } catch (e) {
    Logger('Create user error...', e).error()
    status = false
  }
  return reply.status(200).send({action: 'register', status, message})
}

const codeView = async (req, reply) => {
  const captcha = svgCaptcha.create()
  const hash = codeImageHash(captcha.text, req.ip).get()
  console.log('Captcha', captcha.text)
  return reply.status(200).send({hash, data: captcha.data})
}

function passToHash(pass) {
  return Hash.passToHash(pass, process.env.PASSWORD_SALT)
}

function codeImageHash(text, ip = '*') {
  const d = new Date().getMinutes()
  const str = `t:${text}f${ip}z:${d}`
  return {
    get() {
      return passToHash(str)
    },
    check(hash) {
      return (passToHash(str) === hash)
    }
  }
}

export default {
  loginMethod,
  logoutMethod,
  registerMethod,
  codeView
}
