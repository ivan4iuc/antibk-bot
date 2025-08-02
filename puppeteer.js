const puppeteer = require('puppeteer-core');
const path = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const BASE_URL = 'https://antibk.org/main.php?zayvka=1&r=7&logs2=';

const PREVIOUS_DAYS = [
  1753995600,
  1753909200,
  1753822800,
  1753736400,
  1753650000
];

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: path,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  page.setViewport({ width: 1400, height: 900 });

  console.log('⏳ Подожди 30 секунд для логина...');
  await new Promise(res => setTimeout(res, 30000));

  for (const ts of PREVIOUS_DAYS) {
    const fullURL = `${BASE_URL}${ts}`;
    console.log(`🌐 Загружаю: ${fullURL}`);
    await page.goto(fullURL, { waitUntil: 'networkidle2' });

    try {
      await page.waitForSelector('a[href^="logs.php?log="]', { timeout: 5000 });
      const logLinks = await page.$$eval('a[href^="logs.php?log="]', links =>
        links.map(link => link.href)
      );

      if (logLinks.length > 0) {
        console.log(`✅ Найдено ${logLinks.length} лог(ов) за ${fullURL}:`);
        logLinks.forEach(link => console.log('•', link));
      } else {
        console.log(`⚠️ Нет логов на ${fullURL}`);
      }
    } catch {
      console.log(`❌ Не удалось загрузить логи на ${fullURL}`);
    }

    await new Promise(res => setTimeout(res, 2000)); // пауза между переходами
  }

  await browser.close();
})();