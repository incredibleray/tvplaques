
import { useSelector } from 'react-redux'
import {plaqueMeasurements} from "./SVGPlaqueCard"

export const NUM_ROWS = 2;

function isPlaqueExpired(currentDate, start, end) {
  const beginDate = new Date(start);
  const endDate = new Date(end);
  const plaqueStarted = isNaN(beginDate) || (beginDate <= currentDate);
  const plaqueNotExpired = isNaN(endDate) || (currentDate <= endDate);

  return plaqueStarted && plaqueNotExpired;
}

function CreatePlaquePages(plaques, imagesPerRow, rows, type, pageOffset) {
  const imagesPerPage=imagesPerRow*rows;
  let pages=[];
  let i=0;
  for (; i<Math.floor(plaques.length/imagesPerPage); i++) {
    const plaqueOnPage=plaques.slice(i*imagesPerPage, (i+1)*imagesPerPage);
    const page={
      index:pageOffset+i,
      plaques:plaqueOnPage,
      type:type,
      rows:rows,
      ids:plaqueOnPage.map(p=>p.id),
      searchTerms:plaqueOnPage.map(p=>p.searchTerms).flat()
    }
    pages.push(page);
  }
  
  if (plaques.length>i*imagesPerPage) {
    const plaqueOnPage=plaques.slice(i*imagesPerPage);
    const paddingLen= imagesPerPage-plaqueOnPage.length;
    const padding=Array(paddingLen).fill(createPadItem(type));
    const page={
      index:pageOffset+i,
      plaques:plaqueOnPage.concat(padding),
      type:type,
      rows:rows,
      ids:plaqueOnPage.map(p=>p.id),
      searchTerms:plaqueOnPage.map(p=>p.searchTerms).flat()

    }
    pages.push(page);
  } 

  return pages;
}

const createPadItem = (type) => ({
  "id": null,
  "beneficiary": "",
  "sponsor": "",
  "type": type,
  "requestDate": "",
  "expiryDate": "",
  "searchTerms": [],
  "mediaFiles": [],
  "eventName": "",
  location: [],
  "searchable": false,
});

function compareDates(plaque1, plaque2) {
  const date1 = plaque1.requestDate;
  const date2 = plaque2.requestDate;

  const [mm1, dd1, yyyy1] = date1.split('/');
  const [mm2, dd2, yyyy2] = date2.split('/');
  
  const d1 = new Date(yyyy1, mm1 - 1, dd1);
  const d2 = new Date(yyyy2, mm2 - 1, dd2);
  
  if (d1 > d2) {
    return -1;
  } else if (d1 < d2) {
    return 1;
  } else {
    return 0;
  }
}

