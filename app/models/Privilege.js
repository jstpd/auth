import { DataTypes, Model } from 'sequelize'
import sequelize from '../sequelize'

class Privilege extends Model {}

const model = Privilege.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
  UserId: { type: DataTypes.INTEGER, allowNull: false },
  privilege: { type: DataTypes.MEDIUMINT, allowNull: false },
}, {
  sequelize,
  modelName: 'Privilege'
})

export default model
