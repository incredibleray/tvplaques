import {getAutocompleteOptions} from "./plaques";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { Autocomplete, TextField, IconButton, Stack, Fab } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { useDispatch, useSelector } from 'react-redux'
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import useKeypress from 'react-use-keypress';

export default function SearchPage() {
    const results=useSelector((state)=>state.searchResults);
    const plaquesOnFile=useSelector((state)=>state.plaquesOnFile);
    const term=useSelector((state)=>state.searchTerm);

    const navigate = useNavigate();

  const dispatch = useDispatch();

  useKeypress(["/"], (event) => {
    dispatch({ type: 'updateSearchTerm', payload: "" });
    navigate("/");
  });

    let list=[];
    let combo=[];
    for (let i=0; i<results.length;i++) {
      let avatar=null;
      switch (results[i].type) {
        case 'mmb':
          avatar=<Avatar src="/mmbSearchResult.png" />;
          break;
        case 'rebirth':
          avatar=<Avatar src="/rebirthSearchResult.png" />;
          break;
        case 'ayw':
          avatar=<Avatar src="/aywSearchResult.png" />;
          break;
      }

      let expireText;
      if (results[i].expiryDate != "Permanent") {
        expireText=`Expires on ${results[i].expiryDate}`;
      } else {
        expireText="Permanent"
      }

        const item=<ListItem alignItems="flex-start">
        <ListItemAvatar>
          {avatar}
        </ListItemAvatar>
        <ListItemText
          primary={
            <div>
          <Typography variant="h5">{results[i].beneficiary}</Typography>
          <Typography variant="h6">{results[i].sponsor}</Typography>
          </div>
        }
          secondary={
            <div>
          <Typography variant="body2">{`Requested on ${results[i].requestDate}`}</Typography>
          <Typography variant="body2">{expireText}</Typography>
          <Typography variant="body2">{results[i].locations.join(',')}</Typography>
          </div>
        }
        />
      </ListItem>

      combo.push(item);

      if (combo.length==4) {
        const listItem=<Stack direction="row">
          {combo}
        </Stack>;

      if (list.length) {
        list.push(<Divider variant="inset" component="li" />);
      }

      list.push(listItem);

        combo=[];
      }


    }

    // create a list item from remaining items in the combo.
    if (combo.length>0) {
      const listItem=<Stack direction="row">
            {combo}
          </Stack>;

      if (list.length) {
        list.push(<Divider variant="inset" component="li" />);
      }

      list.push(listItem);
    }
    
    let searchBarPosition={
      position:"absolute",
      top: "35%",
      left: "19%",
      width: "62%"
    },
    autocompletePosition={
      position:"relative",
      top: "0px",
      left: "0px"
    }, searchButtonPosition={
      position:"relative",
      top: "0px",
      right: "7px"
    };
    let hint=<div style={{
      position:"relative",
      top: "20px",
      left: "0px",
      textAlign: "center"
    }}><Typography variant="body2" >
      Use Ctrl+Shift+Space to switch between input languages on Plaque TV.
    </Typography>
    </div>

    if (list.length>0) {
      searchBarPosition={
        position:"relative",
        left: "19%",
        top: "0px",
        width: "62%"
      };
      hint=<></>
    }

    let options=getAutocompleteOptions(plaquesOnFile);

    if (term) {
      options=[term, ...options];
    }

    return <div >
      <div>
    <Autocomplete
    // multiple
    autoHighlight
    handleHomeEndKeys={false}
    options={options}
    renderInput={(params) => (
      <Stack style={searchBarPosition}>
      <Stack direction="row" >
      <TextField
        {...params}
        variant="filled"
        sx={{ ml: 2, flex: 1, mt: 2,
          maxWidth: "91%", 
          display:"inline-block",
          ...autocompletePosition
           }}
        label="Plaque Search"
        placeholder="Beneficiary or Sponsor's Name"
      />
  <IconButton aria-label="search" sx={{display:"inline-block", mt: 2,
    ...searchButtonPosition
  }}
  onClick={()=>dispatch({type: "search"})}>
<SearchIcon  />
</IconButton>

  </Stack>
  
    {hint}
    </Stack>
    )}
    onChange={(event, value) => {
      dispatch({ type: 'updateSearchTerm', payload: value });
      setTimeout(()=>dispatch({type: "search"}), 500);
    }}
    onInputChange={(event,value)=>
      dispatch({ type: 'updateSearchTerm', payload: value })
    }
    freeSolo
  />      
</div>
  <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {list}
    </List>
  <Fab color="secondary" sx={{
  position: 'fixed',
  bottom: "50px",
  right: "50px",
}} onClick={()=>{
  dispatch({ type: 'updateSearchTerm', payload: "" });
  navigate("/");
}}>
  <HomeIcon />
</Fab>
  </div>
}
