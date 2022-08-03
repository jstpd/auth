import auth from '../app/controllers/auth'

export default [
  {
    method: 'POST',
    url: '/auth/login',
    handler: auth.loginMethod
  },
  {
    method: 'POST',
    url: '/auth/logout',
    handler: auth.logoutMethod
  },
  {
    method: 'POST',
    url: '/auth/register',
    handler: auth.registerMethod
  },
  
  {
    method: 'GET',
    url: '/auth/icode',
    handler: auth.codeView
  },
]
