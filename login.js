const express = require("express");
const axios = require("axios");
const puppeteer = require("puppeteer"); // ✅ أضف Puppeteer هنا
const path = require("path");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 📌 Route تجربة علشان نتأكد Puppeteer شغال
app.get("/test", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto("https://example.com");
    const title = await page.title();
    await browser.close();
    res.send(`✅ Puppeteer اشتغل، واسم الصفحة: ${title}`);
  } catch (err) {
    res.status(500).send(`❌ Puppeteer وقع: ${err.message}`);
  }
});

// 📌 صفحة الدخول
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 📌 POST /login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("📥 Received login request:", email);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto("https://www.okcupid.com/login", { waitUntil: "networkidle2" });

    const cookies = await page.cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");
    const userAgent = await page.evaluate(() => navigator.userAgent);
    await browser.close();

    const response = await axios.post(
      "https://e2p-okapi.api.okcupid.com/graphql?operationName=WebLoginWithEmail",
      {
        operationName: "WebLoginWithEmail",
        variables: { input: { email, password } },
        query: `mutation WebLoginWithEmail($input: AuthEmailLoginInput!) {
          authEmailLogin(input: $input) {
            encryptedUserId
            status
            token
            __typename
          }
        }`
      },
      {
        headers: {
          "cookie": cookieHeader,
          "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjb3JlYXBpIiwiYXVkIjoiY29yZWFwaSIsInBsYXRmb3JtSWQiOjExMiwic2Vzc2lvbklkIjoiZWI4Njk5YjYtNDhkYy00ODcwLWI4OTUtMzJlMDRkODAyZTMwIiwic2l0ZUNvZGUiOjM2LCJTZXJ2ZXJJZCI6NzksInZlciI6MTIsImlzc1NyYyI6MjcsImVudiI6MSwic2NvcGUiOlsxXSwiYXV0aF90aW1lIjpudWxsLCJpYXQiOjE3NTIxNzkzMTIsImV4cCI6MTc1MjE4MjAxMn0.KwpNxZvpwTnYCD9o1XhfHXpUa9HqtXsT8nFPXa4YVAg", // بدلها بالتوكن الحقيقي لو عندك
          "content-type": "application/json",
          "origin": "https://www.okcupid.com",
          "referer": "https://www.okcupid.com/",
          "x-okcupid-auth-v": "1",
          "x-okcupid-device-id": "1e3b554a70cf70ed",
          "x-okcupid-locale": "en",
          "x-okcupid-platform": "DESKTOP",
          "x-okcupid-version": "204",
          "user-agent": userAgent
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("❌ Login error:", error.message);
    res.status(500).send("Login failed or blocked by Cloudflare");
  }
});

// ✅ شغّل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
