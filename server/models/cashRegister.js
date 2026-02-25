const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('CashRegister', {
  user_id:        { type: DataTypes.INTEGER },
  opened_at:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  closed_at:      { type: DataTypes.DATE },
  initial_amount: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  final_amount:   { type: DataTypes.DECIMAL(10,2) },
  status:         { type: DataTypes.ENUM('open','closed'), defaultValue: 'open' },
}, { tableName: 'cash_registers', underscored: true });
