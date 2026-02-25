const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Order', {
  table_id: { type: DataTypes.INTEGER },
  user_id:  { type: DataTypes.INTEGER },
  status:   { type: DataTypes.ENUM('open','paid','cancelled'), defaultValue: 'open' },
  total:    { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  notes:    { type: DataTypes.TEXT },
}, { tableName: 'orders', underscored: true });
