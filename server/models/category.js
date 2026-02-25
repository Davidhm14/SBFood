const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Category', {
  name:   { type: DataTypes.STRING(100), allowNull: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'categories', underscored: true });
