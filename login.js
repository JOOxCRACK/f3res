const puppeteer = require("puppeteer");

const email = process.argv[2];
const password = process.argv[3];

(async () => {
  const browser = await puppeteer.launch({ headless: false, slowMo: 30 });
  const page = await browser.newPage();

  try {
    await page.goto("https://www.okcupid.com/login", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // خليك جوه الصفحة ونفّذ fetch manual زي ما بيحصل من React
    const result = await page.evaluate(async (email, password) => {
      const res = await fetch("https://e2p-okapi.api.okcupid.com/graphql?operationName=WebLoginWithEmail", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "origin": "https://www.okcupid.com",
          "referer": "https://www.okcupid.com/",
          "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjb3JlYXBpIiwiYXVkIjoiY29yZWFwaSIsInBsYXRmb3JtSWQiOjExMiwic2Vzc2lvbklkIjoiNTljNGMxYWQtMmY0ZC00MDk1LWIzOWYtMTM4MGY1MjAwZmQwIiwic2l0ZUNvZGUiOjM2LCJTZXJ2ZXJJZCI6NzksInZlciI6MTIsImlzc1NyYyI6MjcsImVudiI6MSwic2NvcGUiOlsxXSwiYXV0aF90aW1lIjpudWxsLCJpYXQiOjE3NTIxNTc3MzAsImV4cCI6MTc1MjE2MDQzMH0.OMVJSMJ8hcrjD3zCd61XJCfdTeRUO_QuTftIEoIM70M",
          "x-okcupid-auth-v": "1",
          "x-okcupid-device-id": "1e3b554a70cf70ed",
          "x-okcupid-locale": "en",
          "x-okcupid-platform": "DESKTOP",
          "x-okcupid-version": "204"
        },
        body: JSON.stringify({
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
        }),
      });

      const data = await res.json();
      return data;
    }, email, password);

    console.log("✅ Login response:\n", JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ ERROR:", err.message);
  } finally {
    await browser.close();
  }
})();
