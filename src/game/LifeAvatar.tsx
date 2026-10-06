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

function AvatarFigure({appearance}:{appearance:Appearance}) {
  const skin="#e7b18f", skinLight="#f1c5a6";
  const hair=appearance==="executive"?"#182329":appearance==="professional"?"#202b32":appearance==="neat"?"#2a353c":"#35434a";
  const shoe=appearance==="executive"?"#101a20":appearance==="professional"?"#16232a":"#1b292f";
  return <svg className="life-avatar-figure" viewBox="0 0 300 430" aria-hidden="true">
    <defs>
      <linearGradient id="avatarSkin" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={skinLight}/><stop offset="1" stopColor={skin}/></linearGradient>
      <linearGradient id="basicCloth" x1="0" x2="1"><stop offset="0" stopColor="#65777d"/><stop offset="1" stopColor="#40545b"/></linearGradient>
      <linearGradient id="neatCloth" x1="0" x2="1"><stop offset="0" stopColor="#31505a"/><stop offset="1" stopColor="#233b44"/></linearGradient>
      <linearGradient id="proCloth" x1="0" x2="1"><stop offset="0" stopColor="#263f49"/><stop offset="1" stopColor="#142932"/></linearGradient>
      <linearGradient id="execCloth" x1="0" x2="1"><stop offset="0" stopColor="#1b2c35"/><stop offset="1" stopColor="#101d24"/></linearGradient>
    </defs>
    <ellipse cx="150" cy="414" rx="72" ry="9" fill="rgba(0,0,0,.25)"/>
    <path d="M112 326v73h31v-73zM157 326v73h31v-73z" fill={appearance==="basic"?"#34474e":"#1c3038"}/>
    <path d="M106 398h43v15h-51q0-10 8-15zM151 398h43q7 5 7 15h-50z" fill={shoe}/>
    {appearance==="basic" && <>
      <path d="M91 224q59-30 118 0l29 106H62z" fill="url(#basicCloth)"/>
      <path d="M106 224q44 23 88 0l12 106H94z" fill="#566970"/>
      <path d="M105 241q45 24 90 0" fill="none" stroke="#82959a" strokeWidth="2"/>
      <path d="M91 236 63 311M209 236l28 75" stroke="#53666d" strokeWidth="19" strokeLinecap="round"/>
    </>}
    {appearance==="neat" && <>
      <path d="M91 224q59-30 118 0l29 106H62z" fill="url(#neatCloth)"/>
      <path d="M112 224 150 265 188 224l-10 106h-56z" fill="#e9eeeb"/>
      <path d="M150 264v65" stroke="#9cb7b3" strokeWidth="2"/>
      <path d="M106 239 91 250M194 239l15 11" stroke="#d7e1de" strokeWidth="2"/>
      <path d="M91 236 62 311M209 236l29 75" stroke="#29414a" strokeWidth="19" strokeLinecap="round"/>
      <path d="M75 279h17M208 279h17" stroke="#b6cbc6" strokeWidth="2" opacity=".65"/>
      <rect x="201" y="289" width="7" height="11" rx="2" fill="#d6bd6f"/>
    </>}
    {appearance==="professional" && <>
      <path d="M91 224q59-30 118 0l29 106H62z" fill="url(#proCloth)"/>
      <path d="M106 224 150 271 194 224l19 106H87z" fill="#edf1ee"/>
      <path d="M115 224 150 263 185 224" fill="none" stroke="#c4d0cc" strokeWidth="2"/>
      <path d="M150 262v68" stroke="#4c666e" strokeWidth="2"/>
      <path d="m144 250 6 12 6-12-6-9z" fill="#66cdb2"/>
      <path d="M91 236 61 311M209 236l30 75" stroke="#1b3039" strokeWidth="21" strokeLinecap="round"/>
      <path d="M73 278h17M210 278h17" stroke="#506a72" strokeWidth="3"/>
      <path d="M58 315q8-5 16 0M226 315q8-5 16 0" stroke="#d2b36a" strokeWidth="3" fill="none"/>
      <path d="M96 327h108" stroke="#75d7bc" strokeWidth="2" opacity=".35"/>
    </>}
    {appearance==="executive" && <>
      <path d="M91 224q59-30 118 0l29 106H62z" fill="url(#execCloth)"/>
      <path d="M110 224 150 268 190 224l-12 106h-56z" fill="#f3efe4"/>
      <path d="M117 224 150 263 183 224" fill="none" stroke="#d5d8d0" strokeWidth="2"/>
      <path d="M150 261v69" stroke="#3d555e" strokeWidth="2"/>
      <path d="m144 249 6 12 6-12-6-10z" fill="#d5b86b"/>
      <path d="M91 236 59 311M209 236l32 75" stroke="#132630" strokeWidth="22" strokeLinecap="round"/>
      <path d="M73 278h18M209 278h18" stroke="#425b64" strokeWidth="3"/>
      <circle cx="66" cy="296" r="3" fill="#d5b86b"/><circle cx="234" cy="296" r="3" fill="#d5b86b"/>
      <rect x="207" y="286" width="11" height="15" rx="2" fill="#172a33" stroke="#d5b86b" strokeWidth="1"/>
      <path d="M95 327h110" stroke="#d5b86b" strokeWidth="2" opacity=".5"/>
    </>}
    <path d="M126 195h48v42q-24 22-48 0z" fill="url(#avatarSkin)"/>
    <ellipse cx="100" cy="137" rx="9" ry="15" fill={skin}/><ellipse cx="200" cy="137" rx="9" ry="15" fill={skin}/>
    <path d="M104 105q6-52 46-58 40 6 46 58v47q-5 57-46 67-41-10-46-67z" fill="url(#avatarSkin)"/>
    <path d="M103 123q-8-55 25-72 36-27 68 2 14 13 5 69l-14-30q-39 12-75-2z" fill={hair}/>
    <path d="M108 91q18-31 48-35 30 4 42 31" fill="none" stroke={hair} strokeWidth="9" strokeLinecap="round"/>
    <path d="M116 128q12-8 24 0M160 128q12-8 24 0" fill="none" stroke="#5d4238" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="130" cy="135" r="3.2" fill="#243238"/><circle cx="170" cy="135" r="3.2" fill="#243238"/>
    <path d="M150 139v23l-7 4h14" fill="none" stroke="#ae7565" strokeWidth="2.6" strokeLinecap="round"/>
    <path d="M135 180q15 8 30 0" fill="none" stroke="#a8665d" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="59" cy="315" r="11" fill="url(#avatarSkin)"/><circle cx="241" cy="315" r="11" fill="url(#avatarSkin)"/>
    {appearance==="professional"&&<rect x="226" y="292" width="10" height="16" rx="2" fill="#17262d" stroke="#9edac7" strokeWidth="1"/>}
    {appearance==="executive"&&<path d="M55 305h13M232 305h13" stroke="#d5b86b" strokeWidth="2"/>}
  </svg>;
}
export function LifeAvatar({appearance,careerTitle,name,housing="studio",food="balanced",transport="public"}:Props){
  const items=[
    {label:"Жильё",value:housingLabels[housing]??housing.toUpperCase(),detail:housing==="premium"?"Комфорт 82 · статус +10":"Комфорт и стоимость жизни"},
    {label:"Одежда",value:labels[appearance],detail:appearance==="executive"?"Переговоры +9 · репутация +12":"Репутация и переговоры"},
    {label:"Питание",value:foodLabels[food]??food.toUpperCase(),detail:food==="premium"?"Энергия 88 · репутация +3":"Восстановление энергии"},
    {label:"Транспорт",value:transportLabels[transport]??transport.toUpperCase(),detail:transport==="executive"?"Мобильность 95 · репутация +10":"Мобильность и рабочая нагрузка"}
  ];
  return <section className={`life-avatar-stage appearance-${appearance} housing-${housing} food-${food} transport-${transport}`} aria-label={`Персонаж ${name}`}>
    <div className="life-avatar-topline"><div><span className="eyebrow">ПЕРСОНАЖ</span><h3>{name}</h3><p>{careerTitle}</p></div><span className="life-avatar-rank">{labels[appearance]}</span></div>
    <div className="life-avatar-portrait"><div className="life-avatar-halo"/><AvatarFigure appearance={appearance}/><div className="life-avatar-ground"/></div>
    <div className="life-avatar-loadout">{items.map(item=><div className="life-loadout-item" key={item.label}><small>{item.label}</small><b>{item.value}</b><span>{item.detail}</span></div>)}</div>
  </section>;
}
