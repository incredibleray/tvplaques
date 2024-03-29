
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import DialogContent from '@mui/material/DialogContent';
import ProgressiveImage from 'react-progressive-graceful-image';
import { Row, Col } from 'react-bootstrap';
import { PlaqueSelector, CARD_MARGIN, MmbPlaque } from './SVGPlaqueCard';
import { MediaRenderer } from './MediaRenderer';
import Paper from '@mui/material/Paper';
import {Table} from 'react-bootstrap';
import { Carousel } from 'react-responsive-carousel';
import { Box, Stack } from '@mui/material';
import ReactCardFlip from 'react-card-flip';
import ReactPlayer from 'react-player'
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { cyan, orange, green, red } from '@mui/material/colors';
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Visibility } from '@mui/icons-material';

function SVGPlaqueCardDetail(props) {
  const [showGallery, setShowGallery] = useState(false);
  const [carouselIndex, setCarouselIndex]= useState(0);
  const [galleryStartIndex, setGalleryStartIndex]= useState(0);
  const highlightPlaque = useSelector((state) => state.highlightPlaque);
  const elementRef = useRef(null);
  
  // on tv the dimension is 1280x720
  const videoWidth=1280;
  const videoHeight=720;
  const paddingHeight=Math.floor((window.innerHeight*0.9-videoHeight)/2)
  let plaqueHeight=Math.floor(window.innerHeight*0.9);

  if (["wmmb","wrebirth"].includes(highlightPlaque.type)) {
    plaqueHeight=Math.floor(window.screen.height*0.95);
  }

if (["rebirth","wrebirth","49days"].includes(highlightPlaque.type)==false || highlightPlaque.mediaFiles.length==0) {
  // see original code for highlight content: https://github.com/incredibleray/plaquetv/blob/319913710ecd2e043fe3d6b6b395df52252c9f15/src/App.js
  
  // dialog window width is limited, can't go beyond 100vw or equavalent pixel value. 
  // reduce plaqueHeight and dialog window height to fix the dialog window width
  plaqueHeight=Math.floor(plaqueHeight*0.85);
 return     <DialogContent sx={{ 
  overflow: "hidden",
  height: "80vh",
  width: "100vw"
}} 
> <PlaqueSelector 
  item={{ 
     ...highlightPlaque,
     targetHeight: plaqueHeight
  }}
  isHighlight={true}
/>
    </DialogContent>
;
}

const plaqueImg=<PlaqueSelector 
item={{ 
   ...highlightPlaque,
   targetHeight: plaqueHeight
}}
isHighlight={true}
/>;

    // videoSrc="https://plaquetv.blob.core.windows.net/plaques/mmbPlaqueIntroSubtitle.mp4";
    // videoSrc="https://plaquetv.blob.core.windows.net/plaques/rebirthPlaqueIntroSubtitle.mp4";

  highlightPlaque.mediaFiles = highlightPlaque.mediaFiles ?? []
  const media=highlightPlaque.mediaFiles.map(
      (mf, i)=>{
      if (mf.endsWith(".jpg") || mf.endsWith(".jpeg") || mf.endsWith(".png")) {
        return <img src={"https://plaquetv.blob.core.windows.net/media/"+mf} style={{height:"720px", width:"1280px"}} />
      }

      if (mf.endsWith(".mp4")) {
        return <ReactPlayer url={"https://plaquetv.blob.core.windows.net/media/"+mf} height="720px" width="1280px"  controls playing={carouselIndex==i} />
      }
      })

  const cardFlipControl=<><Box >
  <IconButton onClick={()=>setShowGallery(false)} >
  <ThreeSixtyIcon sx={{ fontSize: 60, color: orange[500]  }} />
  </IconButton>
  <IconButton onClick={()=>{
    if (galleryStartIndex>0) {
      setGalleryStartIndex(galleryStartIndex-3);
    }
  }} >
  <ArrowUpwardIcon sx={{ fontSize: 60, color: green[500]  }} />
  </IconButton>
  <IconButton onClick={()=>{
    if (galleryStartIndex<highlightPlaque.mediaFiles.length-15) {
      setGalleryStartIndex(galleryStartIndex+3);
    }
  }} >
  <ArrowDownwardIcon sx={{ fontSize: 60, color: red[500]  }} />
  </IconButton>
  
  </Box>
  </>;
        
  return (
    <DialogContent sx={{overflow: "hidden", height: "100vh", backgroundColor:"black" }} ref={elementRef}>
<Table style={{tableLayout: "fixed"}}><tbody><tr><td/><td colSpan={3}>
<ReactCardFlip isFlipped={showGallery} >
  <div onClick={()=>setShowGallery(true)}>{plaqueImg}</div>
        <div>
        <ImageList cols={3} rowHeight={164}>
  {highlightPlaque.mediaFiles.slice(galleryStartIndex, galleryStartIndex+15).map((mf, i) => {
    let imgUrl=mf;
    if (mf.endsWith(".mp4")) {
      imgUrl=mf.split(".")[0]+"-thumbnail.png";
    }

  return (<ImageListItem onClick={()=>setCarouselIndex(galleryStartIndex+i)}>
      <img
        src={`${"https://plaquetv.blob.core.windows.net/media/"+imgUrl}?w=164&h=164&fit=crop&auto=format`}
        srcSet={`${"https://plaquetv.blob.core.windows.net/media/"+imgUrl}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
        loading="lazy"
      />
    </ImageListItem>);
})}
</ImageList>
{cardFlipControl}        </div>
      </ReactCardFlip>

</td><td/><td colSpan={12}>
  {/* this spacing value will put the carousel roughly in the center vertically in 4k resolution */}
        <Stack spacing={19}>
	  <Box />
    <Carousel autoPlay={false} transitionTime={1000}
        showThumbs={false} showStatus={false} 
        style={{overflow: "hidden"}}
        onChange={(i)=>{
          if (carouselIndex!=i) {
            setCarouselIndex(i);
          } }}
          selectedItem={carouselIndex}

        renderArrowPrev={(onClickHandler, hasPrev, label) =>
            hasPrev && (
                <IconButton onClick={onClickHandler} title={label} style={{         position: 'absolute',
                zIndex: 2,
                top: 'calc(50% - 30px)',
                width: 60,
                height: 60,
                cursor: 'pointer', left: 15 }}>
                    <ArrowBackIosNewIcon sx={{ fontSize: 60, color: cyan[300]  }} />
                </IconButton>
            )
        }
        renderArrowNext={(onClickHandler, hasNext, label) =>
            hasNext && (
              <IconButton onClick={onClickHandler} title={label} style={{         position: 'absolute',
                zIndex: 2,
                top: 'calc(50% - 30px)',
                width: 60,
                height: 60,
                cursor: 'pointer', right: 15 }}>
                    <ArrowForwardIosIcon sx={{ fontSize: 60, color: cyan[300]  }} />
                </IconButton>
            )
        }
      >
       {media}           
      </Carousel>
	<Box />
	</Stack>
</td><td/></tr></tbody></Table>

        </DialogContent>      
  );


}

export default SVGPlaqueCardDetail;
