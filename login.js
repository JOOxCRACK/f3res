const puppeteer = require("puppeteer");
const email = process.argv[2];
const password = process.argv[3];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://www.okcupid.com/login", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // ⛳️ الخطوة الأهم - إرسال الطلب من داخل الصفحة
    const result = await page.evaluate(async (email, password) => {
      const res = await fetch("https://e2p-okapi.api.okcupid.com/graphql?operationName=WebLoginWithEmail", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "origin": "https://www.okcupid.com",
          "referer": "https://www.okcupid.com/",
          "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // ✅ توكن كامل
          "x-okcupid-auth-v": "1",
          "x-okcupid-device-id": "1e3b554a70cf70ed",
          "x-okcupid-locale": "en",
          "x-okcupid-platform": "DESKTOP",
          "x-okcupid-version": "204"
        },
        body: JSON.stringify({
          operationName: "WebLoginWithEmail",
          variables: {
            input: { email, password }
          },
          query: `mutation WebLoginWithEmail($input: AuthEmailLoginInput!) {
            authEmailLogin(input: $input) {
              encryptedUserId
              status
              token
              __typename
            }
          }`
        })
      });
      return await res.json();
    }, email, password);

    // 👇 دي بتطبع من Puppeteer على لوج Render
    console.log("✅ Login response:", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ Puppeteer error:", err.message);
  } finally {
    await browser.close();
  }
})();
