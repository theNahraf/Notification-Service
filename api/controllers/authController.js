const authService = require("../services/authService");
const { body, validationResult } = require("express-validator");

const validateSignup = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  body("name").trim().notEmpty().withMessage("Name is required")
];

const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
}

async function signup(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const { email, password, name } = req.body;
    const data = await authService.signup(email, password, name);
    return res.status(201).json({ success: true, data });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
}

async function login(req, res, next) {
  try {
    if (!handleValidation(req, res)) return;
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    return res.json({ success: true, data });
  } catch (e) {
    if (e.statusCode) return res.status(e.statusCode).json({ success: false, message: e.message });
    next(e);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = await authService.listUsers(Number(req.query.limit || 100));
    return res.json({ success: true, data: users });
  } catch (e) {
    next(e);
  }
}

async function updateRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!["USER", "ADMIN"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be USER or ADMIN" });
    }
    const user = await authService.updateUserRole(req.params.id, role);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, data: user });
  } catch (e) {
    next(e);
  }
}

module.exports = { signup, login, getMe, listUsers, updateRole, validateSignup, validateLogin };
