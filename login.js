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

    // انتظر ظهور الفورم فعلاً
    await page.waitForSelector("input[name='username']");
    await page.waitForSelector("input[name='password']");

    // املى البيانات
    await page.type("input[name='username']", email);
    await page.type("input[name='password']", password);
    await page.click("button[type='submit']");

    // انتظر التحويل أو ظهور رسالة خطأ
    await page.waitForTimeout(6000);

    const url = page.url();
    const pageContent = await page.content();

    console.log("📍 Current URL:", url);

    // اطبع أول 1000 حرف من الصفحة بعد محاولة الدخول
    console.log("🔍 HTML Preview:\n", pageContent.substring(0, 1000));
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
  }
})();
