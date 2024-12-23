
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

  function handleResize() {
    const singleRowHeight=(window.screen.height - MARGIN_PIXELS)*0.98;
    const singleRowScale=singleRowHeight/W_CARD_HEIGHT;
    const singleRowPicWidth=Math.floor(W_CARD_WIDTH*singleRowScale);
    const singleRowImagesPerRow = Math.floor((window.screen.width - MARGIN_PIXELS) *0.98/ (singleRowPicWidth + 2*W_CARD_MARGIN));
    // const singleRowImagesPerRow =1;
  
    const highlightPlaqueHeight=Math.floor(window.screen.height*0.85)
    
    let rowHeight = Math.floor((window.screen.height - MARGIN_PIXELS)*0.94 / NUM_ROWS)
    let scale = rowHeight / CARD_HEIGHT;
    let picWidth = Math.floor(CARD_WIDTH * scale);
    let picsPerCol = Math.floor((window.screen.width - MARGIN_PIXELS)*0.94/ (picWidth + 2*CARD_MARGIN));
    let colWidth = Math.floor((window.screen.width - MARGIN_PIXELS)*0.94 / picsPerCol);
  
    dispatch({
      type: 'setWinSize',
      payload: { picsPerCol, rowHeight,singleRowImagesPerRow,singleRowHeight, colWidth, highlightPlaqueHeight }
    });
  
  }

  let search = useSelector((state) => state.search);
  const rowHeight = useSelector((state) => state.rowHeight);
  const totalPages = useSelector((state) => state.totalPages);
  const showSearchBar=useSelector((state)=>state.showSearchBar);
  const initDone=useSelector((state)=>state.initDone);
  const showBlackScreen=useSelector((state)=>state.showBlackScreen);
  const dimDisplay=useSelector((state)=>state.dimDisplay);

  const handleMouseMove = (event) => {
    if (event.clientY > Math.floor(window.innerHeight*0.97) && showSearchBar==false) {
      dispatch({type:"setShowSearchBar", payload: true})    
    }
  };

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);
    const tv = queryParameters.get("tv");
    let location=[],types=[];

    // DTT TV left hand side
    // shows MMB, W-MMB, and as you wish plaques
    if (tv=="dtttv1") {
      location="DTT";
      types=["mmb","wmmb","ayw", ];
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
      types=["mmb","wmmb","ayw",];
    } 
    // GF back wall TV, front of TV face altar
    // shows Rebirth, W-Rebirth plaques.
    else if (tv=="gftv2") {
      location="GF";
      types=["rebirth", "wrebirth"];
    } 
    // WMT TV on right side of Buddha hall
    // display MMB, as you wish and W-MMB plaques.
    else if (tv=="wmttv1") {
      location="WMT";
      types=["mmb","wmmb","ayw",];
    } else if (tv=="wmttv2") {
    // WMT TV on left side of Buddha hall,
    // shows rebirth plaques. do not display W-Rebirth plaque , Master do not seem to like to see a single W-Rebirth plaque of Thomas. 
      location="WMT";
      types=["rebirth", "wrebirth"];
    } else if (tv=="wplaque") {
      location="DTT";
      types=["wmmb", "wrebirth"];
    // photo booth mode, for taking plaque photos.
    // include all plaque types, no location filter
    } else if (tv=="photoBooth") {
      location="photoBooth";
      types=["wmmb", "wrebirth", "ayw","mmb","rebirth"];
    } else {
      location="DTT";
      types=["mmb","rebirth","ayw",];
    }

    // initialization. Fetch plaques, load fetched plaques, set screen size, set location and plaque types.
    new Promise((resolve)=>{
      handleResize();
      setTimeout(resolve, 1000);
    }).then(()=>new Promise((resolve)=>{
      dispatch({type:'setLocation', payload:location});
      dispatch({type:'setPlaqueTypes', payload:types});

      setTimeout(resolve, 1000);
      
    })).then(async ()=> {
      const res=await axios.get('./plaques.json');
    
      if (res.statusText=="OK") {
        console.log(`[${new Date().toLocaleString()}]  loading ${res.data.length} plaques from plaques.json. last five are\n`, 
          // res.data
          res.data.slice(res.data.length-5)
        );

        dispatch({type:"remoteLoadAllPlaques", payload:res.data});
      }
    }).catch(error => {
      console.log('error during initialization', error);
    }).finally(()=>{
      dispatch({type:"initDone"});
    })
    // end of initialization.

    console.log(`[${new Date().toLocaleString()}] creating plaque updater.`);

    // refresh the plaques.json every half an hour.
    // bypass browser cache. the request will keep getting the same file from cache if cache is not bypassed.
    const plaqueUpdater=setInterval(
      async ()=> {
        console.log(`[${new Date().toLocaleString()}] updater wakes up`);

        console.log(`[${new Date().toLocaleString()}] check if browser should reload site`);
        const now=new Date();
        // reload page every Sunday between 2:00 AM and 4:00 AM.
        if (now.getDay()==1 && now.getHours()>=2 && now.getHours()<4) {
          console.log(`[${new Date().toLocaleString()}] plaque updater refresh page.`);

          window.location.reload();
        }

        console.log(`[${new Date().toLocaleString()}] plaque updater fetch plaques.json from server.`)
        await axios.get('./plaques.json', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        })
        .then(response => {
          console.log(`[${new Date().toLocaleString()}] updater received response of status code ${response.statusText} from server.`);

          if (response.statusText=="OK") {
            console.log(`[${new Date().toLocaleString()}] updater successfully fetch plaques.json from server. plaques.json has ${response.data.length} rows. The last and latest record is\n${JSON.stringify(response.data.at(-1))}.\nDispatching remote loading event.`)

            // remote load plaques handler will not use remote loaded plaques.json if it is null or empty array.
            // no need to check for null or empty array here.
            dispatch({type:"remoteLoadAllPlaques", payload:response.data});
          }})
      },
      30*60*1000)

      console.log(`[${new Date().toLocaleString()}] creating display controller.`);

      const displayController=setInterval(
        async ()=> {
          console.log(`[${new Date().toLocaleString()}] display controller wakes up`);

          // add 20 minutes to the current time
          // display will darken 20 minutes earlier than black screen start time and recover 20 minutes before the black screen end time 
          // e.g. black screen from 12 am to 4 am, display will go to black screen from 11:40 pm to 3:40 am. This way it recovers before morning ceremony.
          const time=new Date(new Date().getTime()+1000 * 60 * 20);
  
          if (time.getHours()>=0 && time.getHours()<4) {
            console.log(`[${new Date().toLocaleString()}] At hour ${time.getHours()}, time ${time.toLocaleString()}, turn off display.`);

            dispatch({
              type:"turnOffDisplay"
            })
          }
  
          if (time.getHours()>=4) {
            console.log(`[${new Date().toLocaleString()}] At hour ${time.getHours()}, time ${time.toLocaleString()}, turn on display.`);

            dispatch({
              type:"turnOnDisplay"
            })
          }        
        },
        10*60*1000)

      console.log(`[${new Date().toLocaleString()}] check location=${location} to decide if ChanQi dim controller needs to be created.`);

      let chanQiDimController=null;

      if (location.includes('WMT') || location.includes('GF')) {
        console.log(`[${new Date().toLocaleString()}] creating ChanQi dim controller.`);

        // Chan Qi is over, do not set the Chan Qi Dim controller.

        chanQiDimController=setInterval(
          async ()=> {
            console.log(`[${new Date().toLocaleString()}] ChanQi display controller wakes up`);

            // deduct 10 minutes from the current time
            // display will dim from about 9:10 pm to 7:10 pm. 
            const current=new Date();
            const currentPlus30Minutes=new Date(new Date().getTime()+1000 * 60 * 30);
            const time=new Date();

            if (current.getHours()>=19 && currentPlus30Minutes.getHours()<=21 ) {
              console.log(`[${new Date().toLocaleString()}] ChanQi controller turn dim OFF. current: ${current}, currentPlus30Minutes: ${currentPlus30Minutes}`);

              dispatch({
                type:"turnOffDimDisplay"
              })
            } else {
              console.log(`[${new Date().toLocaleString()}] ChanQi controller turn dim ON. current: ${current}, currentPlus30Minutes: ${currentPlus30Minutes}`);

              dispatch({
                type:"turnOnDimDisplay"
              })
            }        
          },
          10*60*1000) 
        }
        
    return ()=>{
      clearInterval(plaqueUpdater);
      clearInterval(displayController);

      if (chanQiDimController) {
        clearInterval(chanQiDimController);
      }
    }
  }, []);

  if (search.length>0) {
    search=search[0]
  }

  if (showBlackScreen) {
    return <div style={{height: `${window.screen.height}px`, width: `${window.screen.width}px`, backgroundColor: "black"}} />
  }

  let dimScreen=<></>
  if (dimDisplay) {
    dimScreen=<div style={{
      height: `${window.screen.height}px`, 
      width: `${window.screen.width}px`, backgroundColor: "black", 
      position: "absolute", 
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 10,
      opacity: .95}} />
  }

  return (
    <div style={{overflow: "hidden" }}>
      {dimScreen}
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
