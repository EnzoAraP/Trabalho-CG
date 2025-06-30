import * as THREE from 'three';
import KeyboardState from '../libs/util/KeyboardState.js'
import { TeapotGeometry } from '../build/jsm/geometries/TeapotGeometry.js';
import {
   initRenderer,
   initDefaultSpotlight,
   createGroundPlaneXZ,
   SecondaryBox,
   onWindowResize,
   setDefaultMaterial
} from "../libs/util/util.js";
 import { PointerLockControls } from '../build/jsm/controls/PointerLockControls.js';

let scene, renderer, light, camera, keyboard,material;

scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
light = initDefaultSpotlight(scene, new THREE.Vector3(0.0, 200.0, 0.0), 200000); // Use default light  

let camPos = new THREE.Vector3(0, 10, 0);
let camUp = new THREE.Vector3(0.0, 1.0, 0.0);
let camUpRef = new THREE.Vector3(0, 0.5, -1);
let camLook = new THREE.Vector3(0, 1.8, -1);
let camRight = new THREE.Vector3(0.0, 0.0, 0.0);
let camSight = new THREE.Vector3(0.0, 0.0, 0.0);
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(camPos);
camera.up.copy(camUp);
camera.lookAt(camLook);




window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
keyboard = new KeyboardState();
material = setDefaultMaterial("rgb(0,0,0)");
const controle = new PointerLockControls (camera,renderer.domElement );
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0, 2);
let planegeometry = new THREE.BoxGeometry(500,0.1,500);
let groundPlane = new THREE.Mesh(planegeometry, material);
//var groundPlane = createGroundPlaneXZ(10, 10, 10, 10); // width, height, resolutionW, resolutionH
scene.add(groundPlane);

// Create objects
//createTeapot( 2.0,  0.4,  0.0, Math.random() * 0xffffff);
//createTeapot(0.0,  0.4,  2.0, Math.random() * 0xffffff);  
//createTeapot(0.0,  0.4, -2.0, Math.random() * 0xffffff);   

var materialCubo = setDefaultMaterial("rgb(43, 175, 114)"); // create a basic material 
var materialCubo1 = setDefaultMaterial("rgb(255,255, 255)"); // create a basic material
var materialCubo2 = setDefaultMaterial("rgb(185, 51, 27)"); // create a basic material
var materialCubo3 = setDefaultMaterial("rgb(12, 26, 92)"); // create a basic material
var materialCubo4 = setDefaultMaterial("rgb(221, 158, 22)"); // create a basic material

var larg=0.25;
var materialDeg = setDefaultMaterial("rgb(30, 131, 126)"); // create a basic material
var squareGeometry = new THREE.BoxGeometry(larg, 1.8, larg);
var squareMaterial = new THREE.MeshPhongMaterial(
   { color: 'rgb(143, 123, 37)', shininess: "40", specular: 'rgb(255,255,255)' });
var sphere = new THREE.Mesh(squareGeometry, squareMaterial);



var cubeGeo0 = new THREE.BoxGeometry(0.25, 0.1, 0.25);
var cubeGeo = new THREE.BoxGeometry(70, 2.2, 50);
var cubeGeo1 = new THREE.BoxGeometry(70, 2.2, 50);
var cubeGeo2 = new THREE.BoxGeometry(65, 2.2, 2);
var cubeGeo3 = new THREE.BoxGeometry(70, 2.2, 50);
var cubeGeo4 = new THREE.BoxGeometry(140, 2.2, 100);
var cubeGeo5 = new THREE.BoxGeometry(135, 2.2, 2);
var cubeGeo6 = new THREE.BoxGeometry(140, 2.2, 100);


scene.add(sphere);

