
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SVGPlaqueCardDetail from "./SVGPlaqueCardDetail";
import { Row, Col } from 'react-bootstrap';
import { PlaqueSelector, CARD_MARGIN, MmbPlaque } from './SVGPlaqueCard';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Carousel from 'react-bootstrap/Carousel'
import { Box } from '@mui/material';

function HighlightPlaque() {
  const dispatch = useDispatch();
  const rowHeight = useSelector((state) => state.highlightPlaqueHeight);

  // highlight plaques is a list of plaques that should be highlighted in this component.
  const highlightPlaques = useSelector((state) => state.highlightPlaques);
  
  if (highlightPlaques.length == 0) {
    return <></>;
  }

  const handleClose = () => dispatch({ type: "closeHighlightPopup" });

  const dialogTitle=<DialogTitle sx={{ m: 3, p: 0, }}>
  <IconButton color="primary" aria-label="close" onClick={handleClose}
    sx={{
      position: 'absolute',
      right: 8,
      top: 8,
    }}>
    <CloseIcon />
  </IconButton>
</DialogTitle>;

  let plaquesContainer=<></>;
  if (highlightPlaques.length == 1) {
    plaquesContainer=<PlaqueSelector item={{...highlightPlaques[0], targetHeight:rowHeight}} isHighlight={true} />
  } else {
    // multiple plaques to highlight
    // use a carousel to show all the highlight plaques.
    const pages=[];
    for (let i = 0; i < highlightPlaques.length; i++) {
      // setting the background color of <Box> to black
      // so the gaps between two <SVGPlaqueView> pages appears black instead of white.
      pages.push(
        <Carousel.Item>
          <Box sx={{backgroundColor:"black"}}>
            <PlaqueSelector item={{...highlightPlaques[i], targetHeight:rowHeight}} isHighlight={true} />
          </Box>
        </Carousel.Item>);

      plaquesContainer=<Carousel indicators={false} controls={true} interval={10000} pause={false}>
        {pages}
      </Carousel>
    }
  }

  let dialog=<Dialog open={true} onClose={handleClose}>{dialogTitle}
  <DialogContent>
    {plaquesContainer}
  </DialogContent>
  </Dialog>;
  
  // under construction
  // show associated photos and videos for rebirth, W-rebirth plaques.
  // if (["rebirth","wrebirth","49days"].includes(highlightPlaque.type)&&highlightPlaque.mediaFiles.length>0) {
  //   dialog=<Dialog fullScreen open={true} onClose={handleClose}>
  //     {dialogTitle}
  //     <SVGPlaqueCardDetail/>
  //   </Dialog>;
  // }

  return <>{dialog}</>;
}

export default HighlightPlaque;
