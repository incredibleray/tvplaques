
import { useSelector } from 'react-redux'

export const NUM_ROWS = 2;

export const createPadItem = (type) => ({
  "src": "",
  "thumbnail": "",
  "id": "",
  "beneficiary": "",
  "sponsor": "",
  "type": type,
  "location": "",
  "requestDate": "",
  "expiryDate": "",
  "dateString": "",
  "searchable": false,
});


function isPlaqueExpired(currentDate, start, end) {
  const beginDate = new Date(start);
  const endDate = new Date(end);
  const plaqueStarted = isNaN(beginDate) || (beginDate <= currentDate);
  const plaqueNotExpired = isNaN(endDate) || (currentDate <= endDate);

  return plaqueStarted && plaqueNotExpired;
}


export function preprocessSvgPlaques(picsPerCol, location, plaquesOnFile) {
  const currentDate = new Date();
  const plaques = plaquesOnFile.filter(p => isPlaqueExpired(new Date(), p.requestDate, p.expiryDate));
  const mmbPlaques=plaques.filter(p=>p.type==="mmb");
  const rebirthPlaques=plaques.filter(p=>p.type==="rebirth");
  const wishPlaques=plaques.filter(p=>p.type==="wish");
  
  const imagesPerPage = picsPerCol * NUM_ROWS;
  
  const mmbPadLen=Math.ceil(mmbPlaques.length/imagesPerPage)*imagesPerPage-mmbPlaques.length;
  const rebirthPadLen=Math.ceil(rebirthPlaques.length/imagesPerPage)*imagesPerPage-rebirthPlaques.length;
  const wishPadLen=Math.ceil(wishPlaques.length/imagesPerPage)*imagesPerPage-wishPlaques.length;

  const mmbPadding=Array(mmbPadLen).fill(createPadItem('mmb'));
  const rebirthPadding=Array(rebirthPadLen).fill(createPadItem('rebirth'));
  const wishPadding=Array(wishPadLen).fill(createPadItem('wish'));
 
  if (location=="dttRebirth") {
    return rebirthPlaques.concat(rebirthPadding);
  } else if (location=="dttMmb") {
    return mmbPlaques.concat(mmbPadding,wishPlaques,wishPadding);
  } 

  return mmbPlaques.concat(mmbPadding, rebirthPlaques, rebirthPadding, wishPlaques, wishPadding);
}

export function getImages(allPlaques, picsPerCol, page) {

  const imagesPerPage=picsPerCol * NUM_ROWS;
  const start=imagesPerPage*page;
  const end=start + imagesPerPage;

  return allPlaques.slice(start, end);
}

export function getSearchView(allPlaques, picsPerCol, searchResult) {
  const resultIndex=allPlaques.findIndex(
    (p)=>p.id===searchResult.id
  );

  if (resultIndex===-1){
    return [];
  }

  const imagesPerPage=picsPerCol * NUM_ROWS;
  const page=(resultIndex-(resultIndex%imagesPerPage))/imagesPerPage;

  return getImages(allPlaques, picsPerCol, page);

}

export function getSearchPage(allPlaques, picsPerCol, searchResult) {
  const resultIndex=allPlaques.findIndex(
    (p)=>p.id===searchResult.id
  );

  if (resultIndex===-1){
    return -1;
  }

  const imagesPerPage=picsPerCol * NUM_ROWS;
  const page=(resultIndex-(resultIndex%imagesPerPage))/imagesPerPage;

  return page;
}

export function getGalleryPlaqueInfo(plaque) {
  return {
    src: plaque.file,
    thumbnail: plaque.previewFile,
    thumbnailWidth: 235,
    thumbnailHeight: 720,
  };
}

export function searchPlaques(allPlaques, searchTerms) {
  if (searchTerms == null || searchTerms.length === 0) {
    return [];
  }

  // searchTerms = searchTerms.map(s => s.toLowerCase());
  for (const p of allPlaques) {
    if (p.searchTerms!=null && p.searchTerms.filter(x=>searchTerms.includes(x)).length>0) {
      return [p]
    }
  }

  return [];
}

export default getImages;