var cube1 = new THREE.Mesh(cubeGeo, materialCubo);
let inicializadasBoxes=false;
cube1.translateX(300);
let degraus_rampa = criar_degraus(new THREE.Vector3(3, 0, 6), 2.2, 5, 2, 8, 270);
let degraus_rampa2 = criar_degraus(new THREE.Vector3(-3, 0, -6), 2.2, 5, 2, 8, 270);
var queda = false;
var ini=0;
var fim=3;
var area=-1;
var area1 = {
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1),
   cube1: new THREE.Mesh(cubeGeo1, materialCubo1),
   cube2: new THREE.Mesh(cubeGeo2, materialCubo1),
   cube3: new THREE.Mesh(cubeGeo3, materialCubo1),
   degraus: criar_degraus(new THREE.Vector3(-65.5, 0, -150), 2.2, 5, 2, 8, 90),
   posicao_ini: new THREE.Vector3(-100, 1.1, -150),
   cubos: [],
   boundingCubos: [],
   boundingRampa: null,
   ex:35,
   ez:51
}
area1.cubos = [area1.cube1, area1.cube2, area1.cube3];
var area2 = {
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1),
   cube1: new THREE.Mesh(cubeGeo1, materialCubo2),
   cube2: new THREE.Mesh(cubeGeo2, materialCubo2),
   cube3: new THREE.Mesh(cubeGeo3, materialCubo2),
   degraus: criar_degraus(new THREE.Vector3(-65.5, 0, 0), 2.2, 5, 2, 8, 90),
   posicao_ini: new THREE.Vector3(-100, 1.1, 0),
   cubos: [],
   boundingCubos: [],
   boundingRampa: null,
   ex:35,
   ez:51
}
area2.cubos = [area2.cube1, area2.cube2, area2.cube3];
var area3 = {
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1),
   cube1: new THREE.Mesh(cubeGeo1, materialCubo3),
   cube2: new THREE.Mesh(cubeGeo2, materialCubo3),
   cube3: new THREE.Mesh(cubeGeo3, materialCubo3),
   degraus: criar_degraus(new THREE.Vector3(-65.5, 0, 150), 2.2, 5, 2, 8, 90),
   posicao_ini: new THREE.Vector3(-100, 1.1, 150),
   cubos: [],
   boundingCubos: [],
   boundingRampa: null,
   ex:35,
   ez:51
}
area3.cubos = [area3.cube1, area3.cube2, area3.cube3];
var area4 = {
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1),
   cube1: new THREE.Mesh(cubeGeo4, materialCubo4),
   cube2: new THREE.Mesh(cubeGeo5, materialCubo4),
   cube3: new THREE.Mesh(cubeGeo6, materialCubo4),
   degraus: criar_degraus(new THREE.Vector3(80.5, 0, 0), 2.2, 5, 2, 8, 270),
   posicao_ini: new THREE.Vector3(150, 1.1, 0),
   cubos: [],
   boundingCubos: [],
   boundingRampa: null,
   ex:70,
   ez:101
}
area4.cubos = [area4.cube1, area4.cube2, area4.cube3];

//console.log(area1.cubos[1]);
var areas = [area1, area2, area3, area4];

for (var i = 0; i < 4; i++) {
   scene.add(areas[i].cube0);
   areas[i].cube0.translateX(areas[i].posicao_ini.x);
   areas[i].cube0.translateY(areas[i].posicao_ini.y);
   areas[i].cube0.translateZ(areas[i].posicao_ini.z);
   for (var j = 0; j < 3; j++) {

      (areas[i].cube0).add(areas[i].cubos[j]);
      if (j == 1) {
         let desc = -3;
         if (i == 3)
            desc = -desc;

         areas[i].cubos[j].translateX(desc);
         continue;
      }
      if (i < 3) {
         areas[i].cubos[j].translateZ((26 * j) - 26);
         //areas[i].cubos[j].translateX(2.5);
      }
      else {
         areas[i].cubos[j].translateZ(51 * j - 51);
         //areas[i].cubos[j].translateX(-2.5);
      }
       

      
   }
  
}


scene.add(cube1);
cube1.translateX(12);
cube1.translateY(2);
cube1.translateZ(17);
// Set initial position of the sphere
sphere.translateY(0.9);


camSight.subVectors(camLook, camPos);

var persTeste=null;
var message = new SecondaryBox("");






var eixo_x=new THREE.Vector3(1,0,0);
var eixo_y=new THREE.Vector3(0,1,0);
var eixo_z=new THREE.Vector3(0,0,1);

let speed = 20;
let rotSpeed = (2 * Math.PI) / 360;





const boxSphere = new THREE.Box3();

const boxCube = new THREE.Box3();
const boxRampa = new THREE.Box3().setFromObject(area1.degraus[1].rampa);
const boxRampa1 = new THREE.Box3().setFromObject(area2.degraus[1].rampa);
const helperSphere = new THREE.Box3Helper(boxSphere, 0xff0000);
scene.add(helperSphere);

const helperCube = new THREE.Box3Helper(boxCube, 0x00ff00);
scene.add(helperCube);
//const helperRampa = new THREE.Box3Helper(boxRampa1, 0xff0000);
//scene.add(helperRampa);

