import type {Action,ReplayEvent,SemanticEvent} from '@unravel/contracts';
import {actionTargetLabel} from '../../../../../packages/sdk/src/action-label';
export function actionSummary(event:Action,inferred=''){
 const name=event.targetLabel||inferred;
 const kind=event.target.kind==='css'?(event.target.value.split(' > ').at(-1)?.split(':')[0]??'control'):event.target.kind==='unresolved'?event.target.tag:'control';
 const target=name?`“${name}”`:kind==='input'?'input field':kind==='textarea'?'text area':kind==='select'?'selection field':kind==='button'?'button':kind==='form'?'form':'page control';
 const verb={click:'Clicked',fill:'Entered text in',select:'Changed selection in',check:'Toggled',submit:'Submitted'}[event.action];
 return `${verb} ${target}${event.redacted?' (value masked)':''}`;
}
/** Read-only labels from an existing sanitized snapshot. Does not modify stored evidence. */
export function replayActionContext(replay:ReplayEvent[],events:SemanticEvent[],startedAt:number):{labels:Record<number,string>;seeks:Record<number,number>}{
 const nodeIds=new WeakMap<Node,number>();
 const snapshot=replay.find(e=>e.type===2)?.data as {node?:unknown}|undefined;
 const doc=document.implementation.createHTMLDocument('');
 const build=(raw:unknown):Node|null=>{
  if(!raw||typeof raw!=='object')return null;const n=raw as {type:number;id?:number;tagName?:string;textContent?:string;childNodes?:unknown[]};
  if(n.type===3)return doc.createTextNode(n.textContent??'');
  if(n.type!==0&&n.type!==2)return null;
  const tag=n.tagName??'div';if(['script','style','iframe','img','link','object','embed'].includes(tag))return null;
  const node=n.type===0?doc.createDocumentFragment():doc.createElement(tag);if(n.id!==undefined)nodeIds.set(node,n.id);
  for(const child of n.childNodes??[]){const value=build(child);if(value)node.appendChild(value);}return node;
 };
 const root=build(snapshot?.node);if(!root)return {labels:{},seeks:{}};
 const html=root.nodeType===11?(root as DocumentFragment).querySelector('html'):null;
 if(html)doc.replaceChild(html,doc.documentElement);else doc.body.append(root);
 const labels:Record<number,string>={},seeks:Record<number,number>={};
 const inputsByNode=new Map<number,ReplayEvent[]>();
 for(const entry of replay){
  const data=entry.data as {source?:number;id?:number};
  if(entry.type!==3||data.source!==5||typeof data.id!=='number')continue;
  const entries=inputsByNode.get(data.id);
  if(entries)entries.push(entry);else inputsByNode.set(data.id,[entry]);
 }
 const targets=new Map<string,Element|null>();
 events.forEach((event,index)=>{
  if(event.kind!=='action'||event.target.kind!=='css')return;
  try{
   const selector=event.target.value;
   if(!targets.has(selector))targets.set(selector,doc.querySelector(selector));
   const target=targets.get(selector);if(!target)return;
   if(!event.targetLabel){const name=actionTargetLabel(target);if(name)labels[index]=name;}
   if(!['fill','select','check'].includes(event.action))return;
   const id=nodeIds.get(target);
   if(id===undefined)return;
   const input=inputsByNode.get(id)?.find(e=>{const d=e.data as {id?:number;text?:string};const at=e.timestamp-startedAt;
    return d.id===id&&at>=event.at-5&&at<=event.at+2000&&(event.redacted?d.text==='[redacted]':d.text===event.value);
   });
   if(input)seeks[index]=Math.max(event.at,input.timestamp-startedAt+1);
  }catch{/* Unsupported historic selector keeps its original timestamp and generic label. */}
 });
 return {labels,seeks};
}
