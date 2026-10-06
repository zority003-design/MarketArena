import { useEffect, useMemo, useState } from "react";

export type JobMiniGameId = "janitor" | "courier" | "cashier" | "analyst" | "junioranalyst";

type MarketRow = {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  news: string;
};

type Props = {
  jobId: JobMiniGameId;
  title: string;
  basePay: number;
  marketContext?: MarketRow[];
  onComplete: (performance: number) => void;
  onCancel: () => void;
};

type Customer = { price:number; paid:number };
type CaseCompany = MarketRow & { growth:number; profit:number; debt:number; pe:number };

const clamp=(v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
const money=(v:number)=>v.toLocaleString("ru-RU");

function makeCustomers(seed:number):Customer[]{
  return Array.from({length:8},(_,i)=>{
    const price=120+((seed+i*37)%15)*20;
    const change=[20,50,100,200][(seed+i)%4];
    return {price,paid:price+change};
  });
}

function makeAnalystSeries(seed:number){
  return Array.from({length:18},(_,i)=>48+Math.sin((i+seed)*.72)*7+i*.8+(((seed+i*17)%11)-5)*.35);
}

export function JobMiniGame({jobId,title,basePay,marketContext=[],onComplete,onCancel}:Props){
  const seed=useMemo(()=>title.split("").reduce((n,ch)=>n+ch.charCodeAt(0),17),[title]);
  const [score,setScore]=useState(0);
  const [mistakes,setMistakes]=useState(0);
  const [startedAt]=useState(()=>Date.now());
  const [message,setMessage]=useState("Смена начинается. Работай внимательно.");
  const [finished,setFinished]=useState(false);

  const [player,setPlayer]=useState({x:0,y:0});
  const [target,setTarget]=useState(()=>({x:(seed%6),y:Math.floor(seed%5)}));
  const [cleaned,setCleaned]=useState<number[]>([]);
  const [deliveryCount,setDeliveryCount]=useState(0);

  const [customers]=useState(()=>makeCustomers(seed));
  const [customerIndex,setCustomerIndex]=useState(0);

  const [signal,setSignal]=useState(()=>3+(seed%10));
  const [chart,setChart]=useState(()=>makeAnalystSeries(seed));
  const [analystRound,setAnalystRound]=useState(0);

  const marketRows=useMemo(()=>{
    if(marketContext.length)return marketContext.slice(0,8);
    return Array.from({length:5},(_,i)=>({
      ticker:["NDA","VTR","ATL","NFX","RDA"][i],
      name:["Nordex","Vektor","Atlas","Nexum","Radian"][i],
      sector:["Финансы","Технологии","Металлы","Ритейл","Логистика"][i],
      price:100+i*18,
      change:[4.2,-2.8,1.7,-5.1,3.4][i],
      news:["сильный отчёт","снижение спроса","рост производства","слабая маржа","новый контракт"][i]
    }));
  },[marketContext]);

  const caseCompanies=useMemo<CaseCompany[]>(()=>marketRows.slice(0,4).map((c,i)=>({
    ...c,
    growth:Math.round(5+c.change*1.5+(seed+i*11)%12),
    profit:Math.round(70+c.price*.18+(seed*i)%35),
    debt:Math.round(80+(seed+i*17)%180),
    pe:Math.round((7+(seed+i*5)%18)*10)/10
  })),[marketRows,seed]);
  const [caseTarget,setCaseTarget]=useState(0);
  const [caseRound,setCaseRound]=useState(0);

  const grid=useMemo(()=>Array.from({length:30},(_,i)=>({x:i%6,y:Math.floor(i/6),i})),[]);
  const targetIndex=target.y*6+target.x;

  const finish=(bonus=0)=>{
    if(finished)return;
    setFinished(true);
    const elapsed=(Date.now()-startedAt)/1000;
    const speedBonus=elapsed<55?.10:elapsed<90?.05:0;
    const raw=.45+score*.08-mistakes*.07+speedBonus+bonus;
    onComplete(clamp(raw,.25,1));
  };

  const move=(dx:number,dy:number)=>{
    if(finished)return;
    const nx=Math.max(0,Math.min(5,player.x+dx)),ny=Math.max(0,Math.min(4,player.y+dy));
    setPlayer({x:nx,y:ny});
    if(jobId==="courier"&&nx===target.x&&ny===target.y){
      const next=deliveryCount+1;
      setDeliveryCount(next);
      setScore(v=>v+1);
      if(next>=3){setMessage("Все три доставки выполнены.");setTimeout(()=>finish(.10),120);}
      else{
        setMessage("Адрес подтверждён. Следующая доставка.");
        setTarget({x:(seed+next*7+3)%6,y:(seed+next*5+2)%5});
      }
    }
  };

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(jobId!=="courier"&&jobId!=="janitor")return;
      const map:Record<string,[number,number]>={
        ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],
        w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]
      };
      const d=map[e.key];
      if(!d)return;
      e.preventDefault();
      move(d[0],d[1]);
    };
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  });

  const cleanTile=(cell:{x:number;y:number;i:number})=>{
    if(finished)return;
    const distance=Math.abs(cell.x-player.x)+Math.abs(cell.y-player.y);
    if(distance>1){setMessage("Сначала подойди к соседней клетке.");return;}
    if(cleaned.includes(cell.i))return;
    const isTrash=cell.i%7===0||cell.i===targetIndex;
    if(!isTrash){
      setMistakes(v=>v+1);
      setMessage("Здесь чисто. Не трать время на пустую зону.");
      return;
    }
    const next=[...cleaned,cell.i];
    setCleaned(next);
    setScore(v=>v+1);
    setMessage("Мусор убран. Ищи следующую точку.");
    if(next.length>=5)setTimeout(()=>finish(.08),120);
  };

  const serveCustomer=(answer:number)=>{
    if(finished)return;
    const customer=customers[customerIndex];
    if(!customer)return;
    const correct=customer.paid-customer.price;
    if(answer===correct){
      const next=score+1;
      setScore(next);
      setMessage("Сдача верна. Следующий покупатель.");
      if(customerIndex>=customers.length-1){setTimeout(()=>finish(.10),120);return;}
      setCustomerIndex(v=>v+1);
    }else{
      setMistakes(v=>v+1);
      setMessage("Неверная сдача. Пересчитай сумму.");
    }
  };

  const analyst=(i:number)=>{
    if(finished)return;
    if(i===signal){
      const next=analystRound+1;
      setAnalystRound(next);
      setScore(v=>v+1);
      setMessage("Сигнал подтверждён: цена и информационный импульс расходятся с обычным диапазоном.");
      setSignal(3+((signal*7+seed+next*5)%12));
      setChart(c=>c.map((v,j)=>j===i?v+9:v));
      if(next>=4)setTimeout(()=>finish(.10),120);
    }else{
      setMistakes(v=>v+1);
      setMessage("Это обычное движение. Сверь цену, новость и контекст.");
    }
  };

  const evaluateCase=(i:number)=>{
    if(finished)return;
    const c=caseCompanies[i];
    const target=caseCompanies[caseTarget];
    if(!c||!target)return;
    const scoreMetric=(x:CaseCompany)=>x.growth*1.35+x.profit*.035-x.debt*.028-x.pe*.65+(x.change*.35);
    const correct=i===caseTarget && scoreMetric(c)>=scoreMetric(target)-.01;
    if(correct){
      const next=caseRound+1;
      setCaseRound(next);
      setScore(v=>v+1);
      setMessage("Инвестиционный кейс разобран: фундаментал подтверждает выбор.");
      if(next>=3){setTimeout(()=>finish(.14),120);return;}
      setCaseTarget((caseTarget+1+seed)%caseCompanies.length);
    }else{
      setMistakes(v=>v+1);
      setMessage("Решение слабое. Смотри не только на рост: долг, P/E и новость тоже важны.");
    }
  };

  const labels:Record<JobMiniGameId,string>={
    janitor:"Уборка территории",
    courier:"Маршрут доставки",
    cashier:"Касса",
    analyst:"Сигнал рынка",
    junioranalyst:"Инвестиционный кейс"
  };

  return <div className="job-game-backdrop" onClick={onCancel}>
    <div className="job-game-modal premium-job-modal" onClick={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={onCancel}>×</button>
      <div className="job-game-header">
        <div><span className="eyebrow">2D · РАБОЧАЯ СМЕНА · {labels[jobId]}</span><h2>{title}</h2><p>{message}</p></div>
        <div className="job-scoreboard"><span>РЕЗУЛЬТАТ <b>{score}</b></span><span>ОШИБКИ <b>{mistakes}</b></span><span>СТАВКА <b>{money(basePay)} VLR</b></span></div>
      </div>

      {jobId==="courier"&&<div className="job2d-world courier">
        <div className="job2d-skyline"><i/><i/><i/><i/><i/></div>
        <div className="job2d-grid">{grid.map(cell=>{
          const here=player.x===cell.x&&player.y===cell.y;
          const marked=cell.i===targetIndex;
          return <button key={cell.i} className={"job2d-tile "+(marked?"marked ":"")+(here?"player-here":"")} onClick={()=>{
            const dx=cell.x-player.x,dy=cell.y-player.y;
            if(Math.abs(dx)+Math.abs(dy)===1)move(dx,dy);else setMessage("Двигайся по соседней клетке.");
          }}>{cell.i%5===0&&<span className="job2d-building"/>}{marked&&<span className="job2d-marker">⌖</span>}{here&&<span className="job2d-person"/>}</button>;
        })}</div>
        <div className="job2d-controls"><button onClick={()=>move(0,-1)}>↑</button><button onClick={()=>move(-1,0)}>←</button><button onClick={()=>move(1,0)}>→</button><button onClick={()=>move(0,1)}>↓</button></div>
        <small>WASD / стрелки · 3 адреса · лишние шаги снижают качество смены</small>
      </div>}

      {jobId==="janitor"&&<div className="job2d-world streetcleaner">
        <div className="job2d-skyline"><i/><i/><i/><i/><i/></div>
        <div className="job2d-grid">{grid.map(cell=>{
          const here=player.x===cell.x&&player.y===cell.y;
          const marked=!cleaned.includes(cell.i)&&(cell.i%7===0||cell.i===targetIndex);
          return <button key={cell.i} className={"job2d-tile "+(marked?"marked ":"")+(here?"player-here":"")} onClick={()=>cleanTile(cell)}>
            {cell.i%6===2&&<span className="job2d-tree"/>}{marked&&<span className="job2d-marker">✦</span>}{here&&<span className="job2d-person"/>}
          </button>;
        })}</div>
        <div className="job2d-controls"><button onClick={()=>move(0,-1)}>↑</button><button onClick={()=>move(-1,0)}>←</button><button onClick={()=>move(1,0)}>→</button><button onClick={()=>move(0,1)}>↓</button></div>
        <small>Собери 5 зон мусора · сначала подойди к точке · чистые клетки штрафуют</small>
      </div>}

      {jobId==="cashier"&&<div className="job2d-cashier">
        {customers[customerIndex]&&<div className="cashier-ticket"><span>ПОКУПАТЕЛЬ {customerIndex+1}/{customers.length}</span><strong>{money(customers[customerIndex].price)} VLR</strong><small>Оплата: {money(customers[customerIndex].paid)} VLR</small><b>Сдача: {money(customers[customerIndex].paid-customers[customerIndex].price)} VLR</b></div>}
        <div className="cashier-register"><div className="cashier-screen">РАСЧЁТ</div><div className="cashier-options">{[20,50,100,200].map(v=><button key={v} onClick={()=>serveCustomer(v)}>+{money(v)} VLR</button>)}</div><div className="cashier-belt"><i/><i/><i/></div></div>
        <small>8 покупателей · считай сдачу · скорость и точность влияют на оплату</small>
      </div>}

      {jobId==="analyst"&&<div className="job2d-analyst">
        <div className="job2d-chart">{chart.map((v,i)=><button key={i} style={{height:(v+18)+"%"}} className={i===signal?"signal":""} onClick={()=>analyst(i)}><i/></button>)}</div>
        <div className="analyst-feed"><b>ТЕРМИНАЛ · LIVE</b><p>Найди 4 аномалии: сопоставляй график с новостным импульсом и текущей котировкой.</p>{marketRows.slice(0,3).map(c=><div className="analyst-market-row" key={c.ticker}><strong>{c.ticker}</strong><span>{money(c.price)} VLR</span><em className={c.change>=0?"gain":"loss"}>{c.change>=0?"+":""}{c.change.toFixed(2)}%</em><small>{c.news}</small></div>)}</div>
        <small>4 сигнала · ошибки снижают качество смены · данные взяты из текущего рынка</small>
      </div>}

      {jobId==="junioranalyst"&&<div className="job2d-investment">
        <div className="investment-brief"><span>КЕЙС ИНВЕСТИЦИОННОГО АНАЛИТИКА</span><h3>Выбери лучшую инвестиционную идею</h3><p>Сравни рост, прибыль, долг, P/E, текущую динамику и новость. Высокий рост без контроля риска — не автоматически лучший выбор.</p></div>
        <div className="investment-company-grid">{caseCompanies.map((c,i)=><button key={c.ticker} className={i===caseTarget?"case-target":""} onClick={()=>evaluateCase(i)}>
          <b>{c.ticker} · {c.name}</b><span>{c.sector}</span><span>Рост <strong>+{c.growth}%</strong></span><span>Прибыль <strong>{c.profit} млн</strong></span><span>Долг <strong>{c.debt} млн</strong></span><span>P/E <strong>{c.pe}×</strong> · день <strong className={c.change>=0?"gain":"loss"}>{c.change>=0?"+":""}{c.change.toFixed(2)}%</strong></span><small>{c.news}</small>
        </button>)}</div>
        <small>3 кейса · решение должно учитывать фундаментал и новостной фон</small>
      </div>}

      <div className="job-game-bottom"><span>Серия <b>{score}</b> · Ошибки <b>{mistakes}</b></span><span>Результат смены влияет на зарплату, энергию и карьерный XP</span></div>
    </div>
  </div>;
}
