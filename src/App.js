
import './App.css';
import React, { useEffect } from 'react';
import PlaqueCarousel from './Carousel';
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import HighlightPlaque from './HighlightPlaque';
import Box from '@mui/material/Box';
import SearchBar from './SearchBox';
import {NUM_ROWS} from "./plaques";
import {CARD_HEIGHT, CARD_WIDTH, CARD_MARGIN} from './SVGPlaqueCard';
import {MARGIN_PIXELS} from './SVGPlaqueView';
import axios from 'axios';

function App(props) {

  const dispatch = useDispatch();
  let search = useSelector((state) => state.search);
  const rowHeight = useSelector((state) => state.rowHeight);
  const totalPages = useSelector((state) => state.totalPages);
  const showSearchBar=useSelector((state)=>state.showSearchBar);

  const handleMouseMove = (event) => {
    if (event.clientY > Math.floor(window.innerHeight*0.9) && showSearchBar==false) {
      dispatch({type:"setShowSearchBar", payload: true})    
    }
  };

  // const testHighlight=allPlaques[0];

  useEffect(() => {

    function handleResize() {
      let rowHeight = (window.screen.height - MARGIN_PIXELS) / NUM_ROWS
      var scale = rowHeight / CARD_HEIGHT;
      var picWidth = CARD_WIDTH * scale;
      var picsPerCol = Math.ceil((window.screen.width - MARGIN_PIXELS)/ (picWidth + 2*CARD_MARGIN));

      dispatch({
        type: 'setWinSize',
        payload: { picsPerCol, rowHeight }
      });

    }

    // Call handler right away so state gets updated with initial window size
    
    // new Promise((resolve)=>{
    //   handleResize();
    //   dispatch({type:"initDone"});
    // });

    const queryParameters = new URLSearchParams(window.location.search);
    const tv = queryParameters.get("tv");
    let location="";

    if (tv==1) {
      location="dttMmb";
    } else if (tv==2) {
      location="dttRebirth";
    } else {
      location="all";
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




  }, [])

  if (search.length>0) {
    search=search[0]
  }
  return (
    <div style={{overflow: "hidden", height: window.screen.height }}>
      <SearchBar />
      <Box
        onMouseMove={handleMouseMove}
      >
      <PlaqueCarousel />
      </Box>
      <HighlightPlaque />
    </div>
  );
}

export default App;
