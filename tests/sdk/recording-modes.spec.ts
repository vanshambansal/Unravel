import {test,expect} from '@playwright/test';
import type {Recorder,RecorderOptions} from '../../packages/sdk/src/types';
import {validateSubmission} from '../../apps/web/src/server/reports/validation';
const projectId='12345678-1234-4234-8234-123456789012';

for(const mode of ['masked-values','full'] as const)test(`${mode}: diagnostics and native disclosure structure remain readable`,async({page})=>{
 await page.goto('/?debug=1');
 await page.waitForFunction(()=>!!(window as unknown as {UnravelSDK?:unknown}).UnravelSDK);
 const recording=await page.evaluate(async({mode,projectId})=>{
  const host=window as unknown as {fixtureRecorder:Recorder;UnravelSDK:{initialize(options:RecorderOptions):Recorder}};
  host.fixtureRecorder.destroy();
  const section=document.createElement('section');section.id='native-structure';
  section.innerHTML='<details open><summary>Public disclosure</summary><p>Visible disclosure content</p></details><dialog open><p>Visible dialog content</p></dialog>';
  document.body.append(section);
  const recorder=host.UnravelSDK.initialize({projectId,privacy:{mode}});
  await recorder.start();
  await fetch('/api/questions?secret=QUERY_SENTINEL',{method:'POST'});
  window.dispatchEvent(new ErrorEvent('error',{message:'Synthetic diagnostic message',error:new Error('Synthetic diagnostic message'),filename:location.origin+'/app.js?secret=QUERY_SENTINEL',lineno:12,colno:4}));
  await new Promise(resolve=>setTimeout(resolve,30));
  const recording=recorder.stop()!;recorder.destroy();section.remove();return recording;
 },{mode,projectId});
 expect(recording.events.find(e=>e.kind==='network'&&e.url?.path==='/api/questions')).toBeTruthy();
 const error=recording.events.find(e=>e.kind==='error');
 expect(error?.kind==='error'&&error.message).toBe('Synthetic diagnostic message');
 expect(error?.kind==='error'&&error.file?.path).toBe('/app.js');
 const raw=JSON.stringify(recording);expect(raw).not.toContain('QUERY_SENTINEL');
 expect(raw).toContain('"tagName":"dialog"');expect(raw).toContain('"open":""');expect(raw).toContain('"rr_open_mode":"non-modal"');
 if(mode==='full')expect(raw).toContain('Visible disclosure content');
 expect(()=>validateSubmission({version:1,title:'Native structure',description:'',recording})).not.toThrow();
});

