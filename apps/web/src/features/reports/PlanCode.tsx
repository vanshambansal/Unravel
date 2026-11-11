'use client';
import { useEffect, useRef, useState } from 'react';
import type { EditorView as View } from '@codemirror/view';
import type { Compartment as Configuration } from '@codemirror/state';

export function PlanCode({ value, language, readOnly, label, onChange }: { value:string; language:'javascript'|'json'; readOnly:boolean; label:string; onChange(value:string):void }) {
  const root=useRef<HTMLDivElement>(null), editor=useRef<View|null>(null), config=useRef<Configuration|null>(null);
  const latest=useRef({value,language,readOnly,label,onChange}), external=useRef(false);
  const [failed,setFailed]=useState(false);
  const noHistory=useRef<import('@codemirror/state').Annotation<boolean>|null>(null);
  useEffect(()=>{latest.current={value,language,readOnly,label,onChange};},[value,language,readOnly,label,onChange]);
  useEffect(()=>{
    let active=true;
    async function mount(){
      const [view,state,commands,lang,js,json,highlight]=await Promise.all([import('@codemirror/view'),import('@codemirror/state'),import('@codemirror/commands'),import('@codemirror/language'),import('@codemirror/lang-javascript'),import('@codemirror/lang-json'),import('@lezer/highlight')]);
      if(!active||!root.current)return;
      noHistory.current=state.Transaction.addToHistory.of(false);
      const settings=new state.Compartment(); config.current=settings;
      const extensions=()=>[state.EditorState.readOnly.of(latest.current.readOnly),view.EditorView.editable.of(!latest.current.readOnly),view.EditorView.contentAttributes.of({'aria-label':latest.current.label,role:'textbox','aria-multiline':'true','aria-readonly':String(latest.current.readOnly)}),latest.current.language==='json'?json.json():js.javascript({typescript:true})];
      const palette=lang.HighlightStyle.define([{tag:highlight.tags.keyword,color:'#ef9dab'},{tag:[highlight.tags.string,highlight.tags.special(highlight.tags.string)],color:'#b8dab8'},{tag:[highlight.tags.number,highlight.tags.bool,highlight.tags.null],color:'#ecc28c'},{tag:highlight.tags.comment,color:'#a0a9b7'},{tag:[highlight.tags.propertyName,highlight.tags.function(highlight.tags.variableName)],color:'#a8ccec'},{tag:highlight.tags.punctuation,color:'#d1d2dc'}]);
      const instance=new view.EditorView({parent:root.current,state:state.EditorState.create({doc:latest.current.value,extensions:[view.lineNumbers(),view.drawSelection(),commands.history(),lang.bracketMatching(),view.keymap.of([...commands.defaultKeymap,...commands.historyKeymap]),lang.syntaxHighlighting(palette),settings.of(extensions()),view.EditorView.lineWrapping,view.EditorView.theme({'&':{fontSize:'14px',backgroundColor:'#101218',color:'#f3f2ee'},'.cm-content':{fontFamily:"'Unravel Product Mono', monospace",padding:'16px 0',caretColor:'#ef4b53',lineHeight:'1.7'},'.cm-line':{padding:'0 20px 0 12px'},'.cm-scroller':{overflow:'auto',maxHeight:'min(65vh,620px)',minHeight:'300px'},'.cm-gutters':{backgroundColor:'#14161c',color:'#969daa',borderRight:'1px solid #ffffff12',padding:'16px 0'},'.cm-activeLineGutter':{backgroundColor:'#ffffff08'},'&.cm-focused':{outline:'2px solid #ef4b5380',outlineOffset:'-2px'},'.cm-selectionBackground, &.cm-focused .cm-selectionBackground':{backgroundColor:'#ef4b5330'}},{dark:true}),view.EditorView.updateListener.of(update=>{if(update.docChanged&&!external.current&&!latest.current.readOnly)latest.current.onChange(update.state.doc.toString());})]})});
      editor.current=instance;
      // Reconfigure without remounting; JSON undo history survives workspace switches.
      config.current=settings;
      configuration.current=()=>settings.reconfigure(extensions());
    }
    void mount().catch(()=>{if(active)setFailed(true);});
    return()=>{active=false;editor.current?.destroy();editor.current=null;config.current=null;configuration.current=null;};
  },[]);
  const configuration=useRef<(()=>import('@codemirror/state').StateEffect<unknown>)|null>(null);
  useEffect(()=>{const instance=editor.current;if(!instance)return;external.current=true;try{const effect=configuration.current?.();instance.dispatch({...(instance.state.doc.toString()!==value?{changes:{from:0,to:instance.state.doc.length,insert:value}}:{}),effects:effect?[effect]:[],annotations:noHistory.current?[noHistory.current]:[]});}finally{external.current=false;}},[value,language,readOnly,label]);
  return <div className="plan-code-editor"><div ref={root} />{failed&&<label>Editor unavailable; plain text fallback<textarea aria-label={label} value={value} readOnly={readOnly} onChange={event=>onChange(event.target.value)} spellCheck={false}/></label>}</div>;
}
