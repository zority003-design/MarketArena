type Appearance = "basic"|"neat"|"professional"|"executive";
type Props={appearance:Appearance;careerTitle:string;name:string;housing?:string;food?:string;transport?:string};

const labels:Record<Appearance,string>={basic:"СТАРТ",neat:"АККУРАТНЫЙ",professional:"ПРОФИ",executive:"ТОП-МЕНЕДЖЕР"};
const housingLabels:Record<string,string>={dormitory:"ОБЩЕЖИТИЕ",shared:"ОБЩИЙ ДОМ",studio:"СТУДИЯ",apartment:"АПАРТАМЕНТЫ",premium:"ПРЕМИУМ-ДОМ"};
const foodLabels:Record<string,string>={basic:"БАЗОВОЕ",balanced:"СБАЛАНСИРОВАННОЕ",premium:"ПРЕМИАЛЬНОЕ"};
const transportLabels:Record<string,string>={walk:"ПЕШКОМ",public:"ОБЩЕСТВЕННЫЙ ТРАНСПОРТ",scooter:"СКУТЕР",car:"АВТОМОБИЛЬ",executive:"ПРЕДСТАВИТЕЛЬСКИЙ АВТОМОБИЛЬ"};

function HousingScene({kind}:{kind:string}){
  const common={stroke:"rgba(235,255,249,.72)",strokeWidth:2,strokeLinejoin:"round" as const};
  if(kind==="dormitory") return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><rect x="72" y="35" width="216" height="140" rx="10" fill="#56636e" {...common}/><path d="M60 176h240" stroke="#9bb1b0" strokeWidth="5"/>{Array.from({length:18},(_,i)=><rect key={i} x={92+(i%6)*32} y={52+Math.floor(i/6)*38} width="17" height="22" rx="3" fill={i%3===0?"#8dd8c0":"#27343e"}/>) }<path d="M160 176v-48h40v48" fill="#34424d"/><text x="180" y="198" textAnchor="middle" fill="#d9fff1" fontSize="13">ОБЩЕЖИТИЕ</text></svg>;
  if(kind==="shared") return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><path d="M52 102 105 52l52 50v74H52zM157 102l50-45 101 45v74H157z" fill="#5d746e" {...common}/><path d="M83 176v-44h42v44M198 176v-58h34v58M245 176v-38h30v38" fill="#27353c"/><rect x="78" y="111" width="20" height="18" fill="#9be1c9"/><rect x="177" y="107" width="24" height="19" fill="#9be1c9"/><path d="M30 177h300" stroke="#9bb1b0" strokeWidth="5"/><text x="180" y="198" textAnchor="middle" fill="#d9fff1" fontSize="13">ОБЩИЙ ДОМ</text></svg>;
  if(kind==="studio") return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><path d="M75 176V82l105-50 105 50v94z" fill="#4f6972" {...common}/><path d="M180 32v144M75 82h210" stroke="#a9e1d4" strokeWidth="3"/><rect x="98" y="101" width="52" height="40" rx="5" fill="#1e2c35"/><rect x="210" y="101" width="52" height="40" rx="5" fill="#1e2c35"/><rect x="163" y="128" width="34" height="48" fill="#263a43"/><path d="M45 177h270" stroke="#9bb1b0" strokeWidth="5"/><text x="180" y="198" textAnchor="middle" fill="#d9fff1" fontSize="13">СТУДИЯ</text></svg>;
  if(kind==="apartment") return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><rect x="88" y="28" width="184" height="148" rx="8" fill="#657e87" {...common}/><rect x="110" y="47" width="140" height="7" rx="3" fill="#a9e1d4"/>{Array.from({length:24},(_,i)=><rect key={i} x={108+(i%6)*25} y={67+Math.floor(i/6)*25} width="13" height="15" rx="2" fill={i%4===0?"#b9f0dd":"#25343e"}/>)}<rect x="156" y="132" width="48" height="44" fill="#263a43"/><path d="M50 177h260" stroke="#9bb1b0" strokeWidth="5"/><text x="180" y="198" textAnchor="middle" fill="#d9fff1" fontSize="13">АПАРТАМЕНТЫ</text></svg>;
  return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><path d="M48 177V103l132-70 132 70v74z" fill="#8a9e89" {...common}/><path d="M48 103 180 33l132 70-12 14-120-64-120 64z" fill="#384f4c"/><rect x="78" y="119" width="52" height="58" rx="6" fill="#23333b"/><rect x="151" y="119" width="58" height="58" rx="6" fill="#23333b"/><rect x="229" y="119" width="52" height="58" rx="6" fill="#23333b"/><rect x="92" y="129" width="24" height="18" fill="#c0f3df"/><rect x="244" y="129" width="24" height="18" fill="#c0f3df"/><path d="M28 177h304" stroke="#9bb1b0" strokeWidth="5"/><text x="180" y="198" textAnchor="middle" fill="#e5fff6" fontSize="13">ПРЕМИУМ-ДОМ</text></svg>;
}

