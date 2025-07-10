const puppeteer = require("puppeteer");

// قراءة الإيميل والباسورد من سطر الأوامر
const email = process.argv[2];
const password = process.argv[3];

(async () => {
  const browser = await puppeteer.launch({ headless: true }); // أو headless: false لو عايز تشوف
  const page = await browser.newPage();

  try {
    await page.goto("https://www.okcupid.com/login", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // كتابة البريد وكلمة المرور
    await page.type("input[name='username']", email, { delay: 50 });
    await page.type("input[name='password']", password, { delay: 50 });

    // الضغط على زر تسجيل الدخول
    await page.click("button[type='submit']");

    // الانتظار لبعض الوقت حتى يتم التحويل أو ظهور نتيجة
    await page.waitForTimeout(5000);

    const currentURL = page.url();

    if (currentURL.includes("okcupid.com/home")) {
      console.log("✅ Login successful! Redirected to home page.");
    } else {
      console.log("❌ Login failed or blocked.");
    }
  } catch (err) {
    console.error("❌ Error during Puppeteer execution:", err.message);
  } finally {
    await browser.close();
  }
})();
