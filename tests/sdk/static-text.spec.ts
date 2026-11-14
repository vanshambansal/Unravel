import {test,expect} from '@playwright/test';
import type {Recorder,RecorderOptions} from '../../packages/sdk/src/types';

test('marked static text is readable while entered values and blocked content remain masked',async({page})=>{
 await page.goto('/?debug=1');
 await page.waitForFunction(()=>Boolean((window as unknown as {UnravelSDK?:unknown}).UnravelSDK));
 const result=await page.evaluate(async()=>{
  const host=window as unknown as {fixtureRecorder:Recorder;UnravelSDK:{initialize(options:RecorderOptions):Recorder}};
  host.fixtureRecorder.destroy();
  const area=document.createElement('section');
  area.innerHTML='<h2 data-unravel-safe-text>Approved static heading</h2><p>Unmarked confidential text</p><label><span data-unravel-safe-text>Public question label</span><input value="Private typed value" /></label><button data-unravel-safe-text>Public submit label</button><div data-unravel-safe-text data-unravel-block>Blocked content wins</div><input type="password" value="Secret password value" data-unravel-safe-text />';
  document.body.append(area);
  const recorder=host.UnravelSDK.initialize({projectId:'12345678-1234-4234-8234-123456789012',privacy:{allowTextSelectors:['[data-unravel-safe-text]']}});
  try{await recorder.start();return JSON.stringify(recorder.stop());}
  finally{recorder.destroy();area.remove();}
 });
 expect(result).toContain('Approved static heading');
 expect(result).toContain('Public question label');
 expect(result).toContain('Public submit label');
 for(const secret of ['Unmarked confidential text','Private typed value','Blocked content wins','Secret password value'])expect(result).not.toContain(secret);
 expect(result).toContain('[redacted]');
});
