import assert from 'node:assert/strict';
import test from 'node:test';
import {storageFailureKind} from '../../apps/web/src/server/storage-diagnostics.ts';

test('storage diagnostics retain only known codes through wrapped errors and never messages',()=>{
  assert.equal(storageFailureKind({message:'private connection URL',cause:{code:'ENOTFOUND',message:'private hostname'}}),'ENOTFOUND');
  assert.equal(storageFailureKind({errors:[{code:'ECONNRESET'}]}),'ECONNRESET');
  assert.equal(storageFailureKind({code:'42601',query:'private SQL'}),'42601');
  const cycle:{cause?:unknown}={};cycle.cause=cycle;
  assert.equal(storageFailureKind(cycle),'unknown');
  assert.equal(storageFailureKind({code:'private arbitrary string',message:'private'}),'unknown');
});
