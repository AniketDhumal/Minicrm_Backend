const express = require('express');
const router = express.Router();
const passport = require('passport');
const { 
  createCustomer, 
  getCustomers, 
  getCustomerById 
} = require('../controllers/customerController');

router.use(passport.authenticate('jwt', { session: false }));

router.post('/', createCustomer);
router.get('/', getCustomers);
router.get('/:id', getCustomerById);

module.exports = router;