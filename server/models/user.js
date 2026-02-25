const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('User', {
  name:     { type: DataTypes.STRING(100), allowNull: false },
  email:    { type: DataTypes.STRING(150), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role:     { type: DataTypes.ENUM('admin','cashier','waiter'), defaultValue: 'waiter' },
  active:   { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'users', underscored: true });
