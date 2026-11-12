import {test,expect} from '@playwright/test';

test('SVG button semantics preserve blocking and multiple values stay masked by default',async({page})=>{
 await page.goto('/?debug=1');
 await page.evaluate(async()=>{
  window.fixtureRecorder.destroy();
  const section=document.createElement('section');
  section.innerHTML='<button id="ordinary-icon" aria-label="Ordinary action"><svg width="40" height="40"><rect width="40" height="40"/></svg></button><button id="private-icon" data-unravel-block><svg width="40" height="40"><rect width="40" height="40"/></svg></button><select id="ordinary-multi" multiple><option value="PRIVATE_ALPHA">Alpha</option><option value="PRIVATE_BETA">Beta</option></select>';
  document.querySelector('main')!.append(section);
  window.fixtureRecorder=window.UnravelSDK.initialize({projectId:'12345678-1234-4234-8234-123456789012'});
  await window.fixtureRecorder.start();
 });
 await page.locator('#ordinary-icon rect').click();await page.locator('#private-icon rect').click();await page.locator('#private-icon').evaluate(element=>element.removeAttribute('data-unravel-block'));await page.locator('#private-icon rect').click();
 await page.locator('#ordinary-multi').selectOption(['PRIVATE_ALPHA','PRIVATE_BETA']);
 const recording=await page.evaluate(()=>window.fixtureRecorder.stop());
 const actions=recording!.events.filter(event=>event.kind==='action');expect(actions.map(event=>event.action)).toEqual(['click','select']);
 expect(actions[1]).toMatchObject({value:null,values:null,redacted:true});expect(JSON.stringify(recording)).not.toContain('PRIVATE_ALPHA');expect(JSON.stringify(recording)).not.toContain('PRIVATE_BETA');
});

test('safe multiple selection records both options, deselection and replay option states',async({page})=>{
 await page.goto('/?debug=1');
 await page.evaluate(async()=>{
  window.fixtureRecorder.destroy();const select=document.createElement('select');select.id='safe-multi';select.multiple=true;select.innerHTML='<option value="alpha">Alpha</option><option value="beta">Beta</option>';document.querySelector('main')!.append(select);
  window.fixtureRecorder=window.UnravelSDK.initialize({projectId:'12345678-1234-4234-8234-123456789012',privacy:{allowValueSelectors:['#safe-multi']}});await window.fixtureRecorder.start();
 });
 await page.locator('#safe-multi').selectOption(['alpha','beta']);await page.locator('#safe-multi').selectOption([]);
 const recording=await page.evaluate(()=>window.fixtureRecorder.stop());
 const selects=recording!.events.filter(event=>event.kind==='action'&&event.action==='select');expect(selects.map(event=>event.kind==='action'?event.values:undefined)).toEqual([['alpha','beta'],[]]);
 const mutations=recording!.replay.filter(event=>event.type===3&&(event.data as {source?:number}).source===0).map(event=>event.data as {attributes?:{attributes:{selected?:boolean|null}}[]});
 expect(mutations.some(event=>event.attributes?.filter(item=>item.attributes.selected===true).length===2)).toBe(true);
 expect(mutations.some(event=>event.attributes?.filter(item=>item.attributes.selected===null).length===2)).toBe(true);
});
