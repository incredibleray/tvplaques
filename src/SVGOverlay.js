import React from 'react';
import { Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import '@fontsource/playfair-display/400.css';
import '@fontsource/roboto/700.css';
import '@fontsource/gowun-batang/700.css';
import "./kaiti-700.css";

const theme = createTheme({
  typography: {
    h1: {
      fontFamily: '"Playfair Display", Kaiti, "Gowun Batang"',
    },
    h2: {
      fontFamily: '"Playfair Display", Kaiti, "Gowun Batang"',
    },
    h6: {
      fontFamily: "Roboto",
    },
  },
});


export function SvgFile(props) {
  return <img src={props.svg} alt="svg" />
}

export function TextOverlay(props) {
  const writingMode = props.vertical ? 'vertical-rl' : 'horizontal-tb'

  const fitFontSize = props.fontSize;

  const dynamicStyle = props.alignBottom ? {
    transform: 'translate(-50%, 0%)',
    bottom: props.position.y - (props.maxExtent / 2)
  } : {
    transform: 'translate(-50%, -50%)',
    top: props.position.y
  }

  let fontFamily='';
  switch(props.variant) {
    case 'h1':
      fontFamily = '"Playfair Display", Kaiti, "Gowun Batang"';
      break;
    case 'h2':
      fontFamily = '"Playfair Display", Kaiti, "Gowun Batang"';
      break;
    case 'h6':
      fontFamily = "Roboto";
      break;
  }

  const style = {
    position: 'absolute',
    left: props.position.x,
    fontFamily: fontFamily,
    fontSize: `${fitFontSize}px`,
    transformOrigin: 'center center',
    writingMode: `${writingMode}`,
    whiteSpace: 'pre',
    ...dynamicStyle
  };

  return <span style={style}>{props.text}</span>
}

TextOverlay.defaultProps = {
  vertical: false,
  alignBottom: false,
  maxHeight: 30
};
