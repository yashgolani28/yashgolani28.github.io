(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const themeButton = document.getElementById('theme-toggle');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  let themeChosen = false;
  try { themeChosen = ['dark','light'].includes(localStorage.getItem('portfolio-theme')); } catch {}
  function applyTheme(theme) {
    root.style.removeProperty('--paper');
    root.dataset.theme = theme;
    themeButton.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    window.dispatchEvent(new Event('portfolio:theme'));
    schedule();
  }
  themeButton.hidden = false;
  themeButton.addEventListener('click', () => {
    themeChosen = true;
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('portfolio-theme', theme); } catch {}
    applyTheme(theme);
  });
  systemTheme.addEventListener('change', () => { if (!themeChosen) applyTheme(systemTheme.matches ? 'dark' : 'light'); });
  const menu = document.getElementById('site-menu');
  const toggle = document.getElementById('menu-toggle');
  menu.hidden = true; toggle.hidden = false;
  function closeMenu() { menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.innerHTML='Index <span>＋</span>'; }
  toggle.addEventListener('click',()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.innerHTML=open?'Close <span>−</span>':'Index <span>＋</span>';});
  menu.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus();}});
  document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!toggle.contains(e.target))closeMenu();});
  const chapters=[...document.querySelectorAll('[data-label]')];
  const worldSections=[...document.querySelectorAll('[data-world]')];
  const configs=[
    {mode:0,x:2.15,y:.05,scale:.78,opacity:1,turn:0,color:[237,242,248]},
    {mode:0,x:-1.7,y:.05,scale:.94,opacity:1,turn:1.4,color:[224,234,249]},
    {mode:1,x:1.6,y:0,scale:1.1,opacity:1,turn:3.4,color:[226,237,247]},
    {mode:2,x:-1.65,y:0,scale:.96,opacity:1,turn:5.1,color:[245,232,234]},
    {mode:3,x:1.8,y:.5,scale:.58,opacity:.5,turn:7,color:[241,232,231]},
    {mode:3,x:0,y:.4,scale:.4,opacity:0,turn:8.5,color:[237,242,248]}
  ];
  const darkColors=[[12,19,31],[14,24,43],[13,27,42],[30,20,27],[34,22,26],[12,19,31]];
  const projectSection=document.getElementById('projects'),track=document.querySelector('.projectTrack');
  const lab=document.getElementById('signal-lab');
  let positions=[],reelTop=0,reelDistance=0,labTop=0,labTravel=0,frame=0;
  const clamp=(n,min=0,max=1)=>Math.min(max,Math.max(min,n));
  function measure(){
    root.classList.toggle('enhanced',!reduced.matches);
    reelDistance=reduced.matches?0:Math.max(0,track.scrollWidth-innerWidth);
    const reelHeight=`${innerHeight+reelDistance}px`;
    if(projectSection.style.getPropertyValue('--reel-height')!==reelHeight)projectSection.style.setProperty('--reel-height',reelHeight);
    positions=worldSections.map(el=>el.offsetTop);
    reelTop=projectSection.offsetTop;labTop=lab.offsetTop;labTravel=Math.max(1,lab.offsetHeight-innerHeight);
    schedule();
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(update);}
  function update(){
    frame=0;const y=scrollY;
    let i=0;while(i<positions.length-2&&y>positions[i+1])i++;
    let t=clamp((y-positions[i])/(positions[i+1]-positions[i]));
    t=t*t*(3-2*t);
    const a=configs[i],b=configs[i+1];
    const state={};for(const key of ['mode','x','y','scale','opacity','turn'])state[key]=a[key]+(b[key]-a[key])*t;
    if(innerWidth<=650){state.x=.85;state.y=-.7;state.scale*=.61;state.opacity*=.43;}
    if(reduced.matches){state.mode=0;state.turn=0;state.x=innerWidth<=650?.85:2.15;state.y=innerWidth<=650?-.7:.05;state.scale=innerWidth<=650?.55:.78;}
    const labProgress=clamp((y-labTop)/labTravel);
    const labVisibility=clamp((y-labTop+innerHeight*.65)/(innerHeight*.65))*clamp((labTop+labTravel+innerHeight*.6-y)/(innerHeight*.6));
    state.lab=labVisibility>0;
    if(state.lab){state.mode=reduced.matches?0:labProgress*4;state.x=innerWidth<=650?.25:1.1;state.y=innerWidth<=650&&innerHeight<700?.3:0;state.scale=innerWidth<=650?(innerHeight<700?.32:.44):1.1;state.opacity=labVisibility*(innerWidth<=650?.8:1);state.turn=reduced.matches?0:labProgress*7;}
    document.getElementById('lab-progress').style.transform=`scaleX(${labProgress})`;
    const labSteps=['01 / SIGNAL','02 / CONNECTIONS','03 / INTERFACES','04 / FEEDBACK','05 / POSSIBILITIES'];
    document.getElementById('lab-step').textContent=labSteps[Math.min(4,Math.floor(labProgress*5))];
    const dark=root.dataset.theme==='dark';
    const colorA=dark?darkColors[i]:a.color,colorB=dark?darkColors[i+1]:b.color;
    const color=colorA.map((c,j)=>Math.round(c+(colorB[j]-c)*t));
    root.style.setProperty('--paper',`rgb(${color.join(',')})`);
    document.querySelector('meta[name="theme-color"]').content=`rgb(${color.join(',')})`;
    root.style.setProperty('--world-opacity',state.opacity.toFixed(3));
    window.portfolioWorldState=state;
    window.dispatchEvent(new CustomEvent('portfolio:journey',{detail:state}));
    const reelProgress=reelDistance?clamp((y-reelTop)/reelDistance):0;
    // Native focus/hash navigation can scroll an overflow-hidden sticky container.
    // Keep its scroll offset neutral; vertical page position owns the reel transform.
    document.querySelector('.projectPin').scrollLeft=0;
    projectSection.style.setProperty('--reel-x',`${-reelProgress*reelDistance}px`);
    projectSection.style.setProperty('--reel-progress',String(reelProgress));
    let active=chapters[0];for(const chapter of chapters){if(chapter.offsetTop<=y+innerHeight*.45)active=chapter;}
    const index=chapters.indexOf(active);
    document.getElementById('chapter-label').textContent=active.dataset.label;
    document.getElementById('chapter-number').textContent=String(Math.min(7,Math.floor(index*7/chapters.length)+1)).padStart(2,'0');
    document.getElementById('journey-progress').style.transform=`scaleY(${clamp(y/(document.documentElement.scrollHeight-innerHeight))})`;
    for(const link of menu.querySelectorAll('a')){if(link.hash===`#${active.id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}
    document.querySelector('.worldControls').classList.toggle('worldGone',state.opacity<.03);
  }
  // Native page scrolling controls the entire scene and the pinned project reel.
  // There is no wheel cancellation, snap scrolling, or forced advancement.
  addEventListener('scroll',schedule,{passive:true});
  let resizeFrame=0;addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(measure);});
  reduced.addEventListener('change',measure);
  applyTheme(root.dataset.theme || 'light');
  document.addEventListener('toggle',e=>{if(e.target.matches('details'))measure();},true);
  window.addEventListener('portfolio:layout',measure);
  document.fonts.ready.then(measure);addEventListener('load',measure,{once:true});measure();
  // Bring a keyboard-focused slide into view even though the reel is transformed.
  track.addEventListener('focusin',e=>{if(reduced.matches)return;const slide=e.target.closest('.projectSlide');if(!slide)return;const bounds=slide.getBoundingClientRect();if(bounds.left<0||bounds.right>innerWidth){const offset=clamp(slide.offsetLeft-parseFloat(getComputedStyle(track).paddingLeft),0,reelDistance);scrollTo({top:reelTop+offset,behavior:'instant'});}});
  function revealProjectHash() {
    const target=document.getElementById(location.hash.slice(1));
    if(target?.matches('.archiveProject')){target.scrollIntoView();}
    if(target && target.matches('.projectSlide') && !reduced.matches) {
      measure();
      const offset=clamp(target.offsetLeft-parseFloat(getComputedStyle(track).paddingLeft),0,reelDistance);
      const reveal=()=>{document.querySelector('.projectPin').scrollLeft=0;scrollTo({top:reelTop+offset,behavior:'instant'});schedule();};
      reveal();
      // Native fragment scrolling can finish after hashchange on touch browsers.
      requestAnimationFrame(reveal);
    }
  }
  // A same-fragment click must also reveal a slide after the reader has scrolled away.
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href^="#"]');
    if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    const target=document.getElementById(link.hash.slice(1));
    if(!target?.matches('.projectSlide'))return;
    event.preventDefault();
    if(location.hash!==link.hash)history.pushState(null,'',link.hash);
    revealProjectHash();
  });
  window.addEventListener('hashchange',revealProjectHash);
  window.addEventListener('load',()=>{measure();revealProjectHash();},{once:true});
  // Keep older experience deep-links useful after the narrative restructuring.
  const aliases={'ws-investigation':'ws-platform','sasha-essi-integrated-technologies':'experience','sasha-automatic-number-plate-recognition':'ws-analytics','sasha-face-recognition-identity-registry':'ws-analytics','sasha-radar-evidence-systems':'ws-radar','sasha-mlops-platform':'ws-mlops','sasha-vlm-retrieval':'ws-vlm','sasha-unified-analytics-platform':'ws-platform','sasha-investigation-search':'ws-platform'};
  function resolveOldHash(){const dest=aliases[location.hash.slice(1)];if(dest){history.replaceState(null,'',`#${dest}`);document.getElementById(dest).scrollIntoView();}}
  addEventListener('hashchange',resolveOldHash);resolveOldHash();
  const projectDialog=document.getElementById('project-dialog');
  for(const button of document.querySelectorAll('[data-project]')) {
    button.hidden=false;
    button.setAttribute('aria-haspopup','dialog');
    button.setAttribute('aria-controls','project-dialog');
    button.addEventListener('click',e=>{
      // Preserve browser link gestures for the archive's repository fallback.
      if(button.tagName==='A'&&(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey))return;
      e.preventDefault();
      const project=window.PORTFOLIO.projects.find(p=>p.id===button.dataset.project);
      document.getElementById('project-dialog-title').textContent=project.name;
      document.getElementById('project-dialog-subtitle').textContent=project.subtitle;
      document.getElementById('project-dialog-description').textContent=project.description;
      document.getElementById('project-dialog-work').textContent=project.work;
      const stack=document.getElementById('project-dialog-stack');stack.replaceChildren();
      for(const tech of project.stack)stack.append(window.portfolioTechBadge(tech));
      const algorithms=document.getElementById('project-dialog-algorithms');algorithms.replaceChildren();
      for(const method of project.algorithms||[]){const li=document.createElement('li');li.textContent=method;algorithms.append(li);}
      document.querySelector('.dialogNote').textContent=project.note || 'Project visuals are generated concept illustrations, not photographs of the actual builds.';
      document.getElementById('project-dialog-repo').href='https://github.com/yashgolani28/'+project.repo;
      projectDialog.showModal();
    });
  }
  document.getElementById('project-dialog-close').addEventListener('click',()=>projectDialog.close());
  projectDialog.addEventListener('click',e=>{if(e.target===projectDialog){const r=projectDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)projectDialog.close();}});
  document.getElementById('year').textContent=new Date().getFullYear();
  const form=document.getElementById('contactForm');
  const status=document.getElementById('formStatus')||Object.assign(document.createElement('p'),{id:'formStatus'});
  status.setAttribute('role','status');if(!status.parentNode)form.append(status);
  form.addEventListener('submit',async e=>{e.preventDefault();const button=form.querySelector('button[type="submit"]');button.disabled=true;status.textContent='Sending…';try{const response=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});if(!response.ok)throw Error();form.reset();status.textContent='Message sent. Thank you for getting in touch.';}catch{status.textContent='Could not send right now. Please email me directly.';}finally{button.disabled=false;}});
  if(location.hostname==='yashgolani28.github.io'){const script=document.createElement('script');script.defer=true;script.dataset.domain=location.hostname;script.src='https://plausible.io/js/script.js';document.head.append(script);}
})();
