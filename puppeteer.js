// puppeteer.js
const puppeteer = require('puppeteer');
const fs = require('fs/promises');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://antibk.org/main.php?zayvka=1&r=7&rnd=1');

  // Подождать появления таблицы завершённых боёв
  await page.waitForSelector('a[href*="logs2="]');

  // Собрать первые 50 ссылок на логи боёв
  const battleLinks = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll('a[href*="logs2="]'));
    return anchors.slice(0, 50).map(a => a.href);
  });

  const logs = [];

  for (let link of battleLinks) {
    await page.goto(link);
    await page.waitForTimeout(500); // чуть подождать загрузку

    const html = await page.evaluate(() => document.body.innerHTML);

    logs.push({ url: link, html });
  }

  await fs.writeFile('logs_dump.json', JSON.stringify(logs, null, 2), 'utf8');

  console.log('✅ Логи собраны. Всего:', logs.length);

  await browser.close();
})();