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

function LifeDetail({type}:{type:"housing"|"food"|"transport"|"appearance"}) {
  const art={
    housing:<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M20 40 60 12l40 28v22H20z" fill="rgba(92,210,177,.10)" stroke="currentColor" strokeWidth="2"/><path d="M50 62V43h20v19M30 39h12M78 39h12" fill="none" stroke="currentColor" strokeWidth="2"/></svg>,
    food:<svg viewBox="0 0 120 70" aria-hidden="true"><ellipse cx="60" cy="45" rx="40" ry="15" fill="rgba(92,210,177,.08)" stroke="currentColor" strokeWidth="2"/><path d="M28 45q32-30 64 0" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="49" cy="40" r="6" fill="currentColor" opacity=".65"/><circle cx="69" cy="37" r="7" fill="currentColor" opacity=".45"/></svg>,
    transport:<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M18 48 29 28q3-7 12-7h38q9 0 12 7l10 20z" fill="rgba(92,210,177,.10)" stroke="currentColor" strokeWidth="2"/><path d="M36 25h48l8 17H28z" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="36" cy="51" r="7" fill="currentColor"/><circle cx="84" cy="51" r="7" fill="currentColor"/></svg>,
    appearance:<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M35 18q25-12 50 0l10 43H25z" fill="rgba(92,210,177,.08)" stroke="currentColor" strokeWidth="2"/><path d="M45 18 60 38 75 18M60 38v23" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M51 29h18" stroke="currentColor" strokeWidth="2"/></svg>
  }[type];
  return <span className="life-detail-art">{art}</span>;
}
function AvatarFigure({appearance}:{appearance:Appearance}) {
  const skin="#e7b18f";
  const skinLight="#f1c5a6";
  const hair=appearance==="executive"?"#1b242b":appearance==="professional"?"#202a31":appearance==="neat"?"#29343b":"#35434a";
  const shirt=appearance==="executive"?"#f2eee4":appearance==="professional"?"#eef2ef":appearance==="neat"?"#e7ece8":"#c9d4d0";
  const jacket=appearance==="executive"?"#172a34":appearance==="professional"?"#243b45":"#40545b";
  const accent=appearance==="executive"?"#d5b86b":appearance==="professional"?"#72d4ba":"#91dec8";

  return <svg className="life-avatar-figure" viewBox="0 0 300 430" aria-hidden="true">
    <defs>
      <linearGradient id="avatarSkin" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={skinLight}/><stop offset="1" stopColor={skin}/></linearGradient>
      <linearGradient id="avatarJacket" x1="0" x2="1"><stop offset="0" stopColor={jacket}/><stop offset="1" stopColor="#16262f"/></linearGradient>
    </defs>

    <ellipse cx="150" cy="414" rx="72" ry="9" fill="rgba(0,0,0,.25)"/>

    {/* legs */}
    <path d="M116 329v70h31v-70zM153 329v70h31v-70z" fill="#1d3038"/>
    <path d="M108 398h43v15h-49q0-10 6-15zM149 398h43q6 5 6 15h-49z" fill="#111d24"/>

    {/* torso / outfit */}
    <path d="M91 224q59-31 118 0l29 108H62z" fill="url(#avatarJacket)"/>
    <path d="M105 225q45 27 90 0l20 107H85z" fill={shirt}/>

    {appearance==="basic" && <path d="M104 226q46 27 92 0l20 106H84z" fill="#52666c"/>}

    {appearance==="neat" && <>
      <path d="M112 224 150 264 188 224l-9 108h-58z" fill="#e7ece8"/>
      <path d="M150 263v68" stroke="#91dec8" strokeWidth="3"/>
      <path d="M112 224 93 244M188 224l19 20" stroke="#526a70" strokeWidth="6" strokeLinecap="round"/>
    </>}

    {appearance==="professional" && <>
      <path d="M105 224 150 271 195 224l20 108H85z" fill="url(#avatarJacket)"/>
      <path d="M116 224 150 264 184 224l-13 108h-34z" fill="#edf1ee"/>
      <path d="M150 261v71" stroke="#4a646b" strokeWidth="2"/>
      <path d="m145 251 5 9 5-9-5-7z" fill={accent}/>
      <path d="M101 229 84 267M199 229l17 38" stroke="#314850" strokeWidth="12" strokeLinecap="round"/>
    </>}

    {appearance==="executive" && <>
      <path d="M101 224 150 274 199 224l25 108H76z" fill="url(#avatarJacket)"/>
      <path d="M112 224 150 264 188 224l-13 108h-50z" fill={shirt}/>
      <path d="M150 261v71" stroke="#d0d8d3" strokeWidth="2"/>
      <path d="m145 250 5 11 5-11-5-8z" fill={accent}/>
      <path d="M99 229 79 267M201 229l20 38" stroke="#172a34" strokeWidth="14" strokeLinecap="round"/>
      <path d="M101 328h98" stroke={accent} strokeWidth="2" opacity=".45"/>
    </>}

    {/* neck */}
    <path d="M126 195h48v42q-24 22-48 0z" fill="url(#avatarSkin)"/>

    {/* ears + face */}
    <ellipse cx="100" cy="137" rx="9" ry="15" fill={skin}/>
    <ellipse cx="200" cy="137" rx="9" ry="15" fill={skin}/>
    <path d="M104 105q6-52 46-58 40 6 46 58v47q-5 57-46 67-41-10-46-67z" fill="url(#avatarSkin)"/>

    {/* hair — no beard */}
    <path d="M103 123q-8-55 25-72 36-27 68 2 14 13 5 69l-14-30q-39 12-75-2z" fill={hair}/>
    <path d="M108 91q18-31 48-35 30 4 42 31" fill="none" stroke={hair} strokeWidth="9" strokeLinecap="round"/>

    {/* face */}
    <path d="M116 128q12-8 24 0M160 128q12-8 24 0" fill="none" stroke="#5d4238" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="130" cy="135" r="3.2" fill="#243238"/><circle cx="170" cy="135" r="3.2" fill="#243238"/>
    <path d="M150 139v23l-7 4h14" fill="none" stroke="#ae7565" strokeWidth="2.6" strokeLinecap="round"/>
    <path d="M135 180q15 8 30 0" fill="none" stroke="#a8665d" strokeWidth="3" strokeLinecap="round"/>

    {/* arms / hands */}
    <path d="M91 236 61 311M209 236l30 75" stroke={jacket} strokeWidth="20" strokeLinecap="round"/>
    <circle cx="59" cy="315" r="11" fill="url(#avatarSkin)"/>
    <circle cx="241" cy="315" r="11" fill="url(#avatarSkin)"/>
  </svg>;
}
export function LifeAvatar({appearance,careerTitle,name,housing="studio",food="balanced",transport="public"}:Props){
  const items=[
    {type:"housing" as const,label:"Жильё",value:housingLabels[housing]??housing.toUpperCase(),effect:housing==="premium"?"Комфорт +82 · статус +10":"Условия жизни влияют на комфорт и репутацию"},
    {type:"appearance" as const,label:"Одежда",value:labels[appearance],effect:appearance==="executive"?"Переговоры +9 · репутация +12":"Внешний вид влияет на репутацию и переговоры"},
    {type:"food" as const,label:"Питание",value:foodLabels[food]??food.toUpperCase(),effect:food==="premium"?"Энергия +88 · репутация +3":"Качество питания определяет восстановление энергии"},
    {type:"transport" as const,label:"Транспорт",value:transportLabels[transport]??transport.toUpperCase(),effect:transport==="executive"?"Мобильность 95 · репутация +10":"Мобильность влияет на стоимость и рабочую нагрузку"}
  ];
  return <section className={`life-avatar-stage appearance-${appearance} housing-${housing} food-${food} transport-${transport}`} aria-label={`Персонаж ${name}`}>
    <div className="life-avatar-topline"><div><span className="eyebrow">ПЕРСОНАЖ</span><h3>{name}</h3><p>{careerTitle}</p></div><span className="life-avatar-rank">{labels[appearance]}</span></div>
    <div className="life-avatar-portrait"><div className="life-avatar-halo"/><AvatarFigure appearance={appearance}/><div className="life-avatar-ground"/></div>
    <div className="life-avatar-loadout">{items.map(item=><div className="life-loadout-item" key={item.type}><LifeDetail type={item.type}/><div><small>{item.label}</small><b>{item.value}</b><span>{item.effect}</span></div></div>)}</div>
  </section>;
}
