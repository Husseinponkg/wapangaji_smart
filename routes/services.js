const express = require("express");
const router = express.Router();
const {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  markAsSoldOut
} = require('../controllers/servicesController');

// Get all services
router.get('/', getAllServices);

// Get service by ID
router.get('/:id', getServiceById);

// Create a new service
router.post('/', createService);

// Update a service
router.put('/:id', updateService);

// Mark service as sold out
router.patch('/:id/sold-out', markAsSoldOut);

// Delete a service
router.delete('/:id', deleteService);

module.exports = router;