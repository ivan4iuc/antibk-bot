const puppeteer = require('puppeteer');
const fs = require('fs');

const COOKIES_PATH = 'cookies.json';
const LOGS_PATH = 'logs.html';
const TARGET_URL = 'https://antibk.org/main.php?zayvka=1&r=7';

async function saveCookies(page) {
  const cookies = await page.cookies();
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
  console.log('[✅] Cookies saved.');
}

async function loadCookies(page) {
  const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH));
  await page.setCookie(...cookies);
  console.log('[✅] Cookies loaded.');
}

async function run() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  if (fs.existsSync(COOKIES_PATH)) {
    await page.goto('https://antibk.org/');
    await loadCookies(page);
    await page.reload({ waitUntil: 'networkidle2' });
  } else {
    console.log('[🔓] No cookies found. Login manually.');
    await page.goto('https://antibk.org/', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(30000); // 30 секунд на ручной логин
    await saveCookies(page);
  }

  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

    // Ждём хотя бы 1 лог боя
    await page.waitForSelector('a[href*="logs.php?log="]', { timeout: 15000 });

    const html = await page.content();
    fs.writeFileSync(LOGS_PATH, html);
    console.log(`[📄] Логи сохранены в файл: ${LOGS_PATH}`);
  } catch (err) {
    console.error('[⚠️] Ошибка при загрузке логов:', err.message);
  }

  await browser.close();
}

run();