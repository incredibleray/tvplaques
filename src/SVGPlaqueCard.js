import mmb from './resources/MMBPlaque_7_24.svg';
import rebirth from './resources/RebirthPlaque_7_24.svg';
import wish from './resources/RuYiPlaque_7_24.svg';

import {SvgFile, TextOverlay} from './SVGOverlay';

export const CARD_HEIGHT = 612;
export const CARD_WIDTH = 204;
export const CARD_MARGIN = 0;

const MMB_COLOR = 'red';
const REBIRTH_COLOR = 'yellow';
const WISH_COLOR = 'aquamarine';

// svg Files no longer have margins. it is 564 (H) X 163 (W).
// SVG_STYLE creates a box of the old size of the svg file with margins, 612 (H) X 204 (W)
// SVG_STYLE also create the shadow
// CARD_STYLE scales the plaque (svg file, shadow, overlay text) to the display size

const CARD_STYLE = (props) => ({
  transform: `scale(${ (props.item.targetHeight ) / CARD_HEIGHT })`,
  transformOrigin: 'top left',
}); 

const SVG_STYLE = (color) => ({
  backgroundColor: color,
  // display: 'inline-block',
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  boxShadow: `0 2px 17px 0px ${color}`,
});

export function MmbPlaque(props) {
  let svgDivStyle=SVG_STYLE('#ee203b');
  let svgStyle={
    height:"564px",
    width:"163px",
    translate:"0px 27px"
  };

  if (props.isHighlight) {
    svgDivStyle.boxShadow="";
    svgStyle.translate="20.5px 27px"
  }

  return (
     <div style={CARD_STYLE(props)}>
      <div style={svgDivStyle} >
        <img src={mmb} alt="svg" style={svgStyle} />
        </div>
        <TextOverlay text={props.item.beneficiary} position={{x:107, y:375}} vertical={true} maxHeight={64} maxExtent={250} defaultFontSize={30} variant="h1" />
        <TextOverlay text={props.item.sponsor} position={{x:56, y:420}} vertical={true} maxExtent={180} maxHeight={35} defaultFontSize={20} variant="h2" />
        <TextOverlay text={props.item.dateString} position={{x:102, y:577}} maxExtent={116} maxHeight={15} defaultFontSize={10} variant="h6" />
     </div>
  ); 
}

MmbPlaque.defaultProps = {
  beneficiary: '',
  sponsor: '',
  dateString: '',
  type: 'mmb'
};

export function RebirthPlaque(props) {
  let svgDivStyle=SVG_STYLE('#ffcd05');
  let svgStyle={
    height:"564px",
    width:"163px",
    translate:"0px 27px"
  };

  if (props.isHighlight) {
    svgDivStyle.boxShadow="";
    svgStyle.translate="20.5px 27px"
  }

  return (
     <div style={CARD_STYLE(props)}>
        <div style={svgDivStyle}>
        <img src={rebirth} alt="svg" style={svgStyle} />
        </div>
        <TextOverlay text={props.item.beneficiary} position={{x:105, y:365}} vertical={true} maxExtent={262} maxHeight={64} defaultFontSize={30} variant="h1" />
        <TextOverlay text={props.item.sponsor} position={{x:55, y:410}} vertical={true} maxExtent={180} maxHeight={35} defaultFontSize={20} variant="h2" />
        <TextOverlay text={props.item.dateString} position={{x:103, y:576}} maxExtent={105} maxHeight={20} defaultFontSize={10} variant="h6" />
     </div>
  ); 
}

RebirthPlaque.defaultProps = {
  beneficiary: '',
  sponsor: '',
  dateString: '',
  type: 'rebirth'
};

export function WishPlaque(props) {
  let svgDivStyle=SVG_STYLE('#47c8f5');
  let svgStyle={
    height:"564px",
    width:"163px",
    translate:"0px 27px"
  };

  if (props.isHighlight) {
    svgDivStyle.boxShadow="";
    svgStyle.translate="20.5px 27px"
  }

  return (
     <div style={CARD_STYLE(props)}>
     <div style={svgDivStyle}>
     <img src={wish} alt="svg" style={svgStyle} />
        </div>
        <TextOverlay text={props.item.beneficiary} position={{x:105, y:349}} vertical={true} maxExtent={249} maxHeight={64} defaultFontSize={30} variant="h1" />
        <TextOverlay text={props.item.sponsor} position={{x:56, y:380}} vertical={true} maxExtent={180} maxHeight={35} defaultFontSize={20} variant="h2" />
        <TextOverlay text={props.item.dateString} position={{x:102, y:574}} maxExtent={110} maxHeight={20} defaultFontSize={10} variant="h6" />
     </div>
  ); 
}

WishPlaque.defaultProps = {
  beneficiary: '',
  sponsor: '',
  dateString: '',
  type: 'wish'
};

export function PlaqueSelector(props) {
  const type = props.item.type;
  if (type === 'mmb' || type=="wmmb") {
    return MmbPlaque(props);
  } else if (type === 'rebirth') {
    return RebirthPlaque(props);
  } else if (type === 'wish') {
    return WishPlaque(props);
  } else {
    console.log('Undefined type: ' + type);
    return `undefined: ${type}`;
  }
}

PlaqueSelector.defaultProps = {
  type: 'unspecified',
  targetHeight: CARD_HEIGHT - 2 * CARD_MARGIN
}
