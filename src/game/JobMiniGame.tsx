import { useEffect, useMemo, useState } from "react";

type JobId = "streetcleaner" | "courier" | "analyst" | "freelance";

type Props = {
  jobId: JobId;
  title: string;
  basePay: number;
  onComplete: (performance: number) => void;
  onCancel: () => void;
};

const clamp = (v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));

export function JobMiniGame({jobId,title,basePay,onComplete,onCancel}:Props){
  const [startedAt] = useState(()=>Date.now());
  const [score,setScore]=useState(0);
  const [mistakes,setMistakes]=useState(0);
  const [round,setRound]=useState(0);
  const [message,setMessage]=useState("Готовься…");
  const [player,setPlayer]=useState({x:1,y:1});
  const [target,setTarget]=useState({x:4,y:2});
  const [cleaned,setCleaned]=useState<number[]>([]);
  const [chart,setChart]=useState<number[]>(()=>Array.from({length:18},(_,i)=>52+Math.sin(i*.8)*8+i*.9));
  const [signal,setSignal]=useState(()=>Math.floor(Math.random()*12)+3);
  const [task,setTask]=useState(()=>["fix","deploy","audit"][Math.floor(Math.random()*3)]);

  const grid = useMemo(()=>Array.from({length:30},(_,i)=>({x:i%6,y:Math.floor(i/6),i})),[]);
  const targetIndex=target.y*6+target.x;

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(jobId!=="courier" && jobId!=="streetcleaner") return;
      const map:Record<string,[number,number]>={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
      const d=map[e.key]; if(!d)return;
      e.preventDefault();
      move(d[0],d[1]);
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  });

  const finish=()=>{
    const elapsed=(Date.now()-startedAt)/1000;
    const performance=clamp(.45 + score*.12 - mistakes*.07 + (elapsed<65?.08:elapsed<90?.03:0));
    onComplete(performance);
  };

  const move=(dx:number,dy:number)=>{
    const nx=Math.max(0,Math.min(5,player.x+dx)), ny=Math.max(0,Math.min(4,player.y+dy));
    setPlayer({x:nx,y:ny});
    if(nx===target.x&&ny===target.y){
      const nextScore=score+1;
      if(nextScore>=3){setScore(nextScore);setMessage("Маршрут выполнен.");setTimeout(finish,120);return;}
      setScore(nextScore);
      setRound(r=>r+1);
      setMessage(nextScore===2?"Последний адрес.":"Адрес найден.");
      setTarget({x:Math.floor(Math.random()*6),y:Math.floor(Math.random()*5)});
    }
  };

  const clean=(i:number)=>{
    if(cleaned.includes(i))return;
    if(i%7===0 || i===targetIndex){
      const next=[...cleaned,i]; setCleaned(next); setScore(s=>s+1); setMessage("Зона очищена.");
      if(next.length>=5)setTimeout(finish,120);
    }else{
      setMistakes(m=>m+1); setMessage("Здесь чисто — потеря времени.");
    }
  };

  const analyst=(i:number)=>{
    const good=i===signal;
    if(good){
      const next=score+1; setScore(next); setMessage("Сигнал подтверждён.");
      setSignal(Math.floor(Math.random()*12)+3);
      setChart(c=>c.map((v,j)=>v+(j>i?Math.sin(j+i)*1.8:0)));
      if(next>=4)setTimeout(finish,120);
    }else{setMistakes(m=>m+1);setMessage("Ложный сигнал. Проверь импульс ещё раз.");}
  };

  const freelance=(answer:string)=>{
    const good=(task==="fix"&&answer==="CODE")||(task==="deploy"&&answer==="DEPLOY")||(task==="audit"&&answer==="CHECK");
    if(good){
      const next=score+1;setScore(next);setMessage("Задача выполнена.");
      setTask(["fix","deploy","audit"][Math.floor(Math.random()*3)]);
      if(next>=4)setTimeout(finish,120);
    }else{setMistakes(m=>m+1);setMessage("Неверное решение — клиент вернул задачу.");}
  };

  return <div className="job-game-backdrop" onClick={onCancel}>
    <div className="job-game-modal premium-job-modal" onClick={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={onCancel}>×</button>
      <div className="job-game-header">
        <div><span className="eyebrow">2D · РАБОЧАЯ СМЕНА</span><h2>{title}</h2><p>{message}</p></div>
        <div className="job-scoreboard"><span>РЕЗУЛЬТАТ <b>{score}</b></span><span>ОШИБКИ <b>{mistakes}</b></span><span>БАЗА <b>{basePay.toLocaleString("ru-RU")} VLR</b></span></div>
      </div>

      {(jobId==="courier"||jobId==="streetcleaner")&&<div className={"job2d-world "+jobId}>
        <div className="job2d-skyline"><i/><i/><i/><i/><i/></div>
        <div className="job2d-grid">{grid.map(cell=>{
          const here=player.x===cell.x&&player.y===cell.y;
          const marked=jobId==="courier"?cell.i===targetIndex:!cleaned.includes(cell.i)&&(cell.i%7===0);
          return <button key={cell.i} className={"job2d-tile "+(marked?"marked ":"")+(here?"player-here":"")} onClick={()=>{if(jobId==="courier"){const dx=cell.x-player.x,dy=cell.y-player.y;if(Math.abs(dx)+Math.abs(dy)===1)move(dx,dy);else setMessage("Иди по соседним клеткам.");}else clean(cell.i)}} aria-label={marked?"Цель":"Улица"}>
            {jobId==="courier"&&cell.i%5===0&&<span className="job2d-building"/>}
            {jobId==="streetcleaner"&&cell.i%6===2&&<span className="job2d-tree"/>}
            {marked&&<span className="job2d-marker">{jobId==="courier"?"⌖":"✦"}</span>}
            {here&&<span className="job2d-person"/>}
          </button>;
        })}</div>
        <div className="job2d-controls"><button onClick={()=>move(0,-1)}>↑</button><button onClick={()=>move(-1,0)}>←</button><button onClick={()=>move(1,0)}>→</button><button onClick={()=>move(0,1)}>↓</button></div>
        <small>Клавиши WASD/стрелки · 3 правильных действия для завершения смены</small>
      </div>}

      {jobId==="analyst"&&<div className="job2d-analyst">
        <div className="job2d-chart">{chart.map((v,i)=><span key={i} style={{height:(v+18)+"%"}} className={i===signal?"signal":""} onClick={()=>analyst(i)}><i/></span>)}</div>
        <div className="analyst-feed"><b>ТЕРМИНАЛ · LIVE</b><p>Найди столбец, где объём и цена подтверждают импульс.</p><div><span>VOLUME ↑</span><span>PRICE ↑</span><span>RISK {mistakes>1?"HIGH":"LOW"}</span></div></div>
        <small>Выбери 4 подтверждённых сигнала. Ошибка ухудшает итоговую выплату.</small>
      </div>}

      {jobId==="freelance"&&<div className="job2d-freelance">
        <div className="client-brief"><span>CLIENT BRIEF</span><h3>{task==="fix"?"Найди баг в коде":task==="deploy"?"Подготовь релиз":"Проведи проверку данных"}</h3><p>{task==="fix"?"Нужно исправить ошибку перед запуском.":task==="deploy"?"Клиент ждёт рабочую сборку без регрессий.":"Проверь данные перед отправкой отчёта."}</p></div>
        <div className="freelance-options">{["CODE","DEPLOY","CHECK","DESIGN"].map(x=><button key={x} onClick={()=>freelance(x)} className={x===({fix:"CODE",deploy:"DEPLOY",audit:"CHECK"} as Record<string,string>)[task]?"recommended":""}><b>{x}</b><small>{x==="CODE"?"исправить":x==="DEPLOY"?"выпустить":x==="CHECK"?"проверить":"оформить"}</small></button>)}</div>
        <small>Реши 4 задачи клиента. Правильный ответ ускоряет карьерный рост.</small>
      </div>}
      <div className="job-game-bottom"><span>Серия <b>{score}</b> · Ошибки <b>{mistakes}</b></span><span>Успешность влияет на зарплату</span></div>
    </div>
  </div>;
}
