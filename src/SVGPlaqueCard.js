import mmb from './resources/mmb.svg';
import rebirth from './resources/rebirth.svg';
import wish from './resources/ruyi.svg';

import {SvgFile, TextOverlay} from './SVGOverlay';

export const CARD_HEIGHT = 612;
export const CARD_WIDTH = 204;
export const CARD_MARGIN = 1;

const MMB_COLOR = 'red';
const REBIRTH_COLOR = 'yellow';
const WISH_COLOR = 'aquamarine';


const CARD_STYLE = (props, shadowColor) => ({
  transform: `scale(${ (props.item.targetHeight ) / CARD_HEIGHT })`,
  transformOrigin: 'top left',
  // width: 'fit-content',
  // padding: '0px',
  boxShadow: `0 5px 35px 0px ${shadowColor}, 0 5px 35px 0px  ${shadowColor}`
}); 

const PADDING_STYLE = {
  // padding: CARD_MARGIN,
  backgroundColor: 'black'
};

const SVG_STYLE = (color) => ({
  backgroundColor: color,
  display: 'inline-block',
  width: CARD_WIDTH,
  height: CARD_HEIGHT 
});

export function MmbPlaque(props) {
  const paddingStyle=props.noPadding?{}:PADDING_STYLE;
  let cardStyle=CARD_STYLE(props, '#ee203b');
  if (props.noPadding) {
    cardStyle.boxShadow=""
  }

  return (
     <div style={paddingStyle}>
     <div style={cardStyle}>
        <div style={SVG_STYLE('#ee203b')}>
        <SvgFile svg={mmb} />
        </div>
        <TextOverlay text={props.item.beneficiary} position={{x:105, y:375}} vertical={true} variantmaxExtent={262} defaultFontSize={30} variant="h1" />
        <TextOverlay text={props.item.sponsor} position={{x:56, y:420}} vertical={true} maxExtent={180} defaultFontSize={20} variant="h2" />
        <TextOverlay text={props.item.dateString} position={{x:104, y:578}} maxExtent={116} defaultFontSize={10} variant="h6" lang="en" />
     </div>
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
  const paddingStyle=props.noPadding?{}:PADDING_STYLE;
  let cardStyle=CARD_STYLE(props, '#ffcd05');
  if (props.noPadding) {
    cardStyle.boxShadow=""
  }

  // TODO: change the color in SVG_STYLE to '#ffcd05' once the svg template is fixed.
  return (
     <div style={paddingStyle}>
     <div style={cardStyle}>
        <div style={SVG_STYLE('yellow')}>
        <SvgFile svg={rebirth} />
        </div>
        <TextOverlay text={props.item.beneficiary} position={{x:105, y:365}} vertical={true} maxExtent={262} defaultFontSize={30} variant="h1" />
        <TextOverlay text={props.item.sponsor} position={{x:57, y:410}} vertical={true} maxExtent={180} defaultFontSize={20} variant="h2" />
        <TextOverlay text={props.item.dateString} position={{x:105, y:578}} maxExtent={105} defaultFontSize={10} variant="h6" />
     </div>
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
  const paddingStyle=props.noPadding?{}:PADDING_STYLE;
  let cardStyle=CARD_STYLE(props, '#47c8f5');
  if (props.noPadding) {
    cardStyle.boxShadow=""
  }

  return (
     <div style={paddingStyle}>
     <div style={cardStyle}>
        <div style={{  backgroundColor: "#47c8f5",
  display: 'inline-block',
  width: 202,
  height: CARD_HEIGHT }}>
        <SvgFile svg={wish} />
        </div>
        <TextOverlay text={props.item.beneficiary} position={{x:105, y:349}} vertical={true} maxExtent={249} defaultFontSize={30} variant="h1" />
        <TextOverlay text={props.item.sponsor} position={{x:57, y:380}} vertical={true} maxExtent={180} defaultFontSize={20} variant="h2" />
        <TextOverlay text={props.item.dateString} position={{x:100, y:575}} maxExtent={150} defaultFontSize={10} variant="h6" />
     </div>
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
