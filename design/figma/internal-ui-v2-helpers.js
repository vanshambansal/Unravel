// V2-only Figma authoring extensions. Never mutate V1 styles or masters.
function type(parent,value,width,kind='Body',color='color/text') {
  const n=track(figma.createText());const s=styles['Unravel V2/'+kind];
  n.name=value.split('\n')[0].slice(0,70);n.fontName=s.fontName;n.textStyleId=s.id;
  n.characters=value;n.resize(width,24);n.textAutoResize='HEIGHT';n.fills=[paint(color)];parent.appendChild(n);return n;
}
function panel(n,elevated=false) {
  n.fills=[paint(elevated?'v2/raised':'v2/surface')];n.strokes=[paint('v2/border')];
  n.strokeWeight=1;n.cornerRadius=16;return n;
}
function vbutton(parent,label,primary=false,width=156,height=44) {
  const n=button(parent,label,primary,width);n.resize(width,height);
  const t=n.findOne(c=>c.type==='TEXT');t.textStyleId=styles['Unravel V2/Label'].id;
  t.layoutSizingHorizontal='FILL';t.layoutGrow=1;t.textAutoResize='HEIGHT';
  n.cornerRadius=10;return n;
}
function badge(parent,label,accent=false,width=null) {
  const w=width??Math.ceil(label.length*7.2+24);const n=frame(parent,label,w,'HORIZONTAL',8,8,accent?'v2/raised':null);
  n.cornerRadius=7;type(n,label,w-16,'Caption',accent?'color/crimson':'color/muted');return n;
}
function brand(parent,width=168) {
  const r=frame(parent,'Unravel brand',width,'HORIZONTAL',10);r.counterAxisAlignItems='CENTER';
  const mark=track(figma.createNodeFromSvg(MARK));r.appendChild(mark);mark.resize(28,28);
  type(r,'unravel',width-38,'Title');return r;
}
function topbar(parent,project='All projects') {
  const r=frame(parent,'V2 / global header',1440,'HORIZONTAL',24,24,'v2/surface');r.counterAxisAlignItems='CENTER';fixed(r,72);
  brand(r,168);line(r,1).resize(1,24);type(r,project+'  ⌄',290,'Label');
  const spacer=frame(r,'Flexible navigation space',580);fixed(spacer,12);
  type(r,'Docs ↗',76,'Caption','color/muted');badge(r,'Personal');const a=panel(frame(r,'Account avatar',32,'VERTICAL',0,6),true);type(a,'V',20,'Label');return r;
}
function vfield(parent,label,value,width,large=false) {
  const r=frame(parent,'Field / '+label,width,'VERTICAL',8);type(r,label,width,'Label');
  const box=panel(frame(r,'Input surface',width,'VERTICAL',8,14,'v2/raised'),true);box.cornerRadius=10;
  type(box,value,width-28,'Body',large?'color/muted':'color/text');if(large)fixed(box,100);return r;
}
function caption(parent,title,body,width) {
  const r=frame(parent,title,width,'VERTICAL',8,0);type(r,title,width,'Label');type(r,body,width,'Caption','color/muted');return r;
}
