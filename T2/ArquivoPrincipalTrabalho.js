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


import { areas,testeGrandesAreas } from 'criacaoAreas.js';
import { LancaMisseis, lancaMisseis } from './ControleArmas.js';

let scene, renderer, light, camera, keyboard, material;
var stats = new Stats();
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // View function in util/utils
light = initDefaultSpotlight(scene, new THREE.Vector3(0.0, 500.0, 0.0), 500000); // Use default light 

let camPos = new THREE.Vector3(0, 10, 0);
let camUp = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0, 1.8, -1);

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(camPos);
camera.up.copy(camUp);
camera.lookAt(camLook);

scene.add(camera);

const voo = false; // Variável que indica se o voo está habilitado ou não.




window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
keyboard = new KeyboardState();
material = setDefaultMaterial("rgb(218, 204, 204)");
let material2 = setDefaultMaterial("rgb(39, 164, 168)");
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

//var groundPlane = createGroundPlaneXZ(10, 10, 10, 10); // width, height, resolutionW, resolutionH
scene.add(groundPlane);


const lancaMisseis= new LancaMisseis(camera);

// Set initial position of the sphere
//sphere.translateY(0.9);


var larg = 0.75; // Tamenho em x e z do personagem(Largura e espessura)

var grandeArea = -1; // Variável que armazena em qual das 6 grande as áreas o personagem está.
/* As grandes áreas são: Transição(-1): Área base onde há apenas colisão com o chão para se testar. Todo lugar onde não há objetos por perto.
     Fronteira(0) : Região próxima às muralhas do mapa( tem formato de moldura quadrada)
      Grande Áreas de 1 a 4: Representam as áreas especiais do jogo(Plataformas em formato de paralelepípedo) e seus derredores( margem de 4 unidades de comprimento)

*/
var area = -1; // Variável que indica em qual área em formato de paralelepípedo presente no jogo.

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
function Movimento(delta) {
   raycaster.ray.origin.copy(controle.getObject().position);
   
   const frontal = new THREE.Vector3(); // Vetor direção da câmera
   obj.getWorldDirection(frontal);

   frontal.y = 0;// Tira parte em y para movimento x-z
   frontal.normalize();

   const direito = new THREE.Vector3(); // Vetor perpendicular à direita
   direito.crossVectors(frontal, eixo_y).normalize();


   const moveDir = new THREE.Vector3(); // Vetor para armazenar movimento
   if (moveForward) moveDir.add(frontal);
   if (moveBackward) moveDir.sub(frontal);
   if (moveRight) moveDir.add(direito);
   if (moveLeft) moveDir.sub(direito);

   

   if (moveDir.lengthSq() !== 0) { // Se houver movimento
      if (grandeArea >= 1) { // Se estivermos numa grande área que contém blocos

         moveDir.normalize().multiplyScalar(speed * delta); // Normaliza e multiplica pela velocidade, considerando o delta(Diferença entre quadros)
        
         if (area != -1) { // Se estivermos sobre uma área de blocos
         
            // Extensões das áreas definidas( Metade do lado em cada eixo)
            let xi = (areas[area].posicao_ini).x;
            let zi = (areas[area].posicao_ini).z;
            let ex = (areas[area]).ex;
            let ez = (areas[area]).ez;


            // Verifica se saiu da área com blocos, indo para o plano base.
            if (obj.position.x > (xi + ex +larg) || obj.position.x < (xi - ex-larg) || obj.position.z > (zi + ez+larg) || obj.position.z < (zi - ez-larg)) {
             
               area = -1;
            }
         }

         for (var j = 0; j < 3; j++) { // Teste do movimento para os cubos

            let intsc = "";
            ["x", "z"].forEach(eixo => {
               obj.position[eixo] += moveDir[eixo]; // TEsta

               boxPersonagem = new THREE.Box3().setFromCenterAndSize(
                  new THREE.Vector3(obj.position.x, obj.position.y - 0.9, obj.position.z),
                  new THREE.Vector3(larg, 1.8, larg) // largura, altura, profundidade desejadas
               ); 
               
               if (boxPersonagem.intersectsBox(areas[grandeArea - 1].boundingCubos[j])) {
                  
                  intsc = eixo; // Eixo intersectado


               }
               obj.position[eixo] -= moveDir[eixo];  // Tira movimento-teste
            });

            if (intsc !== "") {
               moveDir.normalize(); // Normaliza para fazer verificações corretamente

               let fator = 1; // Fator a se multiplicar( Norma da projeção, que é o produto escalar padrão para projeção em vetores de norma 1, como os dos eixos)
               //console.log(intsc);
               if (intsc === "x") {
                  fator = moveDir.dot(eixo_z); // Projeta em z
               }
               else {
                  fator = moveDir.dot(eixo_x); // Projeta em x
               }
               //console.log(fator);
               speed = Math.abs(fator) * speed;
               moveDir[intsc] = 0; // Zera o outro eixo
               //console.log(moveDir);
            }
         }

         
         isIntersectingStaircase = raycaster.intersectObject(areas[grandeArea - 1].degraus[1].rampa).length > 0.01; // Teste da rampa


         if (isIntersectingStaircase) {

            // Está colidindo com a rampa
            quebrar = true;
            let comp_total = areas[grandeArea - 1].degraus[1].comprimento;
            let altura_total = areas[grandeArea - 1].degraus[1].altura;
  


            let dir_rampa = new THREE.Vector3(0, altura_total, -comp_total).normalize(); // Vetor diração da rampa
            let rotMatrix = new THREE.Matrix4().makeRotationY(areas[grandeArea - 1].degraus[1].angulo_rotacao);
            dir_rampa.applyMatrix4(rotMatrix);

            // Está na rampa
            moveDir.normalize();
            moveDir.y += (altura_total / comp_total);
            let vetorProj = new THREE.Vector3();
            vetorProj.copy(moveDir);
            //console.log(vetorProj);
            vetorProj.projectOnVector(dir_rampa);
            let moveProjecao = vetorProj.length();
            //console.log(moveProjecao);
            if (Math.abs(moveProjecao) > 0.0001) {
               // Move na direção da rampa : incluir subida/descida
               moveDir.y = vetorProj.y;
            }
            if (area == -1) {
               area = grandeArea - 1; // Se entrou na rampa, entrou na área com blocos correspondente
            }

         }

      }
      else if (grandeArea == 0) {
         for (var j = 0; j < 4; j++) {

            let intsc = "";
            ["x", "z"].forEach(eixo => {
               obj.position[eixo] += moveDir[eixo];

               boxPersonagem = new THREE.Box3().setFromCenterAndSize(
                  new THREE.Vector3(obj.position.x, obj.position.y - 0.9, obj.position.z),
                  new THREE.Vector3(larg, 1.8, larg) // largura, altura, profundidade desejadas
               );
               //console.log(boxPersonagem);
               if (boxPersonagem.intersectsBox(fronteira[j + 4])) {
                  
                  intsc = eixo;
                 


               }
               obj.position[eixo] -= moveDir[eixo];
            });

            if (intsc !== "") {
               moveDir.normalize();

               let fator = 1;
               //console.log(intsc);
               if (intsc === "x") {
                  fator = moveDir.dot(eixo_z);
               }
               else {
                  fator = moveDir.dot(eixo_x);
               }
               //console.log(fator);
               speed = Math.abs(fator) * speed;
               moveDir[intsc] = 0;
               //console.log(moveDir);
            }
         }
      }

      moveDir.normalize().multiplyScalar(speed * delta); // Faz ter a norma da velocidade atual


      speed = speedPadrao;
      obj.position.add(moveDir); //Movimenta objeto da câmera
      

      // Verifica saída e entrada de grandes áreas
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
   }


   let isIntersectingGround = false;
   isIntersectingStaircase = false;
   raycaster.ray.origin.copy(obj.position);
   if (grandeArea >= 1) {
      if (area != -1) {
         isIntersectingStaircase = raycaster.intersectObjects([areas[area].degraus[1].rampa, areas[grandeArea - 1].degraus[0].degraus[7]]).length > 0.00001;
         isIntersectingGround = raycaster.intersectObjects([...areas[grandeArea - 1].cubos]).length > 0.00001 || obj.position.y<2;
      }
      else {
         if (voo) {
            //console.log(areas[0].degraus[1].rampa)
            isIntersectingStaircase = raycaster.intersectObjects([areas[grandeArea - 1].degraus[1].rampa, areas[grandeArea - 1].degraus[0].degraus[7]]).length > 0.00001;
            isIntersectingGround = raycaster.intersectObjects([groundPlane, ...areas[grandeArea - 1].cubos]).length > 0.00001;
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
      //console.log("queda");
      obj.position.y -= 5 * delta;
      raycaster.ray.origin.copy(obj.position);
      if (grandeArea >= 1) {
         //console.log(area);
      if (area != -1) {
                        boxPersonagem = new THREE.Box3().setFromCenterAndSize(
                  new THREE.Vector3(obj.position.x, obj.position.y - 0.9, obj.position.z),
                  new THREE.Vector3(larg, 1.8, larg) // largura, altura, profundidade desejadas
               );
         isIntersectingStaircase = raycaster.intersectObjects([areas[area].degraus[1].rampa, areas[grandeArea - 1].degraus[0].degraus[7]]).length > 0.00001;
         isIntersectingGround = false;
         for(var i=0;i<3;i++){
                if(areas[grandeArea-1].boundingCubos[i].intersectsBox(boxPersonagem)){
                    isIntersectingGround=true;
                    break;
                } 
               }        
         if(isIntersectingGround || isIntersectingStaircase)
            obj.position.y += 5 * delta;  
      }
      
      

   }
   }

   if (reset == true) {
      controle.getObject().position.set(3, 4, 8);
      controle.getObject().rotation.set(0, 0, 0);
   }
   if (voo && moveUp == true) {
      obj.position.y += 20 * delta; // Se voo estiver ativado
   }
   //}
   prim = false; // Não é mais de utilidade
}



let verdade = false;

/// fim Enzo 






function estabeleceBoundingBoxes() {
   for (var i = 0; i < 4; i++) {

      for (var j = 0; j < 3; j++) {


         areas[i].boundingCubos.push(new THREE.Box3().setFromObject(areas[i].cubos[j]));
         let degraus = areas[i].degraus[0].degraus;
         for (var k = 0; k < 8; k++) {
            areas[i].boundingDegraus.push(new THREE.Box3().setFromObject(degraus[k]));
         }
      }
      areas[i].boundingRampa = new THREE.Box3().setFromObject(areas[i].degraus[1].rampa);


      //const helper = new THREE.Box3Helper(areas[i].boundingRampa, 0xff0000); // Cor vermelha
      //scene.add(helper);
      fronteira.push(new THREE.Box3().setFromObject(fronteira[i]));

   }
}


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
      Movimento(delta);
      lancaMisseis.atirar();
      stats.update();
      
      
   }
      //console.log(verdade);


   renderer.render(scene, camera) // Render scene
   requestAnimationFrame(render);
   if (!inicializadasBoxes) {
      estabeleceBoundingBoxes();
      inicializadasBoxes = true;
   }
}





