import { createAction } from '@reduxjs/toolkit'
import { preprocessSvgPlaques, searchPlaques} from './plaques';
import {NUM_ROWS} from './plaques';
import filePlaques from "./plaques.json";


const initialState = { 
  search: [],
  allPlaques:[],
  totalPages:0,
  plaquesOnFile: filePlaques,
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
  plaqueTypes: [],
  lastRefreshDate: new Date(),
  colWidth: 1,
  carouselAutoplay: true,
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
    case 'showSearchResults': {
      const searchTerm=state.search;

      if (searchTerm.length==0) {
        return state;
      }

      const searchResults=searchPlaques(state.allPlaques, searchTerm);

      if (searchResults==null) {
        return state;
      }

    return {
          ...state,
          searchResults: [searchResults.plaque],       
          highlightPlaque: searchResults.plaque,
          searchResultPage:searchResults.page,
          showSearchBar: false
        }
    
    }
    case 'search':{
      const searchTerm=action.payload;

      if (state.search==searchTerm) {
        return state;
      }
      
      return {
        ...state,
        search:searchTerm
      };
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

      const allPlaques=preprocessSvgPlaques(state.singleRowImagesPerRow,state.picsPerCol, state.location, state.plaqueTypes,action.payload);

      return {
        ...state,
        plaquesOnFile: action.payload,
        allPlaques: allPlaques,
        totalPages:allPlaques.length,
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
    default:
      return state
  }
}
