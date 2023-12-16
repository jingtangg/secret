// 1. import函式庫
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import pkg from "pg";
const { Client } = pkg;
console.log(process.env);

//2.初始化全局變數
const app = express();
app.set("view engine", "ejs");
const db = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

// 4.middleware（中介軟體)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// 5.路由處理(get)
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

// 5.路由處理(post)
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  const query = "INSERT INTO users(username, password) VALUES($1, $2)";
  db.query(query, [username, password], (err, dbRes) => {
    if (err) {
      console.error("Error saving user to database", err);
      res.status(500).send("Error saving user");
    } else {
      res.render("secrets");
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM users WHERE username = $1 AND password = $2";
  db.query(query, [username, password], (err, dbRes) => {
    if (err) {
      console.error("Error during login", err);
      res.status(500).send("Error during login");
    } else {
      if (dbRes.rows.length > 0) {
        // 用戶存在，密碼正確
        res.render("secrets");
      } else {
        // 用戶不存在或密碼錯誤
        res.send("Username or password is incorrect");
      }
    }
  });
});

// 6.其他功能和監聽
const port = 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