function FoodScene({kind}:{kind:string}){
  if(kind==="basic") return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><ellipse cx="180" cy="125" rx="105" ry="42" fill="#283740" stroke="#a6c2bc" strokeWidth="3"/><ellipse cx="180" cy="119" rx="72" ry="27" fill="#8a7659"/><circle cx="155" cy="115" r="16" fill="#b7a16b"/><circle cx="193" cy="113" r="13" fill="#7d9a5c"/><path d="M112 67h54M139 52v28" stroke="#d8c39b" strokeWidth="8" strokeLinecap="round"/><text x="180" y="190" textAnchor="middle" fill="#d9fff1" fontSize="13">БАЗОВОЕ ПИТАНИЕ</text></svg>;
  if(kind==="balanced") return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><ellipse cx="180" cy="121" rx="112" ry="48" fill="#26353e" stroke="#b7dcd2" strokeWidth="3"/><ellipse cx="180" cy="116" rx="80" ry="31" fill="#e4e5d7"/><circle cx="150" cy="112" r="19" fill="#6f9f5c"/><circle cx="204" cy="110" r="17" fill="#cf9c61"/><circle cx="178" cy="128" r="13" fill="#9e604f"/><path d="M105 71h38M124 53v36M253 58v47" stroke="#b7dcd2" strokeWidth="6" strokeLinecap="round"/><text x="180" y="190" textAnchor="middle" fill="#d9fff1" fontSize="13">СБАЛАНСИРОВАННОЕ</text></svg>;
  return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><ellipse cx="180" cy="122" rx="118" ry="50" fill="#25343d" stroke="#c7eadf" strokeWidth="3"/><ellipse cx="180" cy="116" rx="83" ry="33" fill="#f0eee1"/><path d="M145 111q35-35 70 0-35 42-70 0z" fill="#b97848"/><circle cx="151" cy="105" r="10" fill="#78a85e"/><circle cx="210" cy="105" r="11" fill="#6a9955"/><path d="M254 70c20 8 20 30 0 38-20-8-20-30 0-38z" fill="#88bfc1"/><path d="M254 70v58" stroke="#d8eee8" strokeWidth="3"/><text x="180" y="190" textAnchor="middle" fill="#d9fff1" fontSize="13">ПРЕМИАЛЬНОЕ ПИТАНИЕ</text></svg>;
}

