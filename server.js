const express = require("express");
const axios = require("axios");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login request from:", email);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
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
          "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjb3JlYXBpIiwiYXVkIjoiY29yZWFwaSIsInBsYXRmb3JtSWQiOjExMiwic2Vzc2lvbklkIjoiZDk2YjY0MjYtNmRmZi00MjVlLTk2YzgtZGIxZTJhYzg5YTI3Iiwic2l0ZUNvZGUiOjM2LCJTZXJ2ZXJJZCI6MjA4LCJ2ZXIiOjEyLCJpc3NTcmMiOjI3LCJlbnYiOjEsInNjb3BlIjpbMV0sImF1dGhfdGltZSI6bnVsbCwiaWF0IjoxNzUyMjI4NTY1LCJleHAiOjE3NTIyMzEyNjV9.5E8HPm77aoyEtEYNSj5K7n1gn7l_RLJ3SXp0ZjvZdTM",
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
    console.error("❌ Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
