const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const pool = require("../utils/db");
const result = require("../utils/result");
const config = require("../utils/config");

// Middleware: allow only ADMIN
router.use((req, res, next) => {
  if (req.role !== "ADMIN")
    return res.send(result.createResult("Access denied"));
  next();
});

// Add new user (ADMIN or STORE_OWNER or USER)
router.post("/users", async (req, res) => {
  const { name, email, password, address, role } = req.body;
  const sql = `INSERT INTO users(name,email,password,address,role) VALUES(?,?,?,?,?)`;

  try {
    const hashPassword = await bcrypt.hash(password, config.saltRounds);
    pool.query(
      sql,
      [name, email, hashPassword, address, role],
      (error, data) => {
        res.send(result.createResult(error, data));
      }
    );
  } catch (error) {
    res.send(result.createResult(error));
  }
});

// Add new store
router.post("/stores", (req, res) => {
  const { name, email, address, owner_id } = req.body;
  const sql = `INSERT INTO stores(name,email,address,owner_id) VALUES(?,?,?,?)`;

  pool.query(sql, [name, email, address, owner_id], (error, data) => {
    res.send(result.createResult(error, data));
  });
});

// Admin dashboard
router.get("/dashboard", (req, res) => {
  const dashboard = {};

  pool.query("SELECT COUNT(*) AS users FROM users", (e1, d1) => {
    dashboard.users = d1[0].users;

    pool.query("SELECT COUNT(*) AS stores FROM stores", (e2, d2) => {
      dashboard.stores = d2[0].stores;

      pool.query("SELECT COUNT(*) AS ratings FROM ratings", (e3, d3) => {
        dashboard.ratings = d3[0].ratings;
        res.send(result.createResult(null, dashboard));
      });
    });
  });
});

// List users with filters
router.get("/users", (req, res) => {
  const { name, email, address, role } = req.query;

  let sql = `SELECT u_id,name,email,address,role FROM users WHERE 1=1`;
  const params = [];

  if (name) {
    sql += " AND name LIKE ?";
    params.push(`%${name}%`);
  }
  if (email) {
    sql += " AND email LIKE ?";
    params.push(`%${email}%`);
  }
  if (address) {
    sql += " AND address LIKE ?";
    params.push(`%${address}%`);
  }
  if (role) {
    sql += " AND role = ?";
    params.push(role);
  }

  pool.query(sql, params, (error, data) => {
    res.send(result.createResult(error, data));
  });
});

// List stores with rating
router.get("/stores", (req, res) => {
  const sql = `
        SELECT s.s_id, s.name, s.email, s.address, AVG(r.rating) AS rating
        FROM stores s
        LEFT JOIN ratings r ON s.s_id = r.s_id
        GROUP BY s.s_id
    `;
  pool.query(sql, (error, data) => {
    res.send(result.createResult(error, data));
  });
});

// Get user details (including store rating if owner)
router.get("/users/:id", (req, res) => {
  const u_id = req.params.id;

  const sql = `
        SELECT u.u_id,u.name,u.email,u.address,u.role,
               AVG(r.rating) AS rating
        FROM users u
        LEFT JOIN stores s ON u.u_id = s.owner_id
        LEFT JOIN ratings r ON s.s_id = r.s_id
        WHERE u.u_id = ?
        GROUP BY u.u_id
    `;
  pool.query(sql, [u_id], (error, data) => {
    res.send(result.createResult(error, data[0]));
  });
});

module.exports = router;
