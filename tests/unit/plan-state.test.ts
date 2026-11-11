import test from 'node:test';
import assert from 'node:assert/strict';
import {TestPlanSchema} from '../../packages/test-plan/dist/index.js';
import {startHistory,commitHistory,undoHistory,redoHistory,rememberDraft,readDraft} from '../../apps/web/src/features/reports/plan-state.ts';
import {LocatorSchema} from '../../packages/contracts/dist/index.js';
const plan=TestPlanSchema.parse({version:1,initialPath:'/',steps:[],assertions:[],expectedBehaviorConfirmed:false});
test('draft history restores whole plans including removal, order and confirmation and remains bounded',()=>{
 let history=startHistory(plan);history=commitHistory(history,{...plan,initialPath:'/one'});history=commitHistory(history,{...plan,initialPath:'/two',expectedBehaviorConfirmed:true});
 const undone=undoHistory(history);assert.equal(undone.value.initialPath,'/one');assert.equal(undone.value.expectedBehaviorConfirmed,false);assert.deepEqual(redoHistory(undone).value,history.value);
 const branch=commitHistory(undone,{...plan,initialPath:'/other'});assert.equal(branch.future.length,0);
 for(let i=0;i<40;i++)history=commitHistory(history,{...plan,initialPath:`/${i}`});assert.equal(history.past.length,25);assert.equal(history.value.initialPath,'/39');
});
test('tab-memory recovery can be cleared and bounds retained report drafts',()=>{
 const value={plan,raw:JSON.stringify(plan),baseline:JSON.stringify(plan),revision:0,mode:'reproduction' as const,selection:null};
 for(let i=0;i<5;i++)rememberDraft(`unit-${i}`,value);assert.equal(readDraft('unit-0'),undefined);assert.deepEqual(readDraft('unit-4'),value);rememberDraft('unit-4',null);assert.equal(readDraft('unit-4'),undefined);
});
test('transport structural selectors contain only bounded tag and ordinal paths',()=>{
 assert.equal(LocatorSchema.safeParse({kind:'css',value:'body > main:nth-of-type(1) > button:nth-of-type(2)'}).success,true);
 for(const value of ['#private-user-id','[data-email="person@example.com"]','body > input:nth-of-type(0)','body > input:nth-of-type(1)[value=secret]','body > button:has-text("private")'])assert.equal(LocatorSchema.safeParse({kind:'css',value}).success,false,value);
});
