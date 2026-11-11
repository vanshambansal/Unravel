import {settings} from '../../../settings';
export async function POST(){const config=await settings();return Response.json({accepted:config.fixed===true},{status:config.fixed?200:500});}
