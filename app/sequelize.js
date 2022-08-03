import 'dotenv/config'
import { Sequelize } from 'sequelize'

const sequelize = new Sequelize(process.env.SQL_BASE, process.env.SQL_USER, process.env.SQL_PASS, {
  host: process.env.SQL_HOST,
  dialect: 'mysql' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
})

export default sequelize
