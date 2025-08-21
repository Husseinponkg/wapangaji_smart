const db = require('../config/db');

// Get all services (houses) - only show available ones
const getAllServices = async (req, res) => {
  try {
    // Check if location filter is provided
    const { location } = req.query;
    
    let sql = `
      SELECT s.nyumba_id, s.uploaded_house, s.house_type, s.status, s.location, s.contact, s.price, s.image_url,
             u.f_name, u.l_name, u.role, u.id as user_id
      FROM services s
      JOIN users u ON s.userId = u.id
      WHERE s.status = 'available'
    `;
    
    const params = [];
    
    // Add location filter if provided
    if (location) {
      sql += ' AND s.location LIKE ?';
      params.push(`%${location}%`);
    }
    
    sql += ' ORDER BY s.nyumba_id DESC';
    
    const [rows] = await db.execute(sql, params);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get service by ID
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT s.nyumba_id, s.uploaded_house, s.house_type, s.location, s.contact, s.price, s.image_url,
             u.f_name, u.l_name
      FROM services s
      JOIN users u ON s.userId = u.id
      WHERE s.nyumba_id = ?
    `;
    const [rows] = await db.execute(sql, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new service (house)
const createService = async (req, res) => {
  try {
    const { uploaded_house, userId, house_type, location, contact, price, image_url } = req.body;
    
    // Validate required fields
    if (!uploaded_house || !userId || !house_type || !contact || !price) {
      return res.status(400).json({
        error: 'Required fields: uploaded_house, userId, house_type, contact, price'
      });
    }
    
    // Validate house type
    const validHouseTypes = ['master', 'single', 'double'];
    if (!validHouseTypes.includes(house_type)) {
      return res.status(400).json({
        error: 'Invalid house type. Must be one of: master, single, double'
      });
    }
    
    // Check if user exists and get their role
    const [userRows] = await db.execute(`
      SELECT id, role FROM users
      WHERE id = ?
    `, [userId]);
    
    if (userRows.length === 0) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }
    
    const user = userRows[0];
    
    // Check if user is dalali and enforce 5-house limit
    if (user.role === 'dalali') {
      const [houseCountRows] = await db.execute(
        'SELECT COUNT(*) as count FROM services WHERE userId = ? AND status = "available"',
        [userId]
      );
      
      const houseCount = houseCountRows[0].count;
      if (houseCount >= 5) {
        return res.status(400).json({
          error: 'Dalali users can only have a maximum of 5 houses'
        });
      }
    }
    
    // Insert service into database
    const sql = `INSERT INTO services (uploaded_house, userId, house_type, location, contact, price, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await db.execute(sql, [uploaded_house, userId, house_type, location || null, contact, price, image_url || null]);
    
    // Return success response
    res.status(201).json({
      id: result.insertId,
      message: 'Service successfully created'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a service
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { uploaded_house, userId, house_type, image_url } = req.body;
    
    // Validate house type if provided
    if (house_type) {
      const validHouseTypes = ['master', 'single', 'double'];
      if (!validHouseTypes.includes(house_type)) {
        return res.status(400).json({
          error: 'Invalid house type. Must be one of: master, single, double'
        });
      }
    }
    
    // Check if service exists
    const [serviceRows] = await db.execute('SELECT nyumba_id FROM services WHERE nyumba_id = ?', [id]);
    if (serviceRows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Build update query dynamically
    let updateFields = [];
    let updateValues = [];
    
    if (uploaded_house !== undefined) {
      updateFields.push('uploaded_house = ?');
      updateValues.push(uploaded_house);
    }
    
    if (userId !== undefined) {
      // Check if user exists
      const [userRows] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
      if (userRows.length === 0) {
        return res.status(400).json({
          error: 'Invalid user ID'
        });
      }
      updateFields.push('userId = ?');
      updateValues.push(userId);
    }
    
    if (house_type !== undefined) {
      updateFields.push('house_type = ?');
      updateValues.push(house_type);
    }
    
    if (image_url !== undefined) {
      updateFields.push('image_url = ?');
      updateValues.push(image_url);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updateValues.push(id);
    
    const sql = `UPDATE services SET ${updateFields.join(', ')} WHERE nyumba_id = ?`;
    await db.execute(sql, updateValues);
    
    // Return success response
    res.status(200).json({ message: 'Service successfully updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark service as sold out
const markAsSoldOut = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if service exists
    const [serviceRows] = await db.execute('SELECT nyumba_id FROM services WHERE nyumba_id = ?', [id]);
    if (serviceRows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Update service status to sold_out
    const sql = `UPDATE services SET status = 'sold_out' WHERE nyumba_id = ?`;
    await db.execute(sql, [id]);
    
    // Return success response
    res.status(200).json({ message: 'Service marked as sold out' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a service
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if service exists
    const [serviceRows] = await db.execute('SELECT nyumba_id FROM services WHERE nyumba_id = ?', [id]);
    if (serviceRows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    
    // Delete service from database
    const sql = `DELETE FROM services WHERE nyumba_id = ?`;
    await db.execute(sql, [id]);
    
    // Return success response
    res.status(200).json({ message: 'Service successfully deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  markAsSoldOut
};