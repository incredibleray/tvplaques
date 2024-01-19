
import React from 'react';
import Gallery from 'react-grid-gallery';
import {ImageList, ImageListItem} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { PlaqueSelector, CARD_MARGIN } from './SVGPlaqueCard';
import {Stack, Box} from '@mui/material';
import Masonry from '@mui/lab/Masonry';

// need to set to 3 to avoid a scroll bar on 4k resolution.
export const MARGIN_PIXELS = 1;

function dateStringFor(plaque) {
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

function getImagesFromMetadata(metadata, thumbnailSize) {
  const fetchPlaque = (p) => ({
    ...p,
    src: "",
    thumbnail: "",
    dateString: dateStringFor(p),
    targetHeight: thumbnailSize.height,
    // targetHeight: thumbnailSize.height,
    thumbnailHeight: thumbnailSize.height,
    thumbnailWidth: thumbnailSize.width- 2*CARD_MARGIN
  });
  return metadata.map(fetchPlaque);
}

function SVGPlaqueView(props) {
  const plaqueOnPage = useSelector((state) => state.allPlaques[props.page]);
  const singleRowHeight = useSelector((state) => state.singleRowHeight);
  const doubleRowHeight=useSelector((state) => state.rowHeight);
  const singleRowImagesPerRow = useSelector((state) => state.singleRowImagesPerRow);
  const doubleRowImagesPerRow=useSelector((state) => state.picsPerCol);
  const colWidth=useSelector((s)=>s.colWidth);

  const dispatch = useDispatch();

  const rowHeight=(plaqueOnPage.rows===1)?singleRowHeight:doubleRowHeight;
  const imagesPerRow=(plaqueOnPage.rows===1)?singleRowImagesPerRow:doubleRowImagesPerRow;

  const arrangedPlaques = getImagesFromMetadata(plaqueOnPage.plaques, {width: colWidth, height: rowHeight});

  if (plaqueOnPage.rows===1) {

    let masonryStyle={ backgroundColor:"black",  
    // the plus number eliminates white margin on the bottom
    height: window.screen.height+8,  
    width: window.screen.width, 
    marginLeft: "33px", 
    marginTop: "0px", 
    // marginRight: "33px"
    //  overflow:"hidden" 
  };

  let wPlaqueEnclosureStyle={marginTop:"14px", marginLeft:"8.5px"};

    return   <Masonry columns={imagesPerRow} spacing={2}
    sx={masonryStyle}>
  {arrangedPlaques.map((item) => (
    <div style={wPlaqueEnclosureStyle} onClick={()=>dispatch({type:"clickHighlight", payload: item})}>
      <PlaqueSelector item={item}/>
    </div>
  ))}
</Masonry>
  }

  const  topRow=arrangedPlaques.slice(0, imagesPerRow);
  const botRow=arrangedPlaques.slice(imagesPerRow);
  let masonryStyle={ backgroundColor:"black",  
  // the plus number eliminates white margin on the bottom
  height: window.screen.height/2+8,  
  width: window.screen.width, 
  marginLeft: "6px", marginTop: "0px", marginRight: "6px"
  //  overflow:"hidden" 
};
let plaqueEnclosureStyle={marginTop:"20px", marginLeft:"8.5px"};

  if (window.screen.height==1080 && window.screen.width==1920) {
    masonryStyle={ ...masonryStyle,
    marginLeft: "1px", marginRight: "1px" };
  plaqueEnclosureStyle={ ...plaqueEnclosureStyle,
    marginTop:"12px"};
  }

  return (<>
  <Stack spacing={0}>
    <Box>
  <Masonry columns={imagesPerRow} spacing={2}
    sx={masonryStyle}>
  {topRow.map((item) => (
    <div style={plaqueEnclosureStyle} onClick={()=>dispatch({type:"clickHighlight", payload: item})}>
    <PlaqueSelector item={item}/></div>
  ))}
</Masonry>
</Box>
<Masonry columns={imagesPerRow} spacing={2}
sx={masonryStyle}>
        {botRow.map((item) => (
          <div style={plaqueEnclosureStyle} onClick={()=>dispatch({type:"clickHighlight", payload: item})}>
          <PlaqueSelector item={item}/></div>
        ))}
      </Masonry>
</Stack>
</>
);
}

export default SVGPlaqueView;
