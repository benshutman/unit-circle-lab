import {functions,names,invNames,colors,normalize,values,inverse,parseExpression,decimal,exact,piExact,angleText,reference,quadrant,branches} from './math.js';
const $=id=>document.getElementById(id);
const state={mode:'direct',deg:30,unit:'deg',selected:'sin',inverseFn:'tan',input:-Math.sqrt(3),snap:true};
const special=[0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360];
const formulas={sin:'y/1',cos:'x/1',tan:'y/x',csc:'1/y',sec:'1/x',cot:'x/y'};
const sides={a:{name:'opposite',color:colors.sin},b:{name:'adjacent',color:colors.cos},c:{name:'hypotenuse',color:'#172e4a'}};
const ratios={sin:['a','c'],cos:['b','c'],tan:['a','b'],csc:['c','a'],sec:['c','b'],cot:['b','a']};
const fraction=(top,bottom)=>`<span class="frac"><span>${top}</span><span>${bottom}</span></span>`;
const sideLetter=key=>`<span class="side-letter" style="color:${sides[key].color}">${key}</span>`;
const sideRatio=fn=>fraction(...ratios[fn].map(sideLetter));
const wordRatio=fn=>fraction(...ratios[fn].map(key=>sides[key].name));
const sideValues=deg=>{const v=values(deg);return {a:v.sin,b:v.cos,c:1};};
const valueRatio=fn=>{const v=sideValues(state.deg);return fraction(...ratios[fn].map(key=>display(v[key])));};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function math(s){if(s===null)return '';s=String(s);const neg=s.startsWith('−');if(neg)s=s.slice(1);const parts=s.split('/');return (neg?'<span class="minus">−</span>':'')+(parts.length===2?'<span class="frac"><span>'+esc(parts[0])+'</span><span>'+esc(parts[1])+'</span></span>':esc(s));}
const display=n=>math(exact(n)??decimal(n));
const isExact=n=>exact(n)!==null;
function angleMarkup(deg,unit=state.unit){return unit==='deg'?esc(decimal(deg)+'°'):math(piExact(deg)??decimal(deg*Math.PI/180))+(piExact(deg)?'':' rad');}
function error(message){$('input-error').hidden=!message;$('input-error').textContent=message?message+' The last valid calculation is still shown.':'';}
function syncInput(){const n=state.unit==='deg'?state.deg:state.deg*Math.PI/180;$('angle-input').value=state.unit==='rad'?(piExact(state.deg)??decimal(n)).replace(/π/g,'pi').replace(/−/g,'-'):decimal(n).replace('−','-');}
function setAngle(deg){if(!Number.isFinite(deg)||Math.abs(deg)>1000000)throw Error('Use an angle between −1,000,000° and 1,000,000°.');state.deg=Math.abs(deg)<1e-10?0:deg;error('');syncInput();render();}
function solve(){try{const n=parseExpression($('inverse-input').value);const deg=inverse(state.inverseFn,n);state.input=n;state.deg=deg;error('');render();}catch(e){error(e.message);}}
function switchMode(mode){if(mode===state.mode)return;state.mode=mode;error('');if(mode==='inverse'){state.inverseFn=$('inverse-function').value;try{state.input=parseExpression($('inverse-input').value);state.deg=inverse(state.inverseFn,state.input);}catch{state.input=.5;$('inverse-input').value='1/2';state.deg=inverse(state.inverseFn,state.input);}}else syncInput();render();}
function svgText(x,y,text,attrs=''){return `<text x="${x}" y="${y}" ${attrs}>${esc(text)}</text>`;}
function arcPath(start,end,r,cx=300,cy=270){const pt=d=>[cx+r*Math.cos(d*Math.PI/180),cy-r*Math.sin(d*Math.PI/180)];let a=pt(start);let d=`M${a[0]} ${a[1]}`;const steps=Math.max(2,Math.ceil(Math.abs(end-start)/5));for(let i=1;i<=steps;i++){a=pt(start+(end-start)*i/steps);d+=` L${a[0]} ${a[1]}`;}return d;}
function renderCircle(){
  const deg=state.deg,n=normalize(deg),v=values(deg),cx=300,cy=270,R=170,x=cx+R*v.cos,y=cy-R*v.sin;
  let s='<defs><pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse" x="300" y="270"><path d="M34 0H0V34" fill="none" stroke="#e7edf5" stroke-width=".6"/></pattern></defs><rect x="80" y="50" width="440" height="440" rx="10" fill="url(#grid)"/>';
  s+='<path d="M69 270H531M300 39V501" fill="none" stroke="#a5b4c8" stroke-width="1.2"/>';
  s+=svgText(531,259,'x','font-size="15" fill="#2459d1"')+svgText(312,46,'y','font-size="15" fill="#be2366"');
  s+='<circle cx="300" cy="270" r="170" fill="white" fill-opacity=".68" stroke="#8a9db7" stroke-width="1.5"/>';
  if(state.mode==='inverse'){
    const b=branches[state.inverseFn];
    s+=`<path d="${arcPath(b.min,b.max,R+8)}" fill="none" stroke="#9cbbf0" stroke-width="9" opacity=".75"/>`;
    for(const a of [b.min,b.max]){const excluded=state.inverseFn==='tan'||state.inverseFn==='cot';s+=`<circle cx="${cx+(R+8)*Math.cos(a*Math.PI/180)}" cy="${cy-(R+8)*Math.sin(a*Math.PI/180)}" r="4.5" fill="${excluded?'white':'#668ccb'}" stroke="#668ccb" stroke-width="1.5"/>`;}
    if(state.inverseFn==='csc'||state.inverseFn==='sec'){const a=state.inverseFn==='csc'?0:90;s+=`<circle cx="${cx+(R+8)*Math.cos(a*Math.PI/180)}" cy="${cy-(R+8)*Math.sin(a*Math.PI/180)}" r="4.5" fill="white" stroke="#668ccb" stroke-width="1.5"/>`;}
  }
  for(const a of special.slice(0,-1)){
    const rad=a*Math.PI/180,px=cx+R*Math.cos(rad),py=cy-R*Math.sin(rad),tx=cx+(R+39)*Math.cos(rad),ty=cy-(R+39)*Math.sin(rad);
    s+=`<circle cx="${px}" cy="${py}" r="3.3" fill="#71839d"/>`;
    s+=svgText(tx,ty-2,angleText(a,state.unit),'class="angle-label" text-anchor="middle" dominant-baseline="middle" font-size="16" font-weight="600" fill="#425974"');
    if(state.unit==='deg')s+=svgText(tx,ty+16,piExact(a),'class="radian-label" text-anchor="middle" font-size="13" fill="#708099"');
  }
  s+=`<path d="M${cx} ${cy}H${x}V${y}Z" fill="#c4d5f4" opacity=".24"/>`;
  s+=`<path d="M${cx} ${cy}L${x} ${y}" stroke="#172e4a" stroke-width="2.3"/>`;
  s+=`<path d="M${cx} ${cy}H${x}" stroke="${colors.cos}" stroke-width="4"/><path d="M${x} ${cy}V${y}" stroke="${colors.sin}" stroke-width="4"/>`;
  s+=`<path d="M${cx} ${y}H${x}" stroke="${colors.sin}" stroke-width="1" stroke-dasharray="4 5" opacity=".6"/>`;
  const sweep=state.mode==='inverse'?deg:(deg<0&&n!==0?n-360:n);s+=`<path d="${arcPath(0,sweep,40)}" stroke="#b66b0e" stroke-width="2.5" fill="none"/>`;
  const mid=sweep/2*Math.PI/180;s+=svgText(cx+58*Math.cos(mid),cy-58*Math.sin(mid)+5,'θ','font-family="Georgia,serif" font-size="20" fill="#a35a0a"');
  const labelAttrs='class="side-label" text-anchor="middle" dominant-baseline="middle" font-size="22" font-weight="700"';
  s+=svgText((cx+x)/2,cy+(v.sin>=0?27:-27),'b',`${labelAttrs} fill="${colors.cos}"`);
  s+=svgText(x+(v.cos>=0?20:-20),(cy+y)/2+(Math.abs(v.sin)<.3?(v.sin>=0?-22:26):0),'a',`${labelAttrs} fill="${colors.sin}"`);
  const outward=Math.sign(v.cos*v.sin)||1;
  const labelX=v.cos===0?cx-38:(cx+x)/2-outward*v.sin*25;
  const labelY=v.sin===0?cy-27:(cy+y)/2-outward*v.cos*25;
  s+=svgText(labelX,labelY,'c = 1',`${labelAttrs} fill="#172e4a"`);
  if(Math.abs(v.cos)>.12&&Math.abs(v.sin)>.12){
    const dx=v.cos>0?-10:10,dy=v.sin>0?-10:10;
    s+=`<path d="M${x+dx} ${cy}v${dy}h${-dx}" fill="none" stroke="#71839d" stroke-width="1.4"/>`;
  }
  s+='<circle cx="300" cy="270" r="3.5" fill="#172e4a"/>';
  s+=`<circle cx="${x}" cy="${y}" r="21" fill="#2459d1" opacity=".12"/><circle cx="${x}" cy="${y}" r="9" fill="#2459d1" stroke="white" stroke-width="3"/>`;
  if(state.mode==='inverse')s+=svgText(300,524,'Blue arc = allowed principal angles','text-anchor="middle" font-size="13" fill="#476da6"');
  $('circle').innerHTML=s;$('circle').setAttribute('aria-label',`Unit circle: ${decimal(deg)} degrees; signed opposite leg a = y = ${exact(v.sin)??decimal(v.sin)}, signed adjacent leg b = x = ${exact(v.cos)??decimal(v.cos)}, hypotenuse c = 1. ${state.mode==='inverse'?'Blue arc shows the principal range.':'Use the angle controls or drag the circle to change the angle.'}`);
  const legValues=sideValues(deg);
  $('side-key').innerHTML=Object.keys(sides).map(key=>`<div class="side-key-item"><span class="side-key-name">${sideLetter(key)} <span>${sides[key].name}</span></span><span class="math side-key-value">${key==='a'?'y':key==='b'?'x':'radius'} = ${display(legValues[key])}</span></div>`).join('');
  $('side-note').textContent='Opposite and adjacent refer to the reference angle. Here a = y and b = x carry coordinate signs; their lengths are |a| and |b|.'+(v.sin===0||v.cos===0?' On an axis, one leg is zero, so the triangle collapses.':'');
  $('coordinate-values').innerHTML=`(<span style="color:${colors.cos}">${display(v.cos)}</span>, <span style="color:${colors.sin}">${display(v.sin)}</span>)`;
  $('quadrant').textContent=quadrant(deg);$('reference').textContent=angleText(reference(deg),state.unit);
  $('signs').textContent=functions.filter(f=>v[f]!==null&&v[f]>1e-12).join(', ');
  $('circle-instruction').textContent=state.mode==='inverse'?'The answer sits inside the blue principal range.':'Drag the point or tap anywhere on the circle.';
  $('snap').closest('label').hidden=state.mode==='inverse';
}
function renderGraph(){
  const inv=state.mode==='inverse',fn=inv?state.inverseFn:state.selected,c=colors[fn],W=Math.max(320,$('graph').clientWidth||1040),H=260,left=64,right=W-26,top=20,bottom=218;
  $('graph').setAttribute('viewBox',`0 0 ${W} ${H}`);
  const xmin=inv?(['sin','cos'].includes(fn)?-1.25:-4):-360,xmax=inv?(['sin','cos'].includes(fn)?1.25:4):360;
  const ymin=inv?(branches[fn].min<0?-110:-25):-3.2,ymax=inv?(branches[fn].max>90?205:110):3.2;
  const X=x=>left+(x-xmin)/(xmax-xmin)*(right-left),Y=y=>bottom-(y-ymin)/(ymax-ymin)*(bottom-top);
  let s=`<defs><clipPath id="plot-clip"><rect x="${left}" y="${top}" width="${right-left}" height="${bottom-top}"/></clipPath></defs>`;
  const xticks=inv?(['sin','cos'].includes(fn)?(W<560?[-1,0,1]:[-1,-.5,0,.5,1]):(W<560?[-4,-2,0,2,4]:[-4,-3,-2,-1,0,1,2,3,4])):(W<560?[-360,-180,0,180,360]:[-360,-270,-180,-90,0,90,180,270,360]);
  const yticks=inv?(branches[fn].min<0?[-90,-45,0,45,90]:[0,45,90,135,180]):[-3,-2,-1,0,1,2,3];
  for(const x of xticks){s+=`<path d="M${X(x)} ${top}V${bottom}" stroke="#e6ecf4"/>`;s+=svgText(X(x),244,inv?decimal(x):angleText(x,state.unit),'text-anchor="middle" font-size="13" fill="#687e98"');}
  for(const y of yticks){s+=`<path d="M${left} ${Y(y)}H${right}" stroke="#e6ecf4"/>`;s+=svgText(left-12,Y(y)+4,inv?angleText(y,state.unit):decimal(y),'text-anchor="end" font-size="13" fill="#687e98"');}
  s+=`<path d="M${X(0)} ${top}V${bottom}M${left} ${Y(0)}H${right}" stroke="#9cadc4" stroke-width="1.3"/>`;
  if(!inv&&['tan','sec','csc','cot'].includes(fn)){
    const offset=['tan','sec'].includes(fn)?90:0;for(let a=-540+offset;a<=540;a+=180){if(a>=xmin&&a<=xmax)s+=`<path d="M${X(a)} ${top}V${bottom}" stroke="${c}" opacity=".35" stroke-dasharray="5 5"/>`;}
  }
  const evaluator=x=>{try{return inv?inverse(fn,x):values(x)[fn];}catch{return null;}};
  let path='',prev=null;
  for(let i=0;i<=1440;i++){const x=xmin+(xmax-xmin)*i/1440,y=evaluator(x);if(y===null||!Number.isFinite(y)){prev=null;continue;}const py=Y(y);const jump=prev===null||Math.abs(py-prev)>H;path+=`${jump?'M':'L'}${X(x).toFixed(2)} ${py.toFixed(2)} `;prev=py;}
  s+=`<path d="${path}" clip-path="url(#plot-clip)" fill="none" stroke="${c}" stroke-width="2.7" stroke-linejoin="round"/>`;
  const gx=inv?state.input:(normalize(state.deg)>180?normalize(state.deg)-360:normalize(state.deg)),gy=inv?state.deg:values(state.deg)[fn];
  const onGraph=gx>=xmin&&gx<=xmax&&gy!==null&&gy>=ymin&&gy<=ymax;
  if(onGraph)s+=`<path d="M${X(gx)} ${Y(0)}V${Y(gy)}" stroke="${c}" opacity=".5" stroke-dasharray="4 4"/><circle cx="${X(gx)}" cy="${Y(gy)}" r="7" fill="${c}" stroke="white" stroke-width="2"/>`;
  $('graph').innerHTML=s;$('graph').setAttribute('aria-label',`${inv?invNames[fn]:fn} graph. ${inv?'Horizontal axis is input value; vertical axis is principal angle.':'Horizontal axis is angle; vertical axis is function value.'}`);
  $('graph-title').textContent=inv?`θ = ${invNames[fn]}(v)`:`y = ${fn}(θ)`;
  $('graph-title').style.color=c;
  $('graph-caption').textContent=inv?'Input value along the bottom · principal angle up the side':'Angle along the bottom · function value up the side';
  const range=inv?branches[fn][state.unit==='deg'?'rangeDeg':'rangeRad']:['sin','cos'].includes(fn)?'[−1, 1]':['csc','sec'].includes(fn)?'(−∞, −1] ∪ [1, ∞)':'all real numbers';
  const period=['tan','cot'].includes(fn)?180:360;
  $('graph-footer').innerHTML=`<span><strong>${inv?'Input domain':'Period'}:</strong> ${esc(inv?branches[fn].domain:angleText(period,state.unit))}</span><span><strong>Range:</strong> ${esc(range)}</span>`+
    (!inv?`<span><strong>Domain:</strong> ${['sin','cos'].includes(fn)?'all real angles':['tan','sec'].includes(fn)?'θ ≠ '+(state.unit==='deg'?'90° + 180°k':'π/2 + kπ'):'θ ≠ '+(state.unit==='deg'?'180°k':'kπ')}${['sin','cos'].includes(fn)?'':' (k is an integer)'}</span>`:'')+
    (!onGraph?`<span>${gy===null?'The selected value is undefined.':'Selected point is outside the displayed graph window.'}</span>`:'')+
    (!inv&&Math.abs(gx-state.deg)>1e-7?`<span>Marker uses the coterminal angle ${esc(angleText(gx,state.unit))}.</span>`:'');
}
function renderValues(){
  const v=values(state.deg);
  $('function-grid').innerHTML=functions.map(f=>{
    const [top,bottom]=ratios[f];
    return `<button type="button" class="function-card" data-fn="${f}" style="--function-color:${colors[f]}" aria-pressed="${state.selected===f}" aria-label="${names[f]}: ${top} over ${bottom}, ${sides[top].name} over ${sides[bottom].name}. At ${decimal(state.deg)} degrees: ${exact(v[f])??decimal(v[f])}. ${state.mode==='inverse'?'View its forward graph.':'Select graph.'}"><span class="fn-title"><span>${f} θ =</span>${sideRatio(f)}</span><span class="fn-meaning">${wordRatio(f)}</span><span class="fn-substitution math">${valueRatio(f)}</span><span class="fn-value${v[f]===null?' undefined':''}">${v[f]===null?'':isExact(v[f])?'= ':'≈ '}${display(v[f])}</span><span class="fn-decimal">${v[f]===null?`${bottom} = 0 · undefined`:isExact(v[f])?'≈ '+decimal(v[f]):'rounded to 5 places'}</span></button>`;
  }).join('');
  $('values-title').textContent=state.mode==='inverse'?'Values at the answer angle':'All six functions';
  $('values-hint').textContent=state.mode==='inverse'?'Select to explore forward':'Select one to explore';
}
function renderExplanation(){
  const n=normalize(state.deg),r=reference(state.deg),v=values(state.deg),fn=state.mode==='inverse'?state.inverseFn:state.selected;
  if(state.mode==='inverse'){
    const coordinate=fn==='sin'||fn==='csc'?'y':fn==='cos'||fn==='sec'?'x':'y/x';
    const target=fn==='csc'||fn==='sec'||fn==='cot'?1/state.input:state.input;
    const relationship=fn==='cot'&&state.input===0?'cot θ = x/y = 0, so x = 0':`${coordinate} = ${exact(target)??decimal(target)}`;
    $('explanation').innerHTML=`<h2>How this answer is chosen</h2><ol><li>Find an angle with <span class="math">${esc(fn)} θ = ${sideRatio(fn)} = ${display(state.input)}</span>. On the circle, look for <span class="math">${esc(relationship)}</span>.</li><li>Use the principal range <strong>${esc(branches[fn][state.unit==='deg'?'rangeDeg':'rangeRad'])}</strong> to choose one angle.</li><li>The result is <span class="math">θ = ${angleMarkup(state.deg)}</span>. Check: <span class="math">${esc(fn)}(${angleMarkup(state.deg)}) ${isExact(state.input)?'=':'≈'} ${display(state.input)}</span>.</li></ol>`;
  }else{
    let signNote=v[fn]===null?'The denominator is zero, so the value is undefined.':v[fn]===0?'This function is zero at this angle.':`${names[fn]} is ${v[fn]>0?'positive':'negative'} here.`;
    $('explanation').innerHTML=`<h2>Read the circle, step by step</h2><ol><li>${Math.abs(n-state.deg)>1e-8?'Reduce by full turns: ':'Locate the angle: '}<span class="math">${angleMarkup(state.deg)}${Math.abs(n-state.deg)>1e-8?' → '+angleMarkup(n):''}</span>. ${esc(quadrant(n))}.</li><li>The reference angle is <span class="math">${angleMarkup(r)}</span> — its distance from the x-axis${n%90===0?' (axis-angle convention)':''}.</li><li>Use <span class="math">${fn} θ = ${sideRatio(fn)} = ${math(formulas[fn])}</span>. Substitute the signed legs: <span class="math">${valueRatio(fn)}${v[fn]===null?" is undefined":(isExact(v[fn])?" = ":" ≈ ")+display(v[fn])}</span>. ${signNote}</li></ol>`;
  }
}
function render(){
  const inv=state.mode==='inverse';$('direct-controls').hidden=inv;$('inverse-controls').hidden=!inv;$('branch-panel').hidden=!inv;
  for(const mode of ['direct','inverse']){const el=$(mode+'-tab');el.setAttribute('aria-selected',String(state.mode===mode));el.tabIndex=state.mode===mode?0:-1;}
  $('workspace').setAttribute('aria-labelledby',state.mode+'-tab');
  document.querySelectorAll('[data-unit]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.unit===state.unit)));
  $('input-unit').textContent=state.unit==='deg'?'°':'rad';$('angle-hint').textContent=state.unit==='deg'?'Enter any angle, including negatives and full turns.':'Use pi for π. Try 7pi/6, 13pi/4, or -pi/3.';
  $('angle-slider').value=normalize(state.deg);$('angle-slider').setAttribute('aria-valuetext',angleText(state.deg,state.unit));
  $('angle-presets').innerHTML=[0,30,45,60,90,180,270].map(a=>`<button type="button" data-angle="${a}" class="${Math.abs(normalize(state.deg)-a)<1e-8?'active':''}">${esc(angleText(a,state.unit))}</button>`).join('');
  const examples=inv&&['sec','csc'].includes(state.inverseFn)?['-2','-sqrt(2)','-1','1','sqrt(2)','2']:inv&&['sin','cos'].includes(state.inverseFn)?['-1','-sqrt(3)/2','0','1/2','sqrt(2)/2','1']:['-sqrt(3)','-1','0','1','sqrt(3)'];
  $('inverse-presets').innerHTML=examples.map(a=>`<button type="button" data-example="${a}" aria-label="Use ${a}">${math(exact(parseExpression(a))??decimal(parseExpression(a)))}</button>`).join('');
  if(inv){const fn=state.inverseFn,b=branches[fn];$('angle-result').innerHTML=`<div class="result-label">Principal angle</div><div class="result-math"><span>${invNames[fn]}(${display(state.input)}) =</span><strong>${angleMarkup(state.deg)}</strong><small>= ${angleMarkup(state.deg,state.unit==='deg'?'rad':'deg')}</small></div><p class="hint">${state.deg<0?'Negative angles turn clockwise.':'Positive angles turn counterclockwise.'}</p>`;$('branch-panel').innerHTML=`<h3>Why this angle?</h3><div class="range">${esc(b[state.unit==='deg'?'rangeDeg':'rangeRad'])}</div><p>${esc(b.note)}</p><p>Square brackets include an endpoint; parentheses exclude it.</p>`;}
  else $('angle-result').innerHTML=`<div class="result-label">Your angle</div><div class="result-math"><strong>${angleMarkup(state.deg)}</strong><small>= ${angleMarkup(state.deg,state.unit==='deg'?'rad':'deg')}</small></div>${Math.abs(normalize(state.deg)-state.deg)>1e-8?`<p class="hint">Same circle point as ${esc(angleText(normalize(state.deg),state.unit))}.</p>`:''}`;
  renderCircle();renderValues();renderGraph();renderExplanation();
}
$('angle-form').addEventListener('submit',e=>{e.preventDefault();try{const n=parseExpression($('angle-input').value);setAngle(state.unit==='deg'?n:n*180/Math.PI);}catch(e){error(e.message);}});
$('inverse-form').addEventListener('submit',e=>{e.preventDefault();solve();});
$('inverse-function').addEventListener('change',()=>{const fn=$('inverse-function').value;try{const n=parseExpression($('inverse-input').value);inverse(fn,n);}catch{const v=['sec','csc'].includes(fn)?'2':'1/2';$('inverse-input').value=v;}state.inverseFn=fn;solve();});
$('direct-tab').addEventListener('click',()=>switchMode('direct'));$('inverse-tab').addEventListener('click',()=>switchMode('inverse'));
document.querySelector('.tabs').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const mode=e.key==='Home'?'direct':e.key==='End'?'inverse':state.mode==='direct'?'inverse':'direct';switchMode(mode);$(mode+'-tab').focus();}});
document.querySelectorAll('[data-unit]').forEach(b=>b.addEventListener('click',()=>{state.unit=b.dataset.unit;syncInput();render();}));
$('angle-slider').addEventListener('input',e=>setAngle(Number(e.target.value)));
$('step-back').addEventListener('click',()=>setAngle(state.deg-1));$('step-next').addEventListener('click',()=>setAngle(state.deg+1));$('reset').addEventListener('click',()=>setAngle(30));
$('snap').addEventListener('change',e=>state.snap=e.target.checked);
$('angle-presets').addEventListener('click',e=>{const b=e.target.closest('[data-angle]');if(b)setAngle(Number(b.dataset.angle));});
$('inverse-presets').addEventListener('click',e=>{const b=e.target.closest('[data-example]');if(b){$('inverse-input').value=b.dataset.example;solve();}});
$('function-grid').addEventListener('click',e=>{const b=e.target.closest('[data-fn]');if(b){state.selected=b.dataset.fn;if(state.mode==='inverse')switchMode('direct');else render();$('function-grid').querySelector(`[data-fn="${state.selected}"]`).focus();}});
let dragging=false;
function pointerAngle(e){const svg=$('circle'),pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const p=pt.matrixTransform(svg.getScreenCTM().inverse());if(Math.hypot(p.x-300,p.y-270)<12)return;let a=normalize(Math.atan2(270-p.y,p.x-300)*180/Math.PI);if(state.snap){const near=special.reduce((best,curr)=>Math.abs(curr-a)<Math.abs(best-a)?curr:best,0);if(Math.abs(near-a)<=4)a=near;}setAngle(Math.round(a*10)/10);}
$('circle').addEventListener('pointerdown',e=>{if(state.mode==='inverse')return;dragging=true;$('circle').setPointerCapture(e.pointerId);pointerAngle(e);});
$('circle').addEventListener('pointermove',e=>{if(dragging)pointerAngle(e);});
for(const event of ['pointerup','pointercancel','lostpointercapture'])$('circle').addEventListener(event,()=>dragging=false);
render();
if(typeof ResizeObserver!=='undefined'){let lastWidth=0;const observer=new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(Math.abs(width-lastWidth)>1){lastWidth=width;renderGraph();}});observer.observe($('graph'));}
// Optional browser-agent interface; all actions reuse the visible calculator state.
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  const tool={name:'set_trig_calculation',title:'Set trig calculation',description:'Set the visible unit circle to an angle, or solve one inverse trig value and display its principal angle.',inputSchema:{type:'object',properties:{mode:{type:'string',enum:['direct','inverse']},expression:{type:'string'},unit:{type:'string',enum:['deg','rad']},function:{type:'string',enum:functions}},required:['mode','expression'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){
    if(!input||typeof input.expression!=='string'||!['direct','inverse'].includes(input.mode)||input.unit&&!['deg','rad'].includes(input.unit)||input.function&&!functions.includes(input.function))throw Error('Invalid calculation input.');
    const unit=input.unit??state.unit,n=parseExpression(input.expression),fn=input.function??(input.mode==='inverse'?state.inverseFn:state.selected),deg=input.mode==='inverse'?inverse(fn,n):unit==='rad'?n*180/Math.PI:n;
    if(Math.abs(deg)>1000000)throw Error('Angle is out of range.');
    state.unit=unit;state.mode=input.mode;if(input.mode==='inverse'){state.inverseFn=fn;state.input=n;$('inverse-function').value=fn;$('inverse-input').value=input.expression;}else state.selected=fn;
    setAngle(deg);return {mode:state.mode,angleDegrees:state.deg,angleRadians:state.deg*Math.PI/180,exactRadians:piExact(state.deg),values:values(state.deg)};
  }};
  try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
