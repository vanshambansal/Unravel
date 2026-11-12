import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { TestPlanSchema, generatePlan, planIssues, readableSteps, exportPlaywright, type TestPlan } from '../../packages/test-plan/dist/index.js';
import { sanitizePresentation } from '../../packages/contracts/dist/index.js';
import { validateSubmission } from '../../apps/web/src/server/reports/validation.ts';
import { syntheticSubmission } from '../fixtures/submission.ts';

function valid(): TestPlan { return TestPlanSchema.parse({ version: 1, initialPath: '/', steps: [{ id: 'one', action: 'fill', locator: { kind: 'testId', value: 'question', name: '' }, value: 'Synthetic question', note: '' }], assertions: [{ id: 'assert', locator: { kind: 'css', value: '#feedback', name: '' }, text: 'Success' }], expectedBehaviorConfirmed: true }); }
test('presentation accepts bounded values and rejects resource loads, content, escapes and unknown CSS', () => {
  assert.equal(sanitizePresentation('color:rgb(0, 0, 0);display:flex;padding-top:12px'), 'color:rgb(0, 0, 0);display:flex;padding-top:12px');
  for (const style of ['background-image:url(https://evil.example)','content:attr(value)','color:var(--secret)','width:expression(alert(1))','width:calc(100% + 1px)','font-family:private-sentinel','color:r\\67b(0,0,0)','--token:secret','filter:url(#secret)','color:red!important']) assert.equal(sanitizePresentation(style), null, style);
  const input = syntheticSubmission(); input.recording.presentation = 1;
  const root = (input.recording.replay[1].data as { node: { childNodes: { attributes: Record<string,string> }[] } }).node;
  root.childNodes[0].attributes = { style: 'display:block;background-color:rgb(255, 255, 255)' };
  assert.doesNotThrow(() => validateSubmission(input));
  root.childNodes[0].attributes.style = 'background-image:url(https://evil.example)'; assert.throws(() => validateSubmission(input));
});
test('normalization collapses typing and correlated submit without inventing expected behavior', () => {
  const recording = syntheticSubmission().recording;
  const fill = recording.events[0]; assert.equal(fill.kind, 'action');
  if (fill.kind !== 'action') return;
  const plan = generatePlan({ initialUrl: recording.initialUrl, events: [{ ...fill, at: 10, value: 'a' }, { ...fill, at: 20, value: 'ab' }, { ...fill, at: 30, action: 'click', value: null }, { ...fill, at: 31, action: 'submit', value: null }] });
  assert.equal(plan.steps.length, 2); assert.equal(plan.steps[0].value, 'ab'); assert.equal(plan.assertions.length, 0); assert.equal(plan.expectedBehaviorConfirmed, false);
  const masked = generatePlan({ initialUrl: { origin: 'https://example.com', path: null }, events: [{ ...fill, redacted: true }] });
  assert.equal(masked.steps[0].value, null); assert.ok(planIssues(masked).some(i => i.includes('safe replacement'))); assert.ok(planIssues(masked).some(i => i.includes('Initial path')));
});
test('validated export requires assertions, safe values, supported actions and resolved locators', () => {
  const plan = valid(); assert.deepEqual(planIssues(plan), []);
  for (const bad of [{ ...plan, assertions: [] }, { ...plan, initialPath: '//evil.example' }, { ...plan, initialPath: '/\t/evil.example' }, { ...plan, expectedBehaviorConfirmed: false }, { ...plan, steps: [{ ...plan.steps[0], value: null }] }, { ...plan, steps: [{ ...plan.steps[0], action: 'unsupported' as const }] }, { ...plan, steps: [{ ...plan.steps[0], locator: { kind: 'unresolved' as const, value: '', name: '' } }] }]) assert.throws(() => exportPlaywright(bad));
  assert.equal(TestPlanSchema.safeParse({ ...plan, arbitraryJavaScript: 'alert(1)' }).success, false);
});
test('Playwright adapter escapes literals and prose shares the edited plan', () => {
  const plan = valid(); const sentinel = '"; throw new Error(`injected ${1}`); //\n\u2028'; plan.steps[0].value = sentinel;
  const code = exportPlaywright(plan), source = ts.createSourceFile('generated.spec.ts', code, ts.ScriptTarget.Latest, true);
  assert.equal(source.statements.length, 2); assert.ok(code.includes(JSON.stringify(sentinel).replace(/\u2028/g, '\\u2028')));
  assert.ok(code.includes('toHaveText("Success")')); assert.ok(!code.includes('waitForTimeout')); assert.ok(!code.includes('@unravel')); assert.ok(code.includes('page.goto("/")'));
  assert.ok(readableSteps(plan).some(step => step.includes(JSON.stringify(sentinel))));
});

