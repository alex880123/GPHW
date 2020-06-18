/////////////////////////////////////////////////////////
// global variables
var camera, renderer;
var agent,agent1;

// program starts here ...
init();
animate();

function init() {

  initThree();
  
  //scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 5000);
  camera.position.z = 500;
  camera.position.y = 400;


  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x888888);

  let controls = new THREE.OrbitControls(camera, renderer.domElement);

  document.body.appendChild(renderer.domElement);

  /////////////////////////////////////////////////////////////////////

  
  // scene grid [-400,400]x[-400,400]
  var gridXZ = new THREE.GridHelper(800, 80, 'red', 'white');
  scene.add(gridXZ);

  // in scene.js
  sceneFromJSON ( );  // using LevelDesigner
  
  //////////////////////////////////////////////////////////////////////////	
  	let size = 10; // halfsize of agent
//    agent = new Agent(new THREE.Vector3(-400 + 400 * Math.random(), 0, -400 + 400 * Math.random()), mesh);
    agent = new Agent(new THREE.Vector3(50,0,-50), size);
	
	agent1 = new Agent(new THREE.Vector3(-40,0,70), size);

}


function animate() {

  agent.update(0.01)
  agent1.update(0.01)
  
  // check agent crossing obstacles ...
  scene.obstacles.forEach ( function (obs) { obs.checkCollision (agent)} );
  scene.obstacles.forEach ( function (obs) { obs.checkCollision (agent1)} );
  if (scene.targets.length > 0){
	  
  	requestAnimationFrame(animate);
  }
  
  else if(scene.targets.length == 0){
  	setRandomTargets(-208.14531121285557,209.52434509802094);
	requestAnimationFrame(animate);
  }
  render();
}

function render() {
  renderer.render(scene, camera);
}

