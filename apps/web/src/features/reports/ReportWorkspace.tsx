'use client';
import { useState, useId, useMemo, useEffect, type ComponentProps } from 'react';
import { ReportViewer } from './ReportViewer';
import dynamic from 'next/dynamic';
const prepareEditor = () => import('./PlanEditor');
const PlanEditor = dynamic(() => prepareEditor().then((module) => module.PlanEditor), {
  loading: () => <p role="status">Preparing test plan...</p>,
});
import './test-plan.css';
import { createPlanLoader } from './plan-loader';

export function ReportWorkspace(props: ComponentProps<typeof ReportViewer>) {
  const id = useId();
  const planLoader = useMemo(
    () => createPlanLoader(`/api/projects/${props.projectId}/reports/${props.reportId}/plan`),
    [props.projectId, props.reportId],
  );
  useEffect(() => {
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    const timer = setTimeout(() => {
      if (
        !document.hidden &&
        !connection?.saveData &&
        !/(^|-)2g$/.test(connection?.effectiveType ?? '')
      ) {
        planLoader.prepare();
        void prepareEditor().catch(() => {});
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      planLoader.clear();
    };
  }, [planLoader]);
  const [view, setView] = useState('investigate'),
    [opened, setOpened] = useState(false),
    [evidenceAt, setEvidenceAt] = useState<number | undefined>(),
    [seekRequest, setSeekRequest] = useState(0);
  function show(value: string) {
    if (value === 'plan') setOpened(true);
    setView(value);
  }
  return (
    <>
      <div className="report-workspace-tabs" role="tablist" aria-label="Report workflow">
        {[
          ['investigate', 'Investigation'],
          ['plan', 'Reproduction & test plan'],
        ].map(([value, label]) => (
          <button
            key={value}
            role="tab"
            id={`${id}-report-tab-${value}`}
            aria-controls={`${id}-report-panel-${value}`}
            aria-selected={view === value}
            tabIndex={view === value ? 0 : -1}
            onPointerEnter={() => {
              if (value === 'plan') {
                planLoader.prepare();
                void prepareEditor().catch(() => {});
              }
            }}
            onFocus={() => {
              if (value === 'plan') {
                planLoader.prepare();
                void prepareEditor().catch(() => {});
              }
            }}
            onClick={() => show(value)}
            onKeyDown={(event) => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                event.preventDefault();
                const next =
                  event.key === 'Home'
                    ? 'investigate'
                    : event.key === 'End'
                      ? 'plan'
                      : view === 'plan'
                        ? 'investigate'
                        : 'plan';
                show(next);
                document.getElementById(`${id}-report-tab-${next}`)?.focus();
              }
            }}
          >
            {view === value && <span className="workflow-selection" />}
            <span>{label}</span>
          </button>
        ))}
      </div>
      <section
        id={`${id}-report-panel-investigate`}
        role="tabpanel"
        aria-labelledby={`${id}-report-tab-investigate`}
        hidden={view !== 'investigate'}
        style={{ display: view === 'investigate' ? undefined : 'none' }}
      >
        <ReportViewer
          {...props}
          isActive={view === 'investigate'}
          seekRequest={seekRequest}
          initialOffset={evidenceAt}
          onReviewPlan={() => show('plan')}
        />
      </section>
      <section
        id={`${id}-report-panel-plan`}
        role="tabpanel"
        aria-labelledby={`${id}-report-tab-plan`}
        hidden={view !== 'plan'}
      >
        {opened && (
          <PlanEditor
            loadPlan={planLoader.read}
            projectId={props.projectId}
            reportId={props.reportId}
            events={props.events}
            onInspectEvidence={(at) => {
              setEvidenceAt(at);
              setSeekRequest((value) => value + 1);
              show('investigate');
              document.getElementById(`${id}-report-tab-investigate`)?.focus();
            }}
          />
        )}
      </section>
    </>
  );
}
