const loopback=(host:string)=>['localhost','127.0.0.1','[::1]'].includes(host);
/** Syntactic origin validation is not a declaration that a deployment is trusted. */
export function validReplayOrigin(value:string,parent:string){
 try{const url=new URL(value),owner=new URL(parent);return url.origin===value&&!url.username&&!url.password&&url.origin!==owner.origin&&(url.protocol==='https:'&&url.hostname!==owner.hostname||loopback(url.hostname)&&loopback(owner.hostname)&&['http:','https:'].includes(url.protocol));}catch{return false;}
}
