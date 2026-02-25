const express = require('express');
const cors = require('cors');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('sb_food_db', 'sb_food_user', 'SbFood2025!', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'SB Food API funcionando' });
});

app.get('/db-test', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: 'success', 
      message: '✅ Conectado a PostgreSQL SB Food' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: '❌ Error de conexión', 
      error: error.message 
    });
  }
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`🚀 SB Food API en http://localhost:${PORT}`);
  console.log(`🧪 Prueba BD: http://localhost:${PORT}/db-test`);
});
