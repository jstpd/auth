import { DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize'
//import User from './User'

class LogAuth extends Model {}

const model = LogAuth.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  UserId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.TINYINT, allowNull: false }, // 0 - не верный пароль, 1 - auth true, 9 - register
  ipaddr: { type: DataTypes.STRING, allowNull: false },
  agent: { type: DataTypes.STRING, allowNull: false },
}, {
  sequelize,
  modelName: 'LogAuth',
  updatedAt: false
})

/* model.belongsTo(User, {
  foreignKey: 'id'
}) */

export default model
