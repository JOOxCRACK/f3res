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

    await page.waitForSelector("input[name='username']");
    await page.waitForSelector("input[name='password']");

    // املى الإيميل والباسورد
    await page.type("input[name='username']", email, { delay: 50 });
    await page.type("input[name='password']", password, { delay: 50 });

    // شغل كود تسجيل الدخول من داخل الصفحة (simulate real app behavior)
    await page.evaluate(() => {
      const btn = document.querySelector("button[type='submit']");
      if (btn) btn.click();
    });

    await page.waitForTimeout(7000);

    const url = page.url();
    const content = await page.content();
    console.log("📍 URL:", url);
    console.log("📄 HTML starts with:\n", content.substring(0, 500));
  } catch (err) {
    console.error("❌ ERROR:", err.message);
  } finally {
    await browser.close();
  }
})();
