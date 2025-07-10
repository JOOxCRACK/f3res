const puppeteer = require("puppeteer");

const email = process.argv[2];
const password = process.argv[3];

(async () => {
  const browser = await puppeteer.launch({ headless: true }); // خليها false لو عايز تشوف المتصفح
  const page = await browser.newPage();

  // استمع لكل الريسبونسات اللي بتيجي للصفحة
  page.on("response", async (response) => {
    const req = response.request();
    const url = req.url();

    // فلترة الريكوست اللي فيه login GraphQL
    if (url.includes("/graphql?operationName=WebLoginWithEmail")) {
      console.log(`📩 Response from: ${url}`);
      try {
        const json = await response.json();
        console.log("🔍 Full response JSON:\n", JSON.stringify(json, null, 2));
      } catch (err) {
        console.error("❌ Failed to parse JSON:", err.message);
      }
    }
  });

  try {
    await page.goto("https://www.okcupid.com/login", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await page.type("input[name='username']", email, { delay: 50 });
    await page.type("input[name='password']", password, { delay: 50 });
    await page.click("button[type='submit']");

    // انتظر شوية عشان الريسبونس ييجي
    await page.waitForTimeout(7000);

    const currentURL = page.url();
    if (currentURL.includes("okcupid.com/home")) {
      console.log("✅ Login successful! Redirected to home page.");
    } else {
      console.log("❌ Login failed or redirected to unexpected page.");
    }
  } catch (err) {
    console.error("❌ Puppeteer error:", err.message);
  } finally {
    await browser.close();
  }
})();
