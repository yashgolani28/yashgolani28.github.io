(() => {
  const nodes=[...document.querySelectorAll('[data-node]')];
  const diagram=document.getElementById('routing-diagram');
  const reset=document.getElementById('lab-reset');
  if(!diagram)return;
  const online=[true,true,true];
  function render(){
    const count=online.filter(Boolean).length;
    nodes.forEach((node,i)=>{node.setAttribute('aria-pressed',String(online[i]));node.querySelector('.nodeState').textContent=online[i]?'Online':'Offline';diagram.classList.toggle(`offline${i}`,!online[i]);});
    diagram.dataset.active=String(count);
    const label=document.getElementById('lab-status-label'),text=document.getElementById('lab-status-text');
    if(count===3){label.textContent='All paths open.';text.textContent='Tap a worker to take it offline. Watch the remaining paths carry the signal.';}
    else if(count===0){label.textContent='You found the limit.';text.textContent='No workers are available. The signal waits. Bring one back to restore a path.';}
    else {label.textContent=count===1?'One path. Still connected.':'A different route. Same destination.';text.textContent='The illustration redirects activity to the available workers. Recovery and coordination are part of the systems work I enjoy.';}
  }
  nodes.forEach((node,i)=>node.addEventListener('click',()=>{online[i]=!online[i];render();}));
  reset.hidden=false;reset.addEventListener('click',()=>{online.fill(true);render();});render();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.classList.toggle('inView',entry.isIntersecting);});
  for(const el of document.querySelectorAll('.routingLab,.ticker'))observer.observe(el);
  // Progress is scroll-linked, with no scroll hijacking or forced chapter transitions.
  const progress=document.createElement('div');progress.className='readingProgress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
  let scheduled=false;
  function update(){scheduled=false;const range=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${range>0?scrollY/range:0})`;}
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});update();
  // Subtle perspective on the personal project cards, only for precise pointers.
  if(matchMedia('(pointer:fine)').matches){for(const card of document.querySelectorAll('.projectsGrid>.card')){
    card.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=card.getBoundingClientRect();card.style.setProperty('--tilt-x',`${-(e.clientY-r.top-r.height/2)/r.height*4}deg`);card.style.setProperty('--tilt-y',`${(e.clientX-r.left-r.width/2)/r.width*5}deg`);});
    card.addEventListener('pointerleave',()=>{card.style.setProperty('--tilt-x','0deg');card.style.setProperty('--tilt-y','0deg');});
  }}
})();
