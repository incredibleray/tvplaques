// see doc from https://pptr.dev/
// element handle screenshot: https://pptr.dev/api/puppeteer.elementhandle.screenshot_1/

// import puppeteer from 'puppeteer';
const puppeteer = require('puppeteer');
const path=require('node:path')

const plaqueScreenshot=async(page, i)=>{
  // Locate the proper layer in plaque to take screenshot
  const plaqueImageSelector='.active > div > div > div:nth-child('+String(i)+') > div > div';
  const beneficiaryTextSelector=".active > div > div > div:nth-child("+String(i)+") > div >h1 ";

  const plaque = await page.$(plaqueImageSelector);
  
  console.log(await page.$eval(plaqueImageSelector, element=> element.getAttribute("plaqueId")))
  // plaque is not the same as $(selector), need more research to get attribute.
  // get plaque ID and jotform submission ID printed on plaque atrributes
  // attribute labels do not care about case
  const plaqueId=await page.$eval(plaqueImageSelector, element=> element.getAttribute("plaqueId"))
  const jotformSubmissionId=await page.$eval(plaqueImageSelector, element=> element.getAttribute("jotformSubmissionId"))

  console.log(`plaque ID=${plaqueId}, jotform submission ID=${jotformSubmissionId}`)

  // use plaque ID or jotform submission ID as file name.
  const fileName=`${jotformSubmissionId}-${plaqueId}.png`
  await plaque.screenshot({path:path.join('photos', fileName)});
  // await plaque.screenshot({path:"./photos/"+String(i)+".png"});

}

const takePlaquePhotosOnPage=async (page)=>{
  // This is a selector of one of the plaque on the page, 
  // use this to wait on the page to complete loading.
  let selector='.active > div > div > div:nth-child(3) > div > div';
  
  await page.waitForSelector(
  selector  
  );

  // css selector index starts from 1. the four plaques have selector index 1, 2, 3, 4.
  for (let i=1;i<5;i++) {
    try {
      await plaqueScreenshot(page, i);
    }
    catch (e) {
      console.error(e)
    }
  }

}

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({headless: false });
  const page = await browser.newPage();
  
  // Set screen size to 4k.
  await page.setViewport({width: 3840, height: 2160});

  // TV Plaque URL
  // await page.goto('http://plaquetv.z5.web.core.windows.net/?tv=photoBooth');
  // staging server URL
  await page.goto("https://plaquetvalpha.z5.web.core.windows.net/?tv=photoBooth")
  // dev server URL
  // await page.goto('http://localhost:3000/?tv=photoBooth');

  // wait for 10 seconds so setInterval trigger do not coincide with automatic page flip
  await page.waitForTimeout(10*1000);
  await takePlaquePhotosOnPage(page);

  // take plaque screenshots every half a minute.
  // the carousel turns every half a minute, operator can also set the next page between the interval.
  const timer=setInterval(async ()=>await takePlaquePhotosOnPage(page), 30000);

  // wait for 5 minutes
  await page.waitForTimeout(5*60*1000);

  await browser.close();
})();