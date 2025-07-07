import * as THREE from 'three';
import KeyboardState from '../libs/util/KeyboardState.js'
import { TeapotGeometry } from '../build/jsm/geometries/TeapotGeometry.js';
import Stats from '../build/jsm/libs/stats.module.js';
import {
   initRenderer,
   initDefaultSpotlight,
   createGroundPlaneXZ,
   SecondaryBox,
   onWindowResize,
   setDefaultMaterial
} from "../libs/util/util.js";
import { PointerLockControls } from '../build/jsm/controls/PointerLockControls.js';


import { areas, testeGrandesAreas,scene } from './criacaoAreas.js';
import { LancaMisseis } from './ControleArmas.js';
import { Personagem } from './movimentoPersonagem.js';
import { Cacodemon } from './Inimigo02.js';
import { AmbientLight } from '../build/three.module.js';

let  light, camera, keyboard, material;
var stats = new Stats();
let color = "rgb(0, 0, 0)", shadowMapType = THREE.PCFSoftShadowMap
  var renderer = new THREE.WebGLRenderer();
   //renderer.useLegacyLights = true;
   renderer.shadowMap.enabled = true;
  
   renderer.shadowMap.type = shadowMapType;

   renderer.setClearColor(new THREE.Color(color));
   renderer.setSize(window.innerWidth, window.innerHeight);
   renderer.shadowMap.enabled = true;
   document.getElementById("webgl-output").appendChild(renderer.domElement);

light =new AmbientLight(); // Use default light 

let camPos = new THREE.Vector3(0, 10, 0);
let camUp = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0, 1.8, -1);



const voo = false; // Variável que indica se o voo está habilitado ou não.

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(250, 275, 200); // Posição elevada e inclinada
dirLight.castShadow = true;



  dirLight.castShadow = true;
  dirLight.intensity = 3;
  // Shadow Parameters
  dirLight.shadow.mapSize.width = 4096;
  dirLight.shadow.mapSize.height = 4096;
  dirLight.shadow.camera.near = 200;
  dirLight.shadow.camera.far = 1400;
  dirLight.shadow.camera.left = -200;
  dirLight.shadow.camera.right = 200;
  dirLight.shadow.camera.bottom = -200;
  dirLight.shadow.camera.top = 200;
  dirLight.shadow.bias = -0.0001;  

  // No effect on Basic and PCFSoft
  dirLight.shadow.radius = 0.1;

scene.add(dirLight);
// (opcional) Ajuda para visualizar o volume de sombra
const helper = new THREE.CameraHelper(dirLight.shadow.camera);
scene.add(helper);


const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-250, 275, -200);
fillLight.castShadow = false;
fillLight.intensity = 0.5;

fillLight.shadow.camera.near = 200;
fillLight.shadow.camera.far = 1200;
fillLight.shadow.camera.left = -200;
fillLight.shadow.camera.right = 200;
fillLight.shadow.camera.bottom = -200;
fillLight.shadow.camera.top = 200;
fillLight.shadow.bias = -0.0005;  

// No effect on Basic and PCFSoft


scene.add(fillLight);


camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(camPos);
camera.up.copy(camUp);
camera.lookAt(camLook);

scene.add(camera);
console.log("AAAA");


window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
keyboard = new KeyboardState();
material = new THREE.MeshLambertMaterial({ color:"rgb(218, 204, 204)"}); // cria o material dos cubos da área 1
let material2 = new THREE.MeshLambertMaterial({ color:"rgb(39, 164, 168)"}); 
const controle = new PointerLockControls(camera, renderer.domElement);
controle.pointerSpeed=0.6;
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0, 2.1);
let planegeometry = new THREE.BoxGeometry(500, 0.1, 500); // Plano base 500x500
let border_planeGeometry_YZ = new THREE.BoxGeometry(1, 6, 500); // Geometra das muralhas em z 
let border_planeGeometry_XY = new THREE.BoxGeometry(500, 6, 1); // Geomteria das muralhas em x