// Posição inicial é da seguinte forma:(coord_x, altura_daBASE_y, coord_z)
function criar_degraus(posicao_ini, altura_total, comp_total, largura, num, rot) {
   var degraus = [];
   let altura_individual = altura_total / num;
   let comp_individual = comp_total / num;
   let geometria_degrau = new THREE.BoxGeometry(largura, altura_individual, comp_individual);
   var degrau_base = new THREE.Mesh(geometria_degrau, materialDeg);
   scene.add(degrau_base);
   degraus.push(degrau_base);
   degrau_base.translateX(posicao_ini.x );
   degrau_base.translateY(posicao_ini.y + (altura_individual / 2));
   degrau_base.translateZ(posicao_ini.z);
   rot = rot * Math.PI / 180
   degrau_base.rotateY(rot);
   degrau_base.translateZ(- (comp_individual / 2));
   for (var i = 1; i < num; i++) {
      let degrau = new THREE.Mesh(geometria_degrau, materialDeg);
      degraus.push(degrau);
      degrau_base.add(degrau);
      degrau.translateZ(-comp_individual * i);
      degrau.translateY(altura_individual * i);

   }

   // Geometria da caixa

   let diagonal_degrau = Math.sqrt(
      altura_individual ** 2 + comp_individual ** 2
   );

   let altura_rampa = num * diagonal_degrau;
   let espessura_rampa = diagonal_degrau;
   let largura_rampa = largura;

   const geo_rampa = new THREE.BoxGeometry(
      largura_rampa,
      altura_rampa,
      espessura_rampa
   );

   let material_invisivel = new THREE.MeshBasicMaterial({
      color: "red",
      visible: true
   });

   let rampa_invisivel = new THREE.Mesh(geo_rampa, material_invisivel);

   let inclinacao = Math.atan2(comp_total, altura_total);

   // Rotaciona no X

   rampa_invisivel.rotation.x = -inclinacao;
   // Posiciona
   rampa_invisivel.position.set(
      0,                    // X
      altura_total / 2 - altura_individual / 2,     // Y
      -comp_total / 2 + comp_individual / 2 - (diagonal_degrau / (2 * Math.cos(inclinacao)) - comp_individual)
   );

   degrau_base.add(rampa_invisivel);
   rampa_invisivel.translateY(-diagonal_degrau * Math.tan(inclinacao) / (2)
   );


   // Adiciona na cena




   return [{
      "degraus": degraus,
      "comprimento_degrau": comp_individual
   }, {
      "rampa": rampa_invisivel,
      "angulo_inclinacao": inclinacao,
      "altura": altura_total,
      "comprimento": comp_total,
      "angulo_rotacao": rot
   }];

}
/*
function updateCamera() {
   //camera.position.copy(camPos);
   //camera.up.copy( camUp );
   //camera.lookAt(camLook);


   message.changeMessage("Pos: {" + (sphere.position.x) + ", " + (sphere.position.y)+ ", " + sphere.z + "} " +
      "/ LookAt: {" + camLook.x + ", " + camLook.y + ", " + camLook.z + "}" +
      "/ Up: {" + camUp.x + ", " + camUp.y + ", " + camUp.z + "}" +
      "/ Sight: {" + camUp.x + ", " + camUp.y + ", " + camUp.z + "}");
}
      */
///// A partir daqui Enzo 

const textoEsq  = document.getElementById('instructions');
const blocker = document.getElementById('blocker');

instructions.addEventListener('click', function () {

    controle.lock();

}, false);
controle.addEventListener('lock', function () {
    textoEsq.style.display = 'none';
    blocker.style.display = 'none';
});

controle.addEventListener('unlock', function () {
    blocker.style.display = 'block';
    textoEsq.style.display = '';
});

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let reset = false;
let moveUp = false;