function TransportScene({kind}:{kind:string}){
  if(kind==="walk") return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><path d="M80 160h200" stroke="#94aaa7" strokeWidth="7" strokeLinecap="round"/><path d="M128 91c10 18 13 35 4 52M207 91c-10 18-13 35-4 52" stroke="#9be1c9" strokeWidth="10" strokeLinecap="round"/><path d="M120 144q18 16 31 0M209 144q18 16 31 0" fill="none" stroke="#dbeee8" strokeWidth="8" strokeLinecap="round"/><text x="180" y="190" textAnchor="middle" fill="#d9fff1" fontSize="13">ПЕШКОМ</text></svg>;
  if(kind==="public") return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><rect x="67" y="56" width="226" height="108" rx="24" fill="#5d8b82" stroke="#c0e9dd" strokeWidth="3"/><rect x="86" y="74" width="188" height="45" rx="8" fill="#22323a"/>{Array.from({length:5},(_,i)=><rect key={i} x={94+i*34} y="82" width="25" height="28" rx="3" fill="#83b9c0"/>)}<circle cx="110" cy="164" r="18" fill="#17242b"/><circle cx="250" cy="164" r="18" fill="#17242b"/><text x="180" y="194" textAnchor="middle" fill="#d9fff1" fontSize="13">ОБЩЕСТВЕННЫЙ ТРАНСПОРТ</text></svg>;
  if(kind==="scooter") return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><circle cx="112" cy="153" r="25" fill="#18252c" stroke="#b8dcd3" strokeWidth="3"/><circle cx="248" cy="153" r="25" fill="#18252c" stroke="#b8dcd3" strokeWidth="3"/><path d="M112 153h82l25-62h26M194 153l-16-71M178 82h27" fill="none" stroke="#82c9b5" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/><text x="180" y="194" textAnchor="middle" fill="#d9fff1" fontSize="13">СКУТЕР</text></svg>;
  if(kind==="car") return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><path d="M68 145 94 94q9-18 29-18h116q20 0 29 18l24 51z" fill="#527b82" stroke="#c2e9df" strokeWidth="3"/><path d="M110 91h140l18 40H92z" fill="#20313a"/><path d="M68 145h224v24H68z" fill="#2d4149"/><circle cx="111" cy="169" r="21" fill="#16232a"/><circle cx="249" cy="169" r="21" fill="#16232a"/><text x="180" y="198" textAnchor="middle" fill="#d9fff1" fontSize="13">АВТОМОБИЛЬ</text></svg>;
  return <svg className="life-scene-art" viewBox="0 0 360 210" aria-hidden="true"><path d="M50 146 88 89q11-20 35-20h122q24 0 36 20l29 57z" fill="#718f87" stroke="#d7fff2" strokeWidth="3"/><path d="M107 88h146l22 43H85z" fill="#182931"/><path d="M50 146h260v25H50z" fill="#324950"/><circle cx="104" cy="171" r="22" fill="#111b21"/><circle cx="256" cy="171" r="22" fill="#111b21"/><path d="M150 151h60" stroke="#c3f0e1" strokeWidth="3"/><text x="180" y="198" textAnchor="middle" fill="#e5fff6" fontSize="13">ПРЕДСТАВИТЕЛЬСКИЙ АВТОМОБИЛЬ</text></svg>;
}

export function LifeAvatar({appearance,careerTitle,name,housing="studio",food="balanced",transport="public"}:Props){
  const housingKey=housingLabels[housing]??housing.toUpperCase();
  const foodKey=foodLabels[food]??food.toUpperCase();
  const transportKey=transportLabels[transport]??transport.toUpperCase();
  return <div className={`life-avatar-stage appearance-${appearance} housing-${housing} food-${food} transport-${transport}`} aria-label={`Персонаж ${name}`}>
    <div className="life-scene-glow"/>
    <div className="life-home-scene" aria-hidden="true"><HousingScene kind={housing}/><span>{housingKey}</span></div>
    <div className="life-food-scene" aria-hidden="true"><FoodScene kind={food}/><span>{foodKey}</span></div>
    <div className="life-transport-scene" aria-hidden="true"><TransportScene kind={transport}/><span>{transportKey}</span></div>
    <div className="life-avatar-shadow"/>
    <div className="life-avatar">
      <div className="avatar-hair"><i/><i/><i/></div>
      <div className="avatar-head"><span className="avatar-ear left"/><span className="avatar-ear right"/><i className="avatar-brow left"/><i className="avatar-brow right"/><i className="avatar-eye left"/><i className="avatar-eye right"/><b className="avatar-nose"/><span className="avatar-mouth"/></div>
      <div className="avatar-neck"/>
      <div className="avatar-torso"><span className="avatar-collar left"/><span className="avatar-collar right"/><b className="avatar-tie"/><span className="avatar-pocket"/><span className="avatar-shirt-panel"/></div>
      <div className="avatar-arm left"/><div className="avatar-arm right"/><div className="avatar-hand left"/><div className="avatar-hand right"/>
      <div className="avatar-leg left"/><div className="avatar-leg right"/><div className="avatar-shoe left"/><div className="avatar-shoe right"/>
    </div>
    <div className="life-avatar-caption"><span>ИГРОК · {labels[appearance]}</span><b>{careerTitle}</b></div>
  </div>;
}
