/* global document, AbortController, navigator, clearTimeout, setTimeout, matchMedia, requestAnimationFrame, cancelAnimationFrame, performance, IntersectionObserver, ResizeObserver, MutationObserver, window, scrollY, location */
import { mountStoryMotion } from './story-motion';
export function mountApprovedStory(root, example) {
let disposed = false;
const abort = new AbortController();
const observers = [];
const listen = (node, type, fn) => node.addEventListener(type, fn, {signal:abort.signal});
const observe = (observer) => { observers.push(observer); return observer; };
const $ = (s) => root.querySelector(s);
const $$ = (s) => [...root.querySelectorAll(s)];
const disposeZoom = mountStoryMotion($('.preserved-zoom'));
$('#generated-code').replaceChildren();

let selected = 'question';
example.code.split('\n').forEach((line, i) => {
  const row = document.createElement('span'); row.className = 'code-line';
  row.dataset.codeStep = line.includes('.goto(') ? 'navigate' : line.includes('.fill(') ? 'question' : line.includes('.click(') ? 'submit' : '';
  const number = document.createElement('span'); number.className = 'line-number'; number.textContent = i + 1;
  row.append(number); colorCode(row, line + '\n'); $('#generated-code').append(row);
});
$('#json-plan').textContent = example.json;
function selectStep(step) {
 selected = step;
 $$('[data-step]').forEach(e => e.setAttribute('aria-pressed', String(e.dataset.step === step)));
 $$('[data-line-step]').forEach(e => e.classList.toggle('selected', e.dataset.lineStep === step));
 $$('[data-code-step]').forEach(e => e.classList.toggle('active', e.dataset.codeStep === step));
}
$$('[data-step]').forEach(e => e.onclick = () => selectStep(e.dataset.step));
selectStep(selected);
function view(name) {
 $('#steps-view').hidden = name !== 'steps'; $('#code-view').hidden = name !== 'code'; $('#json-view').hidden = name !== 'json';
 $$('[data-view]').forEach(e => e.setAttribute('aria-pressed', String(e.dataset.view === name)));
 $('#pane-name').textContent = name === 'steps' ? 'Reviewed reproduction' : name === 'json' ? 'JSON plan' : 'Generated Playwright';
}
$$('[data-view]').forEach(e => e.onclick = () => view(e.dataset.view));
$('#view-code').onclick = () => view('code');
let copyTimer;
async function copy(text) {
 try { await navigator.clipboard.writeText(text); $('#copy-status').textContent = 'Copied to clipboard'; }
 catch { $('#copy-status').textContent = 'Copy unavailable. Select the code to copy.'; }
 clearTimeout(copyTimer); copyTimer = setTimeout(() => $('#copy-status').textContent = '', 3000);
}
$('.copy-code').onclick = () => copy(example.code);
let framework = 'Next.js';
const snippet = () => `${framework === 'Next.js' ? "'use client';\n\n" : ''}import { useEffect } from 'react';\nimport { mountWidget } from '@unravel/sdk';\n\nexport function UnravelReporter() {\n  useEffect(() => {\n    const widget = mountWidget({\n      projectId: 'YOUR_PUBLIC_PROJECT_ID',\n      applicationOrigin: 'YOUR_UNRAVEL_ORIGIN',\n    });\n    return () => widget.destroy();\n  }, []);\n  return null;\n}`;
function renderSnippet() { $('#integration-code').textContent = snippet(); }
renderSnippet();
$$('[data-framework]').forEach(e => e.onclick = () => { framework = e.dataset.framework; $$('[data-framework]').forEach(b => b.setAttribute('aria-pressed', String(b === e))); renderSnippet(); });
$('#copy-integration').onclick = () => copy(snippet());
$('#copy-json').onclick = () => copy(example.json);
const details = {
 request: ['HTTP failure, in context.', 'POST /api/questions returned 500. Bodies and headers are not captured.'],
 actions: ['Enter question → Submit question', 'Related actions and replay timestamps stay together.'],
 errors: ['An HTTP 500 is not a JavaScript exception.', 'Uncaught browser errors are captured separately. Neither proves a backend root cause.'],
};
$$('[data-evidence]').forEach(e => e.onclick = () => { $$('[data-evidence]').forEach(b => b.setAttribute('aria-pressed', String(b === e))); const [title, text] = details[e.dataset.evidence]; $('.story-request-detail strong').textContent = title; $('.story-request-detail span').textContent = text; });
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const question = 'Why does this request fail?';
let time = 0, playing = false, frame = 0, last = 0, manual = false, moment = 0;
let manualRecording = false, manualPaused = false, submitted = false, stopped = false;
const at = [0, 5000, 8000, 12000];
function cursorTo(target) {
 const box = $('.browser').getBoundingClientRect(), rect = target.getBoundingClientRect();
 // Cursor tip lands inside the actual control, independent of viewport or text wrapping.
 $('#demo-cursor').style.left = `${rect.left - box.left + Math.min(26, rect.width / 2)}px`;
 $('#demo-cursor').style.top = `${rect.top - box.top + rect.height / 2}px`;
}
function display() {
 if (!manual) {
   moment = time >= 12000 ? 3 : time >= 8000 ? 2 : time >= 2400 ? 1 : 0;
   $('#question').value = time < 2400 ? '' : question.slice(0, Math.floor((time - 2400) / 65));
 }
 const failed = manual ? submitted : time >= 8000;
 const complete = manual ? stopped : time >= 12000;
 $('#failure').hidden = !failed; $('#finished').hidden = !complete;
 const seconds = Math.floor(time / 1000);
 $('#demo-time').textContent = `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`;
 const state = complete ? 'Demo stopped' : manualRecording ? (manualPaused ? 'Demo paused' : 'Recording demo') : playing ? 'Example playing' : time > 0 ? 'Example paused' : 'Demo ready';
 $('#demo-state').lastChild.textContent = state;
 $('#demo-state').dataset.recording = String(manualRecording || playing);
 $('#demo-detail').textContent = manual ? complete ? 'Your sequence is ready to inspect.' : submitted ? 'Request failed. Stop to inspect the evidence.' : manualRecording ? 'Type a question, then choose Submit question.' : 'Choose Start demo to begin.' : ['Start recording on the example website.', 'The visitor enters a question.', 'The request returns HTTP 500.', 'Your sequence is ready to inspect.'][moment];
 $$('[data-moment]').forEach(e => e.setAttribute('aria-pressed', String(Number(e.dataset.moment) === moment)));
 $('#watch span').textContent = manual ? 'Watch example' : playing ? 'Pause example' : reduced.matches ? (moment === 3 ? 'Restart example' : 'Next moment') : time >= 12000 ? 'Replay example' : time > 0 ? 'Resume example' : 'Watch example';
 $('#demo-cursor').classList.toggle('show', playing && !reduced.matches);
 $('.sample-submit').classList.toggle('demo-pressed', !manual && playing && time >= 7600 && time < 8000);
 if (playing) cursorTo(time < 2000 ? $('.sample-context') : time < 6400 ? $('#question') : $('#sample-submit'));
}
function cancelFrame() { cancelAnimationFrame(frame); frame = 0; }
function pause() { playing = false; if (manualRecording) manualPaused = true; cancelFrame(); display(); }
function tick(now) {
 if (!playing && (!manualRecording || manualPaused)) return;
 time += now - last; last = now;
 if (!manual && time >= 12000) { time = 12000; playing = false; }
 display();
 if (playing || (manualRecording && !manualPaused)) frame = requestAnimationFrame(tick);
}
function startClock() { cancelFrame(); last = performance.now(); frame = requestAnimationFrame(tick); }
function leaveManual() {
 manual = false; manualRecording = false; manualPaused = false; submitted = false; stopped = false;
 $('#demo-start').hidden = true; $('#question').disabled = true; $('#sample-submit').disabled = true;
 $('#try').textContent = 'Try it yourself';
}
function watch() {
 if (manual) { pause(); leaveManual(); time = 0; }
 if (reduced.matches) { time = at[(moment + 1) % 4]; display(); return; }
 if (playing) return pause();
 if (time >= 12000) time = 0;
 playing = true; display(); startClock();
}
$('#watch').onclick = watch;
$$('[data-moment]').forEach(e => e.onclick = () => { pause(); leaveManual(); time = at[Number(e.dataset.moment)]; display(); });
$('#try').onclick = () => {
 pause(); manual = true; manualRecording = false; manualPaused = false; submitted = false; stopped = false; time = 0; moment = 0;
 $('#question').value = ''; $('#question').disabled = true; $('#sample-submit').disabled = true;
 $('#demo-start').hidden = false; $('#demo-start').textContent = 'Start demo';
 $('#try').textContent = 'Reset demo'; display();
};
$('#demo-start').onclick = () => {
 if (manualRecording && manualPaused) { manualPaused = false; $('#demo-start').textContent = 'Stop demo'; startClock(); display(); return; }
 if (manualRecording) {
   manualRecording = false; stopped = true; moment = 3; cancelFrame();
   $('#demo-start').hidden = true; $('#question').disabled = true; $('#sample-submit').disabled = true; display(); return;
 }
 manualRecording = true; time = 0; moment = 1;
 $('#question').disabled = false; $('#sample-submit').disabled = false;
 $('#demo-start').textContent = 'Stop demo'; display(); startClock(); $('#question').focus();
};
$('#sample-form').onsubmit = e => {
 e.preventDefault(); if (!manualRecording || manualPaused || !$('#question').value.trim()) { $('#question').focus(); return; }
 submitted = true; moment = 2; display();
};
function suspend() {
 if (manualRecording) { manualPaused = true; $('#demo-start').textContent = 'Resume demo'; }
 pause();
}
listen(document, 'visibilitychange', () => { if (document.hidden) suspend(); });
observe(new IntersectionObserver(entries => { if (!entries[0].isIntersecting && (playing || manualRecording)) suspend(); }, {threshold: .15})).observe($('#study'));
listen(reduced, 'change', pause);
observe(new ResizeObserver(() => { if (playing) display(); })).observe($('.browser'));
// Carry the same navigation shell through the final entrance/story integration.
$('.menu-toggle').onclick = () => {
 const open = $('.menu-toggle').getAttribute('aria-expanded') !== 'true';
 $('.menu-toggle').setAttribute('aria-expanded', String(open)); $('#mobile-links').hidden = !open;
};
$$('#mobile-links a').forEach(e => e.onclick = () => { $('#mobile-links').hidden = true; $('.menu-toggle').setAttribute('aria-expanded','false'); });
listen(document, 'keydown', e => { if (e.key === 'Escape') { $('#mobile-links').hidden = true; $('.menu-toggle').setAttribute('aria-expanded','false'); } });
const journey = $('[data-diagnostic-journey]');
observe(new MutationObserver(() => {
 const p = Number(journey.dataset.progress || 0);
 journey.classList.toggle('zoom-travelling', p > .18);
})).observe(journey, {attributes:true,attributeFilter:['data-progress']});
let handoffTimer;
$('.inspect-request').onclick = e => {
 e.preventDefault();
 const request = $('.story-request-selected');
 const top = journey.getBoundingClientRect().top + scrollY;
 window.scrollTo({top: top - (journey.dataset.zoom === 'on' ? 0 : 82),behavior:reduced.matches?'instant':'smooth'});
 request.classList.add('request-target');
 clearTimeout(handoffTimer); handoffTimer=setTimeout(()=>request.classList.remove('request-target'),3600);
 request.focus({preventScroll:true});
};
$('.story-request-selected').onclick = () => $('[data-evidence="request"]').click();
const closing = $('.closing');
listen(closing, 'pointermove', e => {
 if (reduced.matches || e.pointerType === 'touch') return;
 const r = closing.getBoundingClientRect();
 closing.style.setProperty('--light-x', `${Math.max(10,Math.min(90,(e.clientX-r.left)/r.width*100))}%`);
});
listen(closing, 'pointerleave',()=>closing.style.setProperty('--light-x','50%'));
display();
// Fonts can change section positions after the browser's initial fragment jump.
document.fonts.ready.then(() => {
 if (disposed) return;
 const target = document.getElementById(location.hash.slice(1));
 if (target) requestAnimationFrame(() => {if (!disposed) target.scrollIntoView({block:'start',behavior:'instant'});});
});
function colorCode(parent, source) {
 const tokens = /(\/\/[^\n]*|'[^'\n]*'|"[^"\n]*"|\b(?:import|from|async|await|const|return|export|function)\b)/g;
 let offset = 0;
 for (const match of source.matchAll(tokens)) {
   parent.append(document.createTextNode(source.slice(offset, match.index)));
   const token = document.createElement('span');
   token.className = match[0].startsWith('//') ? 'tok-comment' : /^["']/.test(match[0]) ? 'tok-string' : 'tok-keyword';
   token.textContent = match[0]; parent.append(token); offset = match.index + match[0].length;
 }
 parent.append(document.createTextNode(source.slice(offset)));
}

return () => { disposed=true; playing=false; manualRecording=false; cancelFrame(); clearTimeout(copyTimer); clearTimeout(handoffTimer); abort.abort(); observers.forEach(o=>o.disconnect()); disposeZoom(); };
}
