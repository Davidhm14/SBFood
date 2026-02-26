const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Order', {
  table_id:       { type: DataTypes.INTEGER },
  user_id:        { type: DataTypes.INTEGER },
  status:         { type: DataTypes.ENUM('open', 'pending_payment', 'paid', 'cancelled'), defaultValue: 'open' },
  total:          { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  notes:          { type: DataTypes.TEXT },
  payment_method: { type: DataTypes.ENUM('cash', 'card', 'digital_wallet') },
}, { tableName: 'orders', underscored: true });
