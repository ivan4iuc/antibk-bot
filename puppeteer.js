const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://antibk.org/', { waitUntil: 'domcontentloaded' });

  console.log('⏳ Подожди 30 секунд для логина...');
  await new Promise(resolve => setTimeout(resolve, 30000));

  const currentUrl = page.url();
  if (!currentUrl.includes('main.php')) {
    console.warn('⚠️ Не на главной странице. Попробую перейти вручную...');
    await page.goto('https://antibk.org/main.php?zayvka=1', { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('📂 Перехожу в раздел "Завершённые бои"...');
  await page.goto('https://antibk.org/main.php?zayvka=1&r=7&rnd=1', { waitUntil: 'domcontentloaded' });
  await new Promise(resolve => setTimeout(resolve, 3000));

  const logs = await page.$$eval('a[href^="logs.php?log="]', links =>
    links.map(link => ({
      text: link.innerText.trim(),
      href: link.href
    }))
  );

  if (logs.length === 0) {
    console.log('❌ Не удалось найти ссылки на логи.');
  } else {
    console.log(`✅ Найдено ${logs.length} лог(ов):`);
    logs.forEach(log => console.log(`• ${log.text}: ${log.href}`));
  }

  await browser.close();
})();