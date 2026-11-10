// Independent vanilla integration. No React, Next.js or upload endpoint.
const status = document.querySelector('#record-status');
const options = {
  projectId: '12345678-1234-4234-8234-123456789012',
  privacy: {
    allowTextSelectors: ['label', 'button', '#feedback', 'option'],
    allowValueSelectors: ['#question', '#category'],
    testIds: ['question', 'category', 'submit-question'],
    paths: ['/', '/api/questions', '/app.js'], stylesheetPaths: ['/styles.css'],
    errorMessages: ['Unravel fixture: intentional JavaScript error'],
  },
  onStateChange(value) {
    status.textContent = `${value.state}${value.reason ? ` (${value.reason})` : ''} — ${value.eventCount} events, ${value.bytes} bytes. Data stays in this tab.`;
  },
};
if (window.UnravelSDK) {
  const recorder = window.UnravelSDK.initialize(options);
  document.querySelector('#record-start').addEventListener('click', () => recorder.start().catch(() => { status.textContent = 'Recording could not start. Reload to retry.'; }));
  document.querySelector('#record-stop').addEventListener('click', () => recorder.stop());
  document.querySelector('#record-destroy').addEventListener('click', () => recorder.destroy());
  // Local inspection only; no storage, network submission or browser-global raw events.
  window.fixtureRecorder = recorder;
} else status.textContent = 'SDK unavailable. Run pnpm build:packages before starting the fixture.';