export function preprocessSvgPlaques(singleRowImagesPerRow, doubleRowImagesPerRow, location, types, plaquesOnFile) {
    // this produce the current date at 00:00 (without current time)
  // new Date() returns the current datetime, toDateString returns only the date part of the timestamp. new Date(currentDateString) returns the current date at 00:00.
  const currentDate = new Date(new Date().toDateString());

// single row view of all plaques from new to old, no temple location filter, no show on TV filter
// for taking photos of plaques. 
// have not seen a need for taking photos of Dharma Assembly plaques
// thus apply a filter to exclude Dharma Assembly plaques.
if (location=="photoBooth") {
  const p1=plaquesOnFile.filter(p=>{
    // do not accept plaques that do not have a request date or expiry date.
    if (p.requestDate == null || p.requestDate.length==0 || p.expiryDate==null || p.expiryDate.length==0) {
      return false;
    }

    // not expired or permanent plaque
    if (p.expiryDate!="Permanent" && new Date(p.expiryDate)<currentDate) {
      return false
    }      
    
    // console.log(p.eventName)
    if (p.eventName!=null && p.eventName.length>0) {
      return false
    }

    return true
  });

  console.log("plaque photo booth, after filtering", p1);

  const p2=p1.sort((x, y)=>new Date(y.requestDate)-new Date(x.requestDate));

  console.log("plaque photo booth, after sorting", p2);

  const plaques=p2.map(addFontSizes);

  console.log("photo booth plaques, first five:\n", plaques.slice(0, 5),
  "last five:\n", plaques.slice(plaques.length-5));
  // console.log("all photo booth plaques", plaques);

  const imagesPerPage=singleRowImagesPerRow;
  let pages=[];
  let i=0;
  // 50 pages of plaques seem enough for photo booth.
  for (; i<50 && i<Math.floor(plaques.length/imagesPerPage); i++) {
    const plaqueOnPage=plaques.slice(i*imagesPerPage, (i+1)*imagesPerPage);
    // type can't be defined, plaques of different types are mixed.
    const page={
      index:i,
      plaques:plaqueOnPage,
      type:plaqueOnPage[0].type,
      rows:1,
      ids:plaqueOnPage.map(p=>p.id),
      searchTerms:plaqueOnPage.map(p=>p.searchTerms).flat()
    }
    pages.push(page);
  }


  console.log(`created ${pages.length} pages of plaques photo booth, each page have ${imagesPerPage} plaques`);
  return pages;
}

  // filter out expired plaques, order plaques from newest to oldest, and calculate font sizes
  let plaques = plaquesOnFile.filter(
    p => {
      // do not accept plaques that do not have a request date or expiry date.
      if (p.requestDate == null || p.requestDate.length==0 || p.expiryDate==null || p.expiryDate.length==0) {
        return false;
      }

      return isPlaqueExpired(
      currentDate, 
      p.requestDate, 
      p.expiryDate)
    })
    .sort(compareDates)
    .map(addFontSizes);

  let regularPlaquesRowsPerPage=2;

// regular plaque view apply temple location filter and show on TV filter.
  plaques=plaques.filter(p=>p.locations.includes(location)).filter(p=>p.showOnTv==null || p.showOnTv==true);

  let selected=[];
  
  if (types.includes("mmb")) {
    const mmbPlaques=plaques.filter(p=>p.type==="mmb");
    const existingPagesLen=selected.length;
    selected=selected.concat(
      CreatePlaquePages(
        mmbPlaques, 
        (regularPlaquesRowsPerPage==2)?doubleRowImagesPerRow:singleRowImagesPerRow,
        regularPlaquesRowsPerPage, 
        'mmb', 
        existingPagesLen));
  }

  if (types.includes("rebirth")) {
    const rebirthPlaques=plaques.filter(p=>p.type==="rebirth");
    const existingPagesLen=selected.length;
    selected=selected.concat(
      CreatePlaquePages(
        rebirthPlaques, 
        (regularPlaquesRowsPerPage==2)?doubleRowImagesPerRow:singleRowImagesPerRow,
        regularPlaquesRowsPerPage, 
        'rebirth', 
        existingPagesLen));
  }

  if (types.includes("ayw")) {
    const wishPlaques=plaques.filter(p=>p.type==="ayw");
    const existingPagesLen=selected.length;
    selected=selected.concat(
      CreatePlaquePages(
        wishPlaques, 
        (regularPlaquesRowsPerPage==2)?doubleRowImagesPerRow:singleRowImagesPerRow,
        regularPlaquesRowsPerPage, 
        'ayw', 
        existingPagesLen));
  }

  if (types.includes("wmmb")) {
    const wmmbPlaques=plaques.filter(p=>p.type==="wmmb").map(addFontSizes);
    const existingPagesLen=selected.length;
    selected=selected.concat(CreatePlaquePages(wmmbPlaques, singleRowImagesPerRow, 1, 'wmmb', existingPagesLen));
  }

  if (types.includes("wrebirth")) {
    const wRebirthPlaques=plaques.filter(p=>p.type==="wrebirth").map(addFontSizes);
    const existingPagesLen=selected.length;
    selected=selected.concat(CreatePlaquePages(wRebirthPlaques, singleRowImagesPerRow, 1, 'wrebirth', existingPagesLen));
  }

  return selected;
}

