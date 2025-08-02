// puppeteer.js
// Запускает браузер, логинится (если нужно), подаёт заявку на бой, ждёт начала
// Запуск: node puppeteer.js

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://antibk.org/main.php');

  // TODO: вставить авторизацию при необходимости
  // await page.type('input[name=login]', 'Van Ciuc');
  // await page.type('input[name=pass]', 'your_password');
  // await page.click('input[type=submit]');

  await page.waitForSelector('a[href="main.php?zayvka=1&r=7"]');
  await page.goto('https://antibk.org/main.php?zayvka=1&r=7');

  // Подаём заявку на хаотичный бой через 5 минут, таймаут 1 мин, только моего уровня, быстрый
  await page.waitForSelector('input[name=chaos_start]');
  await page.select('select[name=chaos_start]', '5');
  await page.select('select[name=chaos_timeout]', '1');
  await page.click('input[name=levelonly]');
  await page.click('input[name=chaos_express]');
  await page.click('input[type=submit]');

  console.log('Заявка на бой подана');
  await browser.close();
})();
