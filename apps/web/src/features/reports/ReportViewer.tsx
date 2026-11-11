'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { SemanticEvent } from '@unravel/contracts';
import type { CSSProperties } from 'react';
import { InvestigationSurface, PanelHeading } from '../workspace/compositions';
import { LayoutGroup, motion } from 'motion/react';

const timestamp = (ms: number) => `${(ms / 1000).toFixed(2)}s`;
function label(event: SemanticEvent): string {
  if (event.kind === 'action') return `${event.action} · ${event.target.kind !== 'unresolved' ? event.target.value : `${event.target.tag} (unresolved)`}${event.redacted ? ' · value masked' : ''}`;
  if (event.kind === 'network') return `${event.method} ${event.url?.path ?? '[path masked]'} · ${event.status ?? event.outcome}`;
  if (event.kind === 'error') return `${event.errorType} · ${event.message ?? 'message masked'}`;
  return `Navigate · ${event.url.path ?? '[path masked]'}`;
}
export function ReportViewer({ projectId, reportId, events, durationMs, startedAt, replayOrigin, styled = false, initialOffset, onReviewPlan }: { projectId: string; reportId: string; events: SemanticEvent[]; durationMs: number; startedAt: number; replayOrigin: string; styled?: boolean; initialOffset?: number; onReviewPlan?: () => void }) {
  const container = useRef<HTMLDivElement>(null), bridge = useRef<(type: string, offset?: number) => void>(() => {});
  const [state, setState] = useState('Loading replay'), [offset, setOffset] = useState(0), [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<number | null>(null), [error, setError] = useState('');
  const [actualSize, setActualSize] = useState(false);
  const [confirming, setConfirming] = useState(false), [deleting, setDeleting] = useState(false);
  const [filter, setFilter] = useState('all'), [share, setShare] = useState(66);
  const grid = useRef<HTMLDivElement>(null);
  const entries = events.map((event,index)=>({event,index})).sort((a,b)=>a.event.at-b.event.at);
  const visible = entries.filter(({event})=>filter==='all'||event.kind===filter);
  const chosen = selected === null ? null : events[selected];
  const router = useRouter();
  useEffect(() => {
    const root = container.current!; const frame = document.createElement('iframe');
    if (replayOrigin === location.origin || !/^http:\/\/127\.0\.0\.1:\d+$/.test(replayOrigin)) { setError('Configure an isolated loopback replay origin, separate from the dashboard.'); return; }
    // Permissions apply to a separate trusted origin, never to the dashboard or recorded document.
    frame.title = 'Session replay'; frame.setAttribute('sandbox', 'allow-scripts allow-same-origin'); frame.referrerPolicy = 'no-referrer'; frame.src = replayOrigin + '/';
    const controller = new AbortController(), channel = crypto.randomUUID(); let ready = false, active = true, initialized = false;
    const startup = window.setTimeout(() => { if (active && !ready) { setState('Replay unavailable'); setError('The isolated replay host is unavailable. Start pnpm replay:dev, then reload. Your report and timeline are still saved.'); } }, 10000);
    let replay: unknown[] | null = null, baseline = 0;
    function send(type: string, at = 0) { frame.contentWindow?.postMessage({ type, channel, offset: Math.max(0, at - baseline) }, replayOrigin); }
    bridge.current = send;
    function initialize() {
      if (ready && replay && !initialized) { initialized = true; frame.contentWindow?.postMessage({ type: 'initialize', channel, events: replay, durationMs: Math.max(0, durationMs - baseline) }, replayOrigin); }
    }
    function message(event: MessageEvent) {
      if (!active || event.origin !== replayOrigin || event.source !== frame.contentWindow || !event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'ready') { ready = true; initialize(); return; }
      if (event.data.channel !== channel) return;
      if (event.data.type === 'initialized') { clearTimeout(startup); setState('Replay ready'); if (initialOffset !== undefined) { send('seek', Math.min(durationMs, initialOffset)); setSelected(events.findIndex(event => event.at === initialOffset)); } }
      else if (event.data.type === 'finished') { setPlaying(false); setOffset(durationMs); }
      else if (event.data.type === 'failure') { setState('Replay unavailable'); setError('This masked recording could not be replayed. Its timeline is still available.'); }
      else if (['time','seeked'].includes(event.data.type) && typeof event.data.offset === 'number' && Number.isFinite(event.data.offset)) {
        const actual = Math.min(durationMs, Math.max(0, event.data.offset + baseline)); root.dataset.replayTime = String(actual); setOffset(actual);
      }
    }
    window.addEventListener('message', message); frame.addEventListener('load', () => send('ping')); root.append(frame);
    fetch(`/api/projects/${projectId}/reports/${reportId}/replay`, { signal: controller.signal, cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error(); const data = await response.json();
      if (!active || !Array.isArray(data.replay)) return;
      replay = data.replay; baseline = Math.max(0, Number(data.replay[0]?.timestamp ?? startedAt) - startedAt); initialize();
    }).catch(() => { if (active) { setError('Could not load the recording. Reload to retry.'); setState('Replay unavailable'); } });
    return () => { active = false; clearTimeout(startup); controller.abort(); window.removeEventListener('message', message); frame.remove(); bridge.current = () => {}; };
  }, [projectId, reportId, durationMs, startedAt, replayOrigin, initialOffset, events]);
  function seek(at: number) { setPlaying(false); setOffset(at); bridge.current('seek', at); }
  async function remove() {
    setDeleting(true); setError('');
    try { const response = await fetch(`/api/projects/${projectId}/reports/${reportId}`, { method: 'DELETE' }); if (!response.ok) throw new Error(); router.push(`/app/projects/${projectId}/reports`); router.refresh(); }
    catch { setError('Deletion failed. The report has not been confirmed deleted. Please retry.'); setDeleting(false); }
  }
  return <>
    {error && <p role="alert" className="product-field-error">{error}</p>}
    <InvestigationSurface className="report-grid" ref={grid} style={{'--replay-share':`${share}%`} as CSSProperties}>
      <section id="report-replay" className="report-replay" aria-label="Recorded session">
        <PanelHeading title="Session replay" status={<span role="status" className="product-small">{state}</span>} />
        <div className="report-player" ref={container} />
        <div className="report-controls"><button className="product-button secondary" disabled={state !== 'Replay ready'} onClick={() => { const next = !playing && offset >= durationMs - 20 ? 0 : offset; bridge.current(playing ? 'pause' : 'play', next); setOffset(next); setPlaying(!playing); }}>{playing ? 'Pause replay' : 'Play replay'}</button><button className="product-button secondary" disabled={state !== 'Replay ready'} aria-pressed={actualSize} onClick={() => { bridge.current(actualSize ? 'fit' : 'actual'); if(actualSize) container.current?.scrollIntoView({block:'nearest',behavior:'instant'}); setActualSize(!actualSize); }}>{actualSize ? 'Fit recording' : '100% size'}</button><output data-testid="replay-time" aria-live="off">{timestamp(offset)} / {timestamp(durationMs)}</output></div>
        {actualSize && <p className="product-small">Scroll inside the recording to inspect it at its original size.</p>}
        <label className="product-small" htmlFor="replay-position">Replay position</label>
        <input id="replay-position" type="range" min="0" max={durationMs} step="10" value={offset} onChange={event => seek(Number(event.target.value))} disabled={state !== 'Replay ready'} />
        <p className="report-policy product-small">{styled ? 'Masked styled replay. Bounded layout and colors are captured; scripts, images and external resources stay blocked.' : 'Legacy structural replay: styling was not captured. Submit a fresh recording for the new styled replay; text masking remains enabled.'}</p>
      </section>
      <div className="report-divider" role="separator" tabIndex={0} aria-label="Resize replay panel" aria-orientation="vertical" aria-valuemin={50} aria-valuemax={72} aria-valuenow={share} aria-controls="report-replay report-evidence"
        onKeyDown={event=>{const next=event.key==='ArrowLeft'?share-2:event.key==='ArrowRight'?share+2:event.key==='Home'?50:event.key==='End'?72:null;if(next!==null){event.preventDefault();setShare(Math.min(72,Math.max(50,next)));}}}
        onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);}}
        onPointerMove={event=>{if(!event.currentTarget.hasPointerCapture(event.pointerId))return;const box=grid.current!.getBoundingClientRect();setShare(Math.min(72,Math.max(50,Math.round((event.clientX-box.left)/box.width*100))));}}
        onPointerUp={event=>event.currentTarget.releasePointerCapture(event.pointerId)} />
      <section id="report-evidence" className="report-timeline" aria-label="Recorded events"><h2>Evidence</h2><p className="product-small">Select an event to seek the replay.</p>
        <LayoutGroup id={`evidence-${reportId}`}><div className="evidence-filters" role="group" aria-label="Filter evidence">{[['all','All'],['action','Actions'],['network','Network'],['error','Errors'],['navigation','Navigation']].map(([value,title])=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{filter===value&&<motion.span className="evidence-filter-selection" layoutId="filter" />}<span>{title}</span></button>)}</div>
        <motion.ol layoutScroll aria-label="Event timeline">{visible.map(({event,index}) => <li key={index}><button aria-label={`${event.kind} ${label(event)} ${timestamp(event.at)}`} className={selected === index ? 'selected' : ''} aria-pressed={selected === index} onClick={() => { setSelected(index); seek(event.at); }}>{selected === index && <motion.span className="evidence-selection" layoutId="selected-event" transition={{ type:'spring',stiffness:500,damping:42 }} />}<time>{timestamp(event.at)}</time><span className="report-event-kind">{event.kind}</span><span>{label(event)}</span></button></li>)}</motion.ol></LayoutGroup>
        {!visible.length&&<p className="evidence-empty">No {filter} events were captured in this recording.</p>}
        {chosen && <motion.div key={selected} className="report-event-details" initial={{opacity:.5,x:6}} animate={{opacity:1,x:0}} transition={{duration:.18}}><p className="evidence-type">{chosen.kind==='network' ? `HTTP ${chosen.status ?? chosen.outcome}` : chosen.kind}</p><h3>{chosen.kind==='network'?`${chosen.method} ${chosen.url?.path??'[path masked]'}`:chosen.kind==='action'?`${chosen.action} action`:chosen.kind==='error'?chosen.errorType:'Navigation'}</h3><dl>
          <div><dt>Time</dt><dd>{timestamp(chosen.at)}</dd></div>
          {chosen.kind==='network'&&<><div><dt>Status</dt><dd>{chosen.status??'Unavailable'} · {chosen.outcome}</dd></div><div><dt>Duration</dt><dd>{chosen.durationMs.toFixed(0)} ms</dd></div><div><dt>Transport</dt><dd>{chosen.transport}</dd></div><div><dt>Origin</dt><dd>{chosen.url?.origin??'Masked'}</dd></div></>}
          {chosen.kind==='action'&&<><div><dt>Target</dt><dd>{chosen.target.kind!=='unresolved'?chosen.target.value:`${chosen.target.tag} · unresolved`}</dd></div><div><dt>Value</dt><dd>{chosen.redacted?'Masked':chosen.value??'Not applicable'}</dd></div></>}
          {chosen.kind==='error'&&<><div><dt>Source</dt><dd>{chosen.source}</dd></div><div><dt>Message</dt><dd>{chosen.message??'Masked'}</dd></div></>}
          {chosen.kind==='navigation'&&<div><dt>Path</dt><dd>{chosen.url.path??'Masked'}</dd></div>}
        </dl><p className="product-small">Diagnostics are evidence, not a guaranteed root-cause diagnosis. Network bodies and headers are never captured.</p></motion.div>}
      </section>
    </InvestigationSurface>
    <aside className="report-next-step"><div><h3>Turn this sequence into a regression test</h3><p>Review reproduction steps, supply safe values and confirm the expected result.</p></div><button className="product-button secondary" onClick={onReviewPlan}>Review test plan</button></aside>
    <section className="product-notice report-retention"><h3>Development retention</h3><p>No automatic expiry. Only the project owner can read or permanently delete this report. Deletion removes its replay payload and timeline.</p>
      {confirming ? <><p>This cannot be undone. Delete this report and its recording?</p><div className="product-actions"><button className="product-button danger" disabled={deleting} onClick={() => void remove()}>{deleting ? 'Deleting…' : 'Confirm delete'}</button><button className="product-button secondary" disabled={deleting} onClick={() => setConfirming(false)}>Cancel</button></div></> : <button className="product-button secondary" onClick={() => setConfirming(true)}>Delete report</button>}
    </section>
  </>;
}
