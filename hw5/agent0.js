function agentMesh (size, colorName='red') {
	// mesh facing +x
	let geometry = new THREE.Geometry();
	  geometry.vertices.push (new THREE.Vector3(3*size,0,0))
	  geometry.vertices.push (new THREE.Vector3(0,0,-size))
	  geometry.vertices.push (new THREE.Vector3(0,0,size))
	  geometry.vertices.push (new THREE.Vector3(0,size,0))
  
	  geometry.faces.push(new THREE.Face3(0, 3, 2));
	  geometry.faces.push(new THREE.Face3(0, 2, 1));
	  geometry.faces.push(new THREE.Face3(1, 3, 0));
	  geometry.faces.push(new THREE.Face3(1, 2, 3));
	  geometry.computeFaceNormals()
	
	return new THREE.Mesh (geometry, 
	     new THREE.MeshBasicMaterial({color:colorName, wireframe:true}))  
}

class Agent {
  constructor(pos, halfSize) {
  	this.name = "jmchen";
    this.pos = pos.clone();
    this.vel = new THREE.Vector3();
    this.force = new THREE.Vector3();
    this.target = null;
    this.halfSize = 10;  // half width
    this.mesh = agentMesh (this.halfSize, 'cyan');
    this.MAXSPEED = 350;
    this.ARRIVAL_R = 30;
    
    this.score = 0;
    
    // for orientable agent
    this.angle = 0;
    scene.add (this.mesh);
  }
  
  update(dt) {
  
  	// about target ...
  	if (this.target === null || this.target.found === true) {  // no more target OR target found by other agent
  	  console.log ('find target')
  		this.findTarget();
  		return;  // wait for next turn ...
  	}
  	
    this.accumulateForce();
    
    // collision
    // for all obstacles in the arWorldRoot
    let obs = scene.obstacles;
	let vhat = this.vel.clone().normalize();
	let p = this.pos.clone();
	let halfSize1 = this.halfSize
	let force1 = this.force;
	obs.forEach(function(item,index,arr){
	
	let point = item.mesh.position.clone().sub(p);
	let proj  = point.dot(vhat);
	const REACH = 150
	const K = 10
	//console.log(proj);
	if (proj > 0 && proj < REACH) {
		let perp = new THREE.Vector3();
		perp.subVectors (point, vhat.clone().setLength(proj));
		let overlap = item.size + halfSize1 - perp.length()
		//console.log ("proj:",item.mesh.proj);
    if (overlap > 0) {
			perp.setLength (K*overlap);
			perp.negate()
      force1.add (perp);
			console.log ("hit:", perp);
		}
	}
	});
    // pick the most threatening one
    // apply the repulsive force
    // (write your code here)

	// Euler's method       
    this.vel.add(force1.clone().multiplyScalar(dt));


    // velocity modulation
    let diff = this.target.pos.clone().sub(this.pos)
    let dst = diff.length();
    if (dst < this.ARRIVAL_R) {
      this.vel.setLength(dst)
      const REACH_TARGET = 5;
      if (dst < REACH_TARGET) {// target reached
      	console.log ('target reached');
         this.target.setFound (this);
         this.target = null;
      }
    }
    
    // Euler
    this.pos.add(this.vel.clone().multiplyScalar(dt))
    this.mesh.position.copy(this.pos)
    
    // for orientable agent
    // non PD version
    if (this.vel.length() > 0.1) {
	    	this.angle = Math.atan2 (-this.vel.z, this.vel.x)
    		this.mesh.rotation.y = this.angle
   	}
  }

  findTarget () {
  	console.log ('total: ' + scene.targets.length)
  	let allTargets = scene.targets;
  	let minD = 1e10;
  	let d;
  	for (let i = 0; i < allTargets.length; i++) {
  		d = this.pos.distanceTo (allTargets[i].pos)
  		if (d < minD) {
  			minD = d;
  			this.setTarget (allTargets[i])
  		}
  	}
  }
  
  setTarget(target) {
    this.target = target;
  }
  targetInducedForce(targetPos) {
    return targetPos.clone().sub(this.pos).normalize().multiplyScalar(this.MAXSPEED).sub(this.vel)
  }

  accumulateForce() {
    // seek
    this.force.copy(this.targetInducedForce(this.target.pos));
  }

}
