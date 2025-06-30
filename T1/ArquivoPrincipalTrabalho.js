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
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // View function in util/utils
light = initDefaultSpotlight(scene, new THREE.Vector3(0.0, 500.0, 0.0), 500000); // Use default light 

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


// Criação da arma:
let cylinderGeometry = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 32);
const cylinderMaterial = setDefaultMaterial("rgb(226, 17, 17)");
let cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

cylinder.position.set(0, 0, 0);
cylinder.rotation.x = -Math.PI / 2; //  Girando a arma para ficar na posição correta

//console.log(cylinder);
//criacao do projetil( vetor que os armazena a todos)
const vetProjetil = [];
const projetilGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const projetilMaterial = setDefaultMaterial("rgb(206, 226, 23)");

const voo = false; // Variável que indica se o voo está habilitado ou não.
var prim = true;

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



//var materialCubo = setDefaultMaterial("rgb(43, 175, 114)"); // create a basic material 
var materialCubo1 = setDefaultMaterial("rgb(47, 235, 9)"); // cria o material dos cubos da área 1
var materialCubo2 = setDefaultMaterial("rgb(185, 51, 27)"); // cria o material dos cubos da área 2
var materialCubo3 = setDefaultMaterial("rgb(12, 26, 92)"); // cria o material dos cubos da área 3
var materialCubo4 = setDefaultMaterial("rgb(221, 158, 22)"); // cria o material dos cubos da área 4

var larg = 0.75; // Tamenho em x e z do personagem(Largura e espessura)
//var materialDeg = setDefaultMaterial("rgb(30, 131, 126)"); // create a basic material
//var squareGeometry = new THREE.BoxGeometry(larg, 1.8, larg); 
//var squareMaterial = new THREE.MeshPhongMaterial(
//   { color: 'rgb(143, 123, 37)', shininess: "40", specular: 'rgb(255,255,255)' });
//var sphere = new THREE.Mesh(squareGeometry, squareMaterial);



var cubeGeo0 = new THREE.BoxGeometry(0.25, 0.1, 0.25);// Geometria do cubo central que é o pai de toda estrutura de uma área
var cubeGeo = new THREE.BoxGeometry(70, 2.2, 50);

//Geometrias de da cada cubo(1,2,3 são as geometrias dos cubos das áreas menores e 4,5,6 são a dos cubos da área maior(4) ) :
var cubeGeo1 = new THREE.BoxGeometry(70, 4, 50);
var cubeGeo2 = new THREE.BoxGeometry(64.5, 4, 2);
var cubeGeo3 = new THREE.BoxGeometry(70, 4, 50);
var cubeGeo4 = new THREE.BoxGeometry(140, 4, 100);
var cubeGeo5 = new THREE.BoxGeometry(134.5, 4, 2);
var cubeGeo6 = new THREE.BoxGeometry(140, 4, 100);


//scene.add(sphere);

let inicializadasBoxes = false; // Variável para verificar se todas as bounding boxes dos objetos estáticos que as possuem já foram inicializadas no render

