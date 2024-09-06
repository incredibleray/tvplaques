import SVGPlaqueView from './SVGPlaqueView';
import React, { useEffect, Children } from 'react';
// import { Carousel } from 'react-responsive-carousel';
// import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { Box } from '@mui/material';
import { current } from '@reduxjs/toolkit';
import Carousel from 'react-bootstrap/Carousel'
import 'bootstrap/dist/css/bootstrap.min.css';

function PlaqueCarousel() {
  const dispatch = useDispatch();

  const highlightPlaque = useSelector((state) => state.highlightPlaque);
  const searchResultPage = useSelector((state) => state.searchResultPage);
  const totalPages = useSelector((state) => state.totalPages);
  const showSearchBar=useSelector((state)=>state.showSearchBar);
  const carouselAutoplay=useSelector(s=>s.carouselAutoplay);
  const currentPage=useSelector(s=>s.currentPage);
  const location=useSelector(s=>s.location);

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
    pages.push(<Carousel.Item><Box sx={{backgroundColor:"black"}}><SVGPlaqueView page={i} style={{overflow: "hidden"}} /></Box></Carousel.Item>);
  }

  const onItemChange = (selectedIndex) => {
    dispatch({type:"setCurrentPage", payload: selectedIndex});
  };

  // set scroll interval to 10 seconds in photo booth mode, and 30 seconds in regular mode.
  const scrollInterval=(location=="photoBooth")? 10000:30000;

  // no page indicator, have left right arrows to flip left or right (controls), 
  // scroll the page automatically with scrollInterval. 
  // do not pause the automatic scroll when mouse hover on the object. In this app, the object in carousel is the entire page, so the mouse is likely always hovering over it.
  // when autoplayCarousel is set to false, set the interval to null, which will stop the automatic scrolling.
  // React will omit activeIndex attribute if currentPage==null. (an answer from StackOverflow)
  return (
    <Carousel indicators={false} controls={true} interval={autoPlayCarousel? scrollInterval:null} pause={false} activeIndex={currentPage} onSelect={onItemChange} >
      {pages}
      </Carousel>
  );
}

export default PlaqueCarousel;
