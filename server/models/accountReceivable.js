const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('AccountReceivable', {
  order_id: { type: DataTypes.INTEGER },
  amount:   { type: DataTypes.DECIMAL(10,2), allowNull: false },
  paid:     { type: DataTypes.BOOLEAN, defaultValue: false },
  paid_at:  { type: DataTypes.DATE },
  due_date: { type: DataTypes.DATE },
  notes:    { type: DataTypes.TEXT },
}, { tableName: 'accounts_receivable', underscored: true });
