// ─── Add these routes to your server.js ──────────────────────────────────────

// GET orders for logged-in user
app.get('/api/orders/my-orders', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET orders for guest (by order_numbers stored in localStorage)
app.post('/api/orders/guest', async (req, res) => {
  const { order_numbers } = req.body;
  if (!order_numbers || order_numbers.length === 0)
    return res.json([]);

  try {
    const placeholders = order_numbers.map(() => '?').join(', ');
    const [rows] = await db.query(
      `SELECT * FROM orders WHERE order_number IN (${placeholders}) ORDER BY created_at DESC`,
      order_numbers
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