test('legacy plans upgrade without losing data and exclusions remain reversible in portable JSON', () => {
  const legacy = { version: 1, initialPath: '/', steps: [{ id:'click', action:'click', locator:{kind:'testId', value:'submit', name:''}, value:null, note:'' }], assertions:[], expectedBehaviorConfirmed:false };
  const before = JSON.stringify(legacy), plan = TestPlanSchema.parse(legacy);
  assert.equal(JSON.stringify(legacy), before); assert.equal(plan.version, 2); assert.equal(plan.steps[0].sourceAt, null); assert.equal(plan.steps[0].included,true);
  assert.equal(planIssues(plan,'reproduction').length,0); assert.ok(planIssues(plan).length > 0);
  const excluded = { ...plan.steps[0], id:'excluded', included:false, action:'unsupported' as const, locator:{kind:'unresolved' as const,value:'',name:''} };
  plan.steps.push(excluded); assert.doesNotThrow(()=>exportPlaywright(plan,'reproduction')); assert.ok(!exportPlaywright(plan,'reproduction').includes('toHaveText'));
  assert.equal(TestPlanSchema.parse(JSON.parse(JSON.stringify(plan))).steps.length,2);
  excluded.included=true; assert.throws(()=>exportPlaywright(plan,'reproduction'));
  assert.throws(()=>exportPlaywright({...plan,steps:plan.steps.map(s=>({...s,included:false}))},'reproduction'));
});

test('unknown inputs are not merged and source positions follow normalized actions', () => {
  const original=syntheticSubmission().recording, fill=original.events[0]; if(fill.kind!=='action') throw new Error('fixture');
  const plan=generatePlan({initialUrl:original.initialUrl,events:[{...fill,at:10,target:{kind:'unresolved',tag:'input'}},{...fill,at:20,target:{kind:'unresolved',tag:'input'}}]});
  assert.equal(plan.steps.length,2); assert.deepEqual(plan.steps.map(s=>s.sourceAt),[10,20]); assert.ok(plan.steps.every(s=>s.included));
});

test('different expected outcomes compile safely and reproduction never inherits assertions', () => {
  const plan=valid(); plan.assertions=[{id:'url',kind:'url',path:'/account'},{id:'visible',kind:'visible',locator:{kind:'role',value:'heading',name:'Account'}},{id:'response',kind:'response',method:'POST',path:'/api/save',status:201},{id:'errors',kind:'no-page-errors'}];
  const code=exportPlaywright(plan); assert.ok(code.includes('toHaveURL')); assert.ok(code.includes('toBeVisible')); assert.ok(code.indexOf('waitForResponse') > code.indexOf('page.goto')); assert.ok(code.indexOf('waitForResponse') < code.indexOf('.fill('));
  assert.ok(code.includes('url.origin === new URL(baseURL!).origin')); assert.ok(code.includes('.toBe(201)')); assert.ok(code.includes("page.on('pageerror'")); assert.ok(!code.includes('waitForTimeout'));
  const reproduction=exportPlaywright(plan,'reproduction'); assert.ok(reproduction.includes('Reproduction only')); for(const text of ['toHaveURL','toBeVisible','waitForResponse','pageErrors']) assert.ok(!reproduction.includes(text));
  for(const path of ['//evil.example','/api/save?secret=x','/api/save#fragment','/api/\\save']) assert.throws(()=>exportPlaywright({...plan,assertions:[{id:'r',kind:'response',method:'GET',path,status:200}]}));
  assert.throws(()=>exportPlaywright({...plan,assertions:[{id:'r',kind:'response',method:'GET',path:'/api/save',status:999}]}));
  assert.throws(()=>exportPlaywright({...plan,expectedBehaviorConfirmed:false}));
});

test('CSS validation rejects malformed or unsupported selectors before export',()=>{
  const plan=valid(); for(const value of ['[','button[foo="x"',':unknown-state','#foo::before','button > > input','input:nth-of-type(oops)']) assert.throws(()=>exportPlaywright({...plan,steps:[{...plan.steps[0],locator:{kind:'css',value,name:''}}]},'reproduction'),value);
  for(const value of ['#feedback','body > main:nth-of-type(1) > input:nth-of-type(2)','form input[name="question"]','button:not([disabled])']) assert.doesNotThrow(()=>exportPlaywright({...plan,steps:[{...plan.steps[0],locator:{kind:'css',value,name:''}}]},'reproduction'),value);
});

