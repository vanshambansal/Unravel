import {ApplicationError} from '../errors.ts';
import {boundedText} from '../http.ts';

type Verify = (request:Request,options:{signingSecret:string})=>Promise<{type:string;data:unknown}>;
export async function verifiedClosure(request:Request,signingSecret:string|undefined,verifyWebhook:Verify){
 if(!signingSecret)throw new ApplicationError(503,'Account webhook is not configured.');
 const raw=await boundedText(request,32768);
 let event;
 try{event=await verifyWebhook(new Request(request.url,{method:'POST',headers:request.headers,body:raw}),{signingSecret});}
 catch{throw new ApplicationError(400,'Webhook signature could not be verified.');}
 if(event.type!=='user.deleted')return null;
 const id=event.data&&typeof event.data==='object'&&'id' in event.data?event.data.id:null;
 if(typeof id!=='string'||!/^user_[A-Za-z0-9_-]{1,120}$/.test(id))throw new ApplicationError(422,'Invalid deleted account identifier.');
 return id;
}
