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

const fontFamily = {
  'h1': '"Playfair Display", Kaiti, "Gowun Batang"',
  'h2': '"Playfair Display", Kaiti, "Gowun Batang"',
  'h6': 'Roboto'
}

function calculateFontSize(inStr, maxWidth, maxHeight, startingFontSize, fontFamily) {
    let fontSize = startingFontSize;
    let text = document.createElement('span');
    inStr = inStr.replace('\n', '<br/>');
    text.style.fontFamily = fontFamily;
    text.style.fontSize = `${fontSize}px`;
    text.innerHTML = inStr;
    document.body.appendChild(text);

    while (fontSize > 1 && (text.offsetWidth > maxWidth || text.offsetHeight > maxHeight)) {
        fontSize--;
        text.style.fontSize = `${fontSize}px`;
    }
    document.body.removeChild(text);
    return fontSize;
}

export function SvgFile(props) {
  return <img src={props.svg} alt="svg" />
}

export function TextOverlay(props) {
  const writingMode = props.vertical ? 'vertical-rl' : 'horizontal-tb'

  // calculate the font size in python program and 
  // write it in the plaques.json file to avoid doing computation here.
  //const fitFontSize=props.defaultFontSize;
  const fitFontSize = calculateFontSize(props.text, props.maxExtent, props.maxHeight, props.defaultFontSize, fontFamily[props.variant]);

  const dynamicStyle = props.alignBottom ? {
    transform: 'translate(-50%, 0%)',
    bottom: props.position.y - (props.maxExtent / 2)
  } : {
    transform: 'translate(-50%, -50%)',
    top: props.position.y
  }


  const style = {
    position: 'absolute',
    left: props.position.x,
    fontSize: `${fitFontSize}px`,
    transformOrigin: 'center center',
    writingMode: `${writingMode}`,
    whiteSpace: 'pre',
    ...dynamicStyle
  };

  return (<ThemeProvider theme={theme}><Typography variant={props.variant} style={style}>{props.text}</Typography></ThemeProvider>)
}

TextOverlay.defaultProps = {
  vertical: false,
  alignBottom: false,
  maxHeight: 30
};