//var queda = false;
//var ini = 0;
//var fim = 3;
var grandeArea = -1; // Variável que armazena em qual das 6 grande as áreas o personagem está.
/* As grandes áreas são: Transição(-1): Área base onde há apenas colisão com o chão para se testar. Todo lugar onde não há objetos por perto.
     Fronteira(0) : Região próxima às muralhas do mapa( tem formato de moldura quadrada)
      Grande Áreas de 1 a 4: Representam as áreas especiais do jogo(Plataformas em formato de paralelepípedo) e seus derredores( margem de 4 unidades de comprimento)

*/
var area = -1; // Variável que indica em qual área em formato de paralelepípedo presente no jogo.
var area1 = {
   //Cubos:
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1), //Cubo central-pai.
   // Cubos que compõem o cenário
   cube1: new THREE.Mesh(cubeGeo1, materialCubo1),
   cube2: new THREE.Mesh(cubeGeo2, materialCubo1),
   cube3: new THREE.Mesh(cubeGeo3, materialCubo1),

   // Vetor das escadas, retorno de fução  que retorna diversos elementos da escadaria( Ver mais na função): Vetor de objetos dos degraus, rampa para fazer subida e inclinação: 
   degraus: criar_degraus(new THREE.Vector3(-65.5, 0, -150), 4, 5, 2, 8, 90, materialCubo2),
   posicao_ini: new THREE.Vector3(-100, 2, -150), // Posição inicial do cubo central(núcleo) da área
   cubos: [], // Vetor dos cubos que compõem o cenário
   boundingCubos: [], // Vetor das boundigBoxes dos cubos acima
   boundingRampa: null, // boundingBox da rampa da escada
   boundingDegraus: [], // Vetor com a boudingBox dos degraus
   ex: 35, // Extensão da área em relação a seu centro no eixo x(  Metade do comprimento do lado em x do paralelepípedo)
   ez: 51 // Extensão da área em relação a seu centro no eixo z(  Metade do comprimento do lado em z do paralelepípedo)
}
area1.cubos = [area1.cube1, area1.cube2, area1.cube3];
var area2 = {
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1),
   cube1: new THREE.Mesh(cubeGeo1, materialCubo2),
   cube2: new THREE.Mesh(cubeGeo2, materialCubo2),
   cube3: new THREE.Mesh(cubeGeo3, materialCubo2),
   degraus: criar_degraus(new THREE.Vector3(-65.5, 0, 0), 4, 5, 2, 8, 90, materialCubo3),
   posicao_ini: new THREE.Vector3(-100, 2, 0),
   cubos: [],
   boundingCubos: [],
   boundingRampa: null,
   boundingDegraus: [],
   ex: 35,
   ez: 51
}
area2.cubos = [area2.cube1, area2.cube2, area2.cube3];
var area3 = {
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1),
   cube1: new THREE.Mesh(cubeGeo1, materialCubo3),
   cube2: new THREE.Mesh(cubeGeo2, materialCubo3),
   cube3: new THREE.Mesh(cubeGeo3, materialCubo3),
   degraus: criar_degraus(new THREE.Vector3(-65.5, 0, 150), 4, 5, 2, 8, 90, materialCubo4),
   posicao_ini: new THREE.Vector3(-100, 2, 150),
   cubos: [],
   boundingCubos: [],
   boundingDegraus: [],
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
   degraus: criar_degraus(new THREE.Vector3(80.5, 0, 0), 4, 5, 2, 8, 270, materialCubo1),
   posicao_ini: new THREE.Vector3(150, 2, 0),
   cubos: [],
   boundingCubos: [],
   boundingDegraus: [],
   boundingRampa: null,
   ex: 70,
   ez: 101
}
area4.cubos = [area4.cube1, area4.cube2, area4.cube3];

//console.log(area1.cubos[1]);
var areas = [area1, area2, area3, area4]; // Vetor que armazena todos os elementos das áreas em bloco retangular do mapa

