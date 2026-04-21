"use client"; 
import { useState, useRef, useEffect } from "react";

const MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS=Array.from({length:31},(_,i)=>String(i+1).padStart(2,"0"));
const YEARS=Array.from({length:81},(_,i)=>2010-i);
const HOURS=Array.from({length:24},(_,i)=>String(i).padStart(2,"0"));
const MINS=Array.from({length:60},(_,i)=>String(i).padStart(2,"0"));
const TZ=["UTC-12:00","UTC-11:00","UTC-10:00","UTC-09:00","UTC-08:00 (PST)","UTC-07:00 (MST)","UTC-06:00 (CST)","UTC-05:00 (EST)","UTC-04:00","UTC-03:00","UTC-02:00","UTC-01:00","UTC+00:00 (GMT)","UTC+01:00 (CET)","UTC+02:00 (EET)","UTC+03:00","UTC+03:30","UTC+04:00","UTC+04:30","UTC+05:00 (PKT)","UTC+05:30 (IST)","UTC+05:45","UTC+06:00","UTC+06:30","UTC+07:00","UTC+08:00 (CST)","UTC+09:00 (JST)","UTC+09:30","UTC+10:00 (AEST)","UTC+11:00","UTC+12:00 (NZST)"];
const NC={auspicious:"#c9a96e",adverse:"#c77080",intense:"#9b7ec8",neutral:"#6ec9b5"};
const NB={auspicious:"rgba(201,169,110,.08)",adverse:"rgba(199,112,128,.08)",intense:"rgba(155,126,200,.09)",neutral:"rgba(110,201,181,.06)"};
const CK={rose:"#c77080",teal:"#6ec9b5",purple:"#9b7ec8",gold:"#c9a96e"};
const TABS=[{k:"chart",l:"✦ chart"},{k:"self",l:"☽ self"},{k:"dasha",l:"◈ dasha"},{k:"weekly",l:"◷ weekly"},{k:"today",l:"☀ today"}],{k:"chat",l:"✦ ask"},{k:"compat",l:"♡ match"}];

async function callClaude(prompt,system,messages){
    const body={model:"claude-sonnet-4-20250514",max_tokens:5000};
  if(system)body.system=system;
  body.messages=messages||[{role:"user",content:prompt}];
  const r=await fetch("/api/claude",{
    method:"POST",
    headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01"},
    body:JSON.stringify(body)
  });
  if(!r.ok){const e=await r.text();throw new Error(`API ${r.status}: ${e}`);}
  const d=await r.json();
  return d.content[0].text;
}
function pj(t){return JSON.parse(t.replace(/```json|```/g,"").trim())}
function today(){return new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}

function readingPrompt(f){
  return `You are a master Vedic astrologer using Lahiri Ayanamsha. Generate a detailed personalized reading for:\nName:${f.name}, DOB:${f.day} ${f.month} ${f.year}, Time:${f.hour}:${f.min}, TZ:${f.timezone}, Place:${f.place}, Today:${today()}\n\nBe accurate and specific. Return ONLY valid JSON, no markdown or backticks:\n{"chart":{"lagna":{"name":"Taurus","sanskrit":"Vrishabha","glyph":"♉","degree":"22°14'"},"moonSign":{"name":"Pisces","sanskrit":"Meena","glyph":"♓","degree":"14°07'"},"sunSign":{"name":"Capricorn","sanskrit":"Makar","glyph":"♑","degree":"8°22'"},"nakshatra":{"name":"Uttara Bhadrapada","pada":"4","ruler":"Saturn","symbol":"Twin funeral cots"},"planets":[{"planet":"Sun","sign":"Capricorn","house":"9th","glyph":"☉","nature":"neutral"},{"planet":"Moon","sign":"Pisces","house":"11th","glyph":"☽","nature":"auspicious"},{"planet":"Mars","sign":"Virgo","house":"5th","glyph":"♂","nature":"neutral"},{"planet":"Mercury","sign":"Capricorn","house":"9th","glyph":"☿","nature":"auspicious"},{"planet":"Jupiter","sign":"Gemini","house":"2nd","glyph":"♃","nature":"auspicious"},{"planet":"Venus","sign":"Taurus","house":"1st","glyph":"♀","nature":"auspicious"},{"planet":"Saturn","sign":"Pisces","house":"11th","glyph":"♄","nature":"neutral"},{"planet":"Rahu","sign":"Aquarius","house":"10th","glyph":"☊","nature":"intense"},{"planet":"Ketu","sign":"Leo","house":"4th","glyph":"☋","nature":"intense"}]},"personality":[{"title":"Lagna — Rising Sign","icon":"♉","body":"Detailed personality description..."},{"title":"Moon Sign Nature","icon":"♓","body":"Detailed emotional nature..."},{"title":"Nakshatra Energy","icon":"✦","body":"Detailed nakshatra description..."},{"title":"Sun Sign Purpose","icon":"☉","body":"Detailed solar purpose..."}],"mahadasha":{"current":"Ketu Mahadasha","antardasha":"Mercury Antardasha","period":"Through November 2026","description":"Detailed dasha description...","nextDasha":{"name":"Venus","years":"20 years","preview":"Detailed preview of next dasha..."},"timeline":[{"dasha":"Saturn","years":"1999–2002","status":"past"},{"dasha":"Mercury","years":"2002–2019","status":"past"},{"dasha":"Ketu","years":"2019–2026","status":"active"},{"dasha":"Venus","years":"2026–2046","status":"future"},{"dasha":"Sun","years":"2046–2052","status":"future"}]},"transits":[{"planet":"Sun ☉","sign":"Aries","house":"12th","nature":"adverse","effect":"Brief effect for this lagna..."},{"planet":"Venus ♀","sign":"Taurus","house":"1st","nature":"auspicious","effect":"Brief effect..."},{"planet":"Mercury ☿","sign":"Pisces","house":"11th","nature":"auspicious","effect":"Brief effect..."},{"planet":"Mars ♂","sign":"Pisces","house":"11th","nature":"neutral","effect":"Brief effect..."},{"planet":"Jupiter ♃","sign":"Gemini","house":"2nd","nature":"auspicious","effect":"Brief effect..."},{"planet":"Saturn ♄","sign":"Pisces","house":"11th","nature":"neutral","effect":"Brief effect..."},{"planet":"Rahu ☊","sign":"Aquarius","house":"10th","nature":"intense","effect":"Brief effect..."},{"planet":"Ketu ☋","sign":"Leo","house":"4th","nature":"adverse","effect":"Brief effect..."}],"weeklyForecast":[{"area":"Love & Relationships","icon":"♀","colorKey":"rose","w1t":"Week 1","w1":"Detailed week 1...","w2t":"Week 2","w2":"Detailed week 2..."},{"area":"Career & Finance","icon":"♃","colorKey":"teal","w1t":"Week 1","w1":"Detailed...","w2t":"Week 2","w2":"Detailed..."},{"area":"Health & Energy","icon":"♄","colorKey":"purple","w1t":"Week 1","w1":"Detailed...","w2t":"Week 2","w2":"Detailed..."},{"area":"Spiritual Growth","icon":"✦","colorKey":"gold","w1t":"Week 1","w1":"Detailed...","w2t":"Week 2","w2":"Detailed..."}],"summary":"A compelling 2-sentence cosmic summary for this person right now..."}`;
}

