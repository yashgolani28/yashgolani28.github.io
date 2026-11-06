/* Original upstream SVGs; palette-only monochrome derivatives retain their original path geometry. */
(() => {
  const icons={'ESP32':'espressif','YOLO':'ultralytics','YOLOv8':'ultralytics','ONNX Runtime':'onnx','ONNX':'onnx','MediaPipe':'mediapipe','Ollama':'ollama','PEFT':'huggingface','Qdrant':'qdrant','Python':'python','C++':'cplusplus','Embedded C++':'cplusplus','C':'c','JavaScript':'javascript','TypeScript':'typescript','React':'react','FastAPI':'fastapi','Flask':'flask','PostgreSQL':'postgresql','Kafka':'apachekafka','Redis':'redis','Docker':'docker','Git':'git','PyTorch':'pytorch','OpenCV':'opencv','TensorFlow':'tensorflow','scikit-learn':'scikitlearn','NumPy':'numpy','Pandas':'pandas','ROS 2':'ros','ROS2':'ros','Arduino':'arduino','Firebase':'firebase','Streamlit':'streamlit','Tauri':'tauri','Matplotlib':'matplotlib','Keras':'keras'};
  window.portfolioTechBadge=(name,tag='li')=>{
    const el=document.createElement(tag);el.className='techBadge';
    if(icons[name]){
      const holder=document.createElement('span');holder.className='techIcon';
      const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),use=document.createElementNS(ns,'use');
      svg.setAttribute('viewBox',document.getElementById('tech-'+icons[name]).getAttribute('viewBox'));
      svg.setAttribute('width','24');svg.setAttribute('height','24');svg.setAttribute('aria-hidden','true');
      use.setAttribute('href','#tech-'+icons[name]);svg.append(use);holder.append(svg);el.append(holder);
    }
    const label=document.createElement('span');label.textContent=name;el.append(label);return el;
  };
})();
