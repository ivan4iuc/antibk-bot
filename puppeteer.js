const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // Чтобы ты мог логиниться вручную
    defaultViewport: null,
    args: ["--start-maximized"],
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  });

  const page = await browser.newPage();

  // Шаг 1: зайди на страницу с логами завершённых боёв (фильтр по твоему нику)
  const url = "https://antibk.org/main.php?filter=Van%20Ciuc&zayvka=1&r=7";
  await page.goto(url);

  // Шаг 2: дай время на ручной логин (10 секунд)
  console.log("⏳ Подожди 10 секунд для логина...");
  await page.waitForTimeout(10000);

  // Шаг 3: жди появления ссылок на логи
  await page.waitForSelector('a[href^="logs.php?log="]');
  console.log("✅ Найдены ссылки на логи...");

  // Шаг 4: собери все ссылки
  const logLinks = await page.$$eval('a[href^="logs.php?log="]', links =>
    links.map(link => link.href)
  );

  console.log("📋 Логи завершённых боёв:");
  logLinks.forEach((link, i) => {
    console.log(`${i + 1}. ${link}`);
  });

  // Можно оставить браузер открытым или закрыть:
  // await browser.close();
})();