
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

export function SearchBar() {
  const dispatch = useDispatch();
  let search = useSelector((state) => state.search);
  const showSearchBar = useSelector((state) => state.showSearchBar);
  const highlightPlaque = useSelector((state) => state.highlightPlaque);
  const rowHeight = useSelector((state) => state.rowHeight);
  const location=useSelector((state)=>state.location);
  const allPlaques=useSelector((state)=>state.allPlaques);

  useKeypress(["MediaPlay", "MediaPause", "Pause", "MediaStop","MediaPlayPause"], (event) => {
    if (event.key === 'MediaPlay' && showSearchBar===false && highlightPlaque==null) {
      dispatch({ type: "setShowSearchBar", payload: true });
    } else {
      dispatch({ type: "setShowSearchBar", payload: false });
      dispatch({type:"closeHighlightPopup"});
    }
  });

  // allPlaques=allPlaques.filter(p=>p.id.length>0);
  // const beneficiarys = allPlaques.map(p => p.beneficiary);
  // const requesters = allPlaques.map(p => p.sponsor);
  let searchTerms=new Set(allPlaques.map(p=>p.searchTerms).filter(x=>x!=null).flat());
  const options = Array.from(searchTerms);

  const searchBarWidth = Math.floor((window.innerWidth - MARGIN_PIXELS) * 0.19);

  if (search.length > 0) {
    search = search[0]
  }

    const handleClose = () => dispatch({ type: "setShowSearchBar", payload: false });

    return (<div>
      <Dialog
        open={showSearchBar}
        onClose={handleClose}
      >
        <DialogTitle sx={{ m: 0, p: 3 }}>
        <Stack direction="row" spacing={3}>
        <Autocomplete
          // multiple
          autoHighlight
          handleHomeEndKeys={false}
          options={options}
          // defaultValue={[]}
          renderInput={(params) => (
            <TextField
              {...params}
              sx={{ ml: 2, flex: 1, 
                width: searchBarWidth, 
                display:"inline-block" }}
              variant="standard"
              label="Plaque Search"
              placeholder="Beneficiary or Sponsor's Name"
            />
          )}
          onChange={(event, value) => dispatch({ type: 'search', payload: [value,] })}
          // onFocus={() => dispatch({ type: "startTyping" })}
          // onBlur={() => dispatch({ type: "stopTyping" })}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (search.length > 0) {
                new Promise(
                  (resolve) => {
                    dispatch({ type: "setShowSearchBar", payload: false });
                    // wait for the keyboard on tv to disappear
                    setTimeout(resolve, 3000);
                  }).then(() => {
                    dispatch({ type: "showSearchResults" });
                  });
              }
            }
          }}
          value={search}
        />
        <IconButton aria-label="search" sx={{display:"inline-block"}} >
          <SearchIcon onClick={() =>
            new Promise((resolve) => {
              dispatch({ type: "setShowSearchBar", payload: false });
              setTimeout(resolve, 1000);
            }).then(() => {
              dispatch({ type: "showSearchResults" });
            })} />
        </IconButton>
          <IconButton color="primary" aria-label="close" onClick={handleClose}
            sx={{
              display:"inline-block"
            }}>
            <CloseIcon />
          </IconButton>
          </Stack>
        </DialogTitle>
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
