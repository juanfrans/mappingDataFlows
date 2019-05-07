//*** To do***//
// * Experiment with isometric camera
// * Import via npm
// * Add light?

//*** Set global variables ***//
var scene = new THREE.Scene();
// var camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 0.1, 1000 );
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); // (field of view (dgrees), aspect ratio, near, far)
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//*** Camera position***//
camera.position.set(0, 15, 0);
camera.lookAt(0, 0, 0);

// //*** Create cubes ***//
// var geometry = new THREE.BoxGeometry(1, 1, 1, 3, 3, 3);
// var edges = new THREE.EdgesGeometry(geometry);
// var material = new THREE.MeshBasicMaterial( { color: '#df9609' } );
// var cubeGroup = new THREE.Group();
// for (var i = 0; i < 4; i++) {
//   var cube = new THREE.Mesh(geometry, material);
//   var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#ffffff' }));
//   line.renderOrder = 1;
//   cube.add(line);
//   cube.position.set(-2 + i * 2, 0, 4);
//   cubeGroup.add(cube);
// }
// scene.add(cubeGroup);

//*** Create spheres ***//
var geometry = new THREE.SphereGeometry(0.5, 8, 6);
// var edges = new THREE.EdgesGeometry(geometry);
var material = new THREE.MeshBasicMaterial( { color: '#df9609' } );
material.wireframe = true;
var sphereGroup = new THREE.Group();
for (var i = 0; i < 4; i++) {
  var sphere = new THREE.Mesh(geometry, material);
  // var line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#ffffff' }));
  // line.renderOrder = 1;
  // sphere.add(line);
  sphere.position.set(-2 + i * 2, 0, 4);
  sphereGroup.add(sphere);
}
scene.add(sphereGroup);

//*** Create lines ***//
var material = new THREE.LineBasicMaterial( { color: '#ffffff' } );
for (var i = 0; i < 4; i++) {
  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(-2 + i * 2, 0, 4));
  geometry.vertices.push(new THREE.Vector3(-2 + i * 2, 0, 2));
  geometry.vertices.push(new THREE.Vector3(-2 + i * 2, 5, 0));
  geometry.vertices.push(new THREE.Vector3(-2 + i * 2, 5, -2));
  var line = new THREE.Line( geometry, material );
  scene.add(line);
}
// var geometry = new THREE.Geometry();
// geometry.vertices.push(new THREE.Vector3( -10, 0, 0) );
// geometry.vertices.push(new THREE.Vector3( 0, 10, 0) );
// geometry.vertices.push(new THREE.Vector3( 10, 0, 0) );
// var line = new THREE.Line( geometry, material );
// scene.add(line);

function animate() {
	requestAnimationFrame( animate );
  for (var i = 0; i < sphereGroup.children.length; i++) {
    // sphereGroup.children[i].rotation.x += 0.01;
    sphereGroup.children[i].rotation.z += 0.01;
  }
  // cubeGroup.rotation.x += 0.01;
  // cubeGroup.rotation.y += 0.01;
	renderer.render( scene, camera );
}
animate();
