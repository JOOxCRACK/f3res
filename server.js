const express = require("express");
const path = require("path");
const { exec } = require("child_process");
const app = express();

// استضافة ملفات HTML من مجلد public
app.use(express.static("public"));

// قراءة البيانات من الفورم والـ JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// صفحة تسجيل الدخول
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// تنفيذ سكربت Puppeteer عند الضغط على زر تسجيل الدخول
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("📥 Puppeteer login requested:", email);

  // تنفيذ login.js وتمرير الإيميل والباسورد كـ arguments
  exec(`node login.js "${email}" "${password}"`, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Puppeteer error:", error.message);
      return res.status(500).send("Login failed");
    }
    console.log("✅ Puppeteer output:", stdout);
    res.send(stdout);
  });
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
