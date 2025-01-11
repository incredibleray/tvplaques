import { createAction } from '@reduxjs/toolkit'
import { preprocessSvgPlaques, CreatePlaquePages, addFontSizes} from './plaques';
import {NUM_ROWS} from './plaques';
import FuzzySearch from 'fuzzy-search';


const initialState = { 
  allPlaques:[
    {"id": 2024040001, "beneficiary": "Permanent MMB Beneficiary", "beneficiaryTextSize": 30, "sponsor": "Permanent MMB Sponsor", "sponsorTextSize": 20,"dateStringSize":10, "type": "mmb", "requestDate": "04/01/2024", "expiryDate": "Permanent", "searchTerms": [], "mediaFiles": [], "locations": ["DTT"], "showOnTv": true, "jotformSubmissionId": "001"},
    {"id": 2024040002, "beneficiary": "Temporary MMB Beneficiary", "beneficiaryTextSize": 30, "sponsor": "Temporary MMB Sponsor", "sponsorTextSize": 20, "dateStringSize":10, "type": "mmb", "requestDate": "04/01/2024", "expiryDate": "01/01/9999", "searchTerms": [], "mediaFiles": [], "locations": ["DTT"], "showOnTv": true, "jotformSubmissionId": "002"},
    {"id": 2024040003, "beneficiary": "Temporary Rebirth Beneficiary", "beneficiaryTextSize": 30, "sponsor": "Temporary Rebirth Sponsor", "sponsorTextSize": 20, "dateStringSize":10,"type": "rebirth", "requestDate": "04/01/2024", "expiryDate": "01/01/9999", "searchTerms": [], "mediaFiles": [], "locations": ["DTT"], "showOnTv": true, "jotformSubmissionId": "003"}
  ],
  totalPages:0,
  plaquesOnFile: [],
  searchIndex: new FuzzySearch(),
  searchTerm: null,
  searchResults:[],
  highlightPlaque: null,
  picsPerCol:1,
  rowHeight: 1,
  singleRowHeight:1,
  singleRowImagesPerRow:1,
  highlightPlaqueHeight:1,
  currentPage: null,
  searchResultPage:0,
  highlightPlaqueWidth: 1,
  isTyping: false,
  initDone: false,
  showSearchBar: false,
  location: "DTT",
  plaqueTypes: ["mmb","wmmb","ayw", ],
  lastRefreshDate: new Date(),
  colWidth: 1,
  carouselAutoplay: true,
  showBlackScreen: false,
  dimDisplay: false,
}

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'setCurrentPage': {
      if (action.payload==state.currentPage) {
        return state
      }

      let lastRefreshDate = state.lastRefreshDate;
      const currentDate = new Date();
      const elapsedSeconds = (currentDate.getTime() - lastRefreshDate.getTime()) / 1000;

      // refresh every 7 days, refresh between 1:00 am to 3:00 am.
      const REFRESH_INTERVAL_S = 7*24*60 * 60

      if (elapsedSeconds >= REFRESH_INTERVAL_S &&
         0<currentDate.getHours()<4) {
        window.location.reload();
        lastRefreshDate = currentDate;
      }

      console.log(`setting current page state to ${action.payload}`)
      return {
        ...state,
        lastRefreshDate: lastRefreshDate,
        currentPage:action.payload 
      }
    }
    case 'search': {
      const searchTerm=state.searchTerm;

      if (!searchTerm) {
        return state;
      }

      console.time("fuzzy search");
    
      const results =state.searchIndex.search(searchTerm)

      console.timeEnd("fuzzy search");

    return {
          ...state,
          searchResults: results,       
        }
    
    }
    case 'updateSearchTerm':{
      const term=action.payload;

      if (state.searchTerm==term || term == null) {
        return state;
      }
      
      let results=state.searchResults;
      if (term=="") {
        results=[];
      }

      return {
        ...state,
        searchTerm:term,
        searchResults: results
      };
    }
    case 'showSearchResult': {
      const orderDict={"mmb": 1, "rebirth": 2, "ayw": 3, "wmmb": 1, "wrebirth": 2};
      const wPlaques=state.searchResults.filter(x=>["wmmb", "wrebirth"].includes(x.type)).map(addFontSizes).sort((x, y)=>orderDict[x.type]-orderDict[y.type]);
      const smallPlaques=state.searchResults.filter(x=>["mmb", "rebirth", "ayw"].includes(x.type)).map(addFontSizes).sort((x, y)=>orderDict[x.type]-orderDict[y.type]);
      
      console.log(`converting ${wPlaques.length} W plaques and ${smallPlaques.length} small plaques from search results to carousel pages`);

      let lastSmallPlaqueType="rebirth";
      if (smallPlaques.length) {
        lastSmallPlaqueType=smallPlaques[smallPlaques.length-1].type;
      }
      let lastWPlaqueType="wrebirth";
      if (wPlaques.length) {
        lastWPlaqueType=wPlaques[wPlaques.length-1].type;
      }

      const smallPlaquesPages= CreatePlaquePages(smallPlaques, state.picsPerCol, 2,lastSmallPlaqueType, 0);
      const wPlaquePages=CreatePlaquePages(wPlaques, state.singleRowImagesPerRow,1,lastWPlaqueType, smallPlaquesPages.length);

      const pages=smallPlaquesPages.concat(wPlaquePages);

      console.log(`search results have ${smallPlaquesPages.length} pages of small plaques, ${wPlaquePages.length} W Plaque pages. First and last pages are`, pages[0], pages[pages.length-1]);

      return {
        ...state,
        allPlaques: pages,
        totalPages:pages.length,
        currentPage: 0,
        highlightPlaque: null,
        showSearchBar: false
      }
    }
    case 'clearSearchResult': {
      const allPlaques=preprocessSvgPlaques(state.singleRowImagesPerRow,state.picsPerCol, state.location, state.plaqueTypes,state.plaquesOnFile);

      console.log(`cleared search results. all plaques have ${allPlaques.length} pages. First and last pages are`, allPlaques[0], allPlaques[allPlaques.length-1]);

      return {
        ...state,
        searchResults: [],
        allPlaques: allPlaques,
        totalPages:allPlaques.length,
        currentPage: 0,
        highlightPlaque: null,
      }
    }
    case 'remoteLoadAllPlaques':{
      // remote load plaques at initialization,
      // and every half an hour after that
      
      if (action.payload==null || action.payload.length==0) {
        return state;
      }
      
      // if incoming payload is same as plaquesOnFile, do nothing
      // change to check hash? or set of plaqueIDs
      if (state.plaquesOnFile.length==action.payload.length) {
        return state;
      } 

      const validPlaques=action.payload.filter(x=>x.expiryDate=="Permanent" || new Date()-new Date(x.expiryDate)<0);

      console.log(`${validPlaques.length} plaques are within expiration. Last five are`, validPlaques.slice(validPlaques.length-5));

      const allPlaques=preprocessSvgPlaques(state.singleRowImagesPerRow,state.picsPerCol, state.location, state.plaqueTypes,action.payload);

      console.time("fuzzySearch indexing");

      const fuzzySearch = new FuzzySearch(validPlaques, ['beneficiary', 'sponsor'], {
          caseSensitive: false,
          sort:true
        });
      console.timeEnd("fuzzySearch indexing");

      return {
        ...state,
        plaquesOnFile: action.payload,
        allPlaques: allPlaques,
        totalPages:allPlaques.length,
        searchIndex: fuzzySearch
      }
    }
    case 'closeHighlightPopup': {
      return {
        ...state,
        highlightPlaque: null
      }
    }
    case 'clickHighlight': {
      return {
        ...state,
        highlightPlaque: action.payload,
        showSearchBar: false
      }
    }
    case 'setWinSize': {
      if (state.initDone) {
        return state;
      }

      if (action.payload.picsPerCol === state.picsPerCol) {
        return state;
      }

      const picsPerCol=action.payload.picsPerCol;
      const imagesPerPage=picsPerCol*NUM_ROWS;
      const allPlaques=preprocessSvgPlaques(action.payload.singleRowImagesPerRow, picsPerCol,state.location,state.plaqueTypes, state.plaquesOnFile);
   
      return {
        ...state,
        picsPerCol: picsPerCol,
        rowHeight: action.payload.rowHeight,
        singleRowHeight: action.payload.singleRowHeight,
        singleRowImagesPerRow:action.payload.singleRowImagesPerRow,
        allPlaques: allPlaques,
        totalPages:allPlaques.length,
        colWidth: action.payload.colWidth,
        highlightPlaqueHeight:action.payload.highlightPlaqueHeight
      }
    }
    case 'setHighlightPlaqueWidth': {
      if (state.initDone) {
        return state;
      }

      const highlightPlaqueWidth=action.payload-5;
      if (highlightPlaqueWidth === state.highlightPlaqueWidth) {
        return state;
      }

      return {
        ...state,
        highlightPlaqueWidth: highlightPlaqueWidth
      }
    }
    case 'initDone': {
      return {
        ...state,
        initDone: true
      }
    }
    case 'setShowSearchBar': {
      if (action.payload===state.showSearchBar) {
        return state;
      }

      if (action.payload==true && state.highlightPlaque!=null) {
        return state;
      }
      
      let newState={
        ...state,
        showSearchBar: action.payload
      };

      if (state.searchResultPage!=state.currentPage) {
        newState={
          ...newState,
          searchResultPage: state.currentPage,
        }
      }

      return newState;
    }
    case 'setLocation': {
      if (action.payload===state.location) {
        return state;
      }

      const location=action.payload;
      const allPlaques=preprocessSvgPlaques(state.singleRowImagesPerRow,state.picsPerCol, location, state.plaqueTypes,state.plaquesOnFile);

      return {
        ...state,
        location:location,
        allPlaques: allPlaques,
        totalPages:allPlaques.length,
        currentPage: 0
      }
    }
    case 'setPlaqueTypes': {
      if (action.payload===state.plaqueTypes) {
        return state;
      }

      const plaqueTypes=action.payload;
      const allPlaques=preprocessSvgPlaques(state.singleRowImagesPerRow,state.picsPerCol, state.location, plaqueTypes,state.plaquesOnFile);

      return {
        ...state,
        plaqueTypes:plaqueTypes,
        allPlaques: allPlaques,
        totalPages:allPlaques.length,
        currentPage: 0
      }
    }
    case 'setCarouselAutoplay': {
      if (action.payload===state.carouselAutoplay) {
        return state;
      }

      return {
        ...state,
        carouselAutoplay:action.payload
      }
    }
    case 'turnOnDisplay': {
      if (state.showBlackScreen === false) {
        return state;
      }

      return {
        ...state,
        showBlackScreen: false
      }
    }
    case 'turnOffDisplay': {
      if (state.showBlackScreen == true) {
        return state;
      }

      return {
        ...state,
        showBlackScreen: true
      }
    }
    case 'turnOnDimDisplay': {
      if (state.dimDisplay === true) {
        return state;
      }

      return {
        ...state,
        dimDisplay: true
      }
    }
    case 'turnOffDimDisplay': {
      if (state.dimDisplay == false) {
        return state;
      }

      return {
        ...state,
        dimDisplay: false
      }
    }
    default:
      return state
  }
}
