import mmb from './resources/mmb.svg';
import rebirth from './resources/rebirth.svg';
import wish from './resources/RuYiPlaque_7_24.svg';
import wmmb from './resources/W_mmb.svg';
import wrebirth from './resources/W_rebirth.svg';
import "./WPlaque.css";

import {SvgFile, TextOverlay} from './SVGOverlay';

export const CARD_HEIGHT = 612;
export const CARD_WIDTH = 204;
export const CARD_MARGIN = 0;

// the text boxes width of each type of plaques 
export const plaqueMeasurements={
  mmb: {
    beneficiary:{
      width:250,
      height:64,
      defaultFontSize:30
    },
    sponsor:{
      width:180,
      height:35,
      defaultFontSize:20
    },
    dateString:{
      width:106,
      height:18,
      defaultFontSize:10
    }
  },
  rebirth: {
    beneficiary:{
      width:265,
      height:60,
      defaultFontSize:30
    },
    sponsor:{
      width:180,
      height:35,
      defaultFontSize:20
    },
    dateString:{
      width:105,
      height:20,
      defaultFontSize:10
    }
  },
  ayw: {
    beneficiary:{
      width:239,
      height:64,
      defaultFontSize:30
    },
    sponsor:{
      width:180,
      height:35,
      defaultFontSize:20
    },
    dateString:{
      width:105,
      height:20,
      defaultFontSize:10
    }
  },
  wmmb: {
    beneficiary:{
      width:260,
      height:101,
      defaultFontSize:45
    },
    sponsor:{
      width:208,
      height:51,
      defaultFontSize:30
    },
    dateString:{
      width:114,
      height:14,
      defaultFontSize:14
    }
  },
  wrebirth: {
    beneficiary:{
      width:232,
      height:93,
      defaultFontSize:45
    },
    sponsor:{
      width:209,
      height:59,
      defaultFontSize:30
    },
    dateString:{
      width:138,
      height:17,
      defaultFontSize:15
    }
  }
}
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
    translate:"20px 27px"
  };

  if (props.isHighlight) {
    svgDivStyle.boxShadow="";
    svgStyle.translate="20.5px 27px"
  }

  // date string box top left (28, 540), top right (134, 540), bottom left (28, 558), bottom right (134, 558)
  return (
     <div style={CARD_STYLE(props)}>
      <div style={svgDivStyle} plaqueId={props.item.id} jotformSubmissionId={props.item.jotformSubmissionId ?? null} >
        <img src={mmb} alt="svg" style={svgStyle} />
        </div>
        <TextOverlay text={props.item.beneficiary} position={{x:105, y:375}} vertical={true} maxHeight={64} maxExtent={250} fontSize={props.item.beneficiaryTextSize} variant="h1" />
        <TextOverlay text={props.item.sponsor} position={{x:56, y:420}} vertical={true} maxExtent={180} maxHeight={35} fontSize={props.item.sponsorTextSize} variant="h2" />
        <TextOverlay text={props.item.dateString} position={{x:102, y:576}} fontSize={props.item.dateStringSize} variant="h6" />
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
  let svgDivStyle=SVG_STYLE('#d2b000');
  let svgStyle={
    height:"564px",
    width:"163px",
    translate:"20px 27px"
  };

  if (props.isHighlight) {
    svgDivStyle.boxShadow="";
    svgStyle.translate="20.5px 27px"
  }

  // beneficiary string box top left (50, 196), top right (110, 195), bottom left (50, 478), bottom right (110, 479)
  return (
     <div style={CARD_STYLE(props)}>
        <div style={svgDivStyle} plaqueId={props.item.id} jotformSubmissionId={props.item.jotformSubmissionId ?? null} >
        <img src={rebirth} alt="svg" style={svgStyle} />
        </div>
        <TextOverlay text={props.item.beneficiary} position={{x:102, y:365}} vertical={true} maxExtent={262} maxHeight={64} fontSize={props.item.beneficiaryTextSize} variant="h1" />
        <TextOverlay text={props.item.sponsor} position={{x:55, y:410}} vertical={true} maxExtent={180} maxHeight={35} fontSize={props.item.sponsorTextSize} variant="h2" />
        <TextOverlay text={props.item.dateString} position={{x:103, y:576}} maxExtent={105} maxHeight={20} fontSize={props.item.dateStringSize} variant="h6" />
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
  let svgDivStyle=SVG_STYLE('#a7fe6f');
  let svgStyle={
    height:"564px",
    width:"163px",
    translate:"20px 27px"
  };

  if (props.isHighlight) {
    svgDivStyle.boxShadow="";
    svgStyle.translate="20.5px 27px"
  }

  return (
     <div style={CARD_STYLE(props)}>
     <div style={svgDivStyle} plaqueId={props.item.id} jotformSubmissionId={props.item.jotformSubmissionId ?? null}>
     <img src={wish} alt="svg" style={svgStyle} />
        </div>
        <TextOverlay text={props.item.beneficiary} position={{x:105, y:349}} vertical={true} maxExtent={249} maxHeight={64} fontSize={props.item.beneficiaryTextSize} variant="h1" />
        <TextOverlay text={props.item.sponsor} position={{x:56, y:380}} vertical={true} maxExtent={180} maxHeight={35} fontSize={props.item.sponsorTextSize} variant="h2" />
        <TextOverlay text={props.item.dateString} position={{x:102, y:574}} maxExtent={110} maxHeight={20} fontSize={props.item.dateStringSize} variant="h6" />
     </div>
  ); 
}

WishPlaque.defaultProps = {
  beneficiary: '',
  sponsor: '',
  dateString: '',
  type: 'ayw'
};

export const W_CARD_HEIGHT = 722;
export const W_CARD_WIDTH = 296;
export const W_CARD_MARGIN = 8;


const W_CARD_STYLE = (props) => ({
  transform: `scale(${ (props.item.targetHeight ) / W_CARD_HEIGHT })`,
  transformOrigin: 'top left',
}); 

const W_SVG_STYLE = (color) => ({
  backgroundColor: color,
  // display: 'inline-block',
  width: W_CARD_WIDTH,
  height: W_CARD_HEIGHT,
  boxShadow: `0 2px 17px 0px ${color}`,
});

 function WMmbPlaque(props) {

    let svgDivStyle=W_SVG_STYLE('#ee203b');
    let svgStyle={
      height:"722px",
      width:"296px"
    };
  
    if (props.isHighlight) {
      svgDivStyle.boxShadow="";
    }
  
    // Beneficiary Text: Top left (98, 274), Top right (200, 273), Bottom left (99, 558), Bottom right (200, 558)
    // Sponsor Text: Top left (39, 351), top right (90, 351), bottom left (39, 560), bottom right (90, 559)
    // date string: top left (91, 652), top right (205, 652), bottom left (91, 666), bottom right (205, 666)
    return (
       <div style={W_CARD_STYLE(props)}>
       <div style={svgDivStyle} plaqueId={props.item.id} jotformSubmissionId={props.item.jotformSubmissionId ?? null}>
       <img src={wmmb} alt="svg" style={svgStyle} />
          </div>
          <TextOverlay text={props.item.beneficiary} position={{x:155, y:410}} vertical={true} maxExtent={285} maxHeight={101} fontSize={props.item.beneficiaryTextSize} variant="h1" />
          <TextOverlay text={props.item.sponsor} position={{x:64, y:455}} vertical={true} maxExtent={208} maxHeight={51} fontSize={props.item.sponsorTextSize} variant="h2" />
          <TextOverlay text={props.item.dateString} position={{x:148, y:659}} maxExtent={114} maxHeight={14} fontSize={props.item.dateStringSize} variant="h6" />
       </div>
    ); 
  } 

  function WRebirthPlaque(props) {

    let svgDivStyle=W_SVG_STYLE('ffcd05');
    let svgStyle={
      height:"722px",
      width:"296px"
    };
  
    if (props.isHighlight) {
      svgDivStyle.boxShadow="";
    }
  
    // Beneficiary Text: Top left (101, 308), Top right (193, 308), Bottom left (101, 555), Bottom right (195, 555)              
    // Sponsor Text: Top left (29, 352), top right (88, 352), bottom left (29, 561), bottom right (89, 561)
    // date string: top left (79, 661), top right (217, 661), bottom left (79, 678), bottom right (217, 678)
    return (
       <div style={W_CARD_STYLE(props)}>
       <div style={svgDivStyle} plaqueId={props.item.id} jotformSubmissionId={props.item.jotformSubmissionId ?? null}>
       <img src={wrebirth} alt="svg" style={svgStyle} />
          </div>
          <TextOverlay text={props.item.beneficiary} position={{x:153, y:426}} vertical={true} maxExtent={253} maxHeight={97} fontSize={props.item.beneficiaryTextSize} variant="h1" />
          <TextOverlay text={props.item.sponsor} position={{x:59, y:456}} vertical={true} maxExtent={209} maxHeight={59} fontSize={props.item.sponsorTextSize} variant="h2" />
          <TextOverlay text={props.item.dateString} position={{x:148, y:669}} maxExtent={138} maxHeight={17} fontSize={props.item.dateStringSize} variant="h6" />
       </div>
    ); 
}

export function PlaqueSelector(props) {
  const type = props.item.type;
  
  // console.log(`render plaque of type=${type}, targetHeight=${props.item.targetHeight}`)
  
  if (type === 'mmb') {
    return MmbPlaque(props);
  } else if (type === 'rebirth') {
    return RebirthPlaque(props);
  } else if (type === 'ayw') {
    return WishPlaque(props);
  }   else if (type === 'wrebirth') {
    return WRebirthPlaque(props);
  } else if (type === 'wmmb') {
    return WMmbPlaque(props);
  } else {
    console.log('Undefined type: ' + type);
    return `undefined: ${type}`;
  }
}

PlaqueSelector.defaultProps = {
  type: 'unspecified',
  targetHeight: CARD_HEIGHT - 2 * CARD_MARGIN
}
