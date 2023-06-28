import wmmb from './resources/W_mmb.svg';
import wrebirth from './resources/W_rebirth.svg';
import "./WPlaque.css";
import {SvgFile, TextOverlay} from './SVGOverlay';

export const W_CARD_HEIGHT = 722;
export const W_CARD_WIDTH = 296;
export const W_CARD_MARGIN = 15;

const CARD_STYLE = (props, shadowColor, noShadow) => ({
  transform: `scale(${ (props.item.targetHeight ) / W_CARD_HEIGHT })`,
  transformOrigin: 'top left',
  width: 'fit-content',
  padding: '0px',
  boxShadow: noShadow? "":`0 5px 35px 0px ${shadowColor}, 0 5px 35px 0px  ${shadowColor}`,
}); 

const SVG_STYLE = {
  display: 'inline-block',
  width: W_CARD_WIDTH,
  height: W_CARD_HEIGHT 
};

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
          <div className="" style={SVG_STYLE}>

          <SvgFile svg={wmmb} />
          </div>
          <TextOverlay text={props.item.beneficiary} position={{x:105, y:375}} vertical={true} variantmaxExtent={262} defaultFontSize={30} variant="h1" />
          <TextOverlay text={props.item.sponsor} position={{x:56, y:420}} vertical={true} maxExtent={180} defaultFontSize={20} variant="h2" />
          <TextOverlay text={props.item.dateString} position={{x:104, y:578}} maxExtent={116} defaultFontSize={10} variant="h6" />
       </div>
    ); 
  } 
  // else if (type === 'rebirth') {
  //   return RebirthPlaque(props);
  // } else if (type === 'wish') {
  //   return WishPlaque(props);
  // } 

  return <div style={{padding: props.noPadding? 0: W_CARD_MARGIN,}}>{card}</div>
}

export default WPlaque;