test('retry has a discard exit and widget copy contains no encoding artifacts',async({page})=>{
 await page.goto(`/?projectId=${projectId}&applicationOrigin=${encodeURIComponent('http://127.0.0.1:4183')}`);
 await page.route(`**/api/ingest/${projectId}`,route=>route.abort());
 await page.getByRole('button',{name:'Report a bug',exact:true}).click();
 await page.getByRole('button',{name:'Start recording',exact:true}).click();
 await page.getByRole('button',{name:'Stop recording',exact:true}).click();
 await page.getByText('Add details (optional)',{exact:true}).click();
 await expect(page.getByText('What happened / expected? - optional',{exact:true})).toBeVisible();
 await page.getByRole('textbox',{name:'Report title',exact:true}).fill('Synthetic retry recovery');
 await page.getByRole('button',{name:'Send bug report',exact:true}).click();
 await expect(page.getByRole('button',{name:'Retry submission',exact:true})).toBeVisible();
 const copy=await page.locator('[data-unravel-widget]').evaluate(el=>el.shadowRoot!.textContent!);
 expect(copy).not.toMatch(/[\u00c2\u00c3\ufffd]|\u00e2\u20ac/);
 await page.getByRole('button',{name:'Discard recording',exact:true}).click();
 await page.getByRole('button',{name:'Keep this report',exact:true}).click();
 await expect(page.getByRole('button',{name:'Retry submission',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Discard recording',exact:true}).click();
 await page.getByRole('button',{name:'Discard unsent report',exact:true}).click();
 await expect(page.getByRole('radio',{name:/Mask entered values/})).toBeChecked();
});

test('masked capture leaves the live website untouched and records labelled inputs at action time',async({page})=>{
 await page.goto('/?debug=1');
 await page.waitForFunction(()=>!!(window as unknown as {UnravelSDK?:unknown}).UnravelSDK);
 await page.evaluate(async projectId=>{
  const host=window as unknown as {fixtureRecorder:Recorder;UnravelSDK:{initialize(options:RecorderOptions):Recorder}};
  host.fixtureRecorder.destroy();
  const section=document.createElement('section');section.id='timing-test';section.innerHTML='<label>Public field name<input id="timing-input" value="initial synthetic value"></label><p id="echo">Welcome Vansh</p>';
  document.body.append(section);
  host.fixtureRecorder=host.UnravelSDK.initialize({projectId,privacy:{mode:'masked-values'}});await host.fixtureRecorder.start();
 },projectId);
 const input=page.locator('#timing-input');await expect(input).toHaveValue('initial synthetic value');
 const before=await input.boundingBox();await input.fill('changed synthetic value');
 await expect(input).toHaveValue('changed synthetic value');await expect(page.locator('#echo')).toHaveText('Welcome Vansh');
 const after=await input.boundingBox();expect(after?.width).toBe(before?.width);expect(after?.height).toBe(before?.height);
 const recording=await page.evaluate(()=>{const r=(window as unknown as {fixtureRecorder:Recorder}).fixtureRecorder;const recording=r.stop()!;r.destroy();return recording;});
 const action=recording.events.find(e=>e.kind==='action'&&e.action==='fill');
 expect(action?.kind==='action'&&action.targetLabel).toBe('Public field name');
 const update=recording.replay.find(e=>e.type===3&&(e.data as {source?:number}).source===5&&(e.data as {text?:string}).text==='[redacted]');
 expect(update).toBeTruthy();expect(Math.abs(update!.timestamp-recording.startedAt-action!.at)).toBeLessThan(100);
 expect(JSON.stringify(recording)).not.toContain('changed synthetic value');
});

for(const mode of ['masked-values','full'] as const)test(`${mode}: readable page, explicit field capture and inert server validation`,async({page})=>{
 await page.goto('/?debug=1');
 await page.waitForFunction(()=>!!(window as unknown as {UnravelSDK?:unknown}).UnravelSDK);
 const recording=await page.evaluate(async({mode,projectId})=>{
  const host=window as unknown as {fixtureRecorder:Recorder;UnravelSDK:{initialize(options:RecorderOptions):Recorder}};
  host.fixtureRecorder.destroy();
  const area=document.createElement('section');
  area.innerHTML='<h2>Readable ordinary page</h2><p>Welcome Vansh</p><label>Question<input id="mode-question" value="ordinary synthetic value"></label><textarea>synthetic textarea value</textarea><input type="password" value="synthetic password value"><input autocomplete="cc-number" value="synthetic payment value"><input type="hidden" value="hidden-token-stays-out"><div data-unravel-block>blocked-widget-stays-out</div>';
  document.body.append(area);
  const recorder=host.UnravelSDK.initialize({projectId,privacy:{mode}});
  try{await recorder.start();return recorder.stop()!;}finally{recorder.destroy();area.remove();}
 },{mode,projectId});
 expect(recording.captureMode).toBe(mode);
 const raw=JSON.stringify(recording);
 expect(raw).toContain('Readable ordinary page');expect(raw).toContain('Welcome Vansh');
 for(const secret of ['ordinary synthetic value','synthetic textarea value','synthetic password value','synthetic payment value']){
  if(mode==='full')expect(raw).toContain(secret);else expect(raw).not.toContain(secret);
 }
 expect(raw).not.toContain('hidden-token-stays-out');expect(raw).not.toContain('blocked-widget-stays-out');
 const validated=validateSubmission({version:1,title:'Synthetic mode check',description:'',recording});
 expect(validated.recording.captureMode).toBe(mode);
 if(mode==='full')expect(JSON.stringify(validated)).toContain('synthetic password value');
});

test('widget asks before capture, freezes mode, and resets to masking after discard',async({page})=>{
 await page.goto(`/?projectId=${projectId}&applicationOrigin=${encodeURIComponent('http://127.0.0.1:4183')}`);
 await page.getByRole('button',{name:'Report a bug',exact:true}).click();
 const mask=page.getByRole('radio',{name:/Mask entered values/}),full=page.getByRole('radio',{name:/Full-content recording/});
 await expect(mask).toBeChecked();await full.check();
 await page.getByRole('button',{name:'Start recording',exact:true}).click();
 await expect(page.getByRole('button',{name:'Stop recording',exact:true})).toBeVisible();
 await expect(full).toHaveCount(0);
 await page.getByRole('button',{name:'Stop recording',exact:true}).click();
 await expect(page.getByText('Full-content recording: this report includes entered and sensitive values.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Discard recording',exact:true}).click();
 await page.getByRole('button',{name:'Discard unsent report',exact:true}).click();
 await expect(mask).toBeChecked();
});
