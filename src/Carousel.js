import SVGPlaqueView from './SVGPlaqueView';
import React, { useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { Box } from '@mui/material';

function PlaqueCarousel() {
  const dispatch = useDispatch();

  const highlightPlaque = useSelector((state) => state.highlightPlaque);
  const searchResultPage = useSelector((state) => state.searchResultPage);
  const totalPages = useSelector((state) => state.totalPages);
  const showSearchBar=useSelector((state)=>state.showSearchBar);
  const carouselAutoplay=useSelector(s=>s.carouselAutoplay);

  if (totalPages ===0) {
    return <></>
  }

  let autoPlayCarousel = carouselAutoplay;
  if (highlightPlaque != null || showSearchBar) {
    autoPlayCarousel = false;

  }

  // the pages are layed out horizontally from left to right like a long horizontal scrolls that span many screens
  // there is some gap between adjacent pages
  // a segment of the scroll is shown at any given time, 
  let pages=[];
  for (let i = 0; i < totalPages; i++) {
    // setting the background color of <Box> to black
    // so the gaps between two <SVGPlaqueView> pages appears black instead of white.
    pages.push(<Box sx={{backgroundColor:"black"}}><SVGPlaqueView page={i} style={{overflow: "hidden"}} /></Box>);
  }

  return (
      <Carousel autoPlay={autoPlayCarousel} infiniteLoop={true} interval={29000} stopOnHover={false} transitionTime={1000}
        showThumbs={false} showStatus={false} showIndicators={false}
        selectedItem={searchResultPage}
        onChange={(index)=>dispatch({type:"setCurrentPage", payload:index})}
      >
        {pages}
      </Carousel>
  );
}

export default PlaqueCarousel;
