import SVGPlaqueView from './SVGPlaqueView';
import React, { useEffect, Children } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { Box } from '@mui/material';
import { current } from '@reduxjs/toolkit';

const getPosition = (index, props) => {
  if (props.infiniteLoop) {
      // index has to be added by 1 because of the first cloned slide
      ++index;
  }

  if (index === 0) {
      return 0;
  }

  const childrenLength = Children.count(props.children);
  if (props.centerMode && props.axis === 'horizontal') {
      let currentPosition = -index * props.centerSlidePercentage;
      const lastPosition = childrenLength - 1;

      if (index && (index !== lastPosition || props.infiniteLoop)) {
          currentPosition += (100 - props.centerSlidePercentage) / 2;
      } else if (index === lastPosition) {
          currentPosition += 100 - props.centerSlidePercentage;
      }

      return currentPosition;
  }

  return -index * 100;
}

const CSSTranslate= (position, metric, axis) => {
  const positionPercent = position === 0 ? position : position + metric;
  const positionCss = axis === 'horizontal' ? [positionPercent, 0, 0] : [0, positionPercent, 0];
  const transitionProp = 'translate3d';

  const translatedPosition = '(' + positionCss.join(',') + ')';

  return transitionProp + translatedPosition;
};

// Slide animation from last page to the first page result in a quick slide back to first page, this animation often shows a white screen since rendering can not catch up.
// define a new animation based on the original slide animation
// new animation switch to the next slide with no animation when going from first slide to last slide, or last slide to first slide.
// the rest is the same as the original slide animation.
function animation(props, state) {
  const returnStyles = {};
  const { previousItem, selectedItem } = state;
  const lastPosition = Children.count(props.children) - 1;
  let transitionTime = props.transitionTime + 'ms';
  let timingFunction="ease-in-out";

  // console.log(selectedItem, lastPosition);
  if (props.infiniteLoop && (
    (selectedItem == 0 && previousItem==lastPosition)
    || (selectedItem==lastPosition && previousItem==0)
    )) {
    transitionTime = '250ms';
    timingFunction="step-end";
  }
  // console.log(transitionTime);

  const currentPosition = getPosition(selectedItem, props);
  const transformProp = CSSTranslate(currentPosition, '%', props.axis);

  returnStyles.itemListStyle = {
      WebkitTransform: transformProp,
      msTransform: transformProp,
      OTransform: transformProp,
      transform: transformProp,
  };

  if (!state.swiping) {
      returnStyles.itemListStyle = {
          ...returnStyles.itemListStyle,
          WebkitTransitionTimingFunction: timingFunction,
          MozTransitionTimingFunction: timingFunction,
          OTransitionTimingFunction: timingFunction,
          transitionTimingFunction: timingFunction,
          msTransitionTimingFunction: timingFunction,
          WebkitTransitionDuration: transitionTime,
          MozTransitionDuration: transitionTime,
          OTransitionDuration: transitionTime,
          transitionDuration: transitionTime,
          msTransitionDuration: transitionTime,
      };
  }

  // console.log(returnStyles);
  return returnStyles;
}

function PlaqueCarousel() {
  const dispatch = useDispatch();

  const highlightPlaque = useSelector((state) => state.highlightPlaque);
  const searchResultPage = useSelector((state) => state.searchResultPage);
  const totalPages = useSelector((state) => state.totalPages);
  const showSearchBar=useSelector((state)=>state.showSearchBar);
  const carouselAutoplay=useSelector(s=>s.carouselAutoplay);
  const currentPage=useSelector(s=>s.currentPage);
  
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

  const onChangeCallback=(index)=>{
    dispatch({type:"setCurrentPage", payload:index});
  }

  return (
      <Carousel autoPlay={autoPlayCarousel} infiniteLoop={true} interval={29000} stopOnHover={false} transitionTime={1000}
        showThumbs={false} showStatus={false} showIndicators={false}
        selectedItem={searchResultPage}
        onChange={onChangeCallback}
        animationHandler={animation}
      >
        {pages}
      </Carousel>
  );
}

export default PlaqueCarousel;