test('normalization retains raw evidence while folding native focus, typing, submit and causal SPA navigation',()=>{
  const recording=syntheticSubmission().recording, base=recording.events[0]; if(base.kind!=='action')throw Error('fixture');
  const events=[{...base,at:1,action:'click' as const,value:null},{...base,at:2,action:'fill' as const,value:'a'},{...base,at:3,action:'fill' as const,value:'ab'},{...base,at:4,action:'click' as const,target:{kind:'css' as const,value:'body > form:nth-of-type(1) > button:nth-of-type(1)'},value:null},{...base,at:5,action:'submit' as const,target:{kind:'css' as const,value:'body > form:nth-of-type(1) > button:nth-of-type(1)'},value:null},{kind:'navigation' as const,at:20,source:'push' as const,url:{origin:recording.initialUrl.origin,path:null}}];
  const before=JSON.stringify(events),plan=generatePlan({initialUrl:recording.initialUrl,events});assert.equal(JSON.stringify(events),before);assert.deepEqual(plan.steps.map(step=>step.action),['fill','click']);assert.equal(plan.steps[0].value,'ab');
  const navigation=generatePlan({initialUrl:recording.initialUrl,events:[{kind:'navigation',at:5000,source:'pop',url:{origin:recording.initialUrl.origin,path:'/account'}}]});assert.equal(navigation.steps[0].action,'navigate');assert.ok(exportPlaywright(navigation,'reproduction').includes('page.goto("/account")'));
  const backAfterClick=generatePlan({initialUrl:recording.initialUrl,events:[events[3],{kind:'navigation',at:21,source:'pop',url:{origin:recording.initialUrl.origin,path:'/account'}}]});assert.deepEqual(backAfterClick.steps.map(step=>step.action),['click','navigate']);
  const unknown=generatePlan({initialUrl:recording.initialUrl,events:[{kind:'navigation',at:5000,source:'pop',url:{origin:recording.initialUrl.origin,path:null}}]});assert.equal(unknown.steps[0].action,'unsupported');
});

test('response subscriptions bind to an included action and page-error checks need completion',()=>{
  const plan=valid();plan.steps.push({...plan.steps[0],id:'click',action:'click',value:null});
  plan.assertions=[{id:'r',kind:'response',method:'POST',path:'/api/save',status:200,afterStepId:'click'}];
  const code=exportPlaywright(plan);assert.ok(code.indexOf('waitForResponse')>code.indexOf('.fill('));assert.ok(code.indexOf('waitForResponse')<code.indexOf('.click('));
  assert.throws(()=>exportPlaywright({...plan,steps:plan.steps.map(step=>step.id==='click'?{...step,included:false}:step)}));
  assert.throws(()=>exportPlaywright({...plan,assertions:[{id:'e',kind:'no-page-errors'}]}));
  assert.doesNotThrow(()=>exportPlaywright({...plan,assertions:[...plan.assertions,{id:'e',kind:'no-page-errors'}]}));
});


test('multiple selections preserve arrays, explicit deselection, masking and standalone export',()=>{
 const initialUrl={origin:'https://example.com',path:'/'};
 const event={kind:'action' as const,at:1,action:'select' as const,target:{kind:'testId' as const,value:'channels'},value:null,values:['alpha','beta'],redacted:false};
 const plan=generatePlan({initialUrl,events:[event]});
 assert.deepEqual(plan.steps[0].values,['alpha','beta']);
 assert.match(exportPlaywright(plan,'reproduction'),/selectOption\(\["alpha","beta"\]\)/);
 assert.ok(readableSteps(plan).some(step=>step.includes('alpha')&&step.includes('beta')));
 const cleared=generatePlan({initialUrl,events:[{...event,values:[]}]});
 assert.match(exportPlaywright(cleared,'reproduction'),/selectOption\(\[\]\)/);
 const masked=generatePlan({initialUrl,events:[{...event,values:null,redacted:true}]});
 assert.throws(()=>exportPlaywright(masked,'reproduction'),/safe replacement/);
 assert.equal(TestPlanSchema.safeParse({...plan,steps:[{...plan.steps[0],action:'fill'}]}).success,false);
});
