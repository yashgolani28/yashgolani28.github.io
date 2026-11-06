// A short, skippable opening. Readiness milestones are real; loading never gates content indefinitely.
(() => {
  const root=document.documentElement,overlay=document.getElementById('opening-loader');
  const skip=document.getElementById('skip-intro'),status=document.getElementById('intro-status');
  let done=false,started=performance.now(),timeout;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function finish(){if(done)return;done=true;clearTimeout(timeout);root.classList.remove('introActive');overlay.classList.add('introComplete');document.querySelectorAll('[data-intro-inert]').forEach(el=>{el.inert=false;el.removeAttribute('data-intro-inert');});const focusWasInside=overlay.contains(document.activeElement);if(focusWasInside)document.querySelector('.wordmark')?.focus({preventScroll:true});setTimeout(()=>{overlay.hidden=true;},reduced.matches?0:450);}
  function prepare(){for(const el of document.body.children){if(el!==overlay&&el.tagName!=='SCRIPT'&&!el.inert){el.inert=true;el.setAttribute('data-intro-inert','');}}}
  function ready(){if(done)return;status.textContent='Ready to explore';overlay.style.setProperty('--intro-progress','1');setTimeout(finish,Math.max(0,(reduced.matches?0:900)-(performance.now()-started)));}
  if(location.hash||reduced.matches){overlay.hidden=true;return;}
  overlay.hidden=false;root.classList.add('introActive');overlay.style.setProperty('--intro-progress','.15');
  skip.addEventListener('click',finish);skip.focus({preventScroll:true});
  overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();finish();}if(e.key==='Tab'){e.preventDefault();skip.focus();}});
  document.addEventListener('DOMContentLoaded',()=>{if(done)return;prepare();status.textContent='Connecting the pieces';overlay.style.setProperty('--intro-progress','.65');Promise.allSettled([document.fonts.ready,new Promise(resolve=>{if(document.readyState==='complete')resolve();else addEventListener('load',resolve,{once:true});})]).then(ready);},{once:true});
  timeout=setTimeout(finish,3500);
  addEventListener('pageshow',e=>{if(e.persisted)finish();});
})();
