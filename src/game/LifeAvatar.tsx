type Appearance = "basic"|"neat"|"professional"|"executive";
type Props={
  appearance:Appearance;
  careerTitle:string;
  name:string;
  housing?:string;
  food?:string;
  transport?:string;
};

const labels:Record<Appearance,string>={basic:"START",neat:"NEAT",professional:"PRO",executive:"EXEC"};

const housingLabels:Record<string,string>={
  dormitory:"ОБЩЕЖИТИЕ",
  shared:"ОБЩИЙ ДОМ",
  studio:"СТУДИЯ",
  apartment:"АПАРТАМЕНТЫ",
  premium:"ПРЕМИУМ-ДОМ"
};

const foodLabels:Record<string,string>={
  basic:"БАЗОВОЕ",
  balanced:"СБАЛАНСИРОВАННОЕ",
  healthy:"ЗДОРОВОЕ",
  premium:"ПРЕМИАЛЬНОЕ"
};

const transportLabels:Record<string,string>={
  walk:"ПЕШКОМ",
  public:"ОБЩЕСТВЕННЫЙ",
  bicycle:"ВЕЛОСИПЕД",
  scooter:"СКУТЕР",
  car:"АВТОМОБИЛЬ"
};

export function LifeAvatar({appearance,careerTitle,name,housing="studio",food="balanced",transport="public"}:Props){
  const housingKey=housingLabels[housing]??housing.toUpperCase();
  const foodKey=foodLabels[food]??food.toUpperCase();
  const transportKey=transportLabels[transport]??transport.toUpperCase();

  return <div
    className={`life-avatar-stage appearance-${appearance} housing-${housing} food-${food} transport-${transport}`}
    aria-label={`Персонаж ${name}`}
  >
    <div className="life-scene-glow"/>
    <div className="life-home-scene" aria-hidden="true">
      <div className="life-home-roof"/>
      <div className="life-home-wall"/>
      <div className="life-home-window"/>
      <div className="life-home-door"/>
      <span>{housingKey}</span>
    </div>
    <div className="life-food-scene" aria-hidden="true">
      <div className="life-table"/>
      <div className="life-plate"/>
      <div className="life-food-main"/>
      <div className="life-food-side"/>
      <span>{foodKey}</span>
    </div>
    <div className="life-transport-scene" aria-hidden="true">
      <div className="life-transport-icon"/>
      <span>{transportKey}</span>
    </div>
    <div className="life-avatar-shadow"/>
    <div className="life-avatar">
      <div className="avatar-hair"><i/><i/><i/></div>
      <div className="avatar-head"><span className="avatar-ear left"/><span className="avatar-ear right"/><i className="avatar-brow left"/><i className="avatar-brow right"/><i className="avatar-eye left"/><i className="avatar-eye right"/><b className="avatar-nose"/><span className="avatar-mouth"/></div>
      <div className="avatar-neck"/>
      <div className="avatar-torso"><span className="avatar-collar left"/><span className="avatar-collar right"/><b className="avatar-tie"/><span className="avatar-pocket"/><span className="avatar-shirt-panel"/></div>
      <div className="avatar-arm left"/><div className="avatar-arm right"/>
      <div className="avatar-hand left"/><div className="avatar-hand right"/>
      <div className="avatar-leg left"/><div className="avatar-leg right"/>
      <div className="avatar-shoe left"/><div className="avatar-shoe right"/>
    </div>
    <div className="life-avatar-caption"><span>PLAYER · {labels[appearance]}</span><b>{careerTitle}</b></div>
  </div>;
}
