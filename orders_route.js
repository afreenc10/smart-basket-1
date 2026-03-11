// ─── Add this route to your server.js ────────────────────────────────────────

app.post('/api/orders', async (req, res) => {
  const {
    order_number,
    user_id,
    customer_name,
    customer_phone,
    delivery_address,
    pincode,
    total_amount,
    status,
    items, // array of { product_id, quantity, price }
  } = req.body;

  if (!items || items.length === 0)
    return res.status(400).json({ error: 'No items in order' });

  try {
    const orderId = uuidv4();

    // Insert order
    await db.query(
      `INSERT INTO orders 
        (id, order_number, user_id, customer_name, customer_phone, delivery_address, pincode, total_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, order_number, user_id || null, customer_name, customer_phone, delivery_address, pincode, total_amount, status]
    );

    // Insert order items
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)`,
        [uuidv4(), orderId, item.product_id, item.quantity, item.price]
      );
    }

    res.json({ id: orderId, order_number });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
