import {settings} from '../../settings';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await settings(),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Config unavailable'},{status:503});}}
