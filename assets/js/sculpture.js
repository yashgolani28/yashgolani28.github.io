import * as THREE from '../vendor/three/three.module.js';

// Local procedural geometry: no external models, tracking, or product assets.
const canvas = document.getElementById('work-canvas');
const stage = document.getElementById('scene-stage');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const pause = document.getElementById('motion-control');
const chaos = document.getElementById('chaos-control');
let renderer;
try { renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'low-power'}); }
catch { document.getElementById('scene-fallback').hidden = false; }
if (renderer) init();

function init() {
  document.getElementById('scene-fallback').hidden = true;
  document.getElementById('scene-hint').hidden = false;
  for (const el of [pause, chaos, document.getElementById('scene-reset')]) el.hidden = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38,1,.1,100);
  camera.position.z = 7;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
  renderer.setClearColor(0x000000,0);
  const group = new THREE.Group(); scene.add(group);
  const uniforms = {
    uTime:{value:0},uMode:{value:Number(stage.dataset.mode || 0)},uScatter:{value:0},uLight:{value:0},
    uResolution:{value:new THREE.Vector2(1,1)}
  };
  const vertex = `
    uniform float uTime, uMode, uScatter;
    varying vec3 vWorld; varying vec3 vObject; varying vec3 vSmooth; varying vec2 vUv;
    const float PI = 3.14159265359;
    vec3 shape(vec3 p, vec2 tex) {
      vec3 unit = normalize(p);
      float ripple = sin(unit.x*4.0+uTime*.35)*sin(unit.y*4.0-uTime*.25)*sin(unit.z*4.0+uTime*.3);
      vec3 organic = unit*(1.4+0.25*ripple);
      float a=tex.x*PI*2.0, b=tex.y*PI*2.0;
      vec3 torus = vec3((1.05+.38*cos(b))*cos(a), (1.05+.38*cos(b))*sin(a),.38*sin(b));
      torus.z += .18*sin(a*3.0+uTime*.2);
      vec3 cube = unit / pow(pow(abs(unit.x),6.0)+pow(abs(unit.y),6.0)+pow(abs(unit.z),6.0),1.0/6.0)*1.05;
      cube.xy = mat2(cos(cube.z*.4),-sin(cube.z*.4),sin(cube.z*.4),cos(cube.z*.4))*cube.xy;
      vec3 form = mix(organic,torus,clamp(uMode,0.0,1.0));
      form = mix(form,cube,clamp(uMode-1.0,0.0,1.0));
      float seed = fract(sin(dot(tex,vec2(12.9898,78.233)))*43758.5453);
      form += unit*uScatter*(.65+seed*1.7);
      return form;
    }
    vec3 sphereAt(vec2 tex) {
      float theta=(1.0-tex.y)*PI, phi=tex.x*PI*2.0;
      return vec3(-cos(phi)*sin(theta),cos(theta),sin(phi)*sin(theta));
    }
    void main(){
      vec3 p=shape(position,uv); vObject=p;vUv=uv;
      vec2 du=uv+vec2(.001,0.),dv=uv+vec2(0.,.001);
      vec3 tangentU=shape(sphereAt(du),du)-p, tangentV=shape(sphereAt(dv),dv)-p;
      vSmooth=normalize(mat3(modelMatrix)*cross(tangentU,tangentV));
      vec4 world=modelMatrix*vec4(p,1.0); vWorld=world.xyz;
      vec4 mv=viewMatrix*world;
      gl_Position=projectionMatrix*mv;
      gl_PointSize=(2.0+uScatter*2.0)*(7.0/-mv.z);
    }`;
  const fragment = `
    uniform float uTime,uLight; varying vec3 vWorld; varying vec3 vObject; varying vec3 vSmooth; varying vec2 vUv;
    void main(){
      vec3 N=normalize(vSmooth);
      vec3 V=normalize(cameraPosition-vWorld);
      if(dot(N,V)<0.0)N=-N;
      vec3 L=normalize(vec3(-2.0,4.0,4.0));
      vec3 L2=normalize(vec3(3.0,-1.0,2.0));
      float diffuse=max(dot(N,L),0.0);
      float spec=pow(max(dot(reflect(-L,N),V),0.0),65.0);
      float rim=pow(1.0-max(dot(N,V),0.0),2.2);
      float band=.5+.5*sin(vObject.y*8.0+vObject.x*3.0+vObject.z*4.0+uTime*.15);
      vec3 blue=vec3(.12,.26,.9), peach=vec3(1.0,.47,.28), silver=vec3(.84,.89,1.0);
      vec3 base=mix(blue,peach,smoothstep(.2,.85,band));
      base=mix(base,silver,pow(band,9.0)*.7);
      vec3 col=base*(.17+diffuse*.85)+silver*spec*1.6;
      col+=vec3(.36,.48,1.0)*rim*.9;
      col+=peach*pow(max(dot(N,L2),0.0),4.0)*.45;
      col=mix(col,col*.88+.08,uLight);
      gl_FragColor=vec4(col,1.0);
    }`;
  const geometry = new THREE.SphereGeometry(1,128,96);
  const material = new THREE.ShaderMaterial({uniforms, vertexShader:vertex, fragmentShader:fragment, side:THREE.DoubleSide});
  const sculpture = new THREE.Mesh(geometry, material);group.add(sculpture);
  const pointMaterial = new THREE.ShaderMaterial({uniforms,vertexShader:vertex,transparent:true,depthWrite:false,
    fragmentShader:`uniform float uLight;varying vec3 vObject;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 c=mix(vec3(.7,.78,1.),vec3(1.,.51,.3),.5+.5*sin(vObject.y*3.));c=mix(c,c*.45,uLight);gl_FragColor=vec4(c,smoothstep(.5,.1,d)*.85);}`});
  const particles = new THREE.Points(geometry,pointMaterial);particles.visible=false;group.add(particles);
  // A quiet orbital field gives depth and orientation around the sculpture.
  const starPositions = new Float32Array(220*3);
  for(let i=0;i<220;i++){const a=i*2.399963,r=2.1+(i%17)/17*1.7;starPositions[i*3]=Math.cos(a)*r;starPositions[i*3+1]=Math.sin(a)*r;starPositions[i*3+2]=Math.sin(i*1.7)*1.7-1;}
  const starsGeo=new THREE.BufferGeometry();starsGeo.setAttribute('position',new THREE.BufferAttribute(starPositions,3));
  const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0x848cb8,size:.012,transparent:true,opacity:.45}));group.add(stars);
  const orbit=new THREE.Mesh(new THREE.TorusGeometry(2.1,.004,4,180),new THREE.MeshBasicMaterial({color:0x8893ae,transparent:true,opacity:.2}));orbit.rotation.x=1.1;orbit.rotation.y=.4;group.add(orbit);
  let playing=!reduced.matches,visible=true,frame=0,last=0,time=0,targetMode=uniforms.uMode.value,scattered=false;
  let rotX=.16,rotY=-.3,pointerX=0,pointerY=0,drag=null,scroll=0;
  function label(){pause.textContent=playing?'Pause motion':'Play motion';pause.setAttribute('aria-pressed',String(!playing));document.body.classList.toggle('motionPaused',!playing);}
  function drawRequest(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();uniforms.uResolution.value.set(w,h);group.position.x=w>760?1.0:0;group.position.y=w>760?.03:0;const size=w>760?1.05:.85;group.scale.setScalar(size);drawRequest();}
  function theme(){uniforms.uLight.value=document.documentElement.dataset.theme==='light'?1:0;drawRequest();}
  function scatter(value){scattered=value;chaos.setAttribute('aria-pressed',String(value));chaos.textContent=value?'↙ Reassemble the sculpture':'↗ Release the particles';stage.dataset.scattered=String(value);if(value){particles.visible=true;sculpture.visible=false;}if(!playing){uniforms.uScatter.value=value?1:0;particles.visible=value;sculpture.visible=!value;}drawRequest();}
  pause.addEventListener('click',()=>{playing=!playing;last=0;label();drawRequest();});
  chaos.addEventListener('click',()=>scatter(!scattered));
  reduced.addEventListener('change',()=>{playing=!reduced.matches;label();drawRequest();});
  window.addEventListener('portfolio:mode',e=>{targetMode=e.detail;if(!playing)uniforms.uMode.value=targetMode;drawRequest();});
  document.getElementById('scene-reset').addEventListener('click',()=>{rotX=.16;rotY=-.3;pointerX=pointerY=0;time=0;scatter(false);drawRequest();});
  canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.classList.add('dragging');});
  canvas.addEventListener('pointermove',e=>{if(drag){rotY+=(e.clientX-drag.x)*.008;rotX+=(e.clientY-drag.y)*.008;drag={x:e.clientX,y:e.clientY};}else if(!reduced.matches){const r=canvas.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;}drawRequest();});
  function end(){drag=null;canvas.classList.remove('dragging');}
  canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('pointerleave',()=>{pointerX=pointerY=0;drawRequest();});
  window.addEventListener('scroll',()=>{scroll=reduced.matches?0:Math.min(1,window.scrollY/stage.clientHeight);drawRequest();},{passive:true});
  new ResizeObserver(resize).observe(stage);
  new MutationObserver(theme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){last=0;drawRequest();}},{rootMargin:'100px'}).observe(stage);
  document.addEventListener('visibilitychange',()=>{last=0;drawRequest();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();playing=false;label();canvas.hidden=true;document.getElementById('scene-fallback').hidden=false;});
  function draw(now){frame=0;if(!visible||document.hidden)return;const dt=last?Math.min((now-last)/1000,.04):0;last=now;
    if(playing&&!drag)time+=dt;
    uniforms.uTime.value=time;
    uniforms.uMode.value+=(targetMode-uniforms.uMode.value)*(1-Math.exp(-dt*4));
    uniforms.uScatter.value+=((scattered?1:0)-uniforms.uScatter.value)*(1-Math.exp(-dt*3));
    if(!scattered && uniforms.uScatter.value<.02){particles.visible=false;sculpture.visible=true;}
    group.rotation.set(rotX+pointerY*.18+scroll*.4,rotY+time*.1+pointerX*.3,Math.sin(time*.18)*.06);
    renderer.render(scene,camera);if(playing)drawRequest();
  }
  label();theme();resize();stage.dataset.renderer='webgl';
}
