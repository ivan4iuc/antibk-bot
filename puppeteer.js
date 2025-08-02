const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"],
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });

  const page = await browser.newPage();

  const url = "https://antibk.org/main.php?filter=Van%20Ciuc&zayvka=1&r=7";
  await page.goto(url);

  // Заменили на setTimeout
  console.log("⏳ Подожди 10 секунд для логина...");
  await new Promise(resolve => setTimeout(resolve, 10000));

  await page.waitForSelector('a[href^="logs.php?log="]');
  console.log("✅ Найдены ссылки на логи...");

  const logLinks = await page.$$eval('a[href^="logs.php?log="]', links =>
    links.map(link => link.href)
  );

  console.log("📋 Логи завершённых боёв:");
  logLinks.forEach((link, i) => {
    console.log(`${i + 1}. ${link}`);
  });

  // Оставим браузер открытым для анализа
})();