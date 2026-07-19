import { body, validationResult } from 'express-validator';

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}


export const validateRegister = [
  body('email').isEmail().withMessage("Please provide a valid email address"),
  body('contact')
    .notEmpty().withMessage("Contact number is required")
    .matches(/^\d{10}$/).withMessage("Contact number must be a 10-digit number"),
  body('password')
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/).withMessage("Password must contain at least one lowercase letter"),
  body('fullName')
    .notEmpty().withMessage("Full name is required"),
    // .isLength({ min: 3 }).withMessage("Full name must be at least 3 characters long"),
  body('isSeller')
    .isBoolean().withMessage("isSeller must be a boolean value"),

  validateRequest
]

export const validateLogin = [
  body('email').isEmail().withMessage("Please provide a valid email address"),
  body('password').notEmpty().withMessage("Password is required"),
  validateRequest
]