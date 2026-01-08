const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router();
const pool = require("../utils/db");
const result = require("../utils/result");
const config = require("../utils/config");

// Normal User Registration
router.post("/register", async (req, res) => {
  const { name, email, password, address } = req.body;
  const sql = `INSERT INTO users(name,email,password,address,role) VALUES(?,?,?,?,?)`;

  try {
    const hashPassword = await bcrypt.hash(password, config.saltRounds);
    pool.query(
      sql,
      [name, email, hashPassword, address, "USER"],
      (error, data) => {
        res.send(result.createResult(error, data));
      }
    );
  } catch (error) {
    res.send(result.createResult(error));
  }
});

// Login (all roles)
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = ?`;

  pool.query(sql, [email], async (error, data) => {
    if (data && data.length > 0) {
      const dbUser = data[0];
      const isValid = await bcrypt.compare(password, dbUser.password);

      if (isValid) {
        const payload = {
          id: dbUser.u_id,
          role: dbUser.role,
        };

        const token = jwt.sign(payload, config.secret, { expiresIn: "1d" });

        const user = {
          token: token,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        };

        res.send(result.createResult(error, user));
      } else {
        res.send(result.createResult("Invalid Password"));
      }
    } else {
      res.send(result.createResult("Invalid Email"));
    }
  });
});

// Update Password
router.put("/password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const sql = `SELECT * FROM users WHERE u_id = ?`;
  pool.query(sql, [req.u_id], async (error, data) => {
    if (!data || data.length === 0)
      return res.send(result.createResult("User not found"));

    const dbUser = data[0];
    const match = await bcrypt.compare(oldPassword, dbUser.password);
    if (!match)
      return res.send(result.createResult("Old password is incorrect"));

    const hash = await bcrypt.hash(newPassword, config.saltRounds);
    pool.query(
      `UPDATE users SET password = ? WHERE u_id = ?`,
      [hash, req.u_id],
      (err, data) => {
        res.send(result.createResult(err, "Password updated"));
      }
    );
  });
});

// Logout (client deletes token)
router.post("/logout", (req, res) => {
  res.send(result.createResult(null, "Logged out successfully"));
});


module.exports = router;