function dailyPrompt(f,r){
  return `Vedic daily horoscope for ${f.name}. Lagna:${r.chart.lagna.name}, Moon:${r.chart.moonSign.name}, Nakshatra:${r.chart.nakshatra.name}, Dasha:${r.mahadasha.current}/${r.mahadasha.antardasha}. Today:${today()}. Current Apr 2026 transits: Venus Taurus, Jupiter Gemini direct, Saturn Pisces, Mars Pisces, Mercury Pisces, Sun Aries, Rahu Aquarius, Ketu Leo.\nReturn ONLY valid JSON no markdown:\n{"date":"${today()}","overallEnergy":"one-line vibe for the day","energyScore":7,"sections":[{"area":"Overall Vibe","icon":"✦","text":"Specific today text..."},{"area":"Love & Connections","icon":"♀","text":"Specific today text..."},{"area":"Work & Focus","icon":"♃","text":"Specific today text..."},{"area":"Body & Energy","icon":"☽","text":"Specific today text..."}],"cosmicTip":"One specific actionable tip for today...","affirmation":"A powerful affirmation for today...","luckyColor":"Deep Sapphire","luckyNumber":"7","powerTime":"2–4 PM"}`;
}

function compatPrompt(p1,p2,r1,relType){
  return `Vedic astrologer. Analyse ${relType} compatibility between:\nPerson 1: ${p1.name}, Lagna:${r1.chart.lagna.name}, Moon:${r1.chart.moonSign.name}, Sun:${r1.chart.sunSign.name}, Nakshatra:${r1.chart.nakshatra.name}, Dasha:${r1.mahadasha.current}\nPerson 2: ${p2.name}, born ${p2.day} ${p2.month} ${p2.year} at ${p2.hour}:${p2.min} in ${p2.place} (${p2.timezone})\nAnalyse Kuta points, moon sign compatibility, Venus-Mars interplay${relType==="romantic"?", navamsa synastry":""}, and dasha overlaps.\nReturn ONLY valid JSON no markdown:\n{"score":78,"verdict":"A poetic two-sentence cosmic verdict...","sections":[{"area":"Emotional Bond","score":8,"icon":"☽","text":"Detailed..."},{"area":"Communication","score":7,"icon":"☿","text":"Detailed..."},{"area":"${relType==="romantic"?"Physical & Romantic":"Trust & Reliability"}","score":9,"icon":"${relType==="romantic"?"♀":"♃"}","text":"Detailed..."},{"area":"Life Goals","score":6,"icon":"♃","text":"Detailed..."},{"area":"Spiritual Alignment","score":8,"icon":"✦","text":"Detailed..."}],"strengths":["...","...","..."],"challenges":["...","..."],"remedies":["...","..."]}`;
}

