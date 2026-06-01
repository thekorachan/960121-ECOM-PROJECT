require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const port = Number(process.env.PORT || 3000);

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        description,
        price,
        compare_price,
        stock,
        rating,
        review_count,
        is_active,
        image_url,
        category
      FROM products
      WHERE is_active = true
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error("Failed to load products:", error);
    res.status(500).json({ message: "Failed to load products" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
