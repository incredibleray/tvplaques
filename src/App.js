
import './App.css';
import React, { useEffect } from 'react';
import PlaqueCarousel from './Carousel';
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import HighlightPlaque from './HighlightPlaque';
import Box from '@mui/material/Box';
import SearchBar from './SearchBox';
import {NUM_ROWS} from "./plaques";
import {CARD_HEIGHT, CARD_WIDTH, CARD_MARGIN, W_CARD_HEIGHT, W_CARD_MARGIN, W_CARD_WIDTH} from './SVGPlaqueCard';
import {MARGIN_PIXELS} from './SVGPlaqueView';
import axios from 'axios';

function App(props) {

  const dispatch = useDispatch();
  let search = useSelector((state) => state.search);
  const rowHeight = useSelector((state) => state.rowHeight);
  const totalPages = useSelector((state) => state.totalPages);
  const showSearchBar=useSelector((state)=>state.showSearchBar);

  const handleMouseMove = (event) => {
    if (event.clientY > Math.floor(window.innerHeight*0.97) && showSearchBar==false) {
      dispatch({type:"setShowSearchBar", payload: true})    
    }
  };

  // const testHighlight=allPlaques[0];

  useEffect(() => {

    function handleResize() {
      const singleRowHeight=(window.screen.height - MARGIN_PIXELS)*0.98;
      const singleRowScale=singleRowHeight/W_CARD_HEIGHT;
      const singleRowPicWidth=Math.floor(W_CARD_WIDTH*singleRowScale);
      const singleRowImagesPerRow = Math.floor((window.screen.width - MARGIN_PIXELS) *0.98/ (singleRowPicWidth + 2*W_CARD_MARGIN));
      // const singleRowImagesPerRow =1;

      let rowHeight = Math.floor((window.screen.height - MARGIN_PIXELS)*0.94 / NUM_ROWS)
      let scale = rowHeight / CARD_HEIGHT;
      let picWidth = Math.floor(CARD_WIDTH * scale);
      let picsPerCol = Math.floor((window.screen.width - MARGIN_PIXELS)*0.94/ (picWidth + 2*CARD_MARGIN));
      let colWidth = Math.floor((window.screen.width - MARGIN_PIXELS)*0.94 / picsPerCol);

      dispatch({
        type: 'setWinSize',
        payload: { picsPerCol, rowHeight,singleRowImagesPerRow,singleRowHeight, colWidth }
      });

    }

    // Call handler right away so state gets updated with initial window size
    
    // new Promise((resolve)=>{
    //   handleResize();
    //   dispatch({type:"initDone"});
    // });

    const queryParameters = new URLSearchParams(window.location.search);
    const tv = queryParameters.get("tv");
    let location=[],types=[];

    // DTT TV left hand side
    // shows MMB, W-MMB, and as you wish plaques
     if (tv=="dtttv1") {
      location="DTT";
      types=["mmb","wmmb","wish", ];
    } 
    // DTT TV right hand side
    // shows Rebirth, W-Rebirth plaques
    else if (tv=="dtttv2") {
      location="DTT";
      types=["rebirth", "wrebirth"]
    } 
    // GF side wall TV, front of TV is perpendicular to altar
    // shows MMB, W-MMB, and as you wish plaques
    else if (tv=="gftv1") {
      location="GF";
      types=["mmb","wmmb","wish",];
    } 
    // GF back wall TV, front of TV face altar
    // shows Rebirth, W-Rebirth plaques.
    else if (tv=="gftv2") {
      location="GF";
      types=["rebirth", "wrebirth"];
    } 
    // WMT TV in left side of Buddha hall
    // the only TV at WMT showing plaques, display both MMB and Rebirth plaques.
    else if (tv=="wmttv1") {
      location="WMT";
      types=["mmb","rebirth","wish"];
      // types=["mmb","wmmb","wish",];
    } else if (tv=="wmttv2") {
      location="WMT";
      types=["rebirth", "wrebirth"];
    } else if (tv=="wplaque") {
      location="DTT";
      types=["wmmb", "wrebirth"];
    // photo booth mode, for taking plaque photos.
    // include all plaque types, no location filter
    } else if (tv=="photoBooth") {
      location="photoBooth";
      types=["wmmb", "wrebirth", "wish","mmb","rebirth"];
    } else {
      location="DTT";
      types=["mmb","rebirth","wish",];
    }

    axios.get('./plaques.json')
    .then(response => {
      if (response.statusText=="OK") {
        dispatch({type:"remoteLoadAllPlaques", payload:response.data});
      }}
    )
    .catch(error => {
      console.log('error during initialization', error);
    })
    .finally(()=>new Promise((resolve)=>{
      handleResize();
      setTimeout(resolve, 1000);
    })).then(()=>new Promise((resolve)=>{
      dispatch({type:'setLocation', payload:location});
      dispatch({type:'setPlaqueTypes', payload:types});

      setTimeout(resolve, 1000);
      
    }))
    // .then(()=>new Promise((resolve)=>{
    //   dispatch({type:'clickHighlight', payload:testHighlight});
    //   setTimeout(resolve, 3000);
      
    // }))
    .then(()=>{
      // dispatch({type:"closeHighlightPopup"});
      dispatch({type:"initDone"});
    })

    // refresh the plaques.json every half an hour.
    const plaqueUpdater=setInterval(
      axios.get('./plaques.json')
      .then(response => {
        if (response.statusText=="OK") {
          // remote load plaques handler will not use remote loaded plaques.json if it is null or empty array.
          // no need to check for null or empty array here.
          dispatch({type:"remoteLoadAllPlaques", payload:response.data});
        }}
      )
      ,30*60*1000)

  }, [])

  if (search.length>0) {
    search=search[0]
  }
  return (
    <div style={{overflow: "hidden" }}>
      <SearchBar />
      <Box
        // onMouseMove={handleMouseMove}
        style={{overflow: "hidden"}}
      >
      <PlaqueCarousel  />
      </Box>
      <HighlightPlaque />
    </div>
  );
}

export default App;
