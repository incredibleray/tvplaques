// see doc from https://pptr.dev/
// element handle screenshot: https://pptr.dev/api/puppeteer.elementhandle.screenshot_1/

import puppeteer from 'puppeteer';

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto('http://localhost:3000/?tv=photoBooth');

  // Set screen size
  await page.setViewport({width: 3840, height: 2160});

  // Locate the proper layer in plaque to take screenshot
  const selector = await page.waitForSelector(
    '.selected > div > div > div:nth-child(3) > div > div'
  );

  selector.screenshot({path:"plaquePhoto\\3"})

  await browser.close();
})();