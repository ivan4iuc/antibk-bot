const puppeteer = require('puppeteer');
const fs = require('fs');

const COOKIE_PATH = 'cookies.json';
const TARGET_URL = 'https://antibk.org/';

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const page = await browser.newPage();

  // Загружаем куки, если есть
  if (fs.existsSync(COOKIE_PATH)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH));
    await page.setCookie(...cookies);
    console.log('[🍪] Cookies загружены');
  } else {
    console.log('[🔓] Куки не найдены. Войдите вручную.');
  }

  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

  // Если куки не были загружены — даём время на ручной логин
  if (!fs.existsSync(COOKIE_PATH)) {
    console.log('[⏳] Ожидание логина (60 секунд)...');
    await new Promise(resolve => setTimeout(resolve, 60000)); // 60 секунд
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));
    console.log('[✅] Куки сохранены');
  }

  // Дальше — твоя логика, например — переход к заявке на бой
  console.log('[⚔️] Инициализация авто-действий...');
  try {
    await page.waitForSelector('a[href="main.php?zayvka=1&r=5"]', { timeout: 10000 });
    await page.click('a[href="main.php?zayvka=1&r=5"]');
    console.log('[🎯] Заявка на бой отправлена!');
  } catch (err) {
    console.log('[⚠️] Не удалось найти ссылку на бой:', err.message);
  }

  // Оставь браузер открытым для дебага
  // await browser.close();
}

run().catch(err => {
  console.error('[💥] Ошибка при запуске скрипта:', err);
});