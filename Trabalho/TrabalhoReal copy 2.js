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

let scene, renderer, light, camera, keyboard, material;
var stats = new Stats();  
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // View function in util/utils
light = initDefaultSpotlight(scene, new THREE.Vector3(0.0, 500.0, 0.0), 200000); // Use default light  

let camPos = new THREE.Vector3(0, 10, 0);
let camUp = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0, 1.8, -1);
let camSight = new THREE.Vector3(0.0, 0.0, 0.0);
camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(camPos);
camera.up.copy(camUp);
camera.lookAt(camLook);

scene.add(camera);

let tempoUltimoTiro = 0;

let cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 32);
const cylinderMaterial = setDefaultMaterial("rgb(226, 17, 17)");
let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

cylinder.position.set(0, 0, 0);
cylinder.rotation.x = -Math.PI / 3;

console.log(cylinder);
//criacao do projetil
const vetProjetil = [];
const projetilGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const projetilMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

const voo = true;
var prim = true;

window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
keyboard = new KeyboardState();
material = setDefaultMaterial("rgb(0,0,0)");
let material2 = setDefaultMaterial("rgb(39, 164, 168)");
const controle = new PointerLockControls(camera, renderer.domElement);
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0, 2);
let planegeometry = new THREE.BoxGeometry(500, 0.1, 500);
let border_planeGeometry_YZ = new THREE.BoxGeometry(1, 6, 500);
let border_planeGeometry_XY = new THREE.BoxGeometry(500, 6, 1);

let groundPlane = new THREE.Mesh(planegeometry, material);
var fronteira = [];
for (var i = 0; i < 2; i++) {
   let novoPlano = new THREE.Mesh(border_planeGeometry_YZ, material2);
   scene.add(novoPlano);
   novoPlano.translateX(250.5 * (1 - 2 * i));
   novoPlano.translateY(3);
   fronteira.push(novoPlano);
   novoPlano = new THREE.Mesh(border_planeGeometry_XY, material2);
   scene.add(novoPlano);
   novoPlano.translateZ(250.5 * (1 - 2 * i));
   novoPlano.translateY(3);
   fronteira.push(novoPlano);

}

//var groundPlane = createGroundPlaneXZ(10, 10, 10, 10); // width, height, resolutionW, resolutionH
scene.add(groundPlane);



var materialCubo = setDefaultMaterial("rgb(43, 175, 114)"); // create a basic material 
var materialCubo1 = setDefaultMaterial("rgb(255,255, 255)"); // create a basic material
var materialCubo2 = setDefaultMaterial("rgb(185, 51, 27)"); // create a basic material
var materialCubo3 = setDefaultMaterial("rgb(12, 26, 92)"); // create a basic material
var materialCubo4 = setDefaultMaterial("rgb(221, 158, 22)"); // create a basic material

var larg = 0.5;
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

let inicializadasBoxes = false;

