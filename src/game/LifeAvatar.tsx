type Appearance = "basic"|"neat"|"professional"|"executive";
type Props={appearance:Appearance;careerTitle:string;name:string;};

const labels:Record<Appearance,string>={basic:"START",neat:"NEAT",professional:"PRO",executive:"EXEC"};
const variantFor=(name:string)=>name.split("").reduce((n,ch)=>n+ch.charCodeAt(0),0)%3;

export function LifeAvatar({appearance,careerTitle,name}:Props){
  const variant=variantFor(name);
  return <div className={`life-avatar-stage appearance-${appearance} avatar-variant-${variant}`} aria-label={"Персонаж "+name}>
    <div className="life-avatar-shadow"/>
    <div className="life-avatar">
      <div className="avatar-hair"><i/><i/><i/></div>
      <div className="avatar-head"><span className="avatar-ear left"/><span className="avatar-ear right"/><i className="avatar-eye left"/><i className="avatar-eye right"/><b className="avatar-nose"/><span className="avatar-mouth"/></div>
      <div className="avatar-neck"/>
      <div className="avatar-torso"><span className="avatar-collar left"/><span className="avatar-collar right"/><b className="avatar-tie"/><span className="avatar-pocket"/></div>
      <div className="avatar-arm left"/><div className="avatar-arm right"/>
      <div className="avatar-hand left"/><div className="avatar-hand right"/>
      <div className="avatar-leg left"/><div className="avatar-leg right"/>
      <div className="avatar-shoe left"/><div className="avatar-shoe right"/>
    </div>
    <div className="life-avatar-caption"><span>PLAYER · {labels[appearance]}</span><b>{careerTitle}</b></div>
  </div>;
}
