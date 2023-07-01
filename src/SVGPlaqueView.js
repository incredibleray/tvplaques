
import React from 'react';
import Gallery from 'react-grid-gallery';
import {ImageList, ImageListItem} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { PlaqueSelector, CARD_MARGIN } from './SVGPlaqueCard';
import WPlaque from './WPlaque';

// need to set to 3 to avoid a scroll bar on 4k resolution.
export const MARGIN_PIXELS = 1;

function dateStringFor(plaque) {
  if (plaque.eventName) {
    return plaque.eventName;
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
    // targetHeight: thumbnailSize.height - 2*CARD_MARGIN,
    targetHeight: thumbnailSize.height,
    thumbnailHeight: thumbnailSize.height,
    thumbnailWidth: thumbnailSize.width
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


  const onClick=(index) =>
    dispatch({type:"clickHighlight", payload: arrangedPlaques[index]});
  return (
    <ImageList gap={3}
    sx={{ backgroundColor:"black", padding: 0, spacing:0, margin:0 }} style={{overflow:"hidden"}}
    cols={imagesPerRow} rowHeight={rowHeight}>
  {arrangedPlaques.map((item) => (
    <ImageListItem cols={1} onClick={()=>dispatch({type:"clickHighlight", payload: item})}>
      <PlaqueSelector item={item} />
    </ImageListItem>
  ))}
</ImageList>
);
}

export default SVGPlaqueView;
