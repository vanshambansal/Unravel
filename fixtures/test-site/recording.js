// Independent vanilla integration; visitor submission does not need an account.
const status = document.querySelector('#record-status');
const submissionStatus = document.querySelector('#submission-status');
const title = document.querySelector('#report-title'), description = document.querySelector('#report-description');
const options = {
  projectId: '12345678-1234-4234-8234-123456789012',
  privacy: {
    allowTextSelectors: ['label', 'button', '#feedback', 'option', '#fixture-heading', '#question-title', '#demo-note'],
    allowValueSelectors: ['#question', '#category'],
    testIds: ['question', 'category', 'submit-question'],
    paths: ['/', '/api/questions', '/app.js'], stylesheetPaths: ['/styles.css'],
    errorMessages: ['Unravel fixture: intentional JavaScript error'],
  },
  onStateChange(value) {
    status.textContent = `${value.state}${value.reason ? ` (${value.reason})` : ''} — ${value.eventCount} events, ${value.bytes} bytes.`;
    if (value.state === 'starting') { title.readOnly = false; description.readOnly = false; submissionStatus.textContent = 'Not submitted.'; }
  },
  onSubmissionChange(value) {
    submissionStatus.textContent = value.state === 'submitted' ? `Report saved: ${value.reportId}` : value.state === 'error' ? value.error : value.state === 'submitting' ? 'Submitting report…' : 'Not submitted.';
  },
};
const parameters = new URLSearchParams(location.search);
const configuration = window.__UNRAVEL_FIXTURE_CONFIG__;
const debug = configuration?.testOverrides === true && parameters.get('debug') === '1';
document.querySelector('#fixture-debug').hidden = !debug;
if (window.UnravelSDK && !debug) {
  const projectId = configuration?.testOverrides ? parameters.get('projectId') ?? configuration.projectId : configuration?.projectId;
  const applicationOrigin = configuration?.testOverrides ? parameters.get('applicationOrigin') ?? configuration.applicationOrigin : configuration?.applicationOrigin;
  if (projectId && applicationOrigin) {
    try {
      window.fixtureWidget = window.UnravelSDK.mountWidget({ ...options, projectId, applicationOrigin });
    } catch {
      console.error('Unravel developer setup: invalid public project ID or application origin. Check fixture configuration and restart.');
    }
  } else console.warn(`Unravel developer setup: ${configuration?.error ?? 'Public SDK configuration did not load.'}`);
} else if (window.UnravelSDK) {
  let recorder = window.UnravelSDK.initialize(options);
  document.querySelector('#record-configure').addEventListener('click', () => {
    try {
      if (['recording','starting'].includes(recorder.getStatus().state)) throw new Error('Stop recording before changing configuration.');
      const projectId = document.querySelector('#sdk-project').value.trim();
      const base = new URL(document.querySelector('#sdk-origin').value.trim());
      if (!['localhost','127.0.0.1','[::1]'].includes(base.hostname) || base.origin !== document.querySelector('#sdk-origin').value.trim()) throw new Error('Use a local HTTP(S) origin without a path or credentials.');
      const next = window.UnravelSDK.initialize({ ...options, projectId, submissionUrl: `${base.origin}/api/ingest/${projectId}` });
      recorder.destroy(); recorder = next; window.fixtureRecorder = recorder;
      title.readOnly = false; description.readOnly = false; submissionStatus.textContent = 'Project configured. Start a new recording.';
    } catch (error) { submissionStatus.textContent = error.message; }
  });
  document.querySelector('#record-start').addEventListener('click', () => recorder.start().catch(() => { status.textContent = 'Recording could not start. Reload to retry.'; }));
  document.querySelector('#record-stop').addEventListener('click', () => recorder.stop());
  document.querySelector('#record-destroy').addEventListener('click', () => recorder.destroy());
  // Local inspection only; no storage, network submission or browser-global raw events.
  window.fixtureRecorder = recorder;
  document.querySelector('#report-submit').addEventListener('click', async () => {
    if (!title.reportValidity() || !description.reportValidity()) return;
    try { title.readOnly = true; description.readOnly = true; await recorder.submit({ title: title.value, description: description.value }); }
    catch (error) { submissionStatus.textContent = `${error.message} Click Submit again to retry unchanged details.`; }
  });
 } else {
  console.error('Unravel developer setup: recording SDK did not load. Run corepack pnpm build:packages, then reload.');
}
