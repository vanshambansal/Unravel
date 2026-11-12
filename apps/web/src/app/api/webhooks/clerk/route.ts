import {verifyWebhook} from '@clerk/nextjs/webhooks';
import {NextRequest} from 'next/server';
import {database} from '@/server/db/connection';
import {blockAccountIntake} from '@/server/accounts/closure';
import {verifiedClosure} from '@/server/accounts/webhook';
import {errorResponse} from '@/server/http';

export const runtime='nodejs';
export async function POST(request:Request){
 try{
  const owner=await verifiedClosure(request,process.env.CLERK_WEBHOOK_SIGNING_SECRET,(raw,options)=>verifyWebhook(new NextRequest(raw),options));
  if(owner)await blockAccountIntake(database(),owner);
  return Response.json({received:true},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return errorResponse(error);}
}
