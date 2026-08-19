import { body, validationResult } from 'express-validator';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Full name is required.'),
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long.'),
  body('email').trim().isEmail().withMessage('Must be a valid email address.').normalizeEmail(),
  body('phone').optional().trim().isMobilePhone().withMessage('Must be a valid phone number.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match.');
    }
    return true;
  })
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Must be a valid email address.').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required.')
];

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
