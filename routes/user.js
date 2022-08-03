import userController from '../app/controllers/user'

export default [
  {
    method: 'GET',
    url: '/user/fetch',
    handler: userController.updateAuthData
  },
]
