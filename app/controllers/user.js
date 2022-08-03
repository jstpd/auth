import { Cookie } from 'jgame-core'

const updateAuthData = async(req, reply) => {
  const sid = Cookie.getCookie(req.headers.cookie, 'sid')
  const user = await req.fastify.jwt.decode(sid)
  const data = await req.fastify.redis.get('sess:'+user.uid)
  
  reply.code(200).send({method: 'fetch', data: JSON.parse(data)})
}

export default {
  updateAuthData,
}
