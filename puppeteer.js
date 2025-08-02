
const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  await page.goto('https://antibk.org/');

  console.log('⏳ Подожди 30 секунд для логина...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Переход на страницу "Поединки"
  await page.goto('https://antibk.org/main.php?zayvka=1');
  await page.waitForTimeout(3000);

  // Переход на вкладку "Завершенные"
  await page.goto('https://antibk.org/main.php?zayvka=1&r=7&rnd=1');
  await page.waitForTimeout(3000);

  const battleLogLinks = [];

  for (let i = 0; i < 5; i++) {
    console.log(`📅 День ${i + 1}`);

    // Сохраняем ссылки на логи боёв
    const links = await page.$$eval('a[href^="logs.php?log="]', els =>
      els.map(el => el.href)
    );

    console.log(`🔗 Найдено ${links.length} логов`);
    battleLogLinks.push(...links);

    // Переход на предыдущий день, если возможно
    const prevDayLink = await page.$('a[href*="logs2="]');
    if (prevDayLink) {
      const href = await page.evaluate(el => el.href, prevDayLink);
      await page.goto(href);
      await page.waitForTimeout(3000);
    } else {
      console.log('❌ Кнопка "Предыдущий день" не найдена');
      break;
    }
  }

  console.log('✅ Сбор логов завершён. Вот ссылки:');
  console.log(battleLogLinks);

  await browser.close();
})();