var queda = false;
var ini = 0;
var fim = 3;
var grandeArea = -1;
var area = -1;
var area1 = {
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1),
   cube1: new THREE.Mesh(cubeGeo1, materialCubo1),
   cube2: new THREE.Mesh(cubeGeo2, materialCubo1),
   cube3: new THREE.Mesh(cubeGeo3, materialCubo1),
   degraus: criar_degraus(new THREE.Vector3(-65.5, 0, -150), 2.2, 5, 2, 8, 90, materialCubo2),
   posicao_ini: new THREE.Vector3(-100, 1.1, -150),
   cubos: [],
   boundingCubos: [],
   boundingRampa: null,
   ex: 35,
   ez: 51
}
area1.cubos = [area1.cube1, area1.cube2, area1.cube3];
var area2 = {
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1),
   cube1: new THREE.Mesh(cubeGeo1, materialCubo2),
   cube2: new THREE.Mesh(cubeGeo2, materialCubo2),
   cube3: new THREE.Mesh(cubeGeo3, materialCubo2),
   degraus: criar_degraus(new THREE.Vector3(-65.5, 0, 0), 2.2, 5, 2, 8, 90, materialCubo3),
   posicao_ini: new THREE.Vector3(-100, 1.1, 0),
   cubos: [],
   boundingCubos: [],
   boundingRampa: null,
   ex: 35,
   ez: 51
}
area2.cubos = [area2.cube1, area2.cube2, area2.cube3];
var area3 = {
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1),
   cube1: new THREE.Mesh(cubeGeo1, materialCubo3),
   cube2: new THREE.Mesh(cubeGeo2, materialCubo3),
   cube3: new THREE.Mesh(cubeGeo3, materialCubo3),
   degraus: criar_degraus(new THREE.Vector3(-65.5, 0, 150), 2.2, 5, 2, 8, 90, materialCubo4),
   posicao_ini: new THREE.Vector3(-100, 1.1, 150),
   cubos: [],
   boundingCubos: [],
   boundingRampa: null,
   ex: 35,
   ez: 51
}
area3.cubos = [area3.cube1, area3.cube2, area3.cube3];
var area4 = {
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1),
   cube1: new THREE.Mesh(cubeGeo4, materialCubo4),
   cube2: new THREE.Mesh(cubeGeo5, materialCubo4),
   cube3: new THREE.Mesh(cubeGeo6, materialCubo4),
   degraus: criar_degraus(new THREE.Vector3(80.5, 0, 0), 2.2, 5, 2, 8, 270, materialCubo1),
   posicao_ini: new THREE.Vector3(150, 1.1, 0),
   cubos: [],
   boundingCubos: [],
   boundingRampa: null,
   ex: 70,
   ez: 101
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



// Set initial position of the sphere
sphere.translateY(0.9);


camSight.subVectors(camLook, camPos);

var persTeste = null;
var message = new SecondaryBox("");



let colisaoEspecialEscada = false;


var eixo_x = new THREE.Vector3(1, 0, 0);
var eixo_y = new THREE.Vector3(0, 1, 0);
var eixo_z = new THREE.Vector3(0, 0, 1);
var isIntersectingStaircase = false;
const speedPadrao=20;
let speed = speedPadrao;



var obj = controle.getObject();


var boxPersonagem = new THREE.Box3();

const boxCube = new THREE.Box3();
const helperSphere = new THREE.Box3Helper(boxPersonagem, 0xff0000);
scene.add(helperSphere);

const helperCube = new THREE.Box3Helper(boxCube, 0x00ff00);
scene.add(helperCube);


camera.add(cylinder);
//cylinder.position.set(0, -1, -5); // Por exemplo, um pouco à frente e abaixo.
cylinder.translateX(0);
cylinder.translateY(1.0);
cylinder.translateZ(-1.3);

// criacao do cilindro

//const helperRampa = new THREE.Box3Helper(boxRampa1, 0xff0000);
//scene.add(helperRampa);

