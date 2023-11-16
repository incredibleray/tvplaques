
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'reactjs-popup/dist/index.css';
import Typography from '@mui/material/Typography';
import Table from 'react-bootstrap/Table';           
import Stack from '@mui/material/Stack';
import { RadioGroup, Radio , FormControlLabel} from '@mui/material';
import CheckBox from '@mui/material/Checkbox';

export function Settings() {
  const dispatch = useDispatch();
  const plaqueTypes = useSelector((state) => state.plaqueTypes);
  const carouselAutoplay = useSelector((state) => state.carouselAutoplay);
  const location=useSelector((state)=>state.location);

    return (<div>
      <Table><tbody>
        <tr><td>
          <Typography variant="h6">Location</Typography>
          </td>
          <td>
          <RadioGroup
    value={location}
    onChange={(event) => dispatch({ type: "setLocation",payload: event.target.value})}
  >
            <Stack direction="row" spacing={3}>

            <FormControlLabel value="DTT" control={<Radio />} label="DTT" />
            <FormControlLabel value="GF" control={<Radio />} label="GF" />
            <FormControlLabel value="WMT" control={<Radio />} label="WMT" />

    </Stack>
  </RadioGroup>
          </td>
          </tr>
          <tr><td>
          <Typography variant="h6">Plaque Types</Typography>
</td><td>
        <Stack direction="row" spacing={3}>

          <div><CheckBox checked={plaqueTypes.includes("mmb")} onChange={(event)=>{
            if (event.target.checked && !plaqueTypes.includes("mmb")) {
              dispatch({type:"setPlaqueTypes", payload: [...plaqueTypes, "mmb"]});
            }

            if (!event.target.checked && plaqueTypes.includes("mmb")) {
              dispatch({type:"setPlaqueTypes", payload:plaqueTypes.filter(e=>e!="mmb")});
            }
          }} />MMB</div>
          <div><CheckBox checked={plaqueTypes.includes("rebirth")} onChange={
            (event)=>{
              if (event.target.checked && !plaqueTypes.includes("rebirth")) {
                dispatch({type:"setPlaqueTypes", payload: [...plaqueTypes, "rebirth"]});
              }
  
              if (!event.target.checked && plaqueTypes.includes("rebirth")) {
                dispatch({type:"setPlaqueTypes", payload:plaqueTypes.filter(e=>e!="rebirth")});
              }
            }
          } />Rebirth</div>
          <div><CheckBox checked={plaqueTypes.includes("wish")} onChange={
            (event)=>{
              if (event.target.checked && !plaqueTypes.includes("wish")) {
                dispatch({type:"setPlaqueTypes", payload: [...plaqueTypes, "wish"]});
              }
  
              if (!event.target.checked && plaqueTypes.includes("wish")) {
                dispatch({type:"setPlaqueTypes", payload:plaqueTypes.filter(e=>e!="wish")});
              }
            }
          }/>As you wish</div>
            
          </Stack></td></tr>
          <tr>
          <td></td><td>
        <Stack direction="row" spacing={3}>

          <div><CheckBox checked={plaqueTypes.includes("wmmb")} onChange={(event)=>{
            if (event.target.checked && !plaqueTypes.includes("wmmb")) {
              dispatch({type:"setPlaqueTypes", payload: [...plaqueTypes, "wmmb"]});
            }

            if (!event.target.checked && plaqueTypes.includes("wmmb")) {
              dispatch({type:"setPlaqueTypes", payload:plaqueTypes.filter(e=>e!="wmmb")});
            }
          }} />W-MMB</div>
          <div><CheckBox checked={plaqueTypes.includes("wrebirth")} onChange={
            (event)=>{
              if (event.target.checked && !plaqueTypes.includes("wrebirth")) {
                dispatch({type:"setPlaqueTypes", payload: [...plaqueTypes, "wrebirth"]});
              }
  
              if (!event.target.checked && plaqueTypes.includes("wrebirth")) {
                dispatch({type:"setPlaqueTypes", payload:plaqueTypes.filter(e=>e!="wrebirth")});
              }
            }
          } />W-Rebirth</div>
          <div><CheckBox checked={plaqueTypes.includes("49days")} onChange={
            (event)=>{
              if (event.target.checked && !plaqueTypes.includes("49days")) {
                dispatch({type:"setPlaqueTypes", payload: [...plaqueTypes, "49days"]});
              }
  
              if (!event.target.checked && plaqueTypes.includes("49days")) {
                dispatch({type:"setPlaqueTypes", payload:plaqueTypes.filter(e=>e!="49days")});
              }
            }
          }/>49 Days (Search Only)</div>
            
          </Stack></td>
          </tr>
          <tr><td>
          <Typography variant="h6">Carousel</Typography></td>
          <td><CheckBox checked={carouselAutoplay==false} onChange={(event) => dispatch({ type: "setCarouselAutoplay",payload: event.target.checked==false})} />Stop auto-scroll</td></tr>
          </tbody></Table>
    </div>
  );
}

export default Settings;
