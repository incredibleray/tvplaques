import wmmb from './resources/W_mmb.svg';
import wrebirth from './resources/W_rebirth.svg';
import "./WPlaque.css";
import {SvgFile, TextOverlay} from './SVGOverlay';

export const W_CARD_HEIGHT = 722;
export const W_CARD_WIDTH = 296;
export const W_CARD_MARGIN = 8;

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
          <TextOverlay text={props.item.beneficiary} position={{x:150, y:405}} vertical={true} variantmaxExtent={262} defaultFontSize={45} variant="h1" />
          <TextOverlay text={props.item.sponsor} position={{x:66, y:450}} vertical={true} maxExtent={180} defaultFontSize={30} variant="h2" />
          <TextOverlay text={props.item.dateString} position={{x:146, y:658}} maxExtent={116} defaultFontSize={15} variant="h6" />
       </div>
    ); 
  } 
  // else if (type === 'rebirth') {
  //   return RebirthPlaque(props);
// }

  return <div style={{padding: props.noPadding? 0: W_CARD_MARGIN,}}>{card}</div>
}

export default WPlaque;