for (var i = 0; i < 4; i++) { // Adiciona todos em seus devidos locais
   scene.add(areas[i].cube0);
   areas[i].cube0.translateX(areas[i].posicao_ini.x);
   areas[i].cube0.translateY(areas[i].posicao_ini.y);
   areas[i].cube0.translateZ(areas[i].posicao_ini.z);
   for (var j = 0; j < 3; j++) {

      (areas[i].cube0).add(areas[i].cubos[j]);
      if (j == 1) {
         let desc = -2.75;
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
//sphere.translateY(0.9);


camSight.subVectors(camLook, camPos); // Vetor da direção do campo de visão da câmera. Por ora, inútil, já que pode ser obtido de outra dorma

// Variáveis para teste:
var persTeste = null; 
var message = new SecondaryBox("");




// Eixos do sistema de coordenadas cartesiano:
var eixo_x = new THREE.Vector3(1, 0, 0);
var eixo_y = new THREE.Vector3(0, 1, 0);
var eixo_z = new THREE.Vector3(0, 0, 1);

var isIntersectingStaircase = false; // Variável para verificar a intersecção com a escada
const speedPadrao = 16; // Valor padrão de velocidade do player
let speed = speedPadrao; // Valor que armazena velocidade atual do player



var obj = controle.getObject(); // Objeto da câmera do Poniter lock Controls


var boxPersonagem = new THREE.Box3(); // Bounding box do personagem

const boxCube = new THREE.Box3();
//const helperSphere = new THREE.Box3Helper(boxPersonagem, 0xff0000);
//scene.add(helperSphere);

//const helperCube = new THREE.Box3Helper(boxCube, 0x00ff00);
//scene.add(helperCube);


camera.add(cylinder);// Adiciona arma no jogo
cylinder.position.set(0, -0.3, -0.8); // Estabelece posição da rama para ficar corretamente na câmera


// Função que cria a escada ( Posição inicial da escada, em relação à base, altura total da escada, comprimento total, largua total, número de degraus, rotação em relação à cena( Graus),
// material dos degraus)
function criar_degraus(posicao_ini, altura_total, comp_total, largura, num, rot, materialDeg) {
   var degraus = []; // Vetor de degraus
   // Divisões para se obter os tamanhos individuais:
   let altura_individual = altura_total / num;  
   let comp_individual = comp_total / num;
   let geometria_degrau = new THREE.BoxGeometry(largura, altura_individual, comp_individual);
   var degrau_base = new THREE.Mesh(geometria_degrau, materialDeg); // Degrau da base da escadaria, pai de todos os outros e da rampa
   scene.add(degrau_base);
   degraus.push(degrau_base); // Adiciona no vetor
   degrau_base.translateX(posicao_ini.x); 
   degrau_base.translateY(posicao_ini.y + (altura_individual / 2)); // Translada a altura pela métade para a posição inicial ser a base
   degrau_base.translateZ(posicao_ini.z);
   rot = rot * Math.PI / 180 // Converte para radianos
   degrau_base.rotateY(rot);
   degrau_base.translateZ(- (comp_individual / 2)); // Deslocamento para alinhamento correto da rampa
   for (var i = 1; i < num; i++) {
      let degrau = new THREE.Mesh(geometria_degrau, materialDeg);
      degraus.push(degrau);
      degrau_base.add(degrau); // Adiciona ao degrau base o novo degrau

      // Translações para que eles fiquem com apenas uma aresta de intersecção, encadeados um após o outro na forma de uma escada:
      degrau.translateZ(-comp_individual * i);
      degrau.translateY(altura_individual * i);

   }



   let diagonal_degrau = Math.sqrt(
      altura_individual ** 2 + comp_individual ** 2
   ); // Tamanho da diagonal de cada degrau

   let altura_rampa = num * diagonal_degrau; // Altura total da rampa deve ser igual a soma de todas as diagonais
   let espessura_rampa = diagonal_degrau; // a espessura deve ser igual a de uma diagonal de degrau para que ela os cubra a todos
   let largura_rampa = largura; // A largura é igual a dos degraus

   const geo_rampa = new THREE.BoxGeometry(
      largura_rampa,
      altura_rampa,
      espessura_rampa
   ); 

   let material_invisivel = new THREE.MeshBasicMaterial({
      color: "red",
      visible: false
   }); // Material invisível da rampa

   let rampa_invisivel = new THREE.Mesh(geo_rampa, material_invisivel); // Objeto da rampa

   let inclinacao = Math.atan2(comp_total, altura_total); // Inclinação dela deverá ser igual à arco-cotangente do ângulo da rampa em relação ao eixo-z, arco-tangente do ângulo em relação a y : CA/CO

   // Rotaciona no X

   rampa_invisivel.rotation.x = -inclinacao;// Rotação para o lado oposto, no sentido horário
   // Posiciona
   rampa_invisivel.position.set(
      0, // X
      altura_total / 2 - altura_individual / 2, 
      -comp_total / 2 + comp_individual / 2 - (diagonal_degrau / (2 * Math.cos(inclinacao)) - comp_individual) //Z
   );

   degrau_base.add(rampa_invisivel);
   rampa_invisivel.translateY(-diagonal_degrau * Math.tan(inclinacao) / (2)
   );// Alinhar, por conta geométrica, ao início da parte de cima do último degrau


   // Adiciona na cena




   return [{
      "degraus": degraus, // Vetor de degraus
      "comprimento_degrau": comp_individual // Comprimento de cada um deles
   }, {
      "rampa": rampa_invisivel, // Objeto da rampa
      "angulo_inclinacao": inclinacao, 
      "altura": altura_total,
      "comprimento": comp_total,
      "angulo_rotacao": rot // ângulo de rotação em radianos
   }];

}


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

   ;

   if (moveDir.lengthSq() !== 0) { // Se houver movimento
      if (grandeArea >= 1) { // Se estivermos numa grande área que contém blocos

         moveDir.normalize().multiplyScalar(speed * delta); // Normaliza e multiplica pela velocidade, considerando o delta(Diferença entre quadros)
         let quebrar = false;
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
function atirar(){
if(verdade==true){
   
    const tentativaDisparo = performance.now();

    if (tentativaDisparo - tempoUltimoTiro >= 500) {
        tempoUltimoTiro = tentativaDisparo;
        const projetil = new THREE.Mesh(projetilGeometry, projetilMaterial);

        // posicao do projetil
        const spawnProjetil = new THREE.Vector3();
        spawnProjetil.copy(camera.position);

        const direction = new THREE.Vector3();
        camera.getWorldDirection(direction);

        spawnProjetil.add(direction.clone().multiplyScalar(1));
        projetil.position.copy(spawnProjetil);

        vetProjetil.push({ mesh: projetil, direction,frames:0,area_proj:-1 });

        scene.add(projetil);
    }
}
}
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

function testeGrandesAreas(obj, areaAnalisada) {
   if (areaAnalisada == -1) {
      if (Math.abs(obj.position.x) >= 245 || Math.abs(obj.position.z) >= 245)
         areaAnalisada = 0;
      else {
         let posicao_ini, ex, ez;
         for (var i = 0; i < 4; i++) {
            posicao_ini = areas[i].posicao_ini;
            ex = areas[i].ex;
            ez = areas[i].ez;
            if (obj.position.x >= posicao_ini.x - ex - 4 && obj.position.x <= posicao_ini.x + ex + 4 && obj.position.z >= posicao_ini.z - ez - 4 && obj.position.z <= posicao_ini.z + ez + 4) {
               areaAnalisada = i + 1;
               break;
            }

         }
      }
   }
   else {
      if (areaAnalisada == 0) {
         if (Math.abs(obj.position.x) < 245 && Math.abs(obj.position.z) < 245)
            areaAnalisada = -1;
      }
      else {
         let posicao_ini = areas[areaAnalisada - 1].posicao_ini, ex = areas[areaAnalisada - 1].ex, ez = areas[areaAnalisada - 1].ez;
         if (obj.position.x < posicao_ini.x - ex - 4 || obj.position.x > posicao_ini.x + ex + 4 || obj.position.z < posicao_ini.z - ez - 4 || obj.position.z > posicao_ini.z + ez + 4) {
            areaAnalisada = -1;
         }

      }

   }
   return areaAnalisada;
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
      atirar();
      stats.update();
      const velocidadeProjetil = 1.2;
      let colidiu = false;
      let tamVet = vetProjetil.length;
      for (var q = 0; q < tamVet; q++) {
         colidiu=false;
         let proj = vetProjetil[q];
         const deslocamento = new THREE.Vector3(proj.direction.x * velocidadeProjetil, proj.direction.y * velocidadeProjetil, proj.direction.z * velocidadeProjetil);

         proj.mesh.position.x += deslocamento.x;
         proj.mesh.position.y += deslocamento.y;
         proj.mesh.position.z += deslocamento.z;
         if (proj.frames > 0) {
            proj.frames++;
            if (proj.frames == 180)
               colidiu = true;
         }
         else {
            if (proj.mesh.position.y < -0.1){
               colidiu = true;
               console.log("B");
            }   
            else {
               if (Math.abs(proj.mesh.position.x) > 252 || Math.abs(proj.mesh.position.z) > 252 || Math.abs(proj.mesh.position.y) > 6.1) {
                  proj.frames = 1;
               }
               else {
                  let boxBala = new THREE.Box3().setFromObject(proj.mesh);
                  proj.area_proj = testeGrandesAreas(proj.mesh, proj.area_proj);
                  if (proj.area_proj != -1) {
                     if (proj.area_proj == 0) {
                        for (var i = 0; i < 4; i++) {
                           if (fronteira[i + 4].intersectsBox(boxBala)) {
                              colidiu = true;
                              console.log("B");
                              break;
                           }
                        }
                     }
                     else {
                        i = proj.area_proj-1;
                        //console.log(i);
                        let cubosBox = areas[i].boundingCubos;
                        let rampaBox = areas[i].boundingRampa;
                        for (var j = 0; j < 3; j++) {
                           if (cubosBox[j].intersectsBox(boxBala)) {
                              colidiu = true;
                              console.log("C");
                              break;
                           }

                        }
                        if (!colidiu) {
                           if (rampaBox.intersectsBox(boxBala)) {
                              let degrausBox = areas[i].boundingDegraus;
                              //console.log(degrausBox)
                              for (var k = 0; k < 8; k++) {
                                 if (degrausBox[k].intersectsBox(boxBala)) {
                                    colidiu = true;
                                    console.log("D");
                                    break;

                                 }
                              }
                           }
                           else {
                              if (areas[i].boundingDegraus[7].intersectsBox(boxBala)) {
                                 colidiu = true;
                                 console.log("E");
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
         if (colidiu) {
            console.log("Colisão"+proj.frames);
            scene.remove(proj.mesh);
            vetProjetil.splice(q, 1);
            q--;
            tamVet--;
         }
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





