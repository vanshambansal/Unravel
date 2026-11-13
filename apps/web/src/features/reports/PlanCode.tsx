'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { EditorView as View } from '@codemirror/view';
import type { Compartment as Configuration } from '@codemirror/state';

export function PlanCode({ value, language, readOnly, label, onChange }: { value:string; language:'javascript'|'json'; readOnly:boolean; label:string; onChange(value:string):void }) {
  const root=useRef<HTMLDivElement>(null), editor=useRef<View|null>(null), config=useRef<Configuration|null>(null);
  const latest=useRef({value,language,readOnly,label,onChange}), external=useRef(false);
  const [failed,setFailed]=useState(false);
  const [ready,setReady]=useState(false);
  const noHistory=useRef<import('@codemirror/state').Annotation<boolean>|null>(null);
  const configuration=useRef<(()=>import('@codemirror/state').StateEffect<unknown>)|null>(null);
  useLayoutEffect(() => {
    const previous = latest.current;
    latest.current = { value, language, readOnly, label, onChange };
    const instance = editor.current;
    if (!instance) return;
    const changed = instance.state.doc.toString() !== value;
    const reconfigure = previous.language !== language || previous.readOnly !== readOnly || previous.label !== label;
    if (!changed && !reconfigure) return;
    // Change document and language together, retaining staged JSON undo history.
    external.current = true;
    try {
      const effect = reconfigure ? configuration.current?.() : undefined;
      instance.dispatch({
        changes: changed ? { from: 0, to: instance.state.doc.length, insert: value } : undefined,
        effects: effect ? [effect] : [],
        annotations: noHistory.current ? [noHistory.current] : [],
      });
    } finally { external.current = false; }
  }, [value, language, readOnly, label, onChange]);
  useEffect(()=>{
    let active=true;
    async function mount(){
      const [view,state,commands,lang,js,json,highlight]=await Promise.all([import('@codemirror/view'),import('@codemirror/state'),import('@codemirror/commands'),import('@codemirror/language'),import('@codemirror/lang-javascript'),import('@codemirror/lang-json'),import('@lezer/highlight')]);
      if(!active||!root.current)return;
      noHistory.current=state.Transaction.addToHistory.of(false);
      const settings=new state.Compartment(); config.current=settings;
      const extensions=()=>[state.EditorState.readOnly.of(latest.current.readOnly),view.EditorView.editable.of(!latest.current.readOnly),view.EditorView.contentAttributes.of({'aria-label':latest.current.label,role:'textbox','aria-multiline':'true','aria-readonly':String(latest.current.readOnly)}),latest.current.language==='json'?json.json():js.javascript({typescript:true})];
      const palette=lang.HighlightStyle.define([{tag:highlight.tags.keyword,color:'rgba(255,120,140,0.95)'},{tag:[highlight.tags.string,highlight.tags.special(highlight.tags.string)],color:'rgba(160,220,160,0.95)'},{tag:[highlight.tags.number,highlight.tags.bool,highlight.tags.null],color:'rgba(240,190,130,0.95)'},{tag:highlight.tags.comment,color:'rgba(255,255,255,0.62)'},{tag:[highlight.tags.propertyName,highlight.tags.function(highlight.tags.variableName)],color:'rgba(160,205,250,0.95)'},{tag:highlight.tags.punctuation,color:'rgba(255,255,255,0.6)'}]);
      const instance=new view.EditorView({parent:root.current,state:state.EditorState.create({doc:latest.current.value,extensions:[view.lineNumbers(),view.drawSelection(),commands.history(),lang.bracketMatching(),view.keymap.of([...commands.defaultKeymap,...commands.historyKeymap]),lang.syntaxHighlighting(palette),settings.of(extensions()),view.EditorView.lineWrapping,view.EditorView.theme({'&':{fontSize:'14px',backgroundColor:'rgba(10,12,16,0.72)',color:'#f6f2ec'},'.cm-content':{fontFamily:"'Unravel Product Mono', monospace",padding:'16px 0',caretColor:'#ffffff',lineHeight:'1.7'},'.cm-line':{padding:'0 20px 0 12px'},'.cm-scroller':{overflow:'auto',maxHeight:'min(65vh,620px)',minHeight:'300px'},'.cm-gutters':{backgroundColor:'rgba(8,10,14,0.85)',color:'rgba(255,255,255,0.62)',borderRight:'1px solid rgba(255,255,255,0.06)',padding:'16px 0'},'.cm-activeLineGutter':{backgroundColor:'rgba(255,255,255,0.05)'},'&.cm-focused':{outline:'1px solid rgba(255,255,255,0.2)',outlineOffset:'-1px'},'.cm-selectionBackground, &.cm-focused .cm-selectionBackground':{backgroundColor:'rgba(255,255,255,0.12)'}},{dark:true}),view.EditorView.updateListener.of(update=>{if(update.docChanged&&!external.current&&!latest.current.readOnly)latest.current.onChange(update.state.doc.toString());})]})});
      editor.current=instance;
      // Reconfigure without remounting; JSON undo history survives workspace switches.
      config.current=settings;
      configuration.current=()=>settings.reconfigure(extensions());
      setReady(true);
    }
    // Paint the preparing state before parsing and mounting the editor.
    let start: ReturnType<typeof setTimeout> | undefined;
    const paint = requestAnimationFrame(() => {
      start = setTimeout(() => { void mount().catch(() => { if (active) setFailed(true); }); }, 0);
    });
    return()=>{active=false;cancelAnimationFrame(paint);clearTimeout(start);editor.current?.destroy();editor.current=null;config.current=null;configuration.current=null;};
  },[]);
  return <div className="plan-code-editor">{!ready&&!failed&&<p role="status">Preparing code editor...</p>}<div ref={root} />{failed&&<label>Editor unavailable; plain text fallback<textarea aria-label={label} value={value} readOnly={readOnly} onChange={event=>onChange(event.target.value)} spellCheck={false}/></label>}</div>;
}
