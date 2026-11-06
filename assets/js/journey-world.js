import * as THREE from '../vendor/three/three.module.js';

// One continuous parametric surface: perception, connections, interfaces, feedback.
// The sculpture is conceptual artwork, not a model of any employer system.
const canvas=document.getElementById('work-canvas'),stage=document.getElementById('scene-stage');
const fallback=document.getElementById('scene-fallback'),pause=document.getElementById('motion-control');
const disperse=document.getElementById('chaos-control'),pulseButton=document.getElementById('pulse-control');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});}catch{fallback.hidden=false;document.documentElement.classList.add('noWebgl');window.dispatchEvent(new Event('portfolio:layout'));}
if(renderer)init();
function init(){
  fallback.hidden=true;pause.hidden=disperse.hidden=pulseButton.hidden=false;
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,60);
  camera.position.z=7;renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<650?1.3:1.6));renderer.setClearColor(0,0);
  const sculpture=new THREE.Group();scene.add(sculpture);
  const uniforms={uTime:{value:0},uMode:{value:0},uSpread:{value:0},uEnergy:{value:.5},uPulse:{value:-10},uDark:{value:0},uPointer:{value:new THREE.Vector2(4,4)},uTouch:{value:0}};
  const surface=`
    uniform float uTime,uMode,uSpread,uEnergy,uPulse,uTouch;
    uniform vec2 uPointer;
    const float PI=3.14159265359;
    vec3 curve(float u,float strand,float mode){
      float a=u*PI*2.;float phase=strand*PI*2./3.;float breathe=sin(uTime*.3+a*3.)*.035*uEnergy;
      vec3 knot=vec3((1.02+.38*cos(3.*a+phase))*cos(2.*a),(1.02+.38*cos(3.*a+phase))*sin(2.*a),.46*sin(3.*a+phase));
      float r=1.25+.13*sin(a*5.+phase);
      vec3 orbit=vec3(r*cos(a+phase),r*sin(a+phase)*cos(phase+.45),r*sin(a+phase)*sin(phase+.45));
      vec3 wave=vec3(cos(a)*1.45,sin(a)*.72+sin(a*3.+phase)*.22,(strand-1.)*.44+sin(a*2.+phase)*.42);
      vec3 feedback=vec3((1.+.32*cos(a*3.+phase))*cos(a),(1.+.32*cos(a*3.+phase))*sin(a),.62*sin(a*3.+phase));
      vec3 helix=vec3((1.+.32*cos(a*2.+phase))*cos(a),(1.+.32*cos(a*2.+phase))*sin(a),.8*sin(a*2.+phase));
      vec3 p=mix(knot,orbit,clamp(mode,0.,1.));p=mix(p,wave,clamp(mode-1.,0.,1.));p=mix(p,feedback,clamp(mode-2.,0.,1.));p=mix(p,helix,clamp(mode-3.,0.,1.));
      p*=1.+breathe;return p;
    }
    vec3 surfaceAt(vec2 uv,float strand){
      vec3 c=curve(uv.x,strand,uMode);
      vec3 tangent=normalize(curve(uv.x+.0003,strand,uMode)-curve(uv.x-.0003,strand,uMode));
      vec3 n=normalize(cross(tangent,vec3(.05,.08,1.)));vec3 b=normalize(cross(tangent,n));
      float angle=uv.y*PI*2.+uv.x*PI*4.+strand;
      float width=.14+.055*sin(uv.x*PI*6.+strand+uTime*.25)*uEnergy;
      vec3 p=c+n*cos(angle)*width+b*sin(angle)*(.045+.04*uEnergy);
      float pulse=exp(-pow((uv.x-uPulse)*5.,2.))*uEnergy;
      p*=1.+pulse*.3;
      vec3 direction=normalize(c+vec3(.001));
      p+=direction*uSpread*(.35+.2*sin(uv.x*64.+strand*5.));
      float nearPointer=exp(-length(p.xy-uPointer)*2.5)*uTouch;
      p.z+=nearPointer*.42;
      return p;
    }
  `;
  const vertex=surface+`
    attribute float aStrand;varying vec3 vNormalW,vWorld;varying vec2 vUv;varying float vStrand;
    void main(){vec3 p=surfaceAt(uv,aStrand);vec3 du=surfaceAt(uv+vec2(.0003,0.),aStrand)-p;vec3 dv=surfaceAt(uv+vec2(0.,.0003),aStrand)-p;
      vNormalW=normalize(mat3(modelMatrix)*cross(du,dv));vec4 world=modelMatrix*vec4(p,1.);vWorld=world.xyz;vUv=uv;vStrand=aStrand;
      gl_Position=projectionMatrix*viewMatrix*world;
    }`;
  const fragment=`
    uniform float uDark,uTime,uEnergy,uPulse,uSpread;varying vec3 vNormalW,vWorld;varying vec2 vUv;varying float vStrand;
    void main(){vec3 n=normalize(vNormalW);if(!gl_FrontFacing)n=-n;vec3 view=normalize(cameraPosition-vWorld);vec3 reflected=reflect(-view,n);
      float fresnel=pow(1.-abs(dot(n,view)),2.5);
      float strip=pow(.5+.5*sin(reflected.y*7.+reflected.x*3.),14.);
      float soft=pow(.5+.5*cos(reflected.x*3.-reflected.z*2.),3.);
      vec3 cobalt=vec3(.07,.28,.95),crimson=vec3(.9,.11,.16),silver=vec3(.78,.86,.96);
      float shift=.5+.5*sin(reflected.y*3.+vUv.x*12.5663706+vStrand*1.6);
      vec3 tint=shift<.5?mix(cobalt,silver,shift*2.):mix(silver,crimson,(shift-.5)*2.);
      vec3 color=tint*(.2+soft*.7)+vec3(.92,.95,1.)*strip*.95+fresnel*mix(cobalt,silver,.7)*.7;
      float pulse=exp(-pow((vUv.x-uPulse)*12.,2.));color+=vec3(.65,.83,1.)*pulse*.7;
      float seam=pow(.5+.5*cos(vUv.y*6.283*2.),65.);color+=seam*.12;
      color=mix(color,color*1.12,uDark);gl_FragColor=vec4(color,1.-uSpread*.96);
    }`;
  // Three linked closed ribbons share topology, so every scroll transition morphs.
  const segments=innerWidth<650?128:192,sides=18,positions=[],uvs=[],strands=[],indices=[];
  for(let s=0;s<3;s++){const base=positions.length/3;for(let u=0;u<=segments;u++)for(let v=0;v<=sides;v++){positions.push(0,0,0);uvs.push(u/segments,v/sides);strands.push(s);}for(let u=0;u<segments;u++)for(let v=0;v<sides;v++){const a=base+u*(sides+1)+v,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setAttribute('aStrand',new THREE.Float32BufferAttribute(strands,1));geometry.setIndex(indices);
  const material=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide,transparent:true});
  const ribbons=new THREE.Mesh(geometry,material);ribbons.frustumCulled=false;sculpture.add(ribbons);
  const pointsMaterial=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,vertexShader:surface+`
    attribute float aStrand;varying float vShade;void main(){vec3 p=surfaceAt(uv,aStrand);p+=normalize(p)*(.035+uSpread*.3);vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(1.1+uSpread*2.)*(7./-mv.z);vShade=.5+.5*sin(uv.x*31.4159265+aStrand);}`,
    fragmentShader:`uniform float uSpread,uDark;varying float vShade;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 c=mix(vec3(.12,.35,.9),vec3(.9,.15,.2),step(.5,vShade));c=mix(c,c+.28,uDark);gl_FragColor=vec4(c,(.12+uSpread*.8)*smoothstep(.5,.15,d));}`});
  const points=new THREE.Points(geometry,pointsMaterial);points.frustumCulled=false;sculpture.add(points);
  const orbitMaterial=new THREE.LineBasicMaterial({color:0x648ac1,transparent:true,opacity:.22});
  const orbits=[];for(let j=0;j<3;j++){const coords=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;coords.push(new THREE.Vector3(Math.cos(a)*(1.8+j*.13),Math.sin(a)*(1.8+j*.13),0));}const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(coords),orbitMaterial);l.rotation.set(.7+j*.6,j*.8,0);sculpture.add(l);orbits.push(l);}
  let playing=!reduced.matches,visible=true,lost=false,frame=0,last=0,time=0,spread=0,scattered=false,pulse=-10;
  let rig=window.portfolioWorldState||{mode:0,x:1.95,y:0,scale:.88,opacity:1,turn:0,lab:false};
  let drag=null,rotX=.15,rotY=-.2,override=null,energy=.5,touch=0;
  const captions=['Signal / Drag to bend','Connections / Drag to bend','Interfaces / Drag to bend','Feedback / Drag to bend','Possibilities / Drag to bend'];
  function request(){if(!frame&&visible&&!lost&&!document.hidden)frame=requestAnimationFrame(draw);}
  function labels(){pause.textContent=playing?'Pause ambient':'Play ambient';pause.setAttribute('aria-pressed',String(!playing));disperse.textContent=scattered?'Gather particles ↙':'Disperse ↗';disperse.setAttribute('aria-pressed',String(scattered));document.body.classList.toggle('motionPaused',!playing);}
  function sendPulse(){pulse=playing?-0.2:.5;stage.dataset.pulses=String(Number(stage.dataset.pulses||0)+1);request();}
  pause.addEventListener('click',()=>{playing=!playing;last=0;labels();request();});
  disperse.addEventListener('click',()=>{scattered=!scattered;if(!playing)spread=scattered?1:0;labels();request();});
  pulseButton.addEventListener('click',sendPulse);
  document.getElementById('lab-pulse').addEventListener('click',sendPulse);
  document.getElementById('lab-energy').addEventListener('input',e=>{energy=Number(e.target.value)/100;document.getElementById('energy-value').textContent=e.target.value+'%';request();});
  for(const button of document.querySelectorAll('[data-form]'))button.addEventListener('click',()=>{override=button.dataset.form==='auto'?null:Number(button.dataset.form);for(const el of document.querySelectorAll('[data-form]'))el.setAttribute('aria-pressed',String(el===button));request();});
  document.getElementById('lab-reset').addEventListener('click',()=>{override=null;energy=.5;rotX=.15;rotY=-.2;scattered=false;spread=0;pulse=-10;document.getElementById('lab-energy').value='50';document.getElementById('energy-value').textContent='50%';for(const el of document.querySelectorAll('[data-form]'))el.setAttribute('aria-pressed',String(el.dataset.form==='auto'));labels();request();});
  reduced.addEventListener('change',()=>{playing=!reduced.matches;last=0;labels();request();});
  window.addEventListener('portfolio:journey',e=>{rig=e.detail;visible=rig.opacity>.01;if(visible)request();});
  window.addEventListener('portfolio:theme',request);
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});
  canvas.addEventListener('pointermove',e=>{const rect=canvas.getBoundingClientRect();uniforms.uPointer.value.set(((e.clientX-rect.left)/rect.width-.5)*6-rig.x,(.5-(e.clientY-rect.top)/rect.height)*4-rig.y);touch=1;if(drag){rotY+=(e.clientX-drag.x)*.008;rotX+=(e.clientY-drag.y)*.008;drag.x=e.clientX;drag.y=e.clientY;}request();});
  canvas.addEventListener('pointerup',e=>{if(drag&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<8)sendPulse();drag=null;canvas.classList.remove('dragging');});
  canvas.addEventListener('pointercancel',()=>{drag=null;canvas.classList.remove('dragging');});canvas.addEventListener('pointerleave',()=>{touch=0;request();});
  function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();request();}
  new ResizeObserver(resize).observe(stage);document.addEventListener('visibilitychange',()=>{last=0;request();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;playing=false;labels();canvas.hidden=true;fallback.hidden=false;pause.hidden=disperse.hidden=pulseButton.hidden=true;document.querySelector('.labControls').hidden=true;document.documentElement.classList.add('noWebgl');window.dispatchEvent(new Event('portfolio:layout'));});
  function draw(now){frame=0;if(!visible||document.hidden||lost)return;const dt=last?Math.min((now-last)/1000,.05):0;last=now;if(playing){time+=dt;if(pulse>=-.2&&pulse<1.5)pulse+=dt*.6;}
    spread+=((scattered?1:0)-spread)*(1-Math.exp(-dt*7));
    material.depthWrite=spread<.05;
    uniforms.uTime.value=time;uniforms.uMode.value=rig.lab&&override!==null?override:rig.mode;uniforms.uSpread.value=spread;uniforms.uEnergy.value=energy;uniforms.uPulse.value=pulse;uniforms.uTouch.value=touch;uniforms.uDark.value=document.documentElement.dataset.theme==='dark'?1:0;
    sculpture.position.set(rig.x,rig.y,0);sculpture.scale.setScalar(rig.scale);sculpture.rotation.set(rotX+rig.turn*.08,rotY+rig.turn*.22+time*.035,Math.sin(time*.13)*.05);
    orbits.forEach((o,i)=>{o.rotation.z=time*.035*(i%2?1:-1)+rig.turn*.12;});
    const hint=document.getElementById('scene-label'),caption=captions[Math.round(Math.min(4,uniforms.uMode.value))];if(hint.textContent!==caption)hint.textContent=caption;
    stage.dataset.mode=String(Math.round(uniforms.uMode.value));stage.dataset.scattered=String(scattered);stage.dataset.energy=String(energy);stage.dataset.rotation=rotY.toFixed(2);
    renderer.render(scene,camera);if(playing)request();
  }
  document.querySelector('.labControls').hidden=false;labels();resize();stage.dataset.renderer='webgl';
}
