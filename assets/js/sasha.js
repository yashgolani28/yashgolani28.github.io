/* Sasha: a local guide grounded in the public portfolio, with no remote model. */
(() => {
  'use strict';
  const data=window.PORTFOLIO;if(!data)return;
  const make=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
  const launch=make('button','sashaLaunch');launch.type='button';launch.setAttribute('aria-label','Ask Sasha about Yash’s work');launch.setAttribute('aria-expanded','false');launch.setAttribute('aria-controls','sasha-panel');
  launch.innerHTML='<span class="sashaMark" aria-hidden="true">✳</span><span>Ask Sasha</span>';
  const panel=make('aside','sashaPanel');panel.id='sasha-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Sasha, your portfolio guide');
  panel.innerHTML=`<header class="sashaHeader"><div class="sashaIdentity"><span class="sashaMark" aria-hidden="true">✳</span><div><h2>Sasha</h2><p>Your guide to Yash’s work</p></div></div><div class="sashaHeaderActions"><button type="button" id="sasha-clear" aria-label="Clear conversation">↺</button><button type="button" id="sasha-close" aria-label="Close Sasha">×</button></div></header><p class="sashaScope">Answers from this portfolio · questions stay in your browser</p><div id="sasha-log" class="sashaLog" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation with Sasha"></div><div class="sashaSuggestions" id="sasha-suggestions" aria-label="Suggested questions"></div><form id="sasha-form" class="sashaForm"><label class="sashaSr" for="sasha-input">Ask about Yash’s experience, projects, skills, or education</label><input id="sasha-input" autocomplete="off" maxlength="500" placeholder="Ask about a project or skill…"><button type="submit" aria-label="Send question">↑</button></form><p class="sashaFooter">Curated facts, not a live AI model. <a href="#contact">Ask Yash directly ↗</a></p>`;
  document.body.append(launch,panel);
  const log=panel.querySelector('#sasha-log'),input=panel.querySelector('#sasha-input'),suggestions=panel.querySelector('#sasha-suggestions');
  let lastTopic=null,opener=launch,count=0,followLatest=true;
  log.addEventListener('scroll',()=>{followLatest=log.scrollHeight-log.clientHeight-log.scrollTop<40;},{passive:true});
  new ResizeObserver(()=>{if(!panel.hidden&&followLatest)log.scrollTo({top:log.scrollHeight,behavior:'instant'});}).observe(log);
  const normal=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[-–—]/g,' ').replace(/[^a-z0-9+# ]/g,' ').replace(/\s+/g,' ').trim();
  function linksTo(parent,links){const row=make('div','sashaLinks');for(const [label,href] of links){const a=make('a','',label+' ↗');a.href=href;if(!href.startsWith('#')){a.target='_blank';a.rel='noreferrer';}row.append(a);}parent.append(row);}
  function add(role,text,links=[]){const entry=make('div','sashaMessage '+role);entry.append(make('span','sashaSpeaker',role==='user'?'You':'Sasha'),make('p','',text));if(links.length)linksTo(entry,links);log.append(entry);while(log.children.length>40)log.firstElementChild.remove();followLatest=true;log.scrollTo({top:log.scrollHeight,behavior:'instant'});}
  function contextualQuestions(){const label=document.getElementById('chapter-label').textContent.toLowerCase();if(/inside the signal/.test(label))return ['How does the sculpture work?','What is his distributed systems work?','Which personal projects has Yash built?'];if(/project|curiosity/.test(label))return ['Which personal projects has Yash built?','Tell me about Turtlebot','Explain Traffic VLM'];if(/pieces|system/.test(label))return ['What is his distributed systems work?','What does he do with GPUs?','Show his full-stack work'];if(/see|percep/.test(label))return ['What is his video analytics work?','Tell me about face recognition','How does he handle live cameras?'];if(/loop/.test(label))return ['What is his MLOps work?','Tell me about model research','What is his VLM work?'];return ['Give me a quick introduction','What did Yash build at ESSI?','What are his technical skills?'];}
  function updateSuggestions(){suggestions.replaceChildren();for(const q of contextualQuestions()){const button=make('button','',q);button.type='button';button.addEventListener('click',()=>ask(q));suggestions.append(button);}}
  function welcome(){log.replaceChildren();lastTopic=null;count=0;add('assistant','Hi, I’m Sasha. I can help you explore Yash’s engineering work, explain a project, or find his skills and résumé. What would you like to know?');updateSuggestions();}
  function open(){opener=document.activeElement;panel.hidden=false;launch.setAttribute('aria-expanded','true');input.focus();updateSuggestions();}
  function close(){panel.hidden=true;launch.setAttribute('aria-expanded','false');if(opener&&opener.isConnected)opener.focus();}
  launch.addEventListener('click',()=>panel.hidden?open():close());panel.querySelector('#sasha-close').addEventListener('click',close);panel.querySelector('#sasha-clear').addEventListener('click',()=>{welcome();input.focus();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();close();}});
  panel.addEventListener('click',e=>{if(e.target.closest('a[href^="#"]'))close();});
  function matchScore(query,terms){let score=0;for(const raw of terms){const term=normal(raw);if((' '+query+' ').includes(' '+term+' ')||(' '+query+' ').includes(' '+term+'s '))score+=term.split(' ').length===1?2:6;}return score;}
  function reply(query){
    const q=normal(query);
    if(/who are you|what is your name|what can you do|how can you help/.test(q))return {answer:'I’m Sasha, a local guide to Yash’s portfolio. I can explain his experience, projects, skills, and education, then link you to the relevant section. I use curated portfolio facts, not a live AI model.',links:[['Explore his work','#experience'],['Browse projects','#projects']]};
    if(/^(hi|hello|hey|thanks|thank you)$/.test(q))return {answer:'You’re welcome here. I can introduce Yash, explain his contributions, or point you to a project and its code.',links:[['Explore the work','#experience'],['Personal projects','#projects']]};
    if(/\b(salary|availability|available|notice period|hiring|hire|contact|email)\b/.test(q))return data.topics.find(t=>t.id==='contact');
    if(/\b(accuracy|latency|fps|benchmark|customers|client names|product names|how many cameras|uptime)\b/.test(q))return {answer:'This public portfolio does not publish employer product benchmarks, customer names, or deployment guarantees. It focuses on Yash’s contributions to analytics, architecture, and applications.',links:[['Read the contributions','#contributions'],['Ask Yash directly','#contact']]};
    if(/\b(more|that project|its stack|its tools)\b/.test(q)&&lastTopic&&lastTopic.project){const p=lastTopic.project;return {answer:p.work+' Tools: '+p.stack.join(', ')+'. Methods: '+(p.algorithms||[]).join('; ')+'.',links:[['View project',p.anchor],['Explore code','https://github.com/yashgolani28/'+p.repo]],project:p};}
    if(/\b(introduc|overview|summary|summarize|who is|who are|about yash)\w*/.test(q))return data.topics.find(t=>t.id==='overview');
    if(/what did (yash|he|you) (build|do)|what (has|have) (yash|he|you) (built|done)/.test(q))return data.topics.find(t=>t.id==='experience');
    const projects=data.projects.map(p=>({project:p,score:matchScore(q,[p.name,...p.terms])})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
    if(projects.length){const p=projects[0].project;return {answer:p.description+' '+p.work+' Tools: '+p.stack.join(', ')+'. Methods: '+(p.algorithms||[]).join('; ')+'.',links:[['View project',p.anchor],['Explore code','https://github.com/yashgolani28/'+p.repo]],project:p};}
    const topics=data.topics.map(t=>({...t,score:matchScore(q,t.terms)})).filter(t=>t.score>0).sort((a,b)=>b.score-a.score);
    if(topics.length){const first=topics[0];if(/\band\b|\bcompare\b/.test(q)&&topics[1]&&topics[1].score>=2)return {answer:first.answer+'\n\n'+topics[1].answer,links:[...first.links,...topics[1].links].slice(0,4)};return first;}
    return {answer:'I don’t have a verified answer to that in this portfolio. I can help with Yash’s work, projects, skills, education, or résumé. For anything beyond that, it’s best to ask him directly.',links:[['Professional work','#experience'],['Contact Yash','#contact']]};
  }
  function ask(text){const question=text.trim().slice(0,500);if(!question)return;add('user',question);input.value='';const result=reply(question);lastTopic=result;add('assistant',result.answer,result.links);count++;if(count===1)suggestions.hidden=true;}
  panel.querySelector('#sasha-form').addEventListener('submit',e=>{e.preventDefault();ask(input.value);});
  panel.querySelector('#sasha-clear').addEventListener('click',()=>{suggestions.hidden=false;});
  new MutationObserver(()=>{if(!panel.hidden&&!count)updateSuggestions();}).observe(document.getElementById('chapter-label'),{childList:true});
  welcome();
})();
