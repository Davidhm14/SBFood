const express = require('express');
const { Category } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/categories — todas las categorías activas
router.get('/', authMiddleware, async (req, res) => {
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

// GET /api/categories/all — todas (activas + inactivas)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener todas las categorías', error: error.message });
  }
});

// POST /api/categories — crear categoría
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ message: 'El nombre de la categoría es requerido' });
    }

    const category = await Category.create({
      name: name.trim(),
      active: true
    });
    
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear categoría', error: error.message });
  }
});

// PUT /api/categories/:id — editar categoría
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, active } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ message: 'El nombre de la categoría es requerido' });
    }

    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    await category.update({
      name: name.trim(),
      active: active !== undefined ? !!active : category.active
    });
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar categoría', error: error.message });
  }
});

// DELETE /api/categories/:id — desactivar categoría
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Categoría no encontrada' });
    }

    // Verificar si tiene productos activos
    const { Product } = require('../models');
    const activeProducts = await Product.count({
      where: { category_id: category.id, active: true }
    });

    if (activeProducts > 0) {
      return res.status(400).json({ 
        message: `Categoría tiene ${activeProducts} productos activos` 
      });
    }

    await category.update({ active: false });
    res.json({ message: 'Categoría desactivada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al desactivar categoría', error: error.message });
  }
});

module.exports = router;
