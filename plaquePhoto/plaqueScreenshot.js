// see doc from https://pptr.dev/
// element handle screenshot: https://pptr.dev/api/puppeteer.elementhandle.screenshot_1/

// import puppeteer from 'puppeteer';
const puppeteer = require('puppeteer');

const plaqueScreenshot=async(page, i)=>{
  // Locate the proper layer in plaque to take screenshot
  const plaqueImageSelector='.selected > div > div > div:nth-child('+String(i)+') > div > div';
  const beneficiaryTextSelector=".selected > div > div > div:nth-child("+String(i)+") > div >h1 ";

  const plaque = await page.$(plaqueImageSelector);
  
  // HTML Element of beneficiary text
  const beneficiaryText=await page.$(beneficiaryTextSelector);
  // get string value of beneficiary text
  const beneficiary=await beneficiaryText?.evaluate(e => e.innerText);
  
  // using index as filename works.
  // beneficiary is not getting the beneficiary text.
  await plaque.screenshot({path:".\\plaquePhoto\\"+beneficiary+".png"});
  await plaque.screenshot({path:".\\plaquePhoto\\"+String(i)+".png"});

}

const takePlaquePhotosOnPage=async (page)=>{
  // This is a selector of one of the plaque on the page, 
  // use this to wait on the page to complete loading.
  let selector='.selected > div > div > div:nth-child(3) > div > div';
  
  await page.waitForSelector(
  selector  
  );

  // css selector index starts from 1. the four plaques have selector index 1, 2, 3, 4.
  for (let i=1;i<5;i++) {
    try {
      await plaqueScreenshot(page, i);
    }
    catch (e) {

    }
  }

}

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({headless: false });
  const page = await browser.newPage();

  // TV Plaque URL
  await page.goto('http://plaquetv.z5.web.core.windows.net/?tv=photoBooth');
  // dev server URL
  // await page.goto('http://localhost:3000/?tv=photoBooth');

  // Set screen size to 4k.
  await page.setViewport({width: 3840, height: 2160});

  // take plaque screenshots every half a minute.
  // the carousel turns every half a minute, operator can also set the next page between the interval.
  const timer=setInterval(async ()=>await takePlaquePhotosOnPage(page), 30000);

  // wait for 5 minutes
  await page.waitForTimeout(5*60*1000);

  await browser.close();
})();