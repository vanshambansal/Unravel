import {syntheticSubmission} from '../../../../tests/fixtures/submission.ts';
import {reportService} from '../../src/server/reports/service.ts';
import {createRequire} from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac,randomBytes,randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import nextEnv from '@next/env';
import {Pool} from 'pg';
import {drizzle} from 'drizzle-orm/node-postgres';
import {migrate} from 'drizzle-orm/node-postgres/migrator';
import {eq} from 'drizzle-orm';
import {verifiedClosure} from '../../src/server/accounts/webhook.ts';
import {blockAccountIntake} from '../../src/server/accounts/closure.ts';
import {reportRepository} from '../../src/server/reports/repository.ts';
import * as schema from '../../src/server/db/schema.ts';

const {verifyWebhook}=createRequire(import.meta.url)('@clerk/nextjs/webhooks');
test('signed account closure blocks intake idempotently without removing projects or evidence',async()=>{
 const root=fileURLToPath(new URL('../../',import.meta.url));nextEnv.loadEnvConfig(root,true,{info(){},error(){}});
 const connection=process.env.TEST_DATABASE_URL;
 const identity=(value:string)=>{const url=new URL(value);return url.hostname.replace('-pooler.','.')+url.pathname;};
 assert.ok(connection);assert.notEqual(identity(connection),identity(process.env.DATABASE_URL!));
 const pool=new Pool({connectionString:connection,max:2,connectionTimeoutMillis:15000});const db=drizzle(pool,{schema}),owner='user_'+randomUUID().replaceAll('-','');
 const key=randomBytes(32),secret='whsec_'+key.toString('base64');
 function signed(body:string,seconds=Math.floor(Date.now()/1000)){
  const id='msg_'+randomUUID(),signature=createHmac('sha256',key).update(`${id}.${seconds}.${body}`).digest('base64');
  return new Request('http://localhost/api/webhooks/clerk',{method:'POST',headers:{'content-type':'application/json','svix-id':id,'svix-timestamp':String(seconds),'svix-signature':'v1,'+signature},body});
 }
 let projectId:string|undefined;
 try{
  await migrate(db,{migrationsFolder:root+'drizzle'});
  const [project]=await db.insert(schema.projects).values({ownerId:owner,name:'Synthetic closure test',origin:'https://closure.example'}).returning();projectId=project.id;
  const repository=reportRepository(db),service=reportService(repository);assert.ok(await repository.publicProject(project.id));
  const receipt=await service.submit(project.id,project.origin,syntheticSubmission(project.id,project.origin));
  const evidence=await repository.replay(owner,project.id,receipt.reportId);
  const body=JSON.stringify({type:'user.deleted',data:{id:owner,deleted:true},object:'event'});
  assert.equal(await verifiedClosure(signed(body),secret,verifyWebhook),owner);
  await assert.rejects(()=>verifiedClosure(signed(body),undefined,verifyWebhook),/not configured/);
  await assert.rejects(()=>verifiedClosure(signed(body,1),secret,verifyWebhook),/signature/);
  await assert.rejects(()=>verifiedClosure(signed(body), 'whsec_'+randomBytes(32).toString('base64'),verifyWebhook),/signature/);
  assert.equal(await verifiedClosure(signed(JSON.stringify({type:'session.created',data:{id:'session_test'}})),secret,verifyWebhook),null);
  await blockAccountIntake(db,owner);await blockAccountIntake(db,owner);
  assert.equal(await repository.publicProject(project.id),undefined);
  assert.deepEqual(await repository.replay(owner,project.id,receipt.reportId),evidence);
  await assert.rejects(()=>service.submit(project.id,project.origin,syntheticSubmission(project.id,project.origin)));
  assert.equal((await db.select().from(schema.projects).where(eq(schema.projects.id,project.id))).length,1);
  assert.equal((await db.select().from(schema.accountIntakeBlocks).where(eq(schema.accountIntakeBlocks.ownerId,owner))).length,1);
 }finally{
  if(projectId)await db.delete(schema.projects).where(eq(schema.projects.id,projectId));
  await db.delete(schema.accountIntakeBlocks).where(eq(schema.accountIntakeBlocks.ownerId,owner));await pool.end();
 }
});
