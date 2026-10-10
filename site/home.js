import {mountDemo} from '/home-demo.js';
import {solveProof} from '/proof.js';
import {SPECIALTIES} from '/specialties.js';

const query=new URLSearchParams(location.search),sources=new Set(['instagram','google','linkedin','facebook','indicacao']);
const privacyFlow=query.get('assunto')==='privacidade';
const requestedSource=(query.get('utm_source')||'').toLowerCase();
const sourceAliases={direct:'direto',referral:'indicacao',referral_link:'indicacao',indicacao:'indicacao',instagram:'instagram',google:'google',linkedin:'linkedin',facebook:'facebook'};
const source=requestedSource?(sources.has(requestedSource)?requestedSource:(sourceAliases[requestedSource]||'outro')):'direto';
let referrerHost='';try{const referrer=new URL(document.referrer);if(referrer.origin!==location.origin&&!referrer.hostname.endsWith('.izmed.com.br')&&referrer.hostname!=='izmed.com.br')referrerHost=referrer.hostname.toLowerCase();}catch{}
const width=window.innerWidth,coarse=matchMedia('(pointer: coarse)').matches,device=width<=640?'mobile':coarse?'tablet':'desktop';
const attribution={utmSource:(query.get('utm_source')||'').slice(0,80),utmMedium:(query.get('utm_medium')||'').slice(0,80),utmCampaign:(query.get('utm_campaign')||'').slice(0,100),utmContent:(query.get('utm_content')||'').slice(0,100),landingPath:location.pathname,referrerHost,device};
const tracked=new Set();
const optedOut=Boolean(navigator.globalPrivacyControl)||navigator.doNotTrack==='1'||window.doNotTrack==='1';
function track(event){
 if(optedOut||privacyFlow||tracked.has(event))return;tracked.add(event);
 fetch('/api/public/site/events',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event,source,attribution}),keepalive:true}).catch(()=>{});
}
track('landing_view');
const record=track;
mountDemo(document.querySelector('#interactive-demo'),record);
document.querySelectorAll('[data-cta]').forEach(a=>a.addEventListener('click',()=>record(`cta_click_${a.dataset.cta}`)));

const header=document.querySelector('.site-header'),menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#main-nav');
const desktop=matchMedia('(min-width: 1100px)');
const outsideMenu=[document.querySelector('main'),document.querySelector('footer'),document.querySelector('.mobile-cta')];

/**
 * Opens or closes the mobile menu and keeps the rest of the page out of reach while it is open.
 *
 * @param open - `true` shows the full-screen menu, `false` hides it.
 */
function setMenu(open){
 menu.setAttribute('aria-expanded',String(open));
 menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
 nav.classList.toggle('open',open);
 header.classList.toggle('menu-open',open);
 document.documentElement.classList.toggle('menu-locked',open);
 for(const el of outsideMenu)if(el)el.inert=open;
}
function closeMenu(){setMenu(false);}
menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});

const themeKey='izmed-theme',themeChoices=[...document.querySelectorAll('[data-theme-choice]')];
const themeToggle=document.querySelector('.theme-toggle'),themePanel=document.querySelector('#theme-panel');
const themeNames={system:'sistema',light:'claro',dark:'escuro'};
let themePointer=false;

/**
 * Marks the current theme choice on the desktop button and on both radio groups.
 *
 * @param choice - `system`, `light` or `dark`.
 */
function syncThemeControls(choice){
 for(const input of themeChoices)input.checked=input.value===choice;
 themeToggle.dataset.choice=choice;
 themeToggle.setAttribute('aria-label',`Alterar tema (atual: ${themeNames[choice]})`);
}

/**
 * Applies a theme choice and remembers it in this browser. `system` clears the saved choice so the
 * page follows the operating system again.
 *
 * @param choice - `system`, `light` or `dark`.
 */
