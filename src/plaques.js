
import { useSelector } from 'react-redux'

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
  const currentDate = new Date();
  let plaques = plaquesOnFile.filter(p => isPlaqueExpired(new Date(), p.requestDate, p.expiryDate));
  plaques=plaques.sort(compareDates);
  plaques=plaques.filter(p=>p.locations.includes(location));

  const mmbPlaques=plaques.filter(p=>p.type==="mmb");
  const rebirthPlaques=plaques.filter(p=>p.type==="rebirth");
  const wishPlaques=plaques.filter(p=>p.type==="wish");
  
  let selected=[];
  
  if (types.includes("mmb")) {
    const existingPagesLen=selected.length;
    selected=selected.concat(CreatePlaquePages(mmbPlaques, doubleRowImagesPerRow, 2, 'mmb', existingPagesLen));
  }

  if (types.includes("rebirth")) {
    const existingPagesLen=selected.length;
    selected=selected.concat(CreatePlaquePages(rebirthPlaques, doubleRowImagesPerRow, 2, 'rebirth', existingPagesLen));
  }

  if (types.includes("wish")) {
    const existingPagesLen=selected.length;
    selected=selected.concat(CreatePlaquePages(wishPlaques, doubleRowImagesPerRow, 2, 'wish', existingPagesLen));
  }

  if (types.includes("wmmb")) {
  const wmmbPlaques=plaques.filter(p=>p.type==="wmmb");
    const existingPagesLen=selected.length;
    selected=selected.concat(CreatePlaquePages(wmmbPlaques, singleRowImagesPerRow, 1, 'wmmb', existingPagesLen));
  }

  if (types.includes("wrebirth")) {
    const wRebirthPlaques=plaques.filter(p=>p.type==="wrebirth");
    const existingPagesLen=selected.length;
    selected=selected.concat(CreatePlaquePages(wRebirthPlaques, singleRowImagesPerRow, 1, 'wrebirth', existingPagesLen));
  }

  return selected;
}

// export function getSearchView(allPlaques, picsPerCol, searchResult) {
//   const resultIndex=allPlaques.findIndex(
//     (p)=>p.id===searchResult.id
//   );

//   if (resultIndex===-1){
//     return [];
//   }

//   const imagesPerPage=picsPerCol * NUM_ROWS;
//   const page=(resultIndex-(resultIndex%imagesPerPage))/imagesPerPage;

//   return getImages(allPlaques, picsPerCol, page);

// }

export function searchPlaques(allPlaques, searchTerms) {
  if (searchTerms == null || searchTerms.length === 0) {
    return null;
  }

  const query=searchTerms[0];
  // searchTerms = searchTerms.map(s => s.toLowerCase());
  for (const plaqueOnPage of allPlaques) {
    if (!plaqueOnPage.searchTerms.includes(query)) {
      continue;
    }

    const plaque=plaqueOnPage.plaques.find(p=>p.searchTerms.includes(query));
    return {
      page: plaqueOnPage.index,
      plaque:plaque
    }
  }

  return null;
}
