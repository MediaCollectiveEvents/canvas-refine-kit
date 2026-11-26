import original from '@/assets/walk-in/off-air-welcome.png';
import collective from '@/assets/logo.png';
import faultline from '@/assets/event-producers/curated-faultline.png';
import decodeTV from '@/assets/event-producers/curated-decodetv.jpg';
import supporters from '@/assets/event-producers/off-air-supporters.png';
import signalShift from '@/assets/event-producers/signalshift.png';
export default function WalkInHolding(){return <div className="holding-layout" aria-hidden="true">
 <div className="holding-band holding-welcome">WELCOME TO</div>
 <div className="holding-body">
  <div className="holding-event"><svg viewBox="164 174 790 340" preserveAspectRatio="xMidYMid meet"><image href={original} width="1080" height="1920"/></svg></div>
  <section className="holding-group"><h2>FEATURING</h2><svg className="holding-awards" viewBox="140 675 800 100" preserveAspectRatio="xMidYMid meet"><image href={original} width="1080" height="1920"/></svg></section>
  <section className="holding-group"><h2>PRODUCED BY</h2><div className="holding-producers"><div><img className="holding-collective" src={collective} alt=""/></div><div><img src={faultline} alt=""/></div><div><img src={decodeTV} alt=""/></div></div></section>
  <section className="holding-group"><h2>SUPPORTED BY</h2><div className="holding-sponsors">{[330,30,630,930].map(x=><div key={x}><svg viewBox={`${x} 75 280 85`} preserveAspectRatio="xMidYMid meet"><image href={supporters} width="1200" height="200"/></svg></div>)}</div></section>
  <section className="holding-group"><h2>MEDIA PARTNER</h2><img className="holding-media" src={signalShift} alt=""/></section>
 </div>
 <div className="holding-band holding-signoff">NORMAL SERVICE MAY NOT BE RESUMED.</div>
 </div>}
