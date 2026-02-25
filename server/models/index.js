const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  }
);

const User     = require('./user')(sequelize);
const Table    = require('./table')(sequelize);
const Category = require('./category')(sequelize);
const Product  = require('./product')(sequelize);
const Order    = require('./order')(sequelize);
const OrderItem = require('./orderItem')(sequelize);
const CashRegister = require('./cashRegister')(sequelize);
const AccountReceivable = require('./accountReceivable')(sequelize);

// Asociaciones
Table.hasMany(Order, { foreignKey: 'table_id' });
Order.belongsTo(Table, { foreignKey: 'table_id' });

User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

Order.hasOne(AccountReceivable, { foreignKey: 'order_id' });
AccountReceivable.belongsTo(Order, { foreignKey: 'order_id' });

module.exports = {
  sequelize, User, Table, Category,
  Product, Order, OrderItem,
  CashRegister, AccountReceivable
};