let groundPlane = new THREE.Mesh(planegeometry, material);
var fronteira = []; // Vetor que armazenará os objeto dos planos das fronteiras(Muralhas do mapa) nas 4 primeras posições e suas boundingBoxes nas próximas 4.
for (var i = 0; i < 2; i++) { // Primeiro os dois planos em x e z positivos. 
   let novoPlano = new THREE.Mesh(border_planeGeometry_YZ, material2);
   novoPlano.castShadow=true;
   novoPlano.receiveShadow=true;
   scene.add(novoPlano);
   novoPlano.translateX(250.5 * (1 - 2 * i)); // Descolocamentos adequados
   novoPlano.translateY(3); // Para deixar a base alinhada ao solo
   fronteira.push(novoPlano);
   novoPlano = new THREE.Mesh(border_planeGeometry_XY, material2);
   scene.add(novoPlano);
   novoPlano.translateZ(250.5 * (1 - 2 * i));
   novoPlano.translateY(3);
   fronteira.push(novoPlano);

}
groundPlane.receiveShadow=true;
//var groundPlane = createGroundPlaneXZ(10, 10, 10, 10); // width, height, resolutionW, resolutionH
scene.add(groundPlane);




// Set initial position of the sphere
//sphere.translateY(0.9);


var larg = 0.5; // Tamenho em x e z do personagem(Largura e espessura)



let inicializadasBoxes = false; // Variável para verificar se todas as bounding boxes dos objetos estáticos que as possuem já foram inicializadas no render


// Eixos do sistema de coordenadas cartesiano:
var eixo_x = new THREE.Vector3(1, 0, 0);
var eixo_y = new THREE.Vector3(0, 1, 0);
var eixo_z = new THREE.Vector3(0, 0, 1);

var isIntersectingStaircase = false; // Variável para verificar a intersecção com a escada
const speedPadrao = 16; // Valor padrão de velocidade do player
let speed = speedPadrao; // Valor que armazena velocidade atual do player


var obj = controle.getObject(); // Objeto da câmera do Poniter lock Controls

var boxPersonagem = new THREE.Box3(); // Bounding box do personagem

var personagem = new Personagem(obj,camera,boxPersonagem,larg,speedPadrao);

let cacodemon_geometry = new THREE.BoxGeometry(0.6,1.2,0.6);

let cacodemon_material = new THREE.MeshLambertMaterial({ color:"rgb(55, 9, 180)"}); 

var cacodemons=[];

var arma_cacodemons_derrotados=[];
for(var i=0;i<3;i++){
   
   var obj_cacodemon= new THREE.Mesh(cacodemon_geometry,cacodemon_material);
   obj_cacodemon.castShadow=true;
   obj_cacodemon.receiveShadow=true;
   scene.add(obj_cacodemon);
   obj_cacodemon.position.set(i,0.3,-i);
   let arma_cac=new LancaMisseis(obj_cacodemon,[personagem],false);
   let novo_cac=new Cacodemon(obj_cacodemon,camera,new THREE.Box3(),0.6,3,arma_cac,personagem);
   cacodemons.push(novo_cac);

}

const lancaMisseis= new LancaMisseis(camera,cacodemons,true);

const textoEsq = document.getElementById('instructions');
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




window.addEventListener('keydown', (event) => MovimentoVerificador(event.keyCode, true));
window.addEventListener('keyup', (event) => MovimentoVerificador(event.keyCode, false));
function MovimentoVerificador(key, value) {
   switch (key) {
      case 87:
         moveForward = value;
         break;
      case 38:
         moveForward = value;
         break;   
      case 83:
         moveBackward = value;
         break;
      case 40:
         moveBackward = value;
         break;   
      case 82:
         reset = value;
         break;
      case 65:
         moveLeft = value;
         break;
      case 37:
         moveLeft=value;
         break;   
      case 68:
         moveRight = value;
         break;
      case 39:
         moveRight = value;
         break;   
      case 81:
         moveUp = value;
         break;
   }
}

//var materialCubo = setDefaultMaterial("rgb(43, 175, 114)"); // create a basic material 







