const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { validateBody } = require('../middlewares/validate');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);

module.exports = router;