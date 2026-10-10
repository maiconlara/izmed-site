// Anti-robot proof for the public forms, no third party: the server signs a challenge and this finds a nonce whose
// SHA-256 of `challenge:nonce` starts with `difficulty` zero bits (server/proof.mjs checks it and accepts it once).
// Digests run in batches with an await between them, so a slow phone keeps painting the page while it works.
const BATCH=256;
const zeroBits=bytes=>{let bits=0;for(const byte of bytes){if(byte)return bits+Math.clz32(byte)-24;bits+=8;}return bits;};
export async function solve({challenge,difficulty}){
 const encoder=new TextEncoder();
 for(let start=0;;start+=BATCH){
  const hashes=await Promise.all(Array.from({length:BATCH},(_,i)=>crypto.subtle.digest('SHA-256',encoder.encode(`${challenge}:${start+i}`))));
  const found=hashes.findIndex(hash=>zeroBits(new Uint8Array(hash))>=difficulty);
  if(found>=0)return {challenge,nonce:String(start+found)};
 }
}
export async function solveProof(base=''){
 const response=await fetch(`${base}/api/public/challenge`,{credentials:'omit'});
 const data=await response.json();
 if(!response.ok)throw Object.assign(new Error(data.error||'Não foi possível confirmar o envio. Recarregue a página e tente de novo.'),{status:response.status});
 return solve(data);
}
