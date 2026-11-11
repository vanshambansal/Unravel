// Figma authoring helpers; not application/runtime code. Loaded into use_figma.
const ids = [];
const track = node => { ids.push(node.id); return node; };
await Promise.all([
  { family: 'Inter', style: 'Regular' }, { family: 'Inter', style: 'Medium' },
  { family: 'Manrope', style: 'SemiBold' }, { family: 'IBM Plex Mono', style: 'Regular' },
].map(font => figma.loadFontAsync(font)));
const variables = await figma.variables.getLocalVariablesAsync();
const tokens = Object.fromEntries(variables.map(v => [v.name, v]));
const styles = Object.fromEntries((await figma.getLocalTextStylesAsync()).map(s => [s.name, s]));
const rgb = hex => ({ r: parseInt(hex.slice(1,3),16)/255, g: parseInt(hex.slice(3,5),16)/255, b: parseInt(hex.slice(5,7),16)/255 });
function paint(name, opacity = 1) {
  const p = { type: 'SOLID', color: rgb('#111318'), opacity };
  return figma.variables.setBoundVariableForPaint(p, 'color', tokens[name]);
}
function frame(parent, name, width, direction = 'VERTICAL', gap = 16, padding = 0, fill = null) {
  const n = track(figma.createAutoLayout()); n.name = name; n.layoutMode = direction;
  n.resize(width, 10); n.primaryAxisSizingMode = direction === 'VERTICAL' ? 'AUTO' : 'FIXED'; n.counterAxisSizingMode = direction === 'VERTICAL' ? 'FIXED' : 'AUTO';
  n.itemSpacing = gap; n.paddingTop = n.paddingBottom = n.paddingLeft = n.paddingRight = padding;
  n.fills = fill ? [paint(fill)] : []; n.clipsContent = false;
  if (tokens['space/'+gap]) n.setBoundVariable('itemSpacing',tokens['space/'+gap]);
  if (tokens['space/'+padding]) for (const key of ['paddingTop','paddingBottom','paddingLeft','paddingRight']) n.setBoundVariable(key,tokens['space/'+padding]);
  parent.appendChild(n); return n;
}
function surface(n, raised = false) {
  n.fills = [paint(raised ? 'color/raised' : 'color/surface')];
  n.strokes = [paint('color/border',.7)]; n.strokeWeight = 1; n.cornerRadius = 12;
  return n;
}
function text(parent, value, width, kind = 'Body', color = 'color/text') {
  const n = track(figma.createText()); n.name = value.split('\n')[0].slice(0,64);
  const s = styles['Unravel/'+kind]; n.fontName = s.fontName; n.textStyleId = s.id;
  n.characters = value; n.resize(width, Math.max(20,s.fontSize*1.5)); n.textAutoResize = 'HEIGHT';
  n.fills = [paint(color)]; parent.appendChild(n); return n;
}
function line(parent,width) {
  const n=track(figma.createRectangle());n.name='Divider';n.resize(width,1);n.fills=[paint('color/border',.65)];parent.appendChild(n);return n;
}
function fixed(n,height) { n.resize(n.width,height); n.primaryAxisSizingMode='FIXED'; return n; }
function chip(parent,label,accent=false) {
  const n=frame(parent,label,Math.max(70,label.length*7+24),'HORIZONTAL',8,8,accent?'color/raised':null);
  n.cornerRadius=6; text(n,label,n.width-16,'Small',accent?'color/crimson':'color/muted'); return n;
}
const light = await figma.getNodeByIdAsync('2:39');
const quiet = await figma.getNodeByIdAsync('2:41');
function button(parent,label,primary=false,width=156) {
  const n=track((primary?light:quiet).createInstance());n.name='Button / '+label;
  parent.appendChild(n);n.resize(width,44); const t=n.findOne(c=>c.type==='TEXT'); t.characters=label;
  t.layoutSizingHorizontal='FILL'; t.layoutGrow=1; t.textAutoResize='HEIGHT'; t.textAlignHorizontal='CENTER';
  return n;
}
function header(parent,project='All projects') {
  const n=frame(parent,'Global navigation',1440,'HORIZONTAL',24,24,'color/surface');
  n.counterAxisAlignItems='CENTER';fixed(n,76);
  text(n,'unravel',145,'Title');line(n,1).resize(1,24);
  text(n,project+'  ⌄',325,'Label');
  const space=frame(n,'Flexible header space',675);fixed(space,20);
  chip(n,'Personal'); text(n,'VA',32,'Label'); return n;
}
function titleRow(parent,title,subtitle,width=1296,action=null) {
  const r=frame(parent,'Page heading',width,'HORIZONTAL',24);
  const copy=frame(r,'Heading and description',action?width-220:width,'VERTICAL',8);
  text(copy,title,copy.width,'Heading');text(copy,subtitle,copy.width,'Body','color/muted');
  if(action)button(r,action,true,196);return r;
}
function field(parent,label,value,width,multiline=false) {
  const n=frame(parent,'Field / '+label,width,'VERTICAL',8);
  text(n,label,width,'Label'); const box=surface(frame(n,'Input',width,'VERTICAL',8,12,'color/raised'),true);
  text(box,value,width-24,'Small','color/muted');if(multiline)fixed(box,76);return n;
}
function notes(parent,title,body,width) {
  const n=frame(parent,title,width,'VERTICAL',8,20,'color/surface');n.cornerRadius=10;
  text(n,title,width-40,'Label');text(n,body,width-40,'Small','color/muted');return n;
}
function evidence(root) {
  const nodes=root.findAll(()=>true),counts={};for(const n of nodes)counts[n.type]=(counts[n.type]??0)+1;
  return {id:root.id,name:root.name,width:root.width,height:root.height,counts,
    imageNodes:nodes.filter(n=>Array.isArray(n.fills)&&n.fills.some(p=>p.type==='IMAGE')).map(n=>({id:n.id,name:n.name,type:n.type,width:n.width,height:n.height})),
    fonts:[...new Set(nodes.filter(n=>n.type==='TEXT').flatMap(n=>n.getStyledTextSegments(['fontName']).map(s=>s.fontName.family)))]};
}
