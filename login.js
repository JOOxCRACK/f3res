const puppeteer = require("puppeteer");
const axios = require("axios");

async function loginOkCupid(email, password) {
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

    // ناخد الكوكيز
    const cookies = await page.cookies();
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join("; ");

    // نبعَت ريكوست من Node بالكوكيز
    const graphqlRes = await axios.post(
      "https://e2p-okapi.api.okcupid.com/graphql?operationName=WebLoginWithEmail",
      {
        operationName: "WebLoginWithEmail",
        variables: {
          input: {
            email,
            password
          }
        },
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
          "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // توكن حقيقي
          "content-type": "application/json",
          "origin": "https://www.okcupid.com",
          "referer": "https://www.okcupid.com/",
          "x-okcupid-auth-v": "1",
          "x-okcupid-device-id": "1e3b554a70cf70ed",
          "x-okcupid-locale": "en",
          "x-okcupid-platform": "DESKTOP",
          "x-okcupid-version": "204",
          "user-agent": await page.evaluate(() => navigator.userAgent)
        }
      }
    );

    console.log("✅ Login Response:", JSON.stringify(graphqlRes.data, null, 2));
    return graphqlRes.data;
  } catch (err) {
    console.error("❌ Error:", err.message);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = loginOkCupid;
