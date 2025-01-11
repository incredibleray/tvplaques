
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'reactjs-popup/dist/index.css';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Paper from '@mui/material/Paper';
import Offcanvas from 'react-bootstrap/Offcanvas'; 
import Card from 'react-bootstrap/Card';   
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';           
import 'bootstrap/dist/css/bootstrap.min.css'; 
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import {MARGIN_PIXELS} from './SVGPlaqueView';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CloseIcon from '@mui/icons-material/Close';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import useKeypress from 'react-use-keypress';
import { CheckBox } from '@mui/icons-material';
import Settings from "./Settings";
import {getAutocompleteOptions} from "./plaques";
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

export function SearchBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let search = useSelector((state) => state.search);
  const showSearchBar = useSelector((state) => state.showSearchBar);
  const highlightPlaque = useSelector((state) => state.highlightPlaque);
  const rowHeight = useSelector((state) => state.rowHeight);
  const location=useSelector((state)=>state.location);
  const plaquesOnFile=useSelector((state)=>state.plaquesOnFile);

  useKeypress(["MediaPlay", "MediaPause", "Pause", "MediaStop","MediaPlayPause", "\\", "]", "/"], (event) => {
    if (event.key =="/") {
      navigate('/search');
    }
    else if ((event.key === 'MediaPlay'||event.key=="\\") && showSearchBar===false && highlightPlaque==null) {
      dispatch({ type: "setShowSearchBar", payload: true });
    } else {
      dispatch({ type: "setShowSearchBar", payload: false });
      dispatch({type:"closeHighlightPopup"});
    }
  });

  
  const searchBarWidth = Math.floor((window.innerWidth - MARGIN_PIXELS) * 0.19);

    const handleClose = () => dispatch({ type: "setShowSearchBar", payload: false });

    return (<div>
      <Dialog
        open={showSearchBar}
        onClose={handleClose}
      >
        <DialogTitle sx={{ m: 0, p: 3 }}>
          <IconButton color="primary" aria-label="close" onClick={handleClose}
            sx={{ position: "relative",
              "left": "93%"
            }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Settings />
        </DialogContent>
      </Dialog>
    </div>


//         <FormControl >
//   <InputLabel>Location</InputLabel>
//   <Select
//     value={location}
//     label="Location"
//     onChange={(event)=>{
//       console.log(event.target.value);
//       dispatch({type:"setLocation", payload: event.target.value});
//     }}
//   >
//     <MenuItem value={"dttRebirth"}>DTT Rebirth Plaque TV</MenuItem>
//     <MenuItem value={"dttMmb"}>DTT MMB Plaque TV</MenuItem>
//   </Select>
// </FormControl>
//         <Typography
//           variant="h5"
//           component="div"
//           // sx={{ m: 20 }}
//         >
//           v2.0
//         </Typography>
  );
}

export default SearchBar;
