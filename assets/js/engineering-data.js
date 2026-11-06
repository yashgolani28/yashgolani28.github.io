/* Public contribution summaries; these flows explain concepts, not deployment topology. */
window.ENGINEERING = {
  layers: [
    {id:'ingestion',label:'Ingestion',verb:'Start with a reliable stream.',scope:'01 / Live & recorded video',summary:'I work on camera lifecycles, frame processing, and stream reconnection so the analytics pipeline has usable input.',stack:['Python','OpenCV'],methods:['Frame processing','Camera lifecycle management','Stream recovery'],link:['Explore my analytics work','#ws-analytics']},
    {id:'inference',label:'Inference',verb:'Turn pixels into observations.',scope:'02 / Computer vision',summary:'I connect detection and recognition models to multi-camera processing, with class filtering, confidence handling, and consistent event outputs.',stack:['Python','OpenCV','YOLO','ONNX Runtime'],methods:['Object detection','Class and confidence filtering','Inference integration'],link:['Explore core analytics','#ws-analytics']},
    {id:'services',label:'Services',verb:'Give models a system.',scope:'03 / Distributed processing',summary:'I build the orchestration around inference: task dispatch, shared GPU processing, camera assignments, and recovery when work is interrupted.',stack:['Python','FastAPI','Kafka','Redis','Docker'],methods:['Task orchestration','Worker isolation','Retry and recovery'],link:['Explore my systems work','#ws-distributed']},
    {id:'evidence',label:'Evidence',verb:'Make the result discoverable.',scope:'04 / Search & video understanding',summary:'I connect events, video descriptions, and embeddings to search workflows, so recorded footage can be explored through meaning as well as time.',stack:['PyTorch','Qdrant','PostgreSQL','pgvector'],methods:['VLM captioning','Embedding similarity','Retrieval-augmented generation'],link:['Explore video retrieval','#ws-vlm']},
    {id:'operators',label:'Operators',verb:'Close the loop for people.',scope:'05 / Full-stack applications',summary:'I connect services and data to investigation timelines, maps, alerts, and evidence playback across VA, VMS, and ICCC workflows.',stack:['TypeScript','React','FastAPI','PostgreSQL'],methods:['Service integration','Authenticated APIs','Evidence workflows'],link:['Explore my application work','#ws-platform']}
  ],
  flow:['Video input','Model inference','Service orchestration','Search & evidence','Operator workflows'],
  projects: {
    robot:{title:'From camera frames to detections',steps:[['ROS 2','Camera image topics'],['YOLOv8','Object detection'],['Filtering','Classes & confidence'],['OpenCV','Bounding-box overlays']]},
    agriculture:{title:'From sensor readings to irrigation',steps:[['ESP32','Sensor readings'],['Firebase','Stored observations'],['LSTM','Irrigation prediction'],['Relays','Irrigation control']]},
    quadruped:{title:'From foot coordinates to walking',steps:[['Gait sequence','Planned foot positions'],['Kinematics','Joint-angle calculation'],['Interpolation','Timed servo movement'],['Mechanics','Coordinated legs']]},
    video:{title:'From footage to semantic search',steps:[['Video frames','Local input'],['VLMs','Scene descriptions'],['Embeddings','Searchable representations'],['Retrieval','Relevant footage']]}
  }
};
