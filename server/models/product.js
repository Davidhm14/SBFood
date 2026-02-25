const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Product', {
  category_id: { type: DataTypes.INTEGER },
  name:        { type: DataTypes.STRING(150), allowNull: false },
  price:       { type: DataTypes.DECIMAL(10,2), allowNull: false },
  stock:       { type: DataTypes.INTEGER, defaultValue: 0 },
  min_stock:   { type: DataTypes.INTEGER, defaultValue: 5 },
  image_url:   { type: DataTypes.STRING(255) },
  active:      { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'products', underscored: true });