function estabeleceBoundingBoxes() {
   for (var i = 0; i < 4; i++) {

      for (var j = 0; j < 3; j++) {


         areas[i].boundingCubos.push(new THREE.Box3().setFromObject(areas[i].cubos[j]));
         if(i!=1)
            {   let degraus = areas[i].degraus[0].degraus;
            

            for (var k = 0; k < 8; k++) {
               if(k==0){
                  const geometry = degraus[0].geometry;
                  geometry.computeBoundingBox();

                  const box = geometry.boundingBox.clone();

                  
                  box.applyMatrix4(degraus[0].matrixWorld);
                  areas[i].boundingDegraus.push(box);
               }
               else{
                  areas[i].boundingDegraus.push(new THREE.Box3().setFromObject(degraus[k]));
                  console.log(areas[i].boundingDegraus[k]);
                  const helper = new THREE.Box3Helper(areas[i].boundingDegraus[k], 0xffff00); // Amarelo
                  scene.add(helper);
            }
            }
            areas[i].boundingRampa = new THREE.Box3().setFromObject(areas[i].degraus[1].rampa);
         }
         
         }

      //const helper = new THREE.Box3Helper(areas[i].boundingRampa, 0xff0000); // Cor vermelha
      //scene.add(helper);
      fronteira.push(new THREE.Box3().setFromObject(fronteira[i]));
      
      
   }
   for(var i=0;i<areas[1].num_blocos_extras;i++){
      areas[1].boundingBlocosExtras.push(new THREE.Box3().setFromObject(areas[1].blocosExtras[i]));
   }


   areas[1].porta.box = new THREE.Box3().setFromObject( areas[1].porta.mesh);
   const helper2 = new THREE.Box3Helper(areas[1].porta.box, 0xffff00); // Amarelo
   areas[1].fechadura.box = new THREE.Box3().setFromObject(areas[1].fechadura.mesh);
   const helper3 = new THREE.Box3Helper(areas[1].fechadura.box, 0xffff00); // Amarelo
   areas[1].plataforma.box = new THREE.Box3().setFromObject(areas[1].plataforma.mesh);
   const helper4 = new THREE.Box3Helper(areas[1].plataforma.box, 0xffff00); // Amarelo
   scene.add(helper2);
   scene.add(helper3);
   scene.add(helper4);

}


let verdade = false;

const clock = new THREE.Clock();

window.addEventListener('mousedown', (event) => {
     if (event.button === 0|| event.button === 2)
       verdade =true;
//console.log(controle.pointerSpeed);
});
window.addEventListener('mouseup',(event)=> {
    verdade = false;
});
render();
function render() {


   // fps.update(0.016);

   if (controle.isLocked) {
      let delta = clock.getDelta();
      delta = Math.min(delta,0.05);
      personagem.movimento(areas,fronteira,groundPlane,delta,moveForward,moveBackward,moveRight,moveLeft,moveUp,reset);
      lancaMisseis.atirar(scene,camera,verdade);
      stats.update();
      let armasNovosDerrotados = lancaMisseis.controle_projeteis(scene,areas,fronteira);
      if(armasNovosDerrotados.length!=0)
         arma_cacodemons_derrotados=arma_cacodemons_derrotados.concat(armasNovosDerrotados);
      for(var i=0;i<cacodemons.length;i++){
       
            cacodemons[i].movimento(areas,fronteira,groundPlane,delta,false,false,scene);
            cacodemons[i].arma.controle_projeteis(scene,areas,fronteira);
     
      }
      for ( var i=0;i<arma_cacodemons_derrotados.length;i++){
         arma_cacodemons_derrotados[i].controle_projeteis(scene,areas,fronteira);
         if(arma_cacodemons_derrotados[i].vetProjetil.length==0)
            arma_cacodemons_derrotados.splice(i,1);
      }
         
   }
      //console.log(verdade);


   renderer.render(scene, camera) // Render scene
   requestAnimationFrame(render);
   if (!inicializadasBoxes) {
      estabeleceBoundingBoxes();
      inicializadasBoxes = true;
   }
}