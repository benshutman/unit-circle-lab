/* Unit-circle calculations. All angles are stored in degrees. */
export const functions = ['sin','cos','tan','csc','sec','cot'];
export const names = {sin:'Sine',cos:'Cosine',tan:'Tangent',csc:'Cosecant',sec:'Secant',cot:'Cotangent'};
export const invNames = {sin:'arcsin',cos:'arccos',tan:'arctan',csc:'arccsc',sec:'arcsec',cot:'arccot'};
export const colors = {sin:'#be2366',cos:'#2459d1',tan:'#08786f',csc:'#a42690',sec:'#6550ba',cot:'#a35a0a'};
export const normalize = deg => ((deg % 360) + 360) % 360;
export const clean = n => Math.abs(n) < 1e-12 ? 0 : n;
export function values(deg) {
  const rad = normalize(deg) * Math.PI / 180;
  const sin = clean(Math.sin(rad)), cos = clean(Math.cos(rad));
  return {sin,cos,tan:cos === 0 ? null:clean(sin/cos),csc:sin === 0 ? null:1/sin,sec:cos === 0 ? null:1/cos,cot:sin === 0 ? null:clean(cos/sin)};
}
export function inverse(fn,n) {
  if (!functions.includes(fn) || !Number.isFinite(n)) throw Error('Choose a function and enter a finite real number.');
  if (['sin','cos'].includes(fn) && Math.abs(n)>1) throw Error('This function needs an input from −1 to 1, inclusive.');
  if (['csc','sec'].includes(fn) && Math.abs(n)<1) throw Error('This function needs an input ≤ −1 or ≥ 1.');
  let r;
  if(fn==='sin') r=Math.asin(n);
  if(fn==='cos') r=Math.acos(n);
  if(fn==='tan') r=Math.atan(n);
  if(fn==='csc') r=Math.asin(1/n);
  if(fn==='sec') r=Math.acos(1/n);
  if(fn==='cot') r=Math.atan2(1,n);
  return clean(r*180/Math.PI);
}
// A small expression parser: arithmetic, parentheses, pi, and square roots.
// Never executes input as JavaScript.
export function parseExpression(input) {
  const s=String(input).toLowerCase().replace(/π/g,'pi').replace(/√/g,'sqrt').replace(/[−–]/g,'-').replace(/×/g,'*').replace(/÷/g,'/').replace(/\s+/g,'');
  if(!s || s.length>160) throw Error('Enter a number or expression, such as −sqrt(3), 1/2, or 7pi/6.');
  const tokens=s.match(/(?:\d+(?:\.\d*)?|\.\d+)|pi|sqrt|[()+\-*/^]/g)||[];
  if(tokens.join('')!==s) throw Error('Use numbers, pi, sqrt( ), +, −, ×, ÷, and parentheses.');
  let i=0,depth=0;
  function atom(){
    if(++depth>40)throw Error('Please simplify the expression.');
    const t=tokens[i++];let v;
    if(t==='('){v=sum();if(tokens[i++]!==')')throw Error('Check your parentheses.');}
    else if(t==='pi')v=Math.PI;
    else if(t==='sqrt'){v=Math.sqrt(atom());}
    else if(t && /^(?:\d|\.)/.test(t))v=Number(t);
    else throw Error('Check the expression. Try −sqrt(3) or 1/2.');
    depth--;return v;
  }
  function power(){let v=atom();if(tokens[i]==='^'){i++;v=v**unary();}return v;}
  function unary(){if(tokens[i]==='+'){i++;return unary();}if(tokens[i]==='-'){i++;return -unary();}return power();}
  function product(){let v=unary();while(i<tokens.length){const t=tokens[i];if(t==='*'||t==='/'){i++;const w=unary();v=t==='*'?v*w:v/w;}else if(t==='('||t==='pi'||t==='sqrt'||/^(?:\d|\.)/.test(t)){v*=unary();}else break;}return v;}
  function sum(){let v=product();while(tokens[i]==='+'||tokens[i]==='-'){const t=tokens[i++],w=product();v=t==='+'?v+w:v-w;}return v;}
  const n=sum();if(i!==tokens.length || !Number.isFinite(n))throw Error('The expression must be a finite real number. Check for division by zero or a negative square root.');
  return clean(n);
}
export function decimal(n,digits=5){return n===null?'undefined':Number(clean(n).toFixed(digits)).toLocaleString('en-US',{maximumFractionDigits:digits,useGrouping:false}).replace('-','−');}
export function exact(n) {
  if(n===null)return 'undefined';
  const sign=n < -1e-11 ? '−' : '', a=Math.abs(n);
  const known=[[0,'0'],[0.5,'1/2'],[Math.SQRT1_2,'√2/2'],[Math.sqrt(3)/2,'√3/2'],[1,'1'],[Math.sqrt(3)/3,'√3/3'],[2*Math.sqrt(3)/3,'2√3/3'],[Math.SQRT2,'√2'],[Math.sqrt(3),'√3'],[2,'2']];
  for(const [value,str]of known)if(Math.abs(a-value)<1e-10)return sign+str;
  return null;
}
function gcd(a,b){return b?gcd(b,a%b):a;}
export function piExact(deg){
  if(Math.abs(deg)<1e-10)return '0';
  const r=deg/180;
  for(let q=1;q<=72;q++){const p=Math.round(r*q);if(Math.abs(r-p/q)<1e-10){const g=gcd(Math.abs(p),q),n=p/g,d=q/g;return (n<0?'−':'')+(Math.abs(n)===1?'':Math.abs(n))+'π'+(d===1?'':'/'+d);}}
  return null;
}
export function angleText(deg,unit='deg'){return unit==='deg'?decimal(deg)+'°':(piExact(deg)??decimal(deg*Math.PI/180)+' rad');}
export function reference(deg){const n=normalize(deg);return n<=90?n:n<=180?180-n:n<=270?n-180:360-n;}
export function quadrant(deg){const n=normalize(deg);if(Math.abs(n%90)<1e-8)return 'On an axis';return 'Quadrant '+['I','II','III','IV'][Math.floor(n/90)];}
export const branches={
  sin:{min:-90,max:90,rangeDeg:'[−90°, 90°]',rangeRad:'[−π/2, π/2]',domain:'[−1, 1]',note:'Sine returns a principal angle in quadrant I or IV, including the endpoints.'},
  cos:{min:0,max:180,rangeDeg:'[0°, 180°]',rangeRad:'[0, π]',domain:'[−1, 1]',note:'Cosine returns a principal angle on the upper half of the circle.'},
  tan:{min:-90,max:90,rangeDeg:'(−90°, 90°)',rangeRad:'(−π/2, π/2)',domain:'all real numbers',note:'Tangent returns a principal angle in quadrant I or IV. The endpoints are excluded.'},
  csc:{min:-90,max:90,rangeDeg:'[−90°, 0°) ∪ (0°, 90°]',rangeRad:'[−π/2, 0) ∪ (0, π/2]',domain:'(−∞, −1] ∪ [1, ∞)',note:'Here arccsc(v) = arcsin(1/v); zero is excluded from its angle range.'},
  sec:{min:0,max:180,rangeDeg:'[0°, 90°) ∪ (90°, 180°]',rangeRad:'[0, π/2) ∪ (π/2, π]',domain:'(−∞, −1] ∪ [1, ∞)',note:'Here arcsec(v) = arccos(1/v); 90° is excluded from its angle range.'},
  cot:{min:0,max:180,rangeDeg:'(0°, 180°)',rangeRad:'(0, π)',domain:'all real numbers',note:'Here arccot returns an angle between 0° and 180°. Its conventions can vary by textbook.'}
};
