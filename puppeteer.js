const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--start-maximized'],
    defaultViewport: null
  });

  const page = await browser.newPage();
  await page.goto('https://antibk.org/main.php?zayvka=1&r=7');

  console.log('⏳ Подожди 30 секунд для логина...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  // Проверим, что мы всё ещё на странице логов
  const url = page.url();
  if (!url.includes('main.php?zayvka=1&r=7')) {
    console.error('❌ Не на странице логов боёв. Сейчас на: ', url);
    await page.screenshot({ path: 'wrong_page.png' });
    await browser.close();
    return;
  }

  try {
    await page.waitForSelector('a[href^="logs.php?log="]', { timeout: 60000 });
    const links = await page.$$eval('a[href^="logs.php?log="]', anchors =>
      anchors.map(a => a.href)
    );

    if (links.length === 0) {
      console.error('❌ Ссылки на логи не найдены.');
      await page.screenshot({ path: 'no_logs.png' });
    } else {
      console.log('✅ Найдены ссылки на логи боёв:');
      console.log(links);
    }

  } catch (err) {
    console.error('⚠️ Ошибка при поиске ссылок на логи: ', err.message);
    await page.screenshot({ path: 'error_logs.png' });
  }

  await browser.close();
})();