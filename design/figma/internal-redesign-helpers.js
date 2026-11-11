// Native Figma authoring only. No application/runtime changes.
const page = await figma.getNodeByIdAsync('82:31');
await figma.setCurrentPageAsync(page);
const ids = [];
const track = n => { ids.push(n.id); return n; };
await Promise.all([
  ['Inter','Regular'],['Inter','Medium'],['Inter','Semi Bold'],
  ['Manrope','SemiBold'],['IBM Plex Mono','Regular']
].map(([family,style]) => figma.loadFontAsync({family,style})));
const vars = Object.fromEntries((await figma.variables.getLocalVariablesAsync()).filter(v=>v.variableCollectionId==='VariableCollectionId:82:32').map(v=>[v.name,v]));
const styles = Object.fromEntries((await figma.getLocalTextStylesAsync()).filter(s=>s.name.startsWith('Unravel exploration/')).map(s=>[s.name.split('/')[1],s]));
const rgb = h => ({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
function paint(k,opacity=1){return figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb('#191b22'),opacity},'color',vars['Color/'+k]);}
function gradient(a,b,alpha=1){return {type:'GRADIENT_LINEAR',gradientTransform:[[0,1,0],[-1,0,1]],gradientStops:[{position:0,color:{...rgb(a),a:alpha}},{position:1,color:{...rgb(b),a:alpha}}]};}
function box(parent,name,w,dir='VERTICAL',gap=16,pad=0,bg=null,h=null){
  const n=track(figma.createAutoLayout(dir)); n.name=name;n.resize(w,10);n.primaryAxisSizingMode=dir==='VERTICAL'?'AUTO':'FIXED';n.counterAxisSizingMode=dir==='VERTICAL'?'FIXED':'AUTO';
  n.itemSpacing=gap; n.paddingTop=n.paddingBottom=n.paddingLeft=n.paddingRight=pad;n.fills=bg?[paint(bg)]:[];n.clipsContent=false;parent.appendChild(n);
  for(const [prop,value] of [['itemSpacing',gap],['paddingTop',pad],['paddingBottom',pad],['paddingLeft',pad],['paddingRight',pad]])if(vars['space'+value])n.setBoundVariable(prop,vars['space'+value]);
  if(h!==null)fixed(n,h);return n;
}
function fixed(n,h){n.resize(n.width,h);n.primaryAxisSizingMode='FIXED';n.counterAxisSizingMode='FIXED';return n;}
function txt(parent,value,w,kind='Body',color='text'){
 const n=track(figma.createText()),s=styles[kind];n.name=value.split('\n')[0].slice(0,70);n.fontName=s.fontName;n.textStyleId=s.id;n.characters=value;n.resize(w,s.fontSize*1.5);n.textAutoResize='HEIGHT';n.fills=[paint(color)];parent.appendChild(n);return n;
}
function surface(n,raised=false,r=16){n.fills=[paint(raised?'raised':'surface',.96)];n.strokes=[paint('border',.8)];n.strokeWeight=1;n.cornerRadius=r;if(vars['radius'+r])n.setBoundVariable('cornerRadius',vars['radius'+r]);return n;}
function rule(p,w){const n=track(figma.createRectangle());n.name='Divider';n.resize(w,1);n.fills=[paint('border',.6)];p.appendChild(n);return n;}
function spacer(p,w,h=1){return box(p,'Flexible space',w,'VERTICAL',0,0,null,h);}
function chip(p,label,tone='muted',w=null){const width=w??Math.ceil(label.length*7+24);const n=box(p,'Status / '+label,width,'HORIZONTAL',6,8,'raised',32);n.counterAxisAlignItems='CENTER';n.cornerRadius=8;txt(n,label,width-16,'Small',tone);return n;}
const paths={grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',reports:'M6 3h9l4 4v14H6z M14 3v5h5 M9 12h7 M9 16h5',code:'m8 7-5 5 5 5 m8-10 5 5-5 5 m-3-13-2 16',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',chevron:'m9 5 7 7-7 7',down:'m6 9 6 6 6-6',arrow:'M5 12h14 m-6-6 6 6-6 6',plus:'M12 5v14 M5 12h14',play:'m8 5 11 7-11 7z',pause:'M8 5v14 M16 5v14',check:'m5 12 4 4L19 6',close:'m6 6 12 12 M18 6 6 18',copy:'M8 8h12v13H8z M16 8V3H3v13h5',globe:'M3 12h18 M12 3c6 5 6 13 0 18-6-5-6-13 0-18 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',clock:'M12 7v6l4 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6',more:'M5 12h.01 M12 12h.01 M19 12h.01',shield:'m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6z m-4 10 3 3 5-6',download:'M12 3v12 m-5-5 5 5 5-5 M5 17v4h14v-4',error:'M12 8v5 M12 17h.01 M12 2 2 21h20z',bug:'M8 8h8v8a4 4 0 0 1-8 0z M9 8V5h6v3 M4 10h4 M16 10h4 M4 15h4 M16 15h4 M6 21l3-3 M18 21l-3-3'};
function icon(p,name,size=20,color='muted'){const n=track(figma.createNodeFromSvg(`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${paths[name]??paths.grid}" stroke="#b4b1bd" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`));n.name='Icon / '+name;n.resize(size,size);p.appendChild(n);for(const v of n.findAllWithCriteria({types:['VECTOR']})){v.strokes=[paint(color)];ids.push(v.id);}return n;}
const markPath='M20.43 4.64h-9.29c-4.64 0-6.5 2.79-6.5 6.5 0 3.72 2.79 5.57 6.5 5.57h3.72c3.71 0 6.5-2.78 6.5-6.5 M4.64 15.79c0-3.72 2.79-6.5 6.5-6.5h3.72c3.71 0 6.5 1.85 6.5 5.57 0 3.71-1.86 6.5-6.5 6.5H5.57';
function brand(p,w=160){const n=box(p,'Unravel',w,'HORIZONTAL',10,0,null,32);n.counterAxisAlignItems='CENTER';const m=track(figma.createNodeFromSvg(`<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="${markPath}" fill="none" stroke="#f47985" stroke-width="1.8" stroke-linecap="round"/></svg>`));m.name='Existing Unravel trace mark';n.appendChild(m);for(const c of m.findAll())ids.push(c.id);txt(n,'unravel',w-36,'Title');return n;}
function btn(p,label,primary=false,w=150){
 const key='Redesign / Button / '+(primary?'Primary':'Secondary');const master=page.findOne(n=>n.type==='COMPONENT'&&n.name===key);
 if(master){const n=track(master.createInstance());p.appendChild(n);n.resize(w,44);const t=n.findOne(x=>x.type==='TEXT');t.characters=label;t.resize(w-28,22);t.layoutSizingHorizontal='FILL';n.name='Action / '+label;for(const c of n.findAll())ids.push(c.id);return n;}
 const n=surface(box(p,'Action / '+label,w,'HORIZONTAL',0,12,primary?'text':'raised',44),false,8);n.fills=[paint(primary?'text':'raised')];n.counterAxisAlignItems='CENTER';n.primaryAxisAlignItems='CENTER';const t=txt(n,label,w-24,'Label',primary?'canvas':'text');t.textAlignHorizontal='CENTER';return n;
}
function field(p,label,value,w,help=null,error=false){const n=box(p,'Field / '+label,w,'VERTICAL',8);txt(n,label,w,'Label');const input=surface(box(n,'Input',w,'HORIZONTAL',8,12,'inset',46),false,8);input.fills=[paint('inset')];input.counterAxisAlignItems='CENTER';txt(input,value,w-24,'Body',error?'accent':'text');if(help)txt(n,help,w,'Small',error?'accent':'muted');return n;}
function heading(p,title,description,w,action=null){const r=box(p,'Page heading',w,'HORIZONTAL',20);const copy=box(r,'Purpose',action?w-200:w,'VERTICAL',6);txt(copy,title,copy.width,'Heading');if(description)txt(copy,description,copy.width,'Body','muted');if(action)btn(r,action,true,180);return r;}
function nav(p,label,i,w,selected=false){const r=box(p,'Navigation / '+label,w,'HORIZONTAL',12,12,selected?'raised':null,46);r.cornerRadius=10;r.counterAxisAlignItems='CENTER';icon(r,i,20,selected?'accent':'muted');txt(r,label,w-56,'Label',selected?'text':'muted');return r;}
function art(p,w,h){const n=track(figma.createRectangle());n.name='Approved atrium artwork / scene only';n.resize(w,h);n.fills=[{type:'IMAGE',imageHash:'7539a96a4f6ee0bcd7dd988f34a9d773e7feba97',scaleMode:'FILL'}];p.appendChild(n);return n;}
function root(name,w,h,x,y){if(page.children.some(n=>n.name===name))throw new Error('Frame already exists: '+name);const n=track(figma.createFrame());n.name=name;n.resize(w,h);n.x=x;n.y=y;n.fills=[paint('canvas')];n.clipsContent=true;page.appendChild(n);return n;}
function shell(name,direction,active='Reports',h=900){
 const r=root(name,1440,h,direction==='A'?120:1800,0);r.fills=[gradient('#18151d','#090b10')];
 if(direction==='A'){const backdrop=art(r,1440,h);backdrop.name='Architectural backdrop / low contrast';backdrop.opacity=.22;}
 const a=box(r,'Application',direction==='A'?1400:1440,'VERTICAL',0,0,null,h-(direction==='A'?40:0));a.x=direction==='A'?20:0;a.y=direction==='A'?20:0;a.clipsContent=true;
 if(direction==='A'){surface(a,false,20);a.fills=[paint('surface',.82)];a.effects=[{type:'DROP_SHADOW',color:{r:0,g:0,b:0,a:.35},offset:{x:0,y:20},radius:50,spread:0,visible:true,blendMode:'NORMAL'}];}
 const bar=box(a,'Workspace header',a.width,'HORIZONTAL',24,20,direction==='A'?'raised':null,64);bar.counterAxisAlignItems='CENTER';brand(bar,160);const sw=box(bar,'Project switcher',260,'HORIZONTAL',12,0,null,28);icon(sw,'globe');txt(sw,'Question desk',192,'Label');icon(sw,'down',16);spacer(bar,bar.width-652);icon(bar,'search');const av=surface(box(bar,'Account',32,'VERTICAL',0,4,'raised',32),true,8);txt(av,'V',24,'Label').textAlignHorizontal='CENTER';
 rule(a,a.width);const row=box(a,'Workspace body',a.width,'HORIZONTAL',0,0,null,a.height-65);
 if(direction==='A'){const rail=box(row,'Project navigation',208,'VERTICAL',6,16,'black',row.height);rail.fills=[paint('black',.62)];rail.effects=[{type:'BACKGROUND_BLUR',radius:20,visible:true}];txt(rail,'Workspace',176,'Small','muted');nav(rail,'All projects','grid',176,active==='Projects');spacer(rail,176,18);txt(rail,'Question desk',176,'Small','muted');nav(rail,'Reports','reports',176,active==='Reports');nav(rail,'SDK setup','code',176,active==='SDK setup');nav(rail,'Settings','settings',176,active==='Settings');spacer(rail,176,Math.max(10,row.height-510));const foot=box(rail,'Privacy note',176,'VERTICAL',8);icon(foot,'shield');txt(foot,'Your workspace.\nYour evidence.',176,'Small','muted');}
 const body=box(row,'Working area',direction==='A'?1192:1440,'VERTICAL',20,direction==='A'?28:40,null,row.height);const w=body.width-(direction==='A'?56:80);
 if(direction==='B'){const tabs=box(body,'Project navigation',w,'HORIZONTAL',8,0,null,42);for(const [lab,i]of [['Reports','reports'],['SDK setup','code'],['Settings','settings']])nav(tabs,lab,i,144,active===lab);spacer(tabs,w-632);txt(tabs,'Personal workspace',160,'Small','muted');}
 return {root:r,body,w};
}
function summary(n){return {id:n.id,name:n.name,width:n.width,height:n.height,descendants:n.findAll().length};}