function chatSys(f,r){
  return `You are Kozmik, a warm and insightful Vedic astrologer AI with a modern, Gen Z-friendly voice. You know this person's complete chart:\nName:${f.name}, Born:${f.day} ${f.month} ${f.year} at ${f.hour}:${f.min} in ${f.place} (${f.timezone})\nLagna:${r.chart.lagna.name} (${r.chart.lagna.sanskrit}), Moon:${r.chart.moonSign.name}, Sun:${r.chart.sunSign.name}, Nakshatra:${r.chart.nakshatra.name} Pada ${r.chart.nakshatra.pada}\nDasha:${r.mahadasha.current} / ${r.mahadasha.antardasha} — ${r.mahadasha.period}\nCurrent transits Apr 2026: Venus in Taurus (1st house for this lagna), Jupiter Gemini (2nd), Saturn Pisces Sadhesati peak on Moon, Rahu Aquarius (10th), Ketu Leo (4th), Mars+Mercury Pisces (11th), Sun Aries (12th).\nAnswer questions specifically referencing their actual chart placements. Be warm, insightful, and conversational. Use ✦ ☽ ♀ ♃ sparingly.`;
}

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');
*{box-sizing:border-box}
@keyframes twink{0%,100%{opacity:.12}50%{opacity:.85}}
@keyframes fadeup{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes kspin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes kblink{0%,100%{opacity:1}50%{opacity:0}}
.gt{background:linear-gradient(135deg,#c9a96e,#f0d898,#c9a96e);background-size:200%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmer 4s linear infinite}
.kc{background:rgba(255,255,255,.038);border:1px solid rgba(201,169,110,.16);border-radius:14px;padding:20px;transition:border-color .3s}
.kc:hover{border-color:rgba(201,169,110,.3)}
.ki{width:100%;background:rgba(8,6,18,.82);border:1px solid rgba(201,169,110,.22);border-radius:9px;padding:10px 13px;color:#e8e0d0;font-family:'DM Sans',sans-serif;font-size:14px;outline:none;color-scheme:dark;transition:border-color .2s;-webkit-appearance:none;appearance:none;box-sizing:border-box}
.ki:focus{border-color:#c9a96e;background:rgba(201,169,110,.06)}
.ki::placeholder{color:#444}
select.ki{cursor:pointer;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23c9a96e' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px}
select.ki option{background:#0f0f1a;color:#e8e0d0}
.kl{font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:#777;margin-bottom:5px;font-family:'DM Mono',monospace;display:block}
.kb{background:linear-gradient(135deg,rgba(201,169,110,.15),rgba(201,169,110,.28));border:1px solid #c9a96e;border-radius:50px;color:#c9a96e;cursor:pointer;font-family:'DM Mono',monospace;font-size:12px;letter-spacing:.09em;padding:11px 24px;transition:all .3s}
.kb:hover:not([disabled]){background:rgba(201,169,110,.32);box-shadow:0 0 18px rgba(201,169,110,.25);transform:translateY(-1px)}
.kb[disabled]{opacity:.38;cursor:not-allowed;transform:none}
.kg{background:none;border:1px solid rgba(255,255,255,.09);border-radius:50px;color:#777;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;padding:6px 14px;transition:all .2s;letter-spacing:.05em}
.kg:hover{border-color:rgba(201,169,110,.3);color:#c9a96e}
.kt{background:none;border:1px solid transparent;border-radius:50px;color:#555;cursor:pointer;font-family:'DM Mono',monospace;font-size:11px;letter-spacing:.06em;padding:6px 12px;transition:all .25s;white-space:nowrap}
.kt:hover{color:#888;border-color:rgba(201,169,110,.18)}
.kt.on{background:rgba(201,169,110,.12);border-color:rgba(201,169,110,.33);color:#c9a96e}
.ks{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px;margin-bottom:18px}
.ks::-webkit-scrollbar{display:none}
.kchip{display:inline-block;padding:3px 11px;border-radius:20px;font-size:10px;font-family:'DM Mono',monospace;background:rgba(201,169,110,.1);border:1px solid rgba(201,169,110,.22);color:#c9a96e}
.kdiv{height:1px;background:linear-gradient(90deg,transparent,rgba(201,169,110,.25),transparent);margin:14px 0}
.kload{display:inline-flex;gap:5px;align-items:center}
.kload span{width:5px;height:5px;border-radius:50%;background:#c9a96e;animation:kblink 1.4s ease-in-out infinite}
.kload span:nth-child(2){animation-delay:.2s}
.kload span:nth-child(3){animation-delay:.4s}
.buu{background:rgba(201,169,110,.11);border:1px solid rgba(201,169,110,.22);border-radius:15px 15px 4px 15px;padding:10px 14px;max-width:80%;align-self:flex-end;font-size:14px;line-height:1.65;color:#e8e0d0;word-break:break-word}
.bua{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:15px 15px 15px 4px;padding:10px 14px;max-width:88%;align-self:flex-start;font-size:14px;line-height:1.72;color:#c0b8aa;word-break:break-word}
.kan{animation:fadeup .4s ease both}
`;

function Stars(){
  return(
    <div style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",overflow:"hidden"}}>
      {Array.from({length:80},(_,i)=>(
        <div key={i} style={{position:"absolute",borderRadius:"50%",width:i%8===0?2:1,height:i%8===0?2:1,background:`rgba(255,255,255,${.12+(i%5)*.08})`,top:`${(i*37.3)%100}%`,left:`${(i*61.8)%100}%`,animation:`twink ${2.5+(i%4)}s ease-in-out ${(i*.27)%4.5}s infinite`}}/>
      ))}
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:700,height:700,borderRadius:"50%",background:"radial-gradient(circle,rgba(80,40,130,.07) 0%,rgba(190,90,30,.04) 45%,transparent 70%)"}}/>
    </div>
  );
}

function Logo({size=26}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:size+2,color:"#c9a96e",animation:"kspin 32s linear infinite",display:"inline-block"}}>✺</span>
      <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:size,fontWeight:300,letterSpacing:".1em",color:"#e8e0d0"}}><span className="gt">koz</span>mik</span>
    </div>
  );
}

function Sel({label,value,onChange,options,ph="select"}){
  return(
    <div>
      <label className="kl">{label}</label>
      <select className="ki" value={value} onChange={e=>onChange(e.target.value)}>
        <option value="">{ph}</option>
        {options.map(o=>{const v=o.v!==undefined?o.v:String(o),l=o.l||String(o);return <option key={v} value={v}>{l}</option>})}
      </select>
    </div>
  );
}

const EF={name:"",day:"",month:"",year:"",hour:"",min:"",timezone:"UTC+05:30 (IST)",place:""};

function BirthForm({onSubmit,loading,error,compact=false,submitLabel}){
  const [f,setF]=useState({...EF});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const ok=f.name&&f.day&&f.month&&f.year&&f.hour&&f.min&&f.place;
  return(
    <div style={compact?{}:{maxWidth:480,margin:"0 auto",padding:"0 16px"}}>
      {!compact&&(
        <div style={{textAlign:"center",marginBottom:36,animation:"fadeup .6s ease both"}}>
          <Logo size={38}/>
          <div style={{marginTop:14}}>
            <span style={{background:"rgba(201,169,110,.09)",border:"1px solid rgba(201,169,110,.22)",borderRadius:20,padding:"4px 16px",fontSize:11,fontFamily:"'DM Mono',monospace",color:"#c9a96e",letterSpacing:".11em"}}>VEDIC ASTROLOGY × AI</span>
          </div>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:300,color:"#666",margin:"12px 0 0",letterSpacing:".04em"}}>your cosmos, decoded.</p>
        </div>
      )}
      <div className={compact?"":"kc kan"} style={compact?{display:"grid",gap:13}:{animationDelay:".15s"}}>
        <div style={compact?{}:{display:"grid",gap:13}}>
          <div>
            <label className="kl">name</label>
            <input className="ki" type="text" placeholder="Full name" value={f.name} onChange={e=>s("name",e.target.value)}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1.5fr",gap:8}}>
            <Sel label="day" value={f.day} onChange={v=>s("day",v)} options={DAYS}/>
            <Sel label="month" value={f.month} onChange={v=>s("month",v)} options={MONTHS.map(m=>({v:m,l:m}))}/>
            <Sel label="year" value={f.year} onChange={v=>s("year",v)} options={YEARS.map(y=>({v:String(y),l:String(y)}))}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Sel label="hour (24h)" value={f.hour} onChange={v=>s("hour",v)} options={HOURS.map(h=>({v:h,l:`${h}:00`}))}/>
            <Sel label="minute" value={f.min} onChange={v=>s("min",v)} options={MINS.map(m=>({v:m,l:`:${m}`}))}/>
          </div>
          <Sel label="timezone" value={f.timezone} onChange={v=>s("timezone",v)} options={TZ}/>
          <div>
            <label className="kl">place of birth</label>
            <input className="ki" type="text" placeholder="e.g. Mumbai, India" value={f.place} onChange={e=>s("place",e.target.value)}/>
          </div>
          {error&&<div style={{color:"#c77080",fontSize:13,textAlign:"center",lineHeight:1.5}}>⚠ {error}</div>}
          <button className="kb" disabled={!ok||loading} onClick={()=>onSubmit(f)} style={{width:"100%",marginTop:4}}>
            {loading
              ?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><span className="kload"><span/><span/><span/></span>{compact?"generating...":"reading the stars..."}</span>
              :(submitLabel||"✦ reveal my chart")}
          </button>
        </div>
      </div>
      {!compact&&<p style={{textAlign:"center",fontSize:10,color:"#444",marginTop:14,fontFamily:"'DM Mono',monospace",letterSpacing:".06em"}}>lahiri ayanamsha · sidereal zodiac · vimshottari dasha</p>}
    </div>
  );
}

export default function App(){
  const [view,setView]=useState("form");
  const [uInfo,setUInfo]=useState(null);
  const [reading,setReading]=useState(null);
  const [err,setErr]=useState(null);
  const [loading,setLoading]=useState(false);
  const [tab,setTab]=useState("chart");
  const [exp,setExp]=useState({});
  const [daily,setDaily]=useState(null);
  const [dailyLoad,setDailyLoad]=useState(false);
  const [msgs,setMsgs]=useState([]);
  const [chatIn,setChatIn]=useState("");
  const [chatLoad,setChatLoad]=useState(false);
  const [people,setPeople]=useState([]);
  const [addingP,setAddingP]=useState(false);
  const [personLoad,setPersonLoad]=useState(false);
  const [compatRes,setCompatRes]=useState(null);
  const [compatLoad,setCompatLoad]=useState(false);
  const [selPerson,setSelPerson]=useState(null);
  const [relType,setRelType]=useState("romantic");
  const chatEnd=useRef(null);
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"})},[msgs]);

  const submit=async(f)=>{
    setLoading(true);setUInfo(f);setView("loading");setErr(null);
    try{
      const txt=await callClaude(readingPrompt(f));
      const r=pj(txt);
      setReading(r);
      setMsgs([{role:"assistant",content:`hey ${f.name} ✦ i've read your chart. ask me anything about your cosmos.`}]);
      setView("reading");setTab("chart");
    }catch(e){setErr(e.message);setView("form");}
    setLoading(false);
  };

  const loadDaily=async()=>{
    if(daily){setTab("today");return;}
    setTab("today");setDailyLoad(true);
    try{setDaily(pj(await callClaude(dailyPrompt(uInfo,reading))));}catch(e){console.error(e);}
    setDailyLoad(false);
  };

  const sendChat=async()=>{
    if(!chatIn.trim()||chatLoad)return;
    const um={role:"user",content:chatIn.trim()};
    setMsgs(p=>[...p,um]);setChatIn("");setChatLoad(true);
    try{
      const reply=await callClaude(null,chatSys(uInfo,reading),[...msgs,um]);
      setMsgs(p=>[...p,{role:"assistant",content:reply}]);
    }catch(e){setMsgs(p=>[...p,{role:"assistant",content:"something went wrong, try again ✦"}]);}
    setChatLoad(false);
  };

  const addPerson=async(f)=>{
    setPersonLoad(true);
    try{
      const txt=await callClaude(readingPrompt(f));
      setPeople(p=>[...p,{form:f,reading:pj(txt)}]);
      setAddingP(false);
    }catch(e){console.error(e);}
    setPersonLoad(false);
  };

  const genCompat=async()=>{
    if(!selPerson)return;
    setCompatLoad(true);
    try{setCompatRes({person:selPerson,relType,data:pj(await callClaude(compatPrompt(uInfo,selPerson.form,reading,relType)))});}
    catch(e){console.error(e);}
    setCompatLoad(false);
  };

  const tog=k=>setExp(p=>({...p,[k]:!p[k]}));
  const reset=()=>{setView("form");setReading(null);setDaily(null);setMsgs([]);setPeople([]);setCompatRes(null);setSelPerson(null);setAddingP(false);};

  if(view==="form")return(
    <>
      <style>{CSS}</style>
      <Stars/>
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 0"}}>
        <BirthForm onSubmit={submit} loading={loading} error={err}/>
      </div>
    </>
  );

  if(view==="loading")return(
    <>
      <style>{CSS}</style>
      <Stars/>
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,textAlign:"center",padding:"0 20px"}}>
        <div style={{fontSize:54,color:"#c9a96e",animation:"kspin 7s linear infinite"}}>✺</div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontStyle:"italic",color:"#777"}}>consulting the cosmos...</div>
        <div className="kload"><span/><span/><span/></div>
        <div style={{fontSize:11,color:"#444",fontFamily:"'DM Mono',monospace",marginTop:4,letterSpacing:".07em"}}>calculating lagna · nakshatras · dashas</div>
      </div>
    </>
  );

  const rChart=()=>{
    const c=reading.chart;
    const rows=[{l:"lagna",v:c.lagna.name,s:c.lagna.sanskrit,g:c.lagna.glyph,d:c.lagna.degree},{l:"moon sign",v:c.moonSign.name,s:c.moonSign.sanskrit,g:c.moonSign.glyph,d:c.moonSign.degree},{l:"sun sign",v:c.sunSign.name,s:c.sunSign.sanskrit,g:c.sunSign.glyph,d:c.sunSign.degree},{l:"nakshatra",v:c.nakshatra.name,s:`Pada ${c.nakshatra.pada} · Ruled by ${c.nakshatra.ruler}`,g:"✦",d:""}];
    return(
      <div>
        {rows.map((r,i)=>(
          <div key={i} className="kc" style={{display:"flex",alignItems:"center",gap:16,marginBottom:9}}>
            <div style={{fontSize:24,color:"#c9a96e",width:36,textAlign:"center",flexShrink:0}}>{r.g}</div>
            <div style={{flex:1}}>
              <label className="kl" style={{marginBottom:2}}>{r.l}</label>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,color:"#f0e8d8",lineHeight:1.2}}>{r.v}</div>
              <div style={{fontSize:12,color:"#777"}}>{r.s}</div>
            </div>
            {r.d&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"rgba(201,169,110,.55)"}}>{r.d}</span>}
          </div>
        ))}
        <div className="kc" style={{marginTop:4}}>
          <label className="kl" style={{marginBottom:12}}>PLANETARY POSITIONS</label>
          {c.planets.map((p,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:11,padding:"9px 13px",background:NB[p.nature],border:`1px solid ${NC[p.nature]}22`,borderRadius:10,marginBottom:7}}>
              <span style={{fontSize:15,width:20,textAlign:"center",color:NC[p.nature]}}>{p.glyph}</span>
              <span style={{flex:1,fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#e8e0d0"}}>{p.planet}</span>
              <span style={{fontSize:13,color:"#999"}}>{p.sign}</span>
              <span style={{fontSize:10,color:"#666",fontFamily:"'DM Mono',monospace",marginLeft:8}}>{p.house}</span>
              <span style={{width:7,height:7,borderRadius:"50%",background:NC[p.nature],boxShadow:`0 0 5px ${NC[p.nature]}`,flexShrink:0,marginLeft:8}}/>
            </div>
          ))}
          <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:12}}>
            {Object.entries({auspicious:"Auspicious",adverse:"Adverse",intense:"Intense",neutral:"Neutral"}).map(([k,l])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#777"}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:NC[k],display:"inline-block"}}/>{l}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const rSelf=()=>(
    <div>{reading.personality.map((p,i)=>(
      <div key={i} className="kc" style={{marginBottom:11}}>
        <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:10}}>
          <span style={{fontSize:20,color:"#c9a96e"}}>{p.icon}</span>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#f0e8d8"}}>{p.title}</span>
        </div>
        <p style={{margin:0,fontSize:15,lineHeight:1.78,color:"#c0b8aa"}}>{p.body}</p>
      </div>
    ))}</div>
  );

  const rDasha=()=>{
    const m=reading.mahadasha;
    return(
      <div>
        <div className="kc" style={{marginBottom:11}}>
          <div style={{display:"flex",gap:14,marginBottom:16}}>
            <span style={{fontSize:28,color:"#c9a96e",lineHeight:1,flexShrink:0}}>◈</span>
            <div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,color:"#f0e8d8",marginBottom:3}}>{m.current}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:"italic",color:"#888",marginBottom:9}}>{m.antardasha}</div>
              <span className="kchip">{m.period}</span>
            </div>
          </div>
          <p style={{fontSize:15,lineHeight:1.78,color:"#c0b8aa",margin:"0 0 16px"}}>{m.description}</p>
          <div className="kdiv"/>
          <label className="kl" style={{marginBottom:7}}>COMING NEXT</label>
          <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:"#c9a96e",marginBottom:6}}>{m.nextDasha.name} Mahadasha · {m.nextDasha.years}</div>
          <p style={{margin:0,fontSize:14,lineHeight:1.72,color:"#888"}}>{m.nextDasha.preview}</p>
        </div>
        <div className="kc">
          <label className="kl" style={{marginBottom:16}}>DASHA TIMELINE</label>
          {(m.timeline||[]).map((item,i,arr)=>(
            <div key={i} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:22,marginRight:14}}>
                <div style={{width:9,height:9,borderRadius:"50%",flexShrink:0,background:item.status==="active"?"#c9a96e":item.status==="past"?"rgba(201,169,110,.22)":"rgba(255,255,255,.09)",boxShadow:item.status==="active"?"0 0 10px rgba(201,169,110,.65)":"none"}}/>
                {i<arr.length-1&&<div style={{width:1,height:30,background:"rgba(201,169,110,.1)"}}/>}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",flex:1,padding:"9px 0",borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,.04)":"none"}}>
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:item.status==="active"?"#f0e8d8":item.status==="past"?"#444":"#777"}}>{item.dasha} Mahadasha</span>
                <span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:item.status==="active"?"#c9a96e":"#555"}}>{item.years}{item.status==="active"?" ← now":""}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const rTransits=()=>(
    <div>
      <label className="kl" style={{marginBottom:12}}>CURRENT TRANSITS · GOCHARA</label>
      {reading.transits.map((t,i)=>(
        <div key={i} style={{padding:"11px 14px",background:NB[t.nature],border:`1px solid ${NC[t.nature]}22`,borderRadius:11,marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:t.effect?5:0}}>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#f0e8d8",minWidth:90}}>{t.planet}</span>
            <span style={{flex:1,fontSize:13,color:"#999"}}>{t.sign}</span>
            <span style={{fontSize:10,color:"#666",fontFamily:"'DM Mono',monospace"}}>{t.house}</span>
            <span style={{width:7,height:7,borderRadius:"50%",background:NC[t.nature],boxShadow:`0 0 5px ${NC[t.nature]}`,flexShrink:0,marginLeft:8}}/>
          </div>
          {t.effect&&<div style={{fontSize:12,color:"#666",paddingLeft:101,lineHeight:1.5}}>{t.effect}</div>}
        </div>
      ))}
      <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:9}}>
        {Object.entries({auspicious:"Auspicious",adverse:"Adverse",intense:"Intense",neutral:"Neutral"}).map(([k,l])=>(
          <div key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:"#777"}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:NC[k],display:"inline-block"}}/>{l}
          </div>
        ))}
      </div>
    </div>
  );

  const rWeekly=()=>(
    <div>{(reading.weeklyForecast||[]).map((w,i)=>{
      const c=CK[w.colorKey]||"#c9a96e";
      return(
        <div key={i} className="kc" style={{marginBottom:11}}>
          <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:14}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:`${c}16`,border:`1px solid ${c}32`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,color:c,flexShrink:0}}>{w.icon}</div>
            <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,color:"#f0e8d8"}}>{w.area}</span>
          </div>
          {[{l:w.w1t||"Week 1",t:w.w1},{l:w.w2t||"Week 2",t:w.w2}].map((wk,wi)=>{
            const k=`${i}-${wi}`,open=exp[k];
            return(
              <div key={wi} style={{background:"rgba(255,255,255,.02)",borderRadius:9,border:"1px solid rgba(255,255,255,.05)",overflow:"hidden",marginBottom:wi===0?7:0}}>
                <button onClick={()=>tog(k)} style={{width:"100%",background:"none",border:"none",cursor:"pointer",padding:"10px 13px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:c,letterSpacing:".06em"}}>{wk.l}</span>
                  <span style={{color:"#555",fontSize:12,display:"inline-block",transform:open?"rotate(180deg)":"none",transition:"transform .3s"}}>▾</span>
                </button>
                {open&&<div style={{padding:"2px 13px 13px",fontSize:14,lineHeight:1.78,color:"#c0b8aa"}}>{wk.t}</div>}
              </div>
            );
          })}
        </div>
      );
    })}</div>
  );

  const rToday=()=>{
    if(dailyLoad)return<div style={{textAlign:"center",padding:50}}><div className="kload" style={{justifyContent:"center"}}><span/><span/><span/></div><div style={{fontSize:11,color:"#555",fontFamily:"'DM Mono',monospace",marginTop:12}}>reading today's stars...</div></div>;
    if(!daily)return<div style={{textAlign:"center",padding:50}}><p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:"italic",color:"#777",marginBottom:20}}>ready for today's cosmic forecast?</p><button className="kb" onClick={loadDaily}>☀ generate today's horoscope</button></div>;
    const d=daily;
    return(
      <div>
        <div style={{background:"rgba(201,169,110,.07)",border:"1px solid rgba(201,169,110,.2)",borderRadius:13,padding:"15px 18px",marginBottom:12,display:"flex",alignItems:"center",gap:14}}>
          <div style={{flex:1}}>
            <label className="kl" style={{color:"#c9a96e",marginBottom:3}}>TODAY</label>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:"#f0e8d8",fontStyle:"italic",marginBottom:3}}>{d.date}</div>
            <div style={{fontSize:13,color:"#999"}}>{d.overallEnergy}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:38,color:"#c9a96e",lineHeight:1}}>{d.energyScore}</div>
            <div style={{fontSize:9,color:"#555",fontFamily:"'DM Mono',monospace"}}>/10</div>
          </div>
        </div>
        {(d.sections||[]).map((s,i)=>(
          <div key={i} className="kc" style={{marginBottom:10}}>
            <label className="kl" style={{color:"#c9a96e",marginBottom:6}}>{s.icon} {s.area}</label>
            <p style={{margin:0,fontSize:14,lineHeight:1.78,color:"#c0b8aa"}}>{s.text}</p>
          </div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:9,marginBottom:11}}>
          {[["🎨","color",d.luckyColor],["🔢","number",d.luckyNumber],["⏰","power time",d.powerTime]].map(([ic,l,v],i)=>(
            <div key={i} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(201,169,110,.14)",borderRadius:11,padding:"13px 10px",textAlign:"center"}}>
              <div style={{fontSize:18,marginBottom:5}}>{ic}</div>
              <label className="kl" style={{marginBottom:4}}>{l}</label>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:"#e8e0d0"}}>{v||"–"}</div>
            </div>
          ))}
        </div>
        <div className="kc" style={{background:"linear-gradient(135deg,rgba(201,169,110,.07),rgba(90,45,140,.08))"}}>
          <label className="kl" style={{color:"#c9a96e",marginBottom:7}}>✦ cosmic tip</label>
          <p style={{margin:"0 0 13px",fontSize:14,lineHeight:1.72,color:"#c0b8aa"}}>{d.cosmicTip}</p>
          <div className="kdiv" style={{margin:"11px 0"}}/>
          <label className="kl" style={{marginBottom:6}}>AFFIRMATION</label>
          <p style={{margin:0,fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:"italic",color:"#c9a96e",lineHeight:1.65}}>"{d.affirmation}"</p>
        </div>
      </div>
    );
  };

  const rChat=()=>(
    <div>
      <div style={{height:340,overflowY:"auto",display:"flex",flexDirection:"column",gap:9,padding:"3px 2px",marginBottom:11}}>
        {msgs.map((m,i)=>(
          <div key={i} className={m.role==="user"?"buu":"bua"}>
            {m.role==="assistant"&&<label className="kl" style={{color:"#c9a96e",marginBottom:5}}>✦ KOZMIK</label>}
            <span style={{whiteSpace:"pre-wrap"}}>{m.content}</span>
          </div>
        ))}
        {chatLoad&&<div className="bua"><label className="kl" style={{color:"#c9a96e",marginBottom:6}}>✦ KOZMIK</label><div className="kload"><span/><span/><span/></div></div>}
        <div ref={chatEnd}/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <input className="ki" style={{flex:1}} placeholder="ask anything about your chart..." value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}/>
        <button className="kb" onClick={sendChat} disabled={chatLoad||!chatIn.trim()} style={{flexShrink:0,padding:"11px 18px"}}>✦</button>
      </div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:9}}>
        {["when will i find love?","career guidance?","gemstone reco?","my lucky period?"].map((q,i)=>(
          <button key={i} className="kg" style={{fontSize:11,padding:"5px 12px"}} onClick={()=>setChatIn(q)}>{q}</button>
        ))}
      </div>
    </div>
  );

  const rCompat=()=>{
    if(compatRes){
      const cd=compatRes.data;
      const sc=cd.score>=80?"#c9a96e":cd.score>=60?"#6ec9b5":"#c77080";
      return(
        <div>
          <button className="kg" style={{marginBottom:16}} onClick={()=>setCompatRes(null)}>← back</button>
          <div style={{background:`linear-gradient(135deg,rgba(201,169,110,.07),rgba(${compatRes.relType==="romantic"?"199,112,128":"110,201,181"},.07))`,border:"1px solid rgba(201,169,110,.2)",borderRadius:13,padding:20,marginBottom:14,textAlign:"center"}}>
            <label className="kl" style={{marginBottom:8}}>{compatRes.relType==="romantic"?"♡ ROMANTIC":"⊕ FRIENDSHIP"} COMPATIBILITY</label>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#e8e0d0",marginBottom:14}}>{uInfo.name} × {compatRes.person.form.name}</div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:58,color:sc,lineHeight:1,marginBottom:2}}>{cd.score}</div>
            <div style={{fontSize:11,color:"#666",fontFamily:"'DM Mono',monospace",marginBottom:14}}>/100</div>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:"italic",color:"#d8d0c0",lineHeight:1.72,margin:0}}>"{cd.verdict}"</p>
          </div>
          {(cd.sections||[]).map((s,i)=>(
            <div key={i} className="kc" style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:16,color:"#c9a96e"}}>{s.icon}</span>
                  <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:"#f0e8d8"}}>{s.area}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:70,height:4,borderRadius:2,background:"rgba(255,255,255,.08)",overflow:"hidden"}}>
                    <div style={{width:`${s.score*10}%`,height:"100%",background:"#c9a96e",borderRadius:2}}/>
                  </div>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#c9a96e",minWidth:28}}>{s.score}/10</span>
                </div>
              </div>
              <p style={{margin:0,fontSize:14,lineHeight:1.75,color:"#c0b8aa"}}>{s.text}</p>
            </div>
          ))}
          {cd.strengths&&<div className="kc" style={{marginBottom:11,background:"rgba(110,201,181,.05)",borderColor:"rgba(110,201,181,.2)"}}>
            <label className="kl" style={{color:"#6ec9b5",marginBottom:10}}>✦ STRENGTHS</label>
            {cd.strengths.map((s,i)=><div key={i} style={{fontSize:14,color:"#c0b8aa",marginBottom:7,display:"flex",gap:9}}><span style={{color:"#6ec9b5",flexShrink:0,marginTop:1}}>◉</span><span>{s}</span></div>)}
          </div>}
          {cd.challenges&&<div className="kc" style={{marginBottom:11,background:"rgba(199,112,128,.05)",borderColor:"rgba(199,112,128,.2)"}}>
            <label className="kl" style={{color:"#c77080",marginBottom:10}}>⚠ CHALLENGES</label>
            {cd.challenges.map((s,i)=><div key={i} style={{fontSize:14,color:"#c0b8aa",marginBottom:7,display:"flex",gap:9}}><span style={{color:"#c77080",flexShrink:0,marginTop:1}}>◉</span><span>{s}</span></div>)}
          </div>}
          {cd.remedies&&<div className="kc" style={{background:"rgba(155,126,200,.06)",borderColor:"rgba(155,126,200,.2)"}}>
            <label className="kl" style={{color:"#9b7ec8",marginBottom:10}}>◈ REMEDIES</label>
            {cd.remedies.map((s,i)=><div key={i} style={{fontSize:14,color:"#c0b8aa",marginBottom:7,display:"flex",gap:9}}><span style={{color:"#9b7ec8",flexShrink:0,marginTop:1}}>◈</span><span>{s}</span></div>)}
          </div>}
        </div>
      );
    }

    if(addingP)return(
      <div>
        <button className="kg" style={{marginBottom:16}} onClick={()=>setAddingP(false)}>← back</button>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#f0e8d8",marginBottom:16}}>Add a person</div>
        <div className="kc"><BirthForm onSubmit={addPerson} loading={personLoad} compact submitLabel="✦ add to my circle"/></div>
      </div>
    );

    return(
      <div>
        <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:"#f0e8d8",marginBottom:6}}>Astrological Compatibility</div>
        <p style={{fontSize:14,color:"#777",marginBottom:20,lineHeight:1.6}}>Add people to compare charts — test as friends or romantic partners.</p>
        {people.length>0&&(
          <div style={{marginBottom:20}}>
            <label className="kl" style={{marginBottom:12}}>YOUR CIRCLE</label>
            {people.map((p,i)=>(
              <div key={i} className="kc" style={{display:"flex",alignItems:"center",gap:14,marginBottom:10,cursor:"pointer",borderColor:selPerson===p?"rgba(201,169,110,.5)":"rgba(201,169,110,.16)"}} onClick={()=>setSelPerson(p===selPerson?null:p)}>
                <div style={{width:40,height:40,borderRadius:"50%",background:"rgba(201,169,110,.12)",border:"1px solid rgba(201,169,110,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:18,color:"#c9a96e",flexShrink:0}}>
                  {p.form.name[0]?.toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,color:"#f0e8d8"}}>{p.form.name}</div>
                  <div style={{fontSize:12,color:"#777"}}>{p.reading.chart.lagna.name} rising · {p.reading.chart.moonSign.name} moon</div>
                </div>
                {selPerson===p&&<span style={{color:"#c9a96e"}}>✦</span>}
              </div>
            ))}
          </div>
        )}
        {selPerson&&(
          <div className="kc" style={{marginBottom:16,background:"rgba(201,169,110,.04)"}}>
            <label className="kl" style={{marginBottom:12}}>RELATIONSHIP TYPE</label>
            <div style={{display:"flex",gap:10,marginBottom:16}}>
              {[["romantic","♡ romantic"],["friends","⊕ friends"]].map(([rt,l])=>(
                <button key={rt} className={relType===rt?"kb":"kg"} onClick={()=>setRelType(rt)} style={{flex:1,padding:"10px",textAlign:"center"}}>{l}</button>
              ))}
            </div>
            <button className="kb" style={{width:"100%"}} disabled={compatLoad} onClick={genCompat}>
              {compatLoad?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10}}><span className="kload"><span/><span/><span/></span>analysing charts...</span>:`✦ check compatibility with ${selPerson.form.name}`}
            </button>
          </div>
        )}
        <button className="kg" style={{width:"100%",padding:"12px",borderStyle:"dashed"}} onClick={()=>setAddingP(true)}>
          + add a person
        </button>
        {people.length===0&&<p style={{textAlign:"center",fontSize:12,color:"#555",marginTop:12,fontFamily:"'DM Mono',monospace"}}>add a friend or partner to begin</p>}
      </div>
    );
  };

  return(
    <>
      <style>{CSS}</style>
      <Stars/>
      <div style={{position:"relative",zIndex:1,minHeight:"100vh",padding:"0 16px 80px"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{textAlign:"center",padding:"22px 0 16px"}}>
            <Logo size={23}/>
            <div style={{marginTop:7}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontStyle:"italic",color:"#888"}}>{uInfo.name}</span>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#555",marginLeft:10}}>{uInfo.day} {uInfo.month} {uInfo.year} · {uInfo.place}</span>
            </div>
          </div>
          <div style={{background:"linear-gradient(135deg,rgba(201,169,110,.07),rgba(100,55,160,.07))",border:"1px solid rgba(201,169,110,.2)",borderRadius:13,padding:"16px 20px",marginBottom:18}}>
            <label className="kl" style={{color:"#c9a96e",marginBottom:7}}>COSMIC SUMMARY</label>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:"italic",lineHeight:1.78,color:"#d8d0c0",margin:0}}>"{reading.summary}"</p>
          </div>
          <div className="ks">
            {TABS.map(({k,l})=>(
              <button key={k} className={`kt${tab===k?" on":""}`} onClick={()=>k==="today"?loadDaily():setTab(k)}>{l}</button>
            ))}
          </div>
          <div className="kan">
            {tab==="chart"&&<>{rChart()}{rTransits()}</>}
            {tab==="self"&&rSelf()}
            {tab==="dasha"&&rDasha()}
            
            {tab==="weekly"&&rWeekly()}
            {tab==="today"&&rToday()}{tab==="chat"&&rChat()}{tab==="compat"&&rCompat()}
            
            
          </div>
          <div style={{textAlign:"center",marginTop:30}}>
            <button className="kg" onClick={reset}>← new reading</button>
          </div>
        </div>
      </div>
    </>
  );
}