window.addEventListener('keydown', (event) => MovimentoVerificador(event.keyCode ,true));
window.addEventListener('keyup',(event) => MovimentoVerificador(event.keyCode,false));
function MovimentoVerificador(key,value){
switch(key)
{
  case 87:
    moveForward = value;
  break;
  case 83:
    moveBackward = value;
    break;
  case 82:
    reset = value;
    break;
  case 65:
    moveLeft = value;
    break;
  case 68:
    moveRight= value;
    break;
  case 81:
    moveUp = value;
    break;
}
}
function Movimento (delta)
{
    raycaster.ray.origin.copy(controle.getObject().position);
    //const isIntersectingGround = raycaster.intersectObjects([groundPlane,area1.cube0,area1.cube1,area1.cube2,area1.cube3]).length > 0.1;
    
   const isIntersectingGround = raycaster.intersectObjects([groundPlane, ...area1.cubos, ...area2.cubos, ...area3.cubos, ...area4.cubos]).length > 0.1;
    if(!isIntersectingGround){
   camera.position.y -=10 * delta;
    }
   if(moveForward==true)
    {
      controle.moveForward(speed*delta);
  }
  if(moveBackward==true)
  {
       controle.moveForward(speed*-1*delta);
  }
  if(moveLeft==true)
  {
      controle.moveRight(speed*-1*delta);
  }
  if(moveRight==true)
  {
       controle.moveRight(speed*delta);
  }
  if(reset==true)
  {
    controle.getObject().position.set(3,4,8);
    controle.getObject().rotation.set(0,0,0);
  }
  if(moveUp==true)
  {
   camera.position.y +=20 *delta;
  }

}
/// fim Enzo 

/*function keyboardUpdate() {
   keyboard.update();
   speed=0.1;




   const frontal = new THREE.Vector3();
   camera.getWorldDirection(frontal);

   frontal.y = 0;
   frontal.normalize();

   const direito = new THREE.Vector3();
   direito.crossVectors(frontal, camera.up).normalize();


   const moveDir = new THREE.Vector3();
   if (keyboard.pressed("W")) moveDir.add(frontal);
   if (keyboard.pressed("S")) moveDir.sub(frontal);
   if (keyboard.pressed("D")) moveDir.add(direito);
   if (keyboard.pressed("A")) moveDir.sub(direito);
   if (keyboard.pressed("Q")) moveDir.y += 1;
   if (keyboard.pressed("E")) moveDir.y -= 1;


   if (moveDir.lengthSq() !== 0) {
      
   

      moveDir.normalize().multiplyScalar(speed);
      let quebrar = false;
      if(area!=-1){
         queda=false;
         //console.log(area);
         let xi=(areas[area].posicao_ini).x;
         let zi=(areas[area].posicao_ini).z;
         let ex=(areas[area]).ex;
         let ez=(areas[area]).ez;
         let mult2=ex;
         let fat=-4.5;
         let largA=larg;
         if(area==3){
            mult2=-mult2+5;
            largA=-largA;
         }   
         
         
         //console.log(xi+ex+larg);
         if(sphere.position.x>(xi+ex+largA) || sphere.position.x<(xi-ex-largA) || sphere.position.z>(zi+ez+larg) || sphere.position.z<(zi-ez-larg)){
            ini=0;
            fim=3;
            area=-1;
            queda=true;
         }
         else{
            if(sphere.position.x>(xi+mult2+fat+largA) && sphere.position.x<(xi+mult2-largA) && sphere.position.z<(zi+1-larg) && sphere.position.z>(zi-1+larg)){
               queda=true;
               //console.log("Esc esc")
            }
            else{
               queda=false;
            }
         }

         //console.log(area);
      }
      for (var i = ini; i <=fim && !quebrar; i++) {
         for (var j = 0; j < 3 && !quebrar; j++) {
            boxCube.setFromObject(areas[i].cubos[j])

            let intsc="";
            ["x", "z"].forEach(eixo => {
               sphere.position[eixo] += moveDir[eixo];

               boxSphere.setFromObject(sphere);
               if (boxSphere.intersectsBox(areas[i].boundingCubos[j])) {
                  sphere.position[eixo] -= moveDir[eixo];
                  moveDir[eixo] = 0;
                  quebrar = true;
                  intsc=eixo;
                  console.log(intsc);
                  //console.log(boxCube)
                  quebrar=true;


               }
               sphere.position[eixo] -= moveDir[eixo];
            });
            
           if(intsc!==""){
               let fator=1;
               console.log(intsc);
               if(intsc==="x"){
                  fator=moveDir.dot(eixo_z);
               }
               else{
                   fator=moveDir.dot(eixo_x);
               }
               console.log(fator);
               speed=Math.abs(fator);
               moveDir[intsc]=0;
               console.log(moveDir);
           }
         }
         
         //console.log(boxSphere.intersectsBox(boxRampa));
         if (boxSphere.intersectsBox(areas[i].boundingRampa)) {
            // Está colidindo com a rampa
            queda=false;
            quebrar=true;
            let comp_total = areas[i].degraus[1].comprimento;
            let altura_total = areas[i].degraus[1].altura;



            let dir_rampa = new THREE.Vector3(0, altura_total, -comp_total).normalize();
            let rotMatrix = new THREE.Matrix4().makeRotationY(areas[i].degraus[1].angulo_rotacao);
            dir_rampa.applyMatrix4(rotMatrix);
            // Está na rampa
            moveDir.normalize();
            let moveProjecao = moveDir.dot(dir_rampa);
         
            if (Math.abs(moveProjecao) > 0.0001) {
               // Move na direção da rampa → incluir subida/descida
               moveDir.y = moveProjecao ;
            } else {
               // Move lateralmente → não altera Y
               moveDir.y = 0;
            }
            if(area==-1){
               area=i;
               ini=i;
               fim=i;
            }

         }
      }


      moveDir.normalize().multiplyScalar(speed);

      //console.log(moveDir);
      console.log(moveDir);
      sphere.position.add(moveDir);
      if(sphere.position.y>3.101){
         sphere.position.y=3.101;

      }
   }
   if(queda){
      sphere.position.y-=0.025;
   }
  
   if(sphere.position.y<0.9){
      sphere.position.y=0.9;
      queda=false;
   }
   updateCamera();
  
}





function estabeleceBoundingBoxes(){
   for (var i = 0; i < 4; i++) {

   for (var j = 0; j < 3; j++) {


      areas[i].boundingCubos.push(new THREE.Box3().setFromObject(areas[i].cubos[j]));
   }
   areas[i].boundingRampa=new THREE.Box3().setFromObject(areas[i].degraus[1].rampa);
}
}




function render() {
   requestAnimationFrame(render);
   
   keyboardUpdate();
   renderer.render(scene, camera) // Render scene
    if(!inicializadasBoxes){
      estabeleceBoundingBoxes();
      inicializadasBoxes=true;
   }

}
}
   */
 const clock = new THREE.Clock();
 render();
 function render()
 {
   
   requestAnimationFrame(render);
  // fps.update(0.016);
   
  if( controle.isLocked) {
   Movimento(clock.getDelta());
  }
  
  
  
   renderer.render(scene, camera) // Render scene
   
 }
  





