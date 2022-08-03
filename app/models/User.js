import { DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize'
import LogAuth from './LogAuth'
import Privilege from './Privilege'

class User extends Model {
  async securitySet(type, args) {
    return await LogAuth.create({ UserId: this.id, type, ipaddr: args.ipaddr, agent: args.agent })
  }

  async securityGet(where = {}) {
    return await LogAuth.findAll({
      where: { UserId: this.id, ...where },
      // attributes: ['id']
    })
  }

  async privilegesGet() {
    const list = await Privilege.findAll({
      where: { UserId: this.id },
      attributes: ['privilege']
    })
    return list.map(el => el.privilege)
  }
  
  async privilegesSet(privilege) {
    return await Privilege.create({ UserId: this.id, privilege })
  }


}

const model = User.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  name: { type: DataTypes.STRING, unique: true, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false, /* get() { return 'security' } */ },
  token: { type: DataTypes.STRING, unique: true, allowNull: true },
  status: { type: DataTypes.TINYINT, defaultValue: 2 },

}, {
  sequelize,
  modelName: 'User',
  indexes: [
    /* {
      name: 'password',
      fields: ['password'],
    } */
  ]
})

model.hasMany(LogAuth)
model.hasMany(Privilege)

export default model
