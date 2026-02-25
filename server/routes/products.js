const express = require('express');
const { Product, Category } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/products — todos los productos con categoría
router.get('/', authMiddleware, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { active: true },
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
});

module.exports = router;
