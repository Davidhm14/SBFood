const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const { sequelize, User, Table, Category, Product } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'SB Food API funcionando' });
});

// Test BD + modelos
app.get('/db-test', async (req, res) => {
  try {
    await sequelize.authenticate();

    const users      = await User.findAll({ attributes: ['id','name','role'] });
    const tables     = await Table.findAll({ attributes: ['id','name','status'] });
    const categories = await Category.findAll({ attributes: ['id','name'] });
    const products   = await Product.findAll({ attributes: ['id','name','price'] });

    res.json({
      status: 'success',
      message: '✅ Conectado a PostgreSQL SB Food',
      data: {
        usuarios:   users.length,
        mesas:      tables.length,
        categorias: categories.length,
        productos:  products.length,
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: '❌ Error de conexión',
      error: error.message
    });
  }
});

const PORT = process.env.API_PORT || 4000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL conectado');
    app.listen(PORT, () => {
      console.log(`🚀 SB Food API en http://localhost:${PORT}`);
      console.log(`🧪 Prueba: http://localhost:${PORT}/db-test`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar:', error.message);
  }
}

start();
