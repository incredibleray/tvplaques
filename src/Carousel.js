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
// import { CCarousel, CCarouselItem } from '@coreui/react'
// https://github.com/vadymshymko/react-simply-carousel

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
  const returnStyles = {
    slideStyle: {},
    selectedStyle: { },
    prevStyle: {},
  };
  const { previousItem, selectedItem } = state;
  const lastPosition = Children.count(props.children) - 1;
  let transitionTime = props.transitionTime + 'ms';
  let timingFunction="cubic-bezier(1,-0.16,.66,1.02)";

  console.log(state);
  if (props.infiniteLoop && (
    (selectedItem == 0 && previousItem==lastPosition)
    || (selectedItem==lastPosition && previousItem==0)
    )) {
      const transitionTimingFunction = 'cubic-bezier(1,-0.16,.66,1.02)';

      let slideStyle = {
          position: 'absolute',
          display: 'block',
          zIndex: -2,
          minHeight: '100%',
          opacity: 0,
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          transitionTimingFunction: transitionTimingFunction,
          msTransitionTimingFunction: transitionTimingFunction,
          MozTransitionTimingFunction: transitionTimingFunction,
          WebkitTransitionTimingFunction: transitionTimingFunction,
          OTransitionTimingFunction: transitionTimingFunction,
      };

      if (!state.swiping) {
          slideStyle = {
              ...slideStyle,
              WebkitTransitionDuration: transitionTime,
              MozTransitionDuration: transitionTime,
              OTransitionDuration: transitionTime,
              transitionDuration: transitionTime,
              msTransitionDuration: transitionTime,
          };
      }

      return {
          itemListStyle: {},
          slideStyle,
          selectedStyle: { ...slideStyle, opacity: 1, position: 'relative' },
          prevStyle: { ...slideStyle },
      };
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
    pages.push(<Carousel.Item><Box sx={{backgroundColor:"black"}}><SVGPlaqueView page={i} style={{overflow: "hidden"}} /></Box></Carousel.Item>);
  }

  const onChangeCallback=(index)=>{
    dispatch({type:"setCurrentPage", payload:index});
  }

  // no page indicator, have left right arrows to flip left or right (controls), scroll the page automatically every 30,000 milliseconds, or 30 seconds interval. 
  // do not pause the automatic scroll when mouse hover on the object. In this app, the object in carousel is the entire page, so the mouse is likely always hovering over it.
  return (
    <Carousel indicators={false} controls={true} interval={30000} pause={false}>
      {pages}
      </Carousel>
  );
}

export default PlaqueCarousel;