let textMeasurementObj=null

function addFontSizes(plaque) {
  const beneficiaryTextFontFamily = '"Playfair Display", Kaiti, "Gowun Batang"'
  const sponsorTextFontFamily= '"Playfair Display", Kaiti, "Gowun Batang"'
  const dateStringFontFamily='Roboto'

  plaque.dateString= genDateString(plaque);

  const measurements=plaqueMeasurements[plaque.type]

  if (measurements==null) {
    return plaque;
  }

  // bandage fix for text overflowing, some beneficiary text and date string of temporary plaques overflow.
  // there is something off with the calculation, I don't know what it is.
  // multiply a factor on the beneficiary and datestring width.
  // it fixes the issue for now.
  let beneficiaryTextSize=measurements.beneficiary.defaultFontSize;
  if (plaque.beneficiary) {
    beneficiaryTextSize=calculateFontSize(plaque.beneficiary, measurements.beneficiary.width*0.92, measurements.beneficiary.height, measurements.beneficiary.defaultFontSize, beneficiaryTextFontFamily);
  }

  let sponsorTextSize=measurements.sponsor.defaultFontSize;
  if (plaque.sponsor) {
    sponsorTextSize=calculateFontSize(plaque.sponsor, measurements.sponsor.width, measurements.sponsor.height, measurements.sponsor.defaultFontSize, sponsorTextFontFamily);
  }

  let dateStringSize=measurements.dateString.defaultFontSize;
  if (plaque.dateString) {
    dateStringSize=calculateFontSize(plaque.dateString, measurements.dateString.width*0.88, measurements.dateString.height, measurements.dateString.defaultFontSize, dateStringFontFamily)
  }

  return {
    ...plaque,
    beneficiaryTextSize,
    sponsorTextSize,
    dateStringSize
  }
}

function calculateFontSize(inStr, maxWidth, maxHeight, startingFontSize, fontFamily) {
    let fontSize = startingFontSize;

    // reuse the span object, create new if span object is not available.
    if (textMeasurementObj == null) {
      textMeasurementObj = document.createElement('span')
      textMeasurementObj.style.visibility="hidden"
      document.body.appendChild(textMeasurementObj)

    }

    inStr = inStr.replace('\n', '<br/>');
    textMeasurementObj.style.fontFamily = fontFamily;
    textMeasurementObj.style.fontSize = `${fontSize}px`;
    textMeasurementObj.innerHTML = inStr;

    while (fontSize > 1 && (textMeasurementObj.offsetWidth >= maxWidth || textMeasurementObj.offsetHeight >= maxHeight)) {
        fontSize--;
        textMeasurementObj.style.fontSize = `${fontSize}px`;
    }
    return fontSize;
}

function genDateString(plaque) {
  if (plaque.eventName) {
    return plaque.eventName;
  } 

  if (plaque.expiryDate.toLowerCase() == 'permanent') {
    return `P${plaque.id}`;
  }

  if (plaque.requestDate || plaque.expiryDate) {
    return `${plaque.requestDate}-${plaque.expiryDate}`;
  }

  return '';
}

export function getAutocompleteOptions(plaquesOnFile) {

const forbiddenSearchTerms=[
  /Depression/, /Manic/, /Gambling/, /Paranoia/, /Creditor/, /Anxiety/, /Cancer/
];
let searchTerms=new Set(plaquesOnFile.map(p=>[p.beneficiary, p.sponsor]).flat());
console.log(`found ${searchTerms.size} search terms from beneficairy and sponsor texts of plaques`);

const options = Array.from(searchTerms).filter(
  t=>{
    if (t ==null) return false;
    for (let i=0; i<forbiddenSearchTerms.length;i++) {
      if (forbiddenSearchTerms[i].exec(t)) {
        return false;
      }
    }

    return true;
  });

console.log(`${options.length} filtered search terms, first five are`, options.slice(0, 5));

  return options;
}