// Posição inicial é da seguinte forma:(coord_x, altura_daBASE_y, coord_z)
function criar_degraus(posicao_ini, altura_total, comp_total, largura, num, rot, materialDeg) {
   var degraus = [];
   let altura_individual = altura_total / num;
   let comp_individual = comp_total / num;
   let geometria_degrau = new THREE.BoxGeometry(largura, altura_individual, comp_individual);
   var degrau_base = new THREE.Mesh(geometria_degrau, materialDeg);
   scene.add(degrau_base);
   degraus.push(degrau_base);
   degrau_base.translateX(posicao_ini.x);
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
      visible: false
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

// Listen window size changes
//window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

//tiro



window.addEventListener('keydown', (event) => MovimentoVerificador(event.keyCode, true));
window.addEventListener('keyup', (event) => MovimentoVerificador(event.keyCode, false));
function MovimentoVerificador(key, value) {
   switch (key) {
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
         moveRight = value;
         break;
      case 81:
         moveUp = value;
         break;
   }
}
function Movimento(delta) {
   raycaster.ray.origin.copy(controle.getObject().position);
   //const isIntersectingGround = raycaster.intersectObjects([groundPlane,area1.cube0,area1.cube1,area1.cube2,area1.cube3]).length > 0.1;

  
   console.log(cylinder);
   console.log(cylinder.position);
   const frontal = new THREE.Vector3();
   obj.getWorldDirection(frontal);

   frontal.y = 0;
   frontal.normalize();

   const direito = new THREE.Vector3();
   direito.crossVectors(frontal, eixo_y).normalize();


   const moveDir = new THREE.Vector3();
   if (moveForward) moveDir.add(frontal);
   if (moveBackward) moveDir.sub(frontal);
   if (moveRight) moveDir.add(direito);
   if (moveLeft) moveDir.sub(direito);

   //if (keyboard.pressed("Q")) moveDir.y += 1;
   //if (keyboard.pressed("E")) moveDir.y -= 1;


   if (moveDir.lengthSq() !== 0) {
      console.log("grande área " + grandeArea);
      if (grandeArea >=1) {

         moveDir.normalize().multiplyScalar(speed * delta);
         let quebrar = false;
         if (area != -1) {
            queda = false;
            //console.log(area);
            let xi = (areas[area].posicao_ini).x;
            let zi = (areas[area].posicao_ini).z;
            let ex = (areas[area]).ex;
            let ez = (areas[area]).ez;
            let mult2 = ex;
            let fat = -4.5;
            let largA = larg;
            if (area == 3) {
               mult2 = -mult2 + 4.5;
               largA = -largA;
            }


            //console.log(xi+ex+larg);
            if (obj.position.x > (xi + ex) || obj.position.x < (xi - ex) || obj.position.z > (zi + ez) || obj.position.z < (zi - ez)) {
               ini = 0;
               fim = 3;
               area = -1;
               queda = true;
               console.log("aaz")
            }
            else {
               if (obj.position.x > (xi + mult2 + fat + largA) && obj.position.x < (xi + mult2 - largA) && obj.position.z < (zi + 1 - larg) && obj.position.z > (zi - 1 + larg)) {
                  queda = true;
                  console.log("Esc esc")
               }
               else {
                  queda = false;
               }
            }

            //console.log(area);
         }
        
            for (var j = 0; j < 3; j++) {
               boxCube.setFromObject(areas[grandeArea-1].cubos[j])

               let intsc = "";
               ["x", "z"].forEach(eixo => {
                  obj.position[eixo] += moveDir[eixo];

                  boxPersonagem = new THREE.Box3().setFromCenterAndSize(
                     new THREE.Vector3(obj.position.x, obj.position.y - 0.9, obj.position.z),
                     new THREE.Vector3(larg, 1.8, larg)  // largura, altura, profundidade desejadas
                  );
                  console.log(boxPersonagem);
                  if (boxPersonagem.intersectsBox(areas[grandeArea-1].boundingCubos[j])) {
                     console.log('int')
                     //camera.position[eixo] -= moveDir[eixo];
                     //moveDir[eixo] = 0;
                     //quebrar = true;
                     intsc = eixo;
                     console.log(intsc);
                     //console.log(boxCube)
                     quebrar = true;
                     console.log(boxPersonagem);


                  }
                  obj.position[eixo] -= moveDir[eixo];
               });

               if (intsc !== "") {
                  moveDir.normalize();

                  let fator = 1;
                  console.log(intsc);
                  if (intsc === "x") {
                     fator = moveDir.dot(eixo_z);
                  }
                  else {
                     fator = moveDir.dot(eixo_x);
                  }
                  console.log(fator);
                  speed = Math.abs(fator) * speed;
                  moveDir[intsc] = 0;
                  console.log(moveDir);
               }
            }

            //console.log(boxSphere.intersectsBox(boxRampa));
            // areas[i].boundingRampa = new THREE.Box3().setFromObject(areas[i].degraus[1].rampa);
            // isIntersectingStaircase = boxSphere.intersectsBox(areas[i].boundingRampa);
            isIntersectingStaircase = raycaster.intersectObject(areas[grandeArea-1].degraus[1].rampa).length > 0.01;


            //const helper = new THREE.Box3Helper(areas[i].boundingRampa, 0xff0000); // Cor vermelha
            //scene.add(helper);

            if (isIntersectingStaircase) {

               // Está colidindo com a rampa
               queda = false;
               quebrar = true;
               let comp_total = areas[grandeArea-1].degraus[1].comprimento;
               let altura_total = areas[grandeArea-1].degraus[1].altura;
               console.log('rampa');


               let dir_rampa = new THREE.Vector3(0, altura_total, -comp_total).normalize();
               let rotMatrix = new THREE.Matrix4().makeRotationY(areas[grandeArea-1].degraus[1].angulo_rotacao);
               dir_rampa.applyMatrix4(rotMatrix);

               // Está na rampa
               moveDir.normalize();
               moveDir.y += (altura_total / comp_total);
               let vetorProj = new THREE.Vector3();
               vetorProj.copy(moveDir);
               console.log(vetorProj);
               vetorProj.projectOnVector(dir_rampa);
               let moveProjecao = vetorProj.length();
               console.log(moveProjecao);
               if (Math.abs(moveProjecao) > 0.0001) {
                  // Move na direção da rampa : incluir subida/descida
                  moveDir.y = vetorProj.y;
               }
               if (area == -1) {
                  area = grandeArea-1;
                  ini = grandeArea-1;
                  fim = grandeArea-1;
               }

            }
            else {
               console.log('n-rampa');
            }
         
      }
      else if(grandeArea==0){
         for (var j = 0; j < 4; j++) {

               let intsc = "";
               ["x", "z"].forEach(eixo => {
                  obj.position[eixo] += moveDir[eixo];

                  boxPersonagem = new THREE.Box3().setFromCenterAndSize(
                     new THREE.Vector3(obj.position.x, obj.position.y - 0.9, obj.position.z),
                     new THREE.Vector3(larg, 1.8, larg)  // largura, altura, profundidade desejadas
                  );
                  console.log(boxPersonagem);
                  if (boxPersonagem.intersectsBox(fronteira[j+4])) {
                     console.log('int')
                     //camera.position[eixo] -= moveDir[eixo];
                     //moveDir[eixo] = 0;
                    // quebrar = true;
                     intsc = eixo;
                     console.log(intsc);
                     //console.log(boxCube)
                       
                     console.log(boxPersonagem);


                  }
                  obj.position[eixo] -= moveDir[eixo];
               });

               if (intsc !== "") {
                  moveDir.normalize();

                  let fator = 1;
                  console.log(intsc);
                  if (intsc === "x") {
                     fator = moveDir.dot(eixo_z);
                  }
                  else {
                     fator = moveDir.dot(eixo_x);
                  }
                  console.log(fator);
                  speed = Math.abs(fator) * speed;
                  moveDir[intsc] = 0;
                  console.log(moveDir);
               }
            }
      }

      moveDir.normalize().multiplyScalar(speed * delta);


      speed = speedPadrao;
      console.log("AA");
      console.log(moveDir);
      //console.log(moveDir);
      obj.position.add(moveDir);

      if (grandeArea == -1) {
         if (Math.abs(obj.position.x) >= 245 || Math.abs(obj.position.z) >= 245)
            grandeArea = 0;
         else {
            let posicao_ini, ex, ez;
            for (var i = 0; i < 4; i++) {
               posicao_ini = areas[i].posicao_ini;
               ex = areas[i].ex;
               ez = areas[i].ez;
               if (obj.position.x >= posicao_ini.x - ex - 4 && obj.position.x <= posicao_ini.x + ex + 4 && obj.position.z >= posicao_ini.z - ez - 4 && obj.position.z <= posicao_ini.z + ez + 4) {
                  grandeArea = i + 1;
                  break;
               }

            }
         }
      }
      else {
         if (grandeArea == 0) {
            if (Math.abs(obj.position.x) < 245 && Math.abs(obj.position.z) < 245)
               grandeArea = -1;
         }
         else {
            let posicao_ini = areas[grandeArea - 1].posicao_ini, ex = areas[grandeArea - 1].ex, ez = areas[grandeArea - 1].ez;
            if (obj.position.x < posicao_ini.x - ex - 4 || obj.position.x > posicao_ini.x + ex + 4 || obj.position.z < posicao_ini.z - ez - 4 || obj.position.z > posicao_ini.z + ez + 4) {
               grandeArea = -1;
            }

         }

      }
      //if(cmaera.position.y>3.101){
      // sphere.position.y=3.101;
      colisaoEspecialEscada = false;
   }


   let isIntersectingGround = false;
   isIntersectingStaircase = false;
   if (grandeArea >= 1) {
      if (area != -1) {
         isIntersectingStaircase = raycaster.intersectObjects([areas[area].degraus[1].rampa, areas[grandeArea - 1].degraus[0].degraus[7]]).length > 0.001;
         isIntersectingGround = raycaster.intersectObjects([...areas[grandeArea - 1].cubos]).length > 0.001
      }
      else {
         if (voo) {
            //console.log(areas[0].degraus[1].rampa)
            isIntersectingStaircase = raycaster.intersectObjects([areas[grandeArea - 1].degraus[1].rampa, areas[grandeArea - 1].degraus[0].degraus[7]]).length > 0.001;
            isIntersectingGround = raycaster.intersectObjects([groundPlane, ...areas[grandeArea - 1].cubos]).length > 0.001;
         }
         else {
            isIntersectingGround = raycaster.intersectObject(groundPlane).length > 0.1;
         }
      }

   }
   else {
      isIntersectingGround = raycaster.intersectObject(groundPlane).length > 0.1;

   }
   if (!isIntersectingGround && !isIntersectingStaircase) {
      console.log("queda");
      obj.position.y -= 5 * delta;
   }

   if (reset == true) {
      controle.getObject().position.set(3, 4, 8);
      controle.getObject().rotation.set(0, 0, 0);
   }
   if (moveUp == true) {
      obj.position.y += 20 * delta;
   }
   //}
   prim = false;
}





window.addEventListener('mousedown', (event) => {
  if (event.button === 0|| event.button === 2) {
    const tentativaDisparo = performance.now();

    if (tentativaDisparo - tempoUltimoTiro >= 500) {
        tempoUltimoTiro = tentativaDisparo;
        const projetil = new THREE.Mesh(projetilGeometry, projetilMaterial);

        // posicao do projetil
        const spawnProjetil = new THREE.Vector3();
        spawnProjetil.copy(camera.position);

        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        spawnProjetil.add(direction.clone().multiplyScalar(7));
        projetil.position.copy(spawnProjetil);

        vetProjetil.push({ mesh: projetil, direction });

        scene.add(projetil);
    }
  }
});
/// fim Enzo 





  
function estabeleceBoundingBoxes() {
   for (var i = 0; i < 4; i++) {

      for (var j = 0; j < 3; j++) {


         areas[i].boundingCubos.push(new THREE.Box3().setFromObject(areas[i].cubos[j]));
      }
      areas[i].boundingRampa = new THREE.Box3().setFromObject(areas[i].degraus[1].rampa);


      const helper = new THREE.Box3Helper(areas[i].boundingRampa, 0xff0000); // Cor vermelha
      scene.add(helper);
      fronteira.push(new THREE.Box3().setFromObject(fronteira[i]));
   }
}




const clock = new THREE.Clock();
render();
function render() {

   
   // fps.update(0.016);

   if (controle.isLocked) {
      Movimento(clock.getDelta());
   }
   stats.update();
       const velocidadeProjetil = 0.5;
       vetProjetil.forEach(proj =>{
       const deslocamento = new THREE.Vector3(proj.direction.x * velocidadeProjetil, proj.direction.y * velocidadeProjetil, proj.direction.z * velocidadeProjetil);
   
       proj.mesh.position.x += deslocamento.x;
       proj.mesh.position.y += deslocamento.y;
       proj.mesh.position.z += deslocamento.z;
       });

       
   renderer.render(scene, camera) // Render scene
   requestAnimationFrame(render);
   if (!inicializadasBoxes) {
      estabeleceBoundingBoxes();
      inicializadasBoxes = true;
   }
}








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
   */

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