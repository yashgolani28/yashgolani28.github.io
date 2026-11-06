/* Lightweight, input-driven diagrams of the work. No live product metrics. */
(() => {
  'use strict';
  const data=window.ENGINEERING,section=document.getElementById('skills');
  if(!data||!section)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),tabs=[...section.querySelectorAll('[data-layer]')];
  const planes=[...section.querySelectorAll('.systemPlane')],flow=document.getElementById('engineering-flow');
  const traceButton=document.getElementById('trace-system'),status=document.getElementById('flow-status');
  let selected=0,frame=0;
  const text=(id,value)=>{document.getElementById(id).textContent=value;};
  function stopTrace(){cancelAnimationFrame(frame);frame=0;traceButton.disabled=false;section.classList.remove('isTracing');flow.querySelectorAll('li').forEach(el=>el.classList.remove('isActive'));planes.forEach(el=>el.classList.remove('isFlowStage'));text('drawing-layer',String(selected+1).padStart(2,'0')+' / '+data.layers[selected].label.toUpperCase());}
  function select(index,focus=false){
    stopTrace();selected=index;const layer=data.layers[index];status.textContent='';
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
    planes.forEach((plane,i)=>plane.classList.toggle('isSelected',i===index));
    document.getElementById('engineering-detail').setAttribute('aria-labelledby',tabs[index].id);
    text('drawing-layer',String(index+1).padStart(2,'0')+' / '+layer.label.toUpperCase());
    text('engineering-scope',layer.scope);text('engineering-title',layer.verb);text('engineering-summary',layer.summary);
    const tools=document.getElementById('engineering-tools');tools.replaceChildren(...layer.stack.map(name=>window.portfolioTechBadge(name)));
    text('engineering-methods',layer.methods.join(' · '));
    const link=document.getElementById('engineering-link');link.textContent=layer.link[0]+' ↗';link.href=layer.link[1];
    flow.replaceChildren(...data.flow.map(label=>{const li=document.createElement('li');li.textContent=label;return li;}));
    if(focus){
      tabs[index].focus({preventScroll:true});
      const nav=section.querySelector('.layerTabs'),bounds=tabs[index].getBoundingClientRect(),area=nav.getBoundingClientRect();
      if(bounds.left<area.left)nav.scrollLeft-=area.left-bounds.left;
      if(bounds.right>area.right)nav.scrollLeft+=bounds.right-area.right;
    }
    window.dispatchEvent(new Event('portfolio:layout'));
  }
  section.querySelector('.layerTabs').hidden=false;traceButton.hidden=false;
  tabs.forEach((tab,i)=>tab.addEventListener('click',()=>select(i)));
  section.querySelector('.layerTabs').addEventListener('keydown',event=>{
    let next=selected;if(event.key==='ArrowRight')next=(selected+1)%tabs.length;else if(event.key==='ArrowLeft')next=(selected+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
    event.preventDefault();select(next,true);
  });
  planes.forEach((plane,i)=>plane.addEventListener('click',()=>select(i,true)));
  traceButton.addEventListener('click',()=>{
    stopTrace();const labels=data.flow;
    if(reduced.matches){status.textContent=labels.join(' → ');return;}
    section.classList.add('isTracing');traceButton.disabled=true;
    const paths=planes.map(plane=>plane.querySelector('.planeTrace')),lengths=paths.map(path=>path.getTotalLength()),start=performance.now();
    const steps=[...flow.children];
    function tick(now){
      const progress=Math.min(1,(now-start)/4500),step=Math.min(4,Math.floor(progress*5)),local=progress===1?1:progress*5-step;
      const point=paths[step].getPointAtLength(local*lengths[step]),dot=planes[step].querySelector('.traceDot');
      dot.setAttribute('cx',point.x);dot.setAttribute('cy',point.y);
      planes.forEach((plane,i)=>plane.classList.toggle('isFlowStage',i===step));steps.forEach((el,i)=>el.classList.toggle('isActive',i===step));
      text('drawing-layer',String(step+1).padStart(2,'0')+' / '+data.layers[step].label.toUpperCase());
      if(progress<1){frame=requestAnimationFrame(tick);}else{stopTrace();status.textContent=labels.join(' → ');}
    }
    frame=requestAnimationFrame(tick);
  });
  reduced.addEventListener('change',stopTrace);
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stopTrace();});observer.observe(section);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopTrace();});
  select(0);
  // Project mechanisms reveal the software/mechanical chain behind each concept image.
  for(const article of document.querySelectorAll('.projectSlide')){
    const id=article.id.replace('project-',''),model=data.projects[id];if(!model)continue;
    const visual=article.querySelector('.projectVisual');
    const controls=document.createElement('div');controls.className='mechanismToggle';controls.setAttribute('role','group');controls.setAttribute('aria-label',model.title+' view');
    const panel=document.createElement('div');panel.className='projectMechanism';panel.id='mechanism-'+id;panel.hidden=true;panel.setAttribute('role','group');panel.setAttribute('aria-label',model.title);
    const heading=document.createElement('p');heading.className='mechanismTitle';heading.textContent=model.title;
    const list=document.createElement('ol');list.className='mechanismSteps';
    model.steps.forEach(([name,detail],i)=>{const li=document.createElement('li'),number=document.createElement('span'),title=document.createElement('strong'),copy=document.createElement('span');number.className='mechanismNumber';number.textContent=String(i+1).padStart(2,'0');title.textContent=name;copy.textContent=detail;li.append(number,title,copy);list.append(li);});
    panel.append(heading,list);
    const image=visual.querySelector('img'),caption=visual.querySelector(':scope>span');
    ['Concept','How it works'].forEach((label,i)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-pressed',String(i===0));button.setAttribute('aria-controls',panel.id);button.addEventListener('click',()=>{panel.hidden=i===0;image.hidden=i===1;if(caption)caption.hidden=i===1;controls.querySelectorAll('button').forEach((el,j)=>el.setAttribute('aria-pressed',String(j===i)));});controls.append(button);});
    visual.append(panel,controls);
  }
})();
