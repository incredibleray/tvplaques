import { createAction } from '@reduxjs/toolkit'
import { preprocessSvgPlaques, searchPlaques} from './plaques';
import {getSearchPage,NUM_ROWS} from './plaques';
import filePlaques from "./plaques.json";

const REFRESH_INTERVAL_S = 30 * 60

const initialState = { 
  totalPages: 0,
  search: [],
  allPlaques:[],
  plaquesOnFile: filePlaques,
  searchResults:[],
  highlightPlaque: null,
  picsPerCol:1,
  rowHeight: 1,
  currentPage: 0,
  searchResultPage:0,
  highlightPlaqueWidth: 1,
  isTyping: false,
  initDone: false,
  showSearchBar: false,
  location: "all",
  lastRefreshDate: new Date(),
}

export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'setCurrentPage': {
  
      let lastRefreshDate = state.lastRefreshDate;
      const currentDate = new Date();
      const elapsedSeconds = (currentDate.getTime() - lastRefreshDate.getTime()) / 1000;

      let page=action.payload % state.totalPages;

      if (page===state.currentPage) {
        return state;
      }

      if (page === 0 && elapsedSeconds >= REFRESH_INTERVAL_S) {
        window.location.reload();
        lastRefreshDate = currentDate;
      }

      
      return {
        ...state,
        currentPage:page,
        lastRefreshDate: lastRefreshDate
      }
    }
    case 'showSearchResults': {
      const searchTerm=state.search;

      if (searchTerm.length==0) {
        return state;
      }

      const searchResults=searchPlaques(state.allPlaques, searchTerm);

      if (searchResults.length==0) {
        return state;
      }

      const page=getSearchPage(state.allPlaques, state.picsPerCol, searchResults[0]);

    return {
          ...state,
          searchResults: searchResults,       
          highlightPlaque: searchResults[0],
          searchResultPage:page,
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
      if (state.initDone) {
        return state;
      }
      
      if (action.payload==null) {
        return state;
      }
      
      // if incoming payload is same as plaquesOnFile, do nothing
      // change to check hash? or set of plaqueIDs
      if (state.plaquesOnFile.length==action.payload.length) {
        return state;
      } 

      const allPlaques=preprocessSvgPlaques(state.picsPerCol, state.location, action.payload);

      const imagesPerPage=state.picsPerCol*NUM_ROWS;
      const totalPages=Math.round(allPlaques.length/imagesPerPage);
   
      return {
        ...state,
        plaquesOnFile: action.payload,
        allPlaques: allPlaques,
        totalPages: totalPages,
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

      // if (state.isTyping) {
      //   return state;
      // }

      const picsPerCol=action.payload.picsPerCol;
      const imagesPerPage=picsPerCol*NUM_ROWS;
      const allPlaques=preprocessSvgPlaques(picsPerCol, state.location, state.plaquesOnFile);
      const totalPages=Math.round(allPlaques.length/imagesPerPage);
   
      return {
        ...state,
        picsPerCol: picsPerCol,
        rowHeight: action.payload.rowHeight,
        allPlaques: allPlaques,
        totalPages: totalPages,
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

      // if (state.isTyping) {
      //   return state;
      // }


      return {
        ...state,
        highlightPlaqueWidth: highlightPlaqueWidth
      }
    }
    // case 'startTyping':{
    //   if (state.isTyping) {
    //     return state;
    //   }

    //   return {
    //     ...state,
    //     isTyping: true
    //   }
    // }
    // case 'stopTyping':{
    //   if (!state.isTyping) {
    //     return state;
    //   }

    //   return {
    //     ...state,
    //     isTyping: false
    //   }
    // }
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
      if (state.initDone) {
        return state;
      }
      
      if (action.payload===state.location) {
        return state;
      }

      const picsPerCol=state.picsPerCol;
      const imagesPerPage=picsPerCol*NUM_ROWS;
      const location=action.payload;
      const allPlaques=preprocessSvgPlaques(picsPerCol, location, state.plaquesOnFile);
      const totalPages=Math.round(allPlaques.length/imagesPerPage);

      return {
        ...state,
        location:action.payload,
        allPlaques: allPlaques,
        totalPages:totalPages
      }
    }
    default:
      return state
  }
}
