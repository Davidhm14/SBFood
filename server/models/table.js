const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Table', {
  name:     { type: DataTypes.STRING(50), allowNull: false },
  capacity: { type: DataTypes.INTEGER, defaultValue: 4 },
  status:   { type: DataTypes.ENUM('free','occupied','pending'), defaultValue: 'free' },
}, { tableName: 'tables', underscored: true });
