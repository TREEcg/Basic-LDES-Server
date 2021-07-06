import { Sequelize, DataTypes } from 'sequelize';
const db = require('../config/database')

const DatabaseModel = db.define('DatabaseModel', {
  // Model attributes are defined here
  id: {
    type: DataTypes.TEXT,
    allowNull: false,
    primaryKey: true
  },
  page: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  // Other model options go here
  timestamps: false,
});

DatabaseModel.sync({ force: true });

module.exports = DatabaseModel;