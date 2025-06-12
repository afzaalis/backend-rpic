const express = require('express');
const router = express.Router();
const db = require('../db');

// GET semua PC berdasarkan jenis (Alpha/Beta/Driving)
router.get('/:type', async (req, res) => {
  const pcTypeName = req.params.type; // misal 'Beta'
  try {
    const [rows] = await db.query(
      `SELECT pcs.id, pcs.pc_number, pc_types.name AS type,
       NOT EXISTS (
         SELECT 1 FROM bookings
         WHERE bookings.pc_id = pcs.id
           AND bookings.status IN ('pending', 'confirmed')
             ) AS available
        FROM pcs
        JOIN pc_types ON pcs.pc_type_id = pc_types.id
        WHERE pc_types.name = ?
        `,
       [pcTypeName]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching PCs:', error);
    res.status(500).json({ message: 'Error fetching PCs' });
  }
});

router.get("/pcs/:type", async (req, res) => {
  const type = req.params.type;
  try {
    const [rows] = await db.execute(
      `SELECT pcs.id, pcs.pc_number, pt.name AS type, pcs.available, pcs.price
       FROM pcs
       JOIN pc_types pt ON pcs.pc_type_id = pt.id
       WHERE pt.name = ?`,
      [type]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error get PCs:", err);
    res.status(500).json({ message: "Gagal mengambil data PC" });
  }
});


// GET ketersediaan PC berdasarkan jenis dengan cek booking aktif
router.get('/availability/:type', async (req, res) => {
  const { type } = req.params;
  try {
    const [rows] = await db.query(`
      SELECT pcs.id, pcs.pc_number, pc_types.name AS type,
        CASE WHEN EXISTS (
          SELECT 1 FROM bookings
          WHERE bookings.pc_id = pcs.id
            AND bookings.status IN ('pending', 'confirmed')
            AND NOW() BETWEEN bookings.start_time AND bookings.end_time
        ) THEN 0 ELSE 1 END AS available
      FROM pcs
      JOIN pc_types ON pcs.pc_type_id = pc_types.id
      WHERE pc_types.name = ?
    `, [type]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching PC availability:', error);
    res.status(500).json({ error: 'Failed to get PC availability' });
  }
});


// PATCH /pcs/:id - Ubah status ketersediaan PC
router.patch('/:id', async (req, res) => {
  const pcId = req.params.id;
  const { available } = req.body;

  if (typeof available !== "boolean") {
    return res.status(400).json({ message: "Field 'available' harus boolean" });
  }

  try {
    const [result] = await db.query(
      "UPDATE pcs SET available = ? WHERE id = ?",
      [available, pcId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "PC tidak ditemukan" });
    }

    res.json({ message: "Status PC berhasil diperbarui" });
  } catch (error) {
    console.error("Gagal update status PC:", error);
    res.status(500).json({ message: "Gagal memperbarui status PC" });
  }
});




module.exports = router;
