const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('OrderItem', {
  order_id:   { type: DataTypes.INTEGER },
  product_id: { type: DataTypes.INTEGER },
  quantity:   { type: DataTypes.INTEGER, defaultValue: 1 },
  unit_price: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  notes:      { type: DataTypes.TEXT },
}, { tableName: 'order_items', underscored: true });
