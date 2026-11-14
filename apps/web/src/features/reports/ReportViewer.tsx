'use client';
import {actionSummary,replayActionContext} from './action-summary';
import { memo, useCallback, useEffect, useMemo, useRef, useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import type { SemanticEvent } from '@unravel/contracts';
import type { CSSProperties } from 'react';
import {timelineEntries} from './timeline';
import {validReplayOrigin} from './replay-origin';
import { InvestigationSurface, PanelHeading } from '../workspace/compositions';

const timestamp = (ms: number) => `${(ms / 1000).toFixed(2)}s`;
function label(event: SemanticEvent,inferred=''): string {
  if (event.kind === 'action') return actionSummary(event,inferred);
  if (event.kind === 'network') return `${event.method} ${event.url?.path ?? '[path masked]'} · ${event.status ?? event.outcome}`;
  if (event.kind === 'error') return `${event.errorType} · ${event.message ?? 'message masked'}`;
  return `Navigate · ${event.url.path ?? '[path masked]'}`;
}
export function ReportViewer({ projectId, reportId, events, durationMs, startedAt, replayOrigin, styled = false, initialOffset, seekRequest = 0, isActive = true, onReviewPlan }: { projectId: string; reportId: string; events: SemanticEvent[]; durationMs: number; startedAt: number; replayOrigin: string; styled?: boolean; initialOffset?: number; seekRequest?: number; isActive?: boolean; onReviewPlan?: () => void }) {
  const positionId = useId();
  const container = useRef<HTMLDivElement>(null), bridge = useRef<(type: string, offset?: number) => void>(() => {});
  const [state, setState] = useState('Loading replay'), [offset, setOffset] = useState(0), [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<number | null>(null), [error, setError] = useState('');
  const [actualSize, setActualSize] = useState(false), [ratio,setRatio]=useState('16 / 10');
  const [confirming, setConfirming] = useState(false), [deleting, setDeleting] = useState(false);
  const actionSeeks=useRef<Record<number,number>>({});
  const [actionLabels,setActionLabels]=useState<Record<number,string>>({});
  const [rawTimeline,setRawTimeline]=useState(false);
  const [filter, setFilter] = useState('all'), [share, setShare] = useState(66);
  const grid = useRef<HTMLDivElement>(null);
  const entries = useMemo(() => timelineEntries(events,rawTimeline), [events,rawTimeline]);
  const visible = useMemo(() => entries.filter(({event})=>filter==='all'||event.kind===filter), [entries,filter]);
  const chosen = selected === null ? null : events[selected];
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const cursor = useRef(initialOffset ?? 0);
  const seek = useCallback((at: number) => { cursor.current = Math.max(0, Math.min(durationMs, at)); setPlaying(false); setOffset(cursor.current); bridge.current('seek', cursor.current); }, [durationMs]);
  const selectEvidence = useCallback((index: number, at: number) => { setSelected(index); seek(actionSeeks.current[index]??at); }, [seek]);
  const lastRequest = useRef<{ at: number; request: number } | null>(null);
  useEffect(() => {
    if (!isActive || state !== 'Replay ready' || initialOffset === undefined) return;
    if (lastRequest.current?.at === initialOffset && lastRequest.current.request === seekRequest) return;
    lastRequest.current = { at: initialOffset, request: seekRequest };
    seek(initialOffset);
    const index = events.findIndex(event => event.at === initialOffset);
    setSelected(index < 0 ? null : index);
  }, [initialOffset, seekRequest, isActive, state, events, seek]);
  useEffect(() => {
    const pause = () => { bridge.current('pause', cursor.current); setPlaying(false); };
    if (!isActive) pause();
    const visibility = () => { if (document.hidden) pause(); };
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, [isActive]);
  useEffect(() => {
    actionSeeks.current={};setActionLabels({});setState('Loading replay'); setError(''); setPlaying(false);
    const root = container.current!; const frame = document.createElement('iframe');
    if (!validReplayOrigin(replayOrigin,location.origin)) { setError('Configure an isolated HTTPS replay origin (or separate loopback development origin).'); return; }
    // Permissions apply to a separate trusted origin, never to the dashboard or recorded document.
    frame.title = 'Session replay'; frame.setAttribute('sandbox', 'allow-scripts allow-same-origin'); frame.referrerPolicy = 'no-referrer'; frame.src = replayOrigin + '/';
    const controller = new AbortController(), channel = crypto.randomUUID(); let ready = false, active = true, initialized = false, acknowledged = false;
    const startup = window.setTimeout(() => { if (active && !acknowledged) { frame.style.display = 'none'; setState('Replay taking longer'); setError('The replay is taking longer than usual. You can wait or retry. Your report and timeline are saved.'); } }, 4000);
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
      if (event.data.type === 'initialized') { acknowledged = true; clearTimeout(startup); frame.style.display = ''; setError(''); setState('Replay ready'); send('seek', Math.min(durationMs, cursor.current)); }
      else if (event.data.type === 'finished') { setPlaying(false); setOffset(durationMs); }
      else if (event.data.type === 'failure') { setPlaying(false); frame.style.display = 'none'; setState('Replay unavailable'); setError('This masked recording could not be replayed. Its timeline is still available.'); }
      else if (['time','seeked'].includes(event.data.type) && typeof event.data.offset === 'number' && Number.isFinite(event.data.offset)) {
        const actual = Math.min(durationMs, Math.max(0, event.data.offset + baseline)); root.dataset.replayTime = String(actual); cursor.current = actual; setOffset(actual);
      }
    }
    window.addEventListener('message', message); frame.addEventListener('load', () => send('ping')); root.append(frame);
    const requestTimeout = window.setTimeout(() => controller.abort(), 60000);
    fetch(`/api/projects/${projectId}/reports/${reportId}/replay`, { signal: controller.signal, cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error(); const data = await response.json();
      if (!active || !Array.isArray(data.replay)) return;
      const viewport=data.replay.find((event:{type:number})=>event.type===4)?.data;
      if(viewport?.width>0&&viewport?.height>0)setRatio(`${viewport.width} / ${viewport.height}`);
      const context=replayActionContext(data.replay,events,startedAt);setActionLabels(context.labels);actionSeeks.current=context.seeks;
      replay = data.replay; baseline = Math.max(0, Number(data.replay[0]?.timestamp ?? startedAt) - startedAt); initialize();
    }).catch(() => { if (active) { frame.style.display = 'none'; setError('Could not load the recording. Retry the replay to try again.'); setState('Replay unavailable'); } }).finally(() => clearTimeout(requestTimeout));
    return () => { active = false; clearTimeout(startup); clearTimeout(requestTimeout); controller.abort(); window.removeEventListener('message', message); frame.remove(); bridge.current = () => {}; };
  }, [projectId, reportId, durationMs, startedAt, replayOrigin, events, attempt]);
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

        <div className="report-player" ref={container} style={{aspectRatio:ratio}}>
          {(state === 'Replay unavailable' || state === 'Replay taking longer') && (
            <div className="report-offline-fallback" role="region" aria-label="Replay unavailable">
              <div className="report-offline-badge">
                <span className="report-offline-dot" aria-hidden="true" />
                <span>Replay unavailable</span>
              </div>
              <h3>The replay is not ready yet</h3>
              <p>Check the configured isolated player at <code>{replayOrigin}</code>, then retry. The local production preview uses its paired player; development uses <code>pnpm replay:dev</code>.</p>
              <button type="button" className="product-button secondary" onClick={() => setAttempt(value => value + 1)}>Retry replay</button>
              <small>All recorded timeline events, actions, and network calls below remain fully interactive.</small>
            </div>
          )}
        </div>
        <div className="report-controls"><button className="product-button secondary" disabled={state !== 'Replay ready'} onClick={() => { const next = !playing && offset >= durationMs - 20 ? 0 : offset; bridge.current(playing ? 'pause' : 'play', next); cursor.current = next; setOffset(next); setPlaying(!playing); }}>{playing ? 'Pause replay' : 'Play replay'}</button><button className="product-button secondary" disabled={state !== 'Replay ready'} aria-pressed={actualSize} onClick={() => { bridge.current(actualSize ? 'fit' : 'actual'); if(actualSize) container.current?.scrollIntoView({block:'nearest',behavior:'instant'}); setActualSize(!actualSize); }}>{actualSize ? 'Fit recording' : '100% size'}</button><output data-testid="replay-time" aria-live="off">{timestamp(offset)} / {timestamp(durationMs)}</output></div>
        <p className="product-small">{actualSize?'Scroll inside the recording to inspect it at its original size.':'Fit shows the complete viewport. Use 100% size to inspect small details.'}</p>
        <details className="setup-boundaries"><summary>Why does replay show [redacted]?</summary><p className="product-small">This recording contains the content captured under its original settings. Older SDK versions masked page text. The current widget shows page text in both modes and masks field values unless the visitor chooses Full-content recording. Text displayed outside fields stays visible. Upgrade the SDK and make a new recording to use the new modes; existing redacted content cannot be restored.</p><a className="product-text-link" href={`/app/projects/${projectId}/setup`}>Open SDK setup</a></details>
        <label className="product-small" htmlFor={positionId}>Replay position</label>
        <input id={positionId} type="range" min="0" max={durationMs} step="10" value={offset} onChange={event => seek(Number(event.target.value))} disabled={state !== 'Replay ready'} />
        <p className="report-policy product-small">{styled ? 'Styled replay. Bounded layout and colors are captured; scripts, images and external resources stay blocked.' : 'Legacy structural replay: styling was not captured. Submit a fresh recording for the new styled replay; text masking remains enabled.'}</p>
      </section>
      <div className="report-divider" role="separator" tabIndex={0} aria-label="Resize replay panel" aria-orientation="vertical" aria-valuemin={50} aria-valuemax={72} aria-valuenow={share} aria-controls="report-replay report-evidence"
        onKeyDown={event=>{const next=event.key==='ArrowLeft'?share-2:event.key==='ArrowRight'?share+2:event.key==='Home'?50:event.key==='End'?72:null;if(next!==null){event.preventDefault();setShare(Math.min(72,Math.max(50,next)));}}}
        onPointerDown={event=>{event.currentTarget.setPointerCapture(event.pointerId);}}
        onPointerMove={event=>{if(!event.currentTarget.hasPointerCapture(event.pointerId))return;const box=grid.current!.getBoundingClientRect();setShare(Math.min(72,Math.max(50,Math.round((event.clientX-box.left)/box.width*100))));}}
        onPointerUp={event=>event.currentTarget.releasePointerCapture(event.pointerId)} />
      <section id="report-evidence" className="report-timeline" aria-label="Recorded events"><h2>Evidence</h2><p className="product-small">Select an event to seek the replay.</p>
        <label className="timeline-raw"><input type="checkbox" checked={rawTimeline} onChange={event=>setRawTimeline(event.target.checked)}/> Show every typing event</label><div className="evidence-filters" role="group" aria-label="Filter evidence">{[['all','All'],['action','Actions'],['network','Network'],['error','Errors'],['navigation','Navigation']].map(([value,title])=><button key={value} aria-pressed={filter===value} onClick={()=>setFilter(value)}>{filter===value&&<span className="evidence-filter-selection" />}<span>{title}</span></button>)}</div>
        <EvidenceList request={seekRequest} actionLabels={actionLabels} visible={visible} selected={selected} onSelect={selectEvidence}/>
        {!visible.length&&<p className="evidence-empty">No {filter} events were captured in this recording.</p>}
        {chosen && <div key={selected} className="report-event-details"><p className="evidence-type">{chosen.kind==='network' ? `HTTP ${chosen.status ?? chosen.outcome}` : chosen.kind}</p><h3>{chosen.kind==='network'?`${chosen.method} ${chosen.url?.path??'[path masked]'}`:chosen.kind==='action'?actionSummary(chosen,selected===null?'':actionLabels[selected]):chosen.kind==='error'?chosen.errorType:'Navigation'}</h3><dl>
          <div><dt>Time</dt><dd>{timestamp(chosen.at)}</dd></div>{selected!==null&&actionSeeks.current[selected]!==undefined&&actionSeeks.current[selected]-chosen.at>10&&<div><dt>Replay state</dt><dd>{timestamp(actionSeeks.current[selected])} (captured after the action)</dd></div>}
          {chosen.kind==='network'&&<><div><dt>Status</dt><dd>{chosen.status??'Unavailable'} · {chosen.outcome}</dd></div><div><dt>Duration</dt><dd>{chosen.durationMs.toFixed(0)} ms</dd></div><div><dt>Transport</dt><dd>{chosen.transport}</dd></div><div><dt>Origin</dt><dd>{chosen.url?.origin??'Masked'}</dd></div></>}
          {chosen.kind==='action'&&<><div><dt>Target</dt><dd><details><summary>Technical locator</summary><code>{chosen.target.kind!=='unresolved'?chosen.target.value:`${chosen.target.tag} · unresolved`}</code></details></dd></div><div><dt>Value</dt><dd>{chosen.redacted?'Masked':chosen.values !== undefined ? chosen.values?.join(', ') || 'No options selected' : chosen.value??'Not applicable'}</dd></div></>}
          {chosen.kind==='error'&&<><div><dt>Source</dt><dd>{chosen.source}</dd></div><div><dt>Message</dt><dd>{chosen.message??'Masked'}</dd></div></>}
          {chosen.kind==='navigation'&&<div><dt>Path</dt><dd>{chosen.url.path??'Masked'}</dd></div>}
        </dl><p className="product-small">Diagnostics are evidence, not a guaranteed root-cause diagnosis. Network bodies and headers are never captured.</p></div>}
      </section>
    </InvestigationSurface>
    <aside className="report-next-step"><div><h3>Turn this sequence into a regression test</h3><p>Review reproduction steps, supply safe values and confirm the expected result.</p></div><button className="product-button secondary" onClick={onReviewPlan}>Review test plan</button></aside>
    <section className="product-notice report-retention"><h3>Development retention</h3><p>No automatic expiry. Only the project owner can read or permanently delete this report. Deletion removes its replay payload and timeline.</p>
      {confirming ? <><p>This cannot be undone. Delete this report and its recording?</p><div className="product-actions"><button className="product-button danger" disabled={deleting} onClick={() => void remove()}>{deleting ? 'Deleting…' : 'Confirm delete'}</button><button className="product-button secondary" disabled={deleting} onClick={() => setConfirming(false)}>Cancel</button></div></> : <button className="product-button secondary" onClick={() => setConfirming(true)}>Delete report</button>}
    </section>
  </>;
}

// Playback clock updates must not rebuild every evidence row at 10 Hz.
const EvidenceList = memo(function EvidenceList({request,actionLabels,visible,selected,onSelect}:{request:number;actionLabels:Record<number,string>;visible:ReturnType<typeof timelineEntries>;selected:number|null;onSelect(index:number,at:number):void}) {
  const [page, setPage] = useState(0);
  const lastPage = Math.max(0, Math.ceil(visible.length / 100) - 1);
  const currentPage = Math.min(page, lastPage);
  useEffect(() => {
    const index = selected === null ? 0 : visible.findIndex(entry => entry.indices.includes(selected));
    setPage(Math.max(0, Math.floor(index / 100)));
  }, [selected, visible, request]);
  const start = currentPage * 100;
  return <><ol aria-label="Event timeline">{visible.slice(start, start + 100).map(({event,index,indices,startAt}) => <li key={index}><button aria-label={`${event.kind} ${label(event,actionLabels[index])} ${timestamp(event.at)}`} className={selected !== null && indices.includes(selected) ? 'selected' : ''} aria-pressed={selected!==null&&indices.includes(selected)} onClick={() => onSelect(index,event.at)}>{selected !== null && indices.includes(selected) && <span className="evidence-selection" />}<time>{timestamp(event.at)}</time><span className="report-event-kind">{event.kind}</span><span>{label(event,actionLabels[index])}{indices.length>1&&<span className="timeline-group-note">{indices.length} typing updates &middot; {timestamp(startAt)}&ndash;{timestamp(event.at)}. Select for final value; show every event for individual updates.</span>}</span></button></li>)}</ol>{visible.length > 100 && <nav aria-label="Evidence pages">
    <p className="product-small">Showing {start + 1}-{Math.min(start + 100, visible.length)} of {visible.length} events</p>
    <div className="product-actions">
      <button className="product-button secondary" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous events</button>
      <label className="product-small">Event page <select aria-label="Event page" value={currentPage + 1} onChange={event => setPage(Number(event.target.value) - 1)}>{Array.from({length:lastPage + 1}, (_, index) => <option key={index} value={index + 1}>{index + 1}</option>)}</select></label>
      <button className="product-button secondary" disabled={currentPage === lastPage} onClick={() => setPage(currentPage + 1)}>Next events</button>
    </div>
  </nav>}</>;
});
