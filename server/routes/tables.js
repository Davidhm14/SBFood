const express = require('express');
const { Table } = require('../models');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/tables — obtener todas las mesas
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tables = await Table.findAll({ order: [['name', 'ASC']] });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener mesas', error: error.message });
  }
});

// PATCH /api/tables/:id/status — cambiar estado de una mesa
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findByPk(req.params.id);

    if (!table) return res.status(404).json({ message: 'Mesa no encontrada' });

    await table.update({ status });
    res.json(table);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar mesa', error: error.message });
  }
});

module.exports = router;
