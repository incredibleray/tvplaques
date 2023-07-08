
import React from 'react';
import Gallery from 'react-grid-gallery';
import {ImageList, ImageListItem} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { PlaqueSelector, CARD_MARGIN } from './SVGPlaqueCard';
import WPlaque from './WPlaque';
import {Stack, Box} from '@mui/material';
import Masonry from '@mui/lab/Masonry';

// need to set to 3 to avoid a scroll bar on 4k resolution.
export const MARGIN_PIXELS = 1;

function dateStringFor(plaque) {
  if (plaque.eventName) {
    return plaque.eventName;
  } 

  if (plaque.expiryDate.toLowerCase() == 'permanent') {
    return `${plaque.id}`;
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

    return <ImageList 
    sx={{ backgroundColor:"black" }} 
    cols={imagesPerRow} rowHeight={rowHeight}>
  {arrangedPlaques.map((item) => (
    <ImageListItem onClick={()=>dispatch({type:"clickHighlight", payload: item})}>
      <WPlaque item={item} />
    </ImageListItem>
  ))}
</ImageList>
  }

  const  topRow=arrangedPlaques.slice(0, imagesPerRow);
  const botRow=arrangedPlaques.slice(imagesPerRow);
  const masonryStyle={ backgroundColor:"black",  
  // the plus number eliminates white margin on the bottom
  height: window.screen.height/2+7,  
  width: window.screen.width, 
  marginLeft: "12px", marginTop: "0.8px", marginRight: "10px"
  //  overflow:"hidden" 
};
const plaqueEnclosureStyle={marginTop:"20px", marginLeft:"8.5px"};

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
