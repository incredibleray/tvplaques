import SVGPlaqueView from './SVGPlaqueView';
import React, { useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'

function PlaqueCarousel() {
  const dispatch = useDispatch();

  const highlightPlaque = useSelector((state) => state.highlightPlaque);
  const searchResultPage = useSelector((state) => state.searchResultPage);
  const totalPages = useSelector((state) => state.totalPages);
  const showSearchBar=useSelector((state)=>state.showSearchBar);

  if (totalPages ===0) {
    return <></>
  }

  let autoPlayCarousel = true;
  if (highlightPlaque != null || showSearchBar) {
    autoPlayCarousel = false;

  }

  let pages = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(<SVGPlaqueView page={i} />);
  }


  return (
      <Carousel autoPlay={autoPlayCarousel} infiniteLoop={true} interval={29000} stopOnHover={false} transitionTime={1000}
        showThumbs={false} showStatus={false} showIndicators={false}
        selectedItem={searchResultPage}
        style={{overflow: "hidden"}}
        onChange={(index)=>dispatch({type:"setCurrentPage", payload:index})}
      >
        {pages}
      </Carousel>
  );
}

export default PlaqueCarousel;
