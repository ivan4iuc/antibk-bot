const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const browserPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const base = 'https://antibk.org';

(async () => {
  const browser = await puppeteer.launch({ headless: false, executablePath: browserPath });
  const page = await browser.newPage();
  await page.goto(`${base}/bk`);

  console.log('⏳ Подожди 30 секунд для логина...');
  await new Promise(res => setTimeout(res, 30000));

  const currentUrl = page.url();
  if (!currentUrl.includes('main.php')) {
    console.log('⚠️ Не на главной странице. Попробую перейти вручную...');
    await page.goto(`${base}/main.php`);
    await page.waitForTimeout?.(3000);
  }

  console.log('📂 Перехожу в раздел "Завершённые бои"...');
  await page.goto(`${base}/main.php?zayvka=1&r=7`);

  try {
    await page.waitForSelector('a[href*="logs2="]', { timeout: 30000 });
  } catch (e) {
    console.log('❌ Не удалось найти ссылки на логи.');
    await browser.close();
    return;
  }

  const logPages = await page.$$eval('a[href*="logs2="]', links =>
    links.map(a => a.href)
  );

  const logs = [];
  for (let logPage of logPages.slice(0, 5)) {
    console.log('🌐 Загружаю:', logPage);
    try {
      await page.goto(logPage);
      const hrefs = await page.$$eval('a[href*="logs.php?log="]', links =>
        links.map(a => a.href)
      );
      logs.push(...hrefs);
      console.log(`✅ Найдено ${hrefs.length} лог(ов) за ${logPage}:`);
      hrefs.forEach(url => console.log('•', url));
    } catch (e) {
      console.log(`❌ Не удалось загрузить логи на ${logPage}`);
    }

    if (logs.length >= 50) break;
  }

  const slicedLogs = logs.slice(0, 50);
  fs.writeFileSync('logs_dump.json', JSON.stringify(slicedLogs, null, 2));
  console.log(`✅ Сохранено ${slicedLogs.length} логов в logs_dump.json`);

  await browser.close();
})();