function setTheme(choice){
 try{if(choice==='system')localStorage.removeItem(themeKey);else localStorage.setItem(themeKey,choice);}catch{}
 const apply=()=>{if(choice==='system')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=choice;syncThemeControls(choice);};
 if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion: reduce)').matches)document.startViewTransition(apply);else apply();
}
syncThemeControls(document.documentElement.dataset.theme||'system');
themePanel.addEventListener('pointerdown',()=>{themePointer=true;});
themePanel.addEventListener('keydown',()=>{themePointer=false;});
themeChoices.forEach(input=>input.addEventListener('change',()=>{
 if(!input.checked)return;
 setTheme(input.value);
 if(themePointer&&themePanel.contains(input))themePanel.hidePopover?.();
}));
if(!('popover' in HTMLElement.prototype))themeToggle.hidden=true;

const form=document.querySelector('#pilot-form'),status=document.querySelector('#form-status'),submit=form.querySelector('button[type=submit]');
let requestId=crypto.randomUUID();
let lastAttemptData=null;
const purpose=form.elements.purpose;
const clinicField=form.elements.clinic;
const specialtyField=form.elements.specialty;
specialtyField?.insertAdjacentHTML('beforeend',SPECIALTIES.map(name=>`<option>${name}</option>`).join(''));
let clinicAutofilled=false;
clinicField.addEventListener('input',()=>{clinicAutofilled=false;});
form.addEventListener('focusin',e=>{if(purpose.value==='piloto'&&e.target.matches('input,select,textarea'))record('form_start');});
function updatePurpose(){
 const privacy=purpose.value==='privacidade';
 const specialtyWrap=document.querySelector('#lead-specialty-field');if(specialtyWrap)specialtyWrap.hidden=privacy;
 submit.firstChild.textContent=privacy?'Enviar pedido sobre meus dados ':'Quero conhecer o piloto ';
 if(privacy&&!clinicField.value){clinicField.value='Não se aplica';clinicAutofilled=true;}
 if(!privacy&&clinicAutofilled){clinicField.value='';clinicAutofilled=false;}
}
purpose.addEventListener('change',updatePurpose);
if(query.get('assunto')==='privacidade'){purpose.value='privacidade';updatePurpose();}
form.addEventListener('submit',async e=>{
 e.preventDefault();status.textContent='';
 if(purpose.value==='piloto')record('form_submit_attempt');
 const contact=form.elements.contact.value.trim(),phone=contact.replace(/[ ()+.-]/g,'');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)&&!/^\d{10,15}$/.test(phone)){if(purpose.value==='piloto')record('form_validation_error');status.textContent='Informe um e-mail válido ou WhatsApp com DDD.';form.elements.contact.focus();return;}
 const attemptData=JSON.stringify([...new FormData(form)]);
 if(lastAttemptData!==null&&lastAttemptData!==attemptData)requestId=crypto.randomUUID();
 lastAttemptData=attemptData;
 submit.disabled=true;
 try{
  submit.firstChild.textContent='Verificando… ';const proof=await solveProof();submit.firstChild.textContent='Enviando… ';
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);let response;
  try{response=await fetch('/api/public/site/leads',{method:'POST',headers:{'content-type':'application/json'},signal:controller.signal,body:JSON.stringify({requestId,name:form.elements.name.value.trim(),clinic:form.elements.clinic.value.trim(),contact,purpose:purpose.value,specialty:purpose.value==='piloto'?(specialtyField?.value||''):'',consent:form.elements.consent.checked,website:form.elements.website.value,source:optedOut||purpose.value==='privacidade'?'outro':source,attribution:optedOut||purpose.value==='privacidade'?{}:attribution,proof})});}finally{clearTimeout(timeout);}
  if(!(response.headers.get('content-type')||'').includes('json'))throw new Error(`Serviço indisponível no momento (HTTP ${response.status}). Tente de novo em instantes.`);
  const result=await response.json();if(!response.ok||result.ok!==true)throw new Error(result.error||'Não foi possível enviar. Tente novamente.');
  const success=document.querySelector('#form-success');
  if(purpose.value==='privacidade')success.querySelector('h3').textContent='Pedido registrado.';
  form.hidden=true;success.hidden=false;success.focus({preventScroll:true});requestId=crypto.randomUUID();lastAttemptData=null;
 }catch(error){status.textContent=error.name==='AbortError'||error instanceof TypeError?'Não conseguimos confirmar o recebimento. Seus campos foram mantidos; tente enviar novamente.':error.message;}
 finally{submit.disabled=false;updatePurpose();}
});

