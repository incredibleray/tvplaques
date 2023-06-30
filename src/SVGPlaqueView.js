
import React from 'react';
import Gallery from 'react-grid-gallery';
import {ImageList, ImageListItem} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux';
import { PlaqueSelector, CARD_MARGIN } from './SVGPlaqueCard';
import WPlaque from './WPlaque';
export const MARGIN_PIXELS = 2;

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
    targetHeight: thumbnailSize.height - 2*CARD_MARGIN,
    thumbnailHeight: thumbnailSize.height,
    thumbnailWidth: thumbnailSize.width
  });
  return metadata.map(fetchPlaque);
}

function SVGPlaqueView(props) {
  const dispatch = useDispatch();

  const plaqueOnPage = useSelector((state) => state.allPlaques[props.page]);
  const singleRowHeight = useSelector((state) => state.singleRowHeight);
  const doubleRowHeight=useSelector((state) => state.rowHeight);
  const singleRowImagesPerRow = useSelector((state) => state.singleRowImagesPerRow);
  const doubleRowImagesPerRow=useSelector((state) => state.picsPerCol);

  const rowHeight=(plaqueOnPage.rows===1)?singleRowHeight:doubleRowHeight;
  const imagesPerRow=(plaqueOnPage.rows===1)?singleRowImagesPerRow:doubleRowImagesPerRow;
  const colWidth = Math.ceil((window.screen.width - MARGIN_PIXELS) / imagesPerRow);

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
   <div style={{
        display: "block",
        height: "100%",
        width: "100%",
        border: "1px solid #ddd",
        overflow: "hidden",
        backgroundColor: "black"}}>
        <Gallery
          images={arrangedPlaques}
          thumbnailImageComponent={PlaqueSelector}
          enableLightbox={false}
          enableImageSelection={false}
          rowHeight={rowHeight}
          margin={0}
          maxRows={plaqueOnPage.rows}
          onClickThumbnail={onClick} />
    </div>);
}

export default SVGPlaqueView;
