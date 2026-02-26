const express = require('express');
const { Op } = require('sequelize');
const { Product, Category } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/products — todos los productos activos (para POS)
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

// GET /api/products/all — TODOS los productos (activos + inactivos, para admin)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, attributes: ['id', 'name'] }],
      order: [['name', 'ASC']],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener todos los productos', error: error.message });
  }
});

// GET /api/products/:id — producto específico
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener producto', error: error.message });
  }
});

// POST /api/products — crear producto
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, price, categoryId, description } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ message: 'El nombre del producto es requerido' });
    }
    if (!price || price <= 0) {
      return res.status(400).json({ message: 'Precio debe ser mayor a 0' });
    }

    const product = await Product.create({
      name: name.trim(),
      price: parseFloat(price),
      category_id: categoryId,
      description: description?.trim() || null,
      active: true
    });
    
    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });
    
    res.status(201).json(fullProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
});

// PUT /api/products/:id — editar producto
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, price, categoryId, description, active } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ message: 'El nombre del producto es requerido' });
    }
    if (price && price <= 0) {
      return res.status(400).json({ message: 'Precio debe ser mayor a 0' });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await product.update({
      name: name.trim(),
      price: price ? parseFloat(price) : product.price,
      category_id: categoryId || product.category_id,
      description: description?.trim() || product.description,
      active: active !== undefined ? !!active : product.active
    });
    
    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });
    
    res.json(fullProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
});

// DELETE /api/products/:id — desactivar producto (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await product.update({ active: false });
    res.json({ message: 'Producto desactivado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al desactivar producto', error: error.message });
  }
});

// POST /api/products/:id/activate — reactivar producto
router.post('/:id/activate', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await product.update({ active: true });
    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, attributes: ['id', 'name'] }]
    });
    
    res.json(fullProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al reactivar producto', error: error.message });
  }
});

// GET /api/products/categories — todas las categorías
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
});

module.exports = router;
