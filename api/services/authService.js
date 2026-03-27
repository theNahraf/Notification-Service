const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const config = require("../config");

const SALT_ROUNDS = 12;

async function signup(email, password, name) {
  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
  if (existing.rows.length) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, 'USER') RETURNING id, email, name, role, created_at`,
    [email.toLowerCase(), passwordHash, name]
  );
  const user = result.rows[0];
  const token = generateToken(user);
  return { user, token };
}

async function login(email, password) {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
  const user = result.rows[0];
  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user);
  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role, created_at: user.created_at },
    token
  };
}

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

async function getUserById(id) {
  const result = await pool.query(
    "SELECT id, email, name, role, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

async function listUsers(limit = 100) {
  const result = await pool.query(
    "SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return result.rows;
}

async function updateUserRole(userId, role) {
  const result = await pool.query(
    "UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role",
    [role, userId]
  );
  return result.rows[0] || null;
}

module.exports = { signup, login, generateToken, verifyToken, getUserById, listUsers, updateUserRole };
