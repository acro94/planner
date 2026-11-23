// 오프라인 실행을 위한 서비스 워커. 앱을 고치면 VERSION 숫자를 올리세요.
const VERSION='fp-v9';
const SHELL=['./','./index.html','./firebase-config.js','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
const FBV='10.12.2';
const EXTRA=['firebase-app.js','firebase-auth.js','firebase-firestore.js'].map(f=>`https://www.gstatic.com/firebasejs/${FBV}/${f}`);
self.addEventListener('install',e=>{e.waitUntil((async()=>{const c=await caches.open(VERSION);await c.addAll(SHELL);await Promise.all(EXTRA.map(u=>c.add(new Request(u,{mode:'cors'})).catch(()=>{})));self.skipWaiting()})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==VERSION)await caches.delete(k);await self.clients.claim()})())});
const PASS=/(firestore|identitytoolkit|securetoken|www)\.googleapis\.com|firebaseapp\.com|apis\.google\.com|accounts\.google\.com/;
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(PASS.test(u.hostname))return;                       // 데이터·로그인 요청은 Firebase가 직접 처리
  if(r.mode==='navigate'){                               // 앱 페이지: 네트워크 우선, 끊기면 저장본
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{const c=res.clone();caches.open(VERSION).then(x=>x.put('./index.html',c));return res}).catch(()=>caches.match('./index.html')));return}
  if(u.origin===location.origin){                       // 앱 파일: 항상 새 파일 먼저, 끊기면 저장본
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res}).catch(()=>caches.match(r)));return}
  if(/gstatic\.com|fonts\.googleapis\.com/.test(u.hostname)){   // SDK·글꼴: 한 번 받으면 저장본 사용
    e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(VERSION).then(x=>x.put(r,c))}return res})));}
});
