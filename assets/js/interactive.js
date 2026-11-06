/* A procedural, locally rendered sketch. No product assets or telemetry. */
(() => {
  'use strict';
  const modes = [
    { code: '01 / PERCEPTION', kicker: 'From pixels to understanding', description: 'I develop analytics for vehicles, people, traffic, and scenes, connecting model outputs to searchable events.', href: '#ws-analytics', link: 'Explore my analytics work' },
    { code: '02 / SYSTEMS', kicker: 'Many parts. One working system.', description: 'I build distributed processing and orchestration that connects cameras, inference servers, and backend services.', href: '#ws-distributed', link: 'Explore my systems work' },
    { code: '03 / APPLICATIONS', kicker: 'Make complex work usable.', description: 'I build full-stack interfaces for search, alerts, investigations, and maps, bringing analytics into everyday workflows.', href: '#ws-platform', link: 'Explore my application work' }
  ];
  const modeButtons = [...document.querySelectorAll('[data-scene]')];
  modeButtons.forEach((button, index) => button.addEventListener('click', () => {
    const info = modes[index];
    modeButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === index)));
    document.getElementById('scene-code').textContent = info.code;
    document.getElementById('scene-kicker').textContent = info.kicker;
    document.getElementById('scene-description').textContent = info.description;
    const link = document.getElementById('scene-link');
    link.href = info.href; link.textContent = info.link + ' ↗';
    document.getElementById('scene-stage').dataset.mode = String(index);
    window.dispatchEvent(new CustomEvent('portfolio:mode', {detail:index}));
  }));
  document.querySelector('.sceneModes').hidden = false;
  // Real content stays in the document; filters are optional progressive enhancement.
  function installFilter(buttonSelector,itemSelector,attribute,statusId,noun) {
    const buttons=[...document.querySelectorAll(buttonSelector)],items=[...document.querySelectorAll(itemSelector)];
    if(!buttons.length)return;
    buttons[0].parentElement.hidden=false;
    function apply(value){
      buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attribute]===value)));
      let shown=0;items.forEach(item=>{item.hidden=value!=='all'&&item.dataset.group!==value;if(!item.hidden)shown++;});
      document.getElementById(statusId).textContent=`${shown} ${noun} shown`;
    }
    buttons.forEach(b=>b.addEventListener('click',()=>apply(b.dataset[attribute])));
    function revealHash(){const id=decodeURIComponent(location.hash.slice(1));const el=document.getElementById(id);if(el&&items.some(item=>item.hidden&&(item===el||item.contains(el)))){apply('all');el.scrollIntoView({block:'start'});}}
    window.addEventListener('hashchange',revealHash);
    // A repeated anchor doesn't emit hashchange, so also handle direct link clicks.
    document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const el=document.getElementById(a.getAttribute('href').slice(1));if(el&&items.some(item=>item===el||item.contains(el)))apply('all');});
  }
  document.querySelectorAll('[data-work-group]').forEach(el=>el.dataset.group=el.dataset.workGroup);
  installFilter('[data-work-filter]','[data-work-group]','workFilter','work-filter-status','contributions');
  document.querySelectorAll('.projectsGrid > .card').forEach((el,i)=>el.dataset.group=[1,2,3].includes(i)?'robotics':'ai');
  installFilter('[data-project-filter]','.projectsGrid > .card','projectFilter','project-filter-status','projects');
})();
