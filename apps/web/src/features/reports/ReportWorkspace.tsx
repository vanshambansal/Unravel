'use client';
import { useState, type ComponentProps } from 'react';
import { ReportViewer } from './ReportViewer';
import { PlanEditor } from './PlanEditor';
import './test-plan.css';
import { LayoutGroup, motion } from 'motion/react';

export function ReportWorkspace(props: ComponentProps<typeof ReportViewer>) {
  const [view, setView] = useState('investigate'), [opened, setOpened] = useState(false), [evidenceAt, setEvidenceAt] = useState<number | undefined>();
  function show(value: string) { if (value === 'plan') setOpened(true); setView(value); }
  return <><LayoutGroup id={`workflow-${props.reportId}`}><div className="report-workspace-tabs" role="tablist" aria-label="Report workflow">{[['investigate','Investigation'],['plan','Reproduction & test plan']].map(([value, label]) => <button key={value} role="tab" id={`report-tab-${value}`} aria-controls={`report-panel-${value}`} aria-selected={view === value} tabIndex={view === value ? 0 : -1} onClick={() => show(value)} onKeyDown={event => { if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 'investigate' : event.key === 'End' ? 'plan' : view === 'plan' ? 'investigate' : 'plan'; show(next); document.getElementById(`report-tab-${next}`)?.focus(); } }}>{view===value&&<motion.span className="workflow-selection" layoutId="workflow-tab" />}<span>{label}</span></button>)}</div></LayoutGroup>
    <motion.section id="report-panel-investigate" role="tabpanel" aria-labelledby="report-tab-investigate" hidden={view !== 'investigate'} initial={false} animate={{ opacity:view==='investigate'?1:.7, y:view==='investigate'?0:5 }}>{view === 'investigate' && <ReportViewer {...props} initialOffset={evidenceAt} onReviewPlan={() => show('plan')} />}</motion.section>
    <motion.section id="report-panel-plan" role="tabpanel" aria-labelledby="report-tab-plan" hidden={view !== 'plan'} initial={false} animate={{ opacity:view==='plan'?1:.7, y:view==='plan'?0:5 }}>{opened && <PlanEditor projectId={props.projectId} reportId={props.reportId} events={props.events} onInspectEvidence={at => { setEvidenceAt(at); show('investigate'); document.getElementById('report-tab-investigate')?.focus(); }} />}</motion.section>
  </>;
}