/*
function criar_degraus( posicao_ini ,altura_total,comp_total,largura,num,rot){
   var degraus=[];
   let altura_individual=altura_total/num;
   let comp_individual=comp_total/num;
   let geometria_degrau=new THREE.BoxGeometry(largura,altura_individual,comp_individual);
   var degrau_base=new THREE.Mesh( geometria_degrau, materialDeg );
   scene.add(degrau_base);
   degraus.push(degrau_base);
   degrau_base.translateX(posicao_ini.x);
   degrau_base.translateY(posicao_ini.y+(altura_individual/2));
   degrau_base.translateZ(posicao_ini.z);
   degrau_base.rotateY(rot*Math.PI/180);
   for(var i=1;i<num;i++){
      let degrau=new THREE.Mesh( geometria_degrau, materialDeg );
      degraus.push(degrau);
      degrau_base.add(degrau);
      degrau.translateZ(-comp_individual*i);
      degrau.translateY(altura_individual*i);

   }

      // Geometria da caixa
   let altura_rampa = (altura_total**2+comp_total**2)**0.5;
   let comp_rampa=((altura_individual**2+comp_individual**2)**0.5);
   let largura_rampa=largura;
   const geo_rampa= new THREE.BoxGeometry(largura_rampa, altura_rampa, comp_rampa);

   // Material invisível
   var material_invisivel = new THREE.MeshBasicMaterial({
   color: "red",    // Cor opcional, não será visível.
   visible: true   // Deixa o material completamente invisível.
   });
   
   // Mesh (objeto 3D)
   var rampa_invisivel= new THREE.Mesh(geo_rampa, material_invisivel);
   let inclinacao=Math.atan(comp_total/altura_total);
   // Rotaciona a caixa para simular uma rampa inclinada
   degrau_base.add(rampa_invisivel);
   //rampa_invisivel.translateZ(comp_individual/2);
   rampa_invisivel.rotation.x = -inclinacao; 
   rampa_invisivel.translateY(-altura_rampa/num);
   rampa_invisivel.translateY(altura_rampa/2);
   
   
  
   // Adiciona na cena
   
   
   

   return [degraus,rampa_invisivel];

}"
*/