/**
 * Keeps the header transparent over the brand hero only at the top of the page and switches it to
 * the solid look as soon as the visitor scrolls, so its white text never sits over the photo or the
 * value strip.
 */
function watchTop(){
 const sentinel=document.querySelector('.top-sentinel');
 if(!sentinel||!('IntersectionObserver' in window)){header.dataset.state='solid';return;}
 new IntersectionObserver(([entry])=>{header.dataset.state=entry.isIntersecting?'over-brand':'solid';}).observe(sentinel);
}
watchTop();
desktop.addEventListener('change',closeMenu);

if('IntersectionObserver' in window){
 const pilotObserver=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){record('pilot_section_view');pilotObserver.disconnect();}},{threshold:.3});pilotObserver.observe(document.querySelector('#piloto'));
 const sticky=document.querySelector('.mobile-cta'),visibleCtas=new Set();
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)entry.isIntersecting?visibleCtas.add(entry.target):visibleCtas.delete(entry.target);
  sticky.classList.toggle('hide',visibleCtas.size>0);
 },{threshold:0});
 observer.observe(document.querySelector('#piloto'));
 document.querySelectorAll('main [data-cta]').forEach(cta=>observer.observe(cta));
 document.addEventListener('focusin',e=>{if(e.target.matches('input,select'))sticky.classList.add('hide');});

 const spyLinks=new Map([...nav.querySelectorAll('.nav-link')].map(link=>[link.hash.slice(1),link]));
 const spy=new IntersectionObserver(entries=>{
  for(const entry of entries){
   const link=spyLinks.get(entry.target.id);
   if(entry.isIntersecting){spyLinks.forEach(other=>other.removeAttribute('aria-current'));link.setAttribute('aria-current','true');}
   else link.removeAttribute('aria-current');
  }
 },{rootMargin:'-45% 0px -50% 0px'});
 spyLinks.forEach((link,id)=>{const section=document.getElementById(id);if(section)spy.observe(section);});

 const stepLinks=new Map([...document.querySelectorAll('.feature-index a')].map(link=>[link.hash.slice(1),link]));
 const stepSpy=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   stepLinks.forEach(other=>other.removeAttribute('aria-current'));
   stepLinks.get(entry.target.id)?.setAttribute('aria-current','true');
  }
 },{rootMargin:'-40% 0px -55% 0px'});
 stepLinks.forEach((link,id)=>{const step=document.getElementById(id);if(step)stepSpy.observe(step);});

 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.querySelectorAll('[data-reveal-group]').forEach(group=>[...group.children].forEach((child,index)=>child.style.setProperty('--reveal-index',String(index))));
  const targets=[...document.querySelectorAll('[data-reveal], [data-reveal-group] > *')];
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   const el=entry.target;
   const done=event=>{if(event.target!==el)return;el.classList.remove('is-revealing');el.removeEventListener('transitionend',done);};
   el.addEventListener('transitionend',done);
   el.classList.add('is-revealing');el.classList.remove('is-pending');
   revealObserver.unobserve(el);
  }),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  const fold=innerHeight*.92;
  targets.forEach(el=>{if(el.getBoundingClientRect().top<fold)return;el.classList.add('is-pending');revealObserver.observe(el);});
 }
}

document.querySelector('#pilot-fields').disabled=false;
document.querySelector('#form-loading').hidden=true;
