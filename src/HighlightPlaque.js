
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

function HighlightPlaque() {
  const dispatch = useDispatch();
  const rowHeight = useSelector((state) => state.rowHeight);
  const highlightPlaque = useSelector((state) => state.highlightPlaque);
  
  if (highlightPlaque == null) {
    return <></>;
  }

  const handleClose = () => dispatch({ type: "closeHighlightPopup" });

  return <div>
    <Dialog
    fullScreen
      open={true}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle sx={{ m: 0, p: 3 }}>
        <IconButton color="primary" aria-label="close" onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <SVGPlaqueCardDetail/>
    </Dialog>
  </div>
    ;


}

export default HighlightPlaque;
