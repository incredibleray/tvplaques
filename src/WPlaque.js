import mmb from './resources/mmb.svg';
import rebirth from './resources/rebirth.svg';
import wish from './resources/ruyi.svg';
import "./WPlaque.css";
import {SvgFile, TextOverlay} from './SVGOverlay';

const CARD_HEIGHT = 612;
const CARD_WIDTH = 204;
const CARD_MARGIN = 20;

const MMB_COLOR = 'red';
const REBIRTH_COLOR = 'yellow';
const WISH_COLOR = 'aquamarine';


const CARD_STYLE = (props, shadowColor, noShadow) => ({
  transform: `scale(${ (props.item.targetHeight ) / CARD_HEIGHT })`,
  transformOrigin: 'top left',
  width: 'fit-content',
  padding: '0px',
  boxShadow: noShadow? "":`0 5px 35px 0px ${shadowColor}, 0 5px 35px 0px  ${shadowColor}`,
}); 

const SVG_STYLE = (color) => ({
  backgroundColor: color,
  display: 'inline-block',
  width: CARD_WIDTH,
  height: CARD_HEIGHT 
});

// export function RebirthPlaque(props) {
//   const paddingStyle=props.noPadding?{}:PADDING_STYLE;
//   let cardStyle=CARD_STYLE(props, '#aaaa00cc');
//   if (props.noPadding) {
//     cardStyle.boxShadow=""
//   }

//   return (
//      <div style={paddingStyle}>
//      <div style={cardStyle}>
//         <div style={SVG_STYLE(REBIRTH_COLOR)}>
//         <SvgFile svg={rebirth} />
//         </div>
//         <TextOverlay text={props.item.beneficiary} position={{x:105, y:375}} vertical={true} maxExtent={262} defaultFontSize={props.item.beneFontSize} variant="h1" />
//         <TextOverlay text={props.item.sponsor} position={{x:57, y:410}} vertical={true} maxExtent={180} defaultFontSize={props.item.sponsorFontSize} variant="h2" />
//         <TextOverlay text={props.item.dateString} position={{x:105, y:578}} maxExtent={105} defaultFontSize={props.item.dateStringFontSize} variant="h6" />
//      </div>
//      </div>
//   ); 
// }

// RebirthPlaque.defaultProps = {
//   beneficiary: '',
//   sponsor: '',
//   dateString: '',
//   type: 'rebirth'
// };

// export function WishPlaque(props) {
//   const paddingStyle=props.noPadding?{}:PADDING_STYLE;
//   let cardStyle=CARD_STYLE(props, '#7fffd4aa');
//   if (props.noPadding) {
//     cardStyle.boxShadow=""
//   }

//   return (
//      <div style={paddingStyle}>
//      <div style={cardStyle}>
//         <div style={SVG_STYLE(WISH_COLOR)}>
//         <SvgFile svg={wish} />
//         </div>
//         <TextOverlay text={props.item.beneficiary} position={{x:105, y:349}} vertical={true} maxExtent={249} defaultFontSize={props.item.beneFontSize} variant="h1" />
//         <TextOverlay text={props.item.sponsor} position={{x:57, y:380}} vertical={true} maxExtent={180} defaultFontSize={props.item.sponsorFontSize} variant="h2" />
//         <TextOverlay text={props.item.dateString} position={{x:105, y:578}} maxExtent={150} defaultFontSize={props.item.dateStringFontSize} variant="h6" />
//      </div>
//      </div>
//   ); 
// }

// WishPlaque.defaultProps = {
//   beneficiary: '',
//   sponsor: '',
//   dateString: '',
//   type: 'wish'
// };

export function WPlaque(props) {
  const type = props.item.type;
  let card=<></>
  if (type=="wmmb") {
    const cardStyle=CARD_STYLE(props, '#aa0000dd', props.noPadding);
    card=(
       <div style={cardStyle}>
          <div className="glow" style={SVG_STYLE(MMB_COLOR)}>

          <SvgFile svg={mmb} />
          </div>
          <TextOverlay text={props.item.beneficiary} position={{x:105, y:375}} vertical={true} variantmaxExtent={262} defaultFontSize={props.item.beneFontSize} variant="h1" />
          <TextOverlay text={props.item.sponsor} position={{x:56, y:420}} vertical={true} maxExtent={180} defaultFontSize={props.item.sponsorFontSize} variant="h2" />
          <TextOverlay text={props.item.dateString} position={{x:104, y:578}} maxExtent={116} defaultFontSize={props.item.dateStringFontSize} variant="h6" lang="en" />
       </div>
    ); 
  } 
  // else if (type === 'rebirth') {
  //   return RebirthPlaque(props);
  // } else if (type === 'wish') {
  //   return WishPlaque(props);
  // } 

  return <div style={{padding: props.noPadding? 0: CARD_MARGIN,}}>{card}</div>
}

export default WPlaque;