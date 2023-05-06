
import React, { useState } from 'react';
import Gallery from 'react-grid-gallery';
import { getImages, NUM_ROWS } from './plaques';

import { useDispatch, useSelector } from 'react-redux';
import { PlaqueSelector, CARD_MARGIN } from './SVGPlaqueCard';

export const MARGIN_PIXELS = 1;

function getImagesFromMetadata(metadata, thumbnailSize) {
  const dateStringFor = (p) => 
     (p.requestDate || p.expiryDate) ? `${p.requestDate}-${p.expiryDate}` : '';
  const fetchPlaque = (p) => ({
    ...p,
    src: "",
    thumbnail: "",
    // dateString: dateStringFor(p),
    targetHeight: thumbnailSize.height - 2*CARD_MARGIN,
    thumbnailHeight: thumbnailSize.height,
    thumbnailWidth: thumbnailSize.width
  });
  return metadata.map(fetchPlaque);
}

function SVGPlaqueView(props) {
  const dispatch = useDispatch();

  const allPlaques = useSelector((state) => state.allPlaques);
  const rowHeight = useSelector((state) => state.rowHeight);
  const picsPerCol = useSelector((state) => state.picsPerCol);
  const colWidth = Math.ceil((window.screen.width - MARGIN_PIXELS) / picsPerCol);

  let page = props.page;
  const plaques = getImages(allPlaques, picsPerCol, page);
  const arrangedPlaques = getImagesFromMetadata(plaques, {width: colWidth, height: rowHeight});
  const onClick=(index) =>
    dispatch({type:"clickHighlight", payload: arrangedPlaques[index]});
  return (
   <div style={{
        display: "block",
        minHeight: "1px",
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
          maxRows={NUM_ROWS}
          onClickThumbnail={onClick} />
    </div>);
}

export default SVGPlaqueView;
