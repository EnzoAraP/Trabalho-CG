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


import { areas, testeGrandesAreas, scene } from './criacaoAreas.js';
import { LancaMisseis, Metralhadora } from './ControleArmas.js';
import { Personagem } from './movimentoPersonagem.js';
import { Cacodemon } from './Inimigo02.js';
import { Lost_Soul } from './Inimigo01.js';
import { carregarArquivoGLB, carregarArquivoObj } from './funcoesGeometriasExternas.js';
import { AmbientLight } from '../build/three.module.js';
import { ElevacaoBloco } from './funcaoElevarBlocoEmY.js';

let light, camera, keyboard, material;
var stats = new Stats();
let color = "rgb(0, 0, 0)", shadowMapType = THREE.PCFSoftShadowMap;
var renderer = new THREE.WebGLRenderer();
//renderer.useLegacyLights = true;
renderer.shadowMap.enabled = true;

let luz_atual = 0;
const op_luz = [[THREE.PCFSoftShadowMap, 4096, -0.0002], [THREE.VSMShadowMap, 2048, -0.0005]];

renderer.shadowMap.type = op_luz[luz_atual][0];

renderer.setClearColor(new THREE.Color(color));
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.getElementById("webgl-output").appendChild(renderer.domElement);

light = new AmbientLight(); // Use default light 

light.intensity = 0.5;

scene.add(light);

let camPos = new THREE.Vector3(0, 10, 0);
let camUp = new THREE.Vector3(0.0, 1.0, 0.0);
let camLook = new THREE.Vector3(0, 1.8, -1);



const voo = true; // Variável que indica se o voo está habilitado ou não.

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(450, 500, 420);
dirLight.castShadow = true;



dirLight.castShadow = true;
dirLight.intensity = 1;
// Shadow Parameters
dirLight.shadow.mapSize.width = op_luz[luz_atual][1];
dirLight.shadow.mapSize.height = op_luz[luz_atual][1];
dirLight.shadow.camera.near = 561;
dirLight.shadow.camera.far = 983;
dirLight.shadow.camera.left = -150;
dirLight.shadow.camera.right = 150;
dirLight.shadow.camera.bottom = -150;
dirLight.shadow.camera.top = 150;
dirLight.shadow.bias = op_luz[luz_atual][2];

// No effect on Basic and PCFSoft
dirLight.shadow.radius = 2.5;


scene.add(dirLight.target);


scene.add(dirLight);
// (opcional) Ajuda para visualizar o volume de sombra
const helper = new THREE.CameraHelper(dirLight.shadow.camera);
scene.add(helper);

dirLight.target.position.set(0, 0, 0);
scene.add(dirLight.target);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-350, 430, -350);
fillLight.castShadow = false;
fillLight.intensity = 0.6;
scene.add(fillLight.target);

// No effect on Basic and PCFSoft


scene.add(fillLight);


const lerpConfig = {
  destination: new THREE.Vector3(0,1,0),
  alpha: 0.01,
  move: true
};


function mudanca_luz() {
   const posPer = personagem.obj.position;

   const range = 150;

   // Atualiza os limites (centrado no alvo da luz)
   dirLight.shadow.camera.left = -range;
   dirLight.shadow.camera.right = range;
   dirLight.shadow.camera.top = range;
   dirLight.shadow.camera.bottom = -range;

   // Move a luz e o alvo
   dirLight.position.set(posPer.x + 450, posPer.y + 500, posPer.z + 420);
   dirLight.target.position.set(posPer.x, posPer.y, posPer.z);


   fillLight.position.set(posPer.x - 450, posPer.y + 500, posPer.z - 420);
   fillLight.target.position.set(posPer.x, posPer.y, posPer.z);
   // Atualiza projeção da shadow camera
   dirLight.shadow.camera.updateProjectionMatrix();

   // Atualiza helper se estiver sendo usado
   helper.update();
}

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(camPos);
camera.up.copy(camUp);
camera.lookAt(camLook);

scene.add(camera);
//console.log("AAAA");



window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
keyboard = new KeyboardState();
material = new THREE.MeshLambertMaterial({ color: "rgb(218, 204, 204)" }); // cria o material dos cubos da área 1
let material2 = new THREE.MeshLambertMaterial({ color: "rgb(39, 164, 168)" });
const controle = new PointerLockControls(camera, renderer.domElement);
controle.pointerSpeed = 0.6;
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0, 2.1);
let planegeometry = new THREE.BoxGeometry(500, 0.1, 500); // Plano base 500x500
let border_planeGeometry_YZ = new THREE.BoxGeometry(1, 9, 500); // Geometra das muralhas em z 
let border_planeGeometry_XY = new THREE.BoxGeometry(500, 9, 1); // Geomteria das muralhas em x

let groundPlane = new THREE.Mesh(planegeometry, material);

var fronteira = []; // Vetor que armazenará os objeto dos planos das fronteiras(Muralhas do mapa) nas 4 primeras posições e suas boundingBoxes nas próximas 4.
for (var i = 0; i < 2; i++) { // Primeiro os dois planos em x e z positivos. 
   let novoPlano = new THREE.Mesh(border_planeGeometry_YZ, material2);
   novoPlano.castShadow = true;
   novoPlano.receiveShadow = true;
   scene.add(novoPlano);
   novoPlano.translateX(250.5 * (1 - 2 * i)); // Descolocamentos adequados
   novoPlano.translateY(3); // Para deixar a base alinhada ao solo
   fronteira.push(novoPlano);
   novoPlano = new THREE.Mesh(border_planeGeometry_XY, material2);
   novoPlano.castShadow = true;
   novoPlano.receiveShadow = true;
   scene.add(novoPlano);
   novoPlano.translateZ(250.5 * (1 - 2 * i));
   novoPlano.translateY(3);
   fronteira.push(novoPlano);

}
groundPlane.receiveShadow = true;
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




let assetManager = {
   // Properties ---------------------------------
   cacodemon1: null,
   cacodemon2: null,
   cacodemon3: null,
   num: 0,
   num_total: 1,
   allLoaded: false,

   // Functions ----------------------------------
   checkLoaded: function () {
      if (!this.allLoaded) {
         this.allLoaded = (this.cacodemon1 != null) && (this.cacodemon2 != null) && (this.cacodemon3 != null);

      }
   },

   hideAll: function () {
      for (var i = 0; i < this.num; i++)
         this.cacodemon[i].visilbility = false;
   }
}


let assetManagerLost = {
   // Properties ---------------------------------
   lost_Soul1: null,
   lost_Soul2: null,
   lost_Soul3: null,
   lost_Soul4: null,
   lost_Soul5: null,
   num: 0,
   num_total: 1,
   allLoaded: false,

   // Functions ----------------------------------
   checkLoaded: function () {
      if (!this.allLoaded) {
         var somatorio = 0;

         if (this.lost_Soul1 == null) {
            somatorio++;
         }

         console.log(somatorio);
         this.allLoaded = (this.lost_Soul1 != null) && (this.lost_Soul2 != null) && (this.lost_Soul3 != null) && (this.lost_Soul4 != null) && (this.lost_Soul5 != null);

      }
   },

   hideAll: function () {
      for (var i = 0; i < this.num; i++)
         this.lost_Soul[i].visilbility = false;
   }
}


carregarArquivoGLB(assetManager, './2025.1_T2_Assets/', 'cacodemon', false, "1", scene, 1);
carregarArquivoGLB(assetManager, './2025.1_T2_Assets/', 'cacodemon', false, "2", scene, 1);
carregarArquivoGLB(assetManager, './2025.1_T2_Assets/', 'cacodemon', false, "3", scene, 1);

carregarArquivoObj(assetManagerLost, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "1", scene);
carregarArquivoObj(assetManagerLost, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "2", scene);
carregarArquivoObj(assetManagerLost, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "3", scene);
carregarArquivoObj(assetManagerLost, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "4", scene);
carregarArquivoObj(assetManagerLost, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "5", scene);

let cacodemon_geometry = new THREE.BoxGeometry(0.6, 1.2, 0.6);

let cacodemon_material = new THREE.MeshLambertMaterial({ color: "rgb(55, 9, 180)" });

var cacodemons = [];
var carregou_vetor_cac = false;
var cacodemons_derrotados = [];
var cac_acordados = false;
function carregar_cac() {
   for (var i = 0; i < 3; i++) {
      const larguraBarra = 1.2;
      const alturaBarra = 0.15;
      const fundoGeometry = new THREE.PlaneGeometry(larguraBarra, alturaBarra);
      const fundoMaterial = new THREE.MeshBasicMaterial({
         color: "rgb(0, 0, 0)",
         //opacity: 0.6,       // Meio transparente
         transparent: true
      });
      let barraFundo = new THREE.Mesh(fundoGeometry, fundoMaterial);


      // Frente (verde) - a parte que será "cortada"
      const frenteGeometry = new THREE.PlaneGeometry(larguraBarra, alturaBarra);
      const frenteMaterial = new THREE.MeshBasicMaterial({ color: "rgb(231, 16, 16)" });
      let barraVida = new THREE.Mesh(frenteGeometry, frenteMaterial);
      const group = new THREE.Group();

      group.add(barraFundo);
      group.add(barraVida);
      group.visible = false;
      scene.add(group);

      let nome = 'cacodemon';
      var obj_cacodemon = assetManager[nome + (i + 1).toString()];
      obj_cacodemon.castShadow = true;
      obj_cacodemon.receiveShadow = true;

      group.position.copy(obj.position).add(new THREE.Vector3(0, 1.2, 0));

      barraVida.position.z = 0.01;

      obj_cacodemon.position.set(i, 0.3, -i);
      let arma_cac = new LancaMisseis(obj_cacodemon, [personagem], false);
      let novo_cac = new Cacodemon(obj_cacodemon, camera, new THREE.Box3(), 0.6, 5, arma_cac, personagem);
      novo_cac.barraFrente = barraVida;
      novo_cac.barraFundo = barraFundo;
      novo_cac.grupoBarras = group;
      novo_cac.tamBarraVida = larguraBarra;
      cacodemons.push(novo_cac);


   }
   lancaMisseis.numInimigos = 3;
}

//lostSoul
var lost_soulvet = [];
var carregou_vetor_lost = false;
var lost_soul_derrotados = [];
var lost_soul_acordados = false;
function carregar_lost_Soul() {
   for (var i = 0; i < 5; i++) {
      const larguraBarra = 1.2;
      const alturaBarra = 0.15;
      const fundoGeometry = new THREE.PlaneGeometry(larguraBarra, alturaBarra);
      const fundoMaterial = new THREE.MeshBasicMaterial({
         color: "rgb(0, 0, 0)",
         //opacity: 0.6,       // Meio transparente
         transparent: true
      });
      let barraFundo = new THREE.Mesh(fundoGeometry, fundoMaterial);


      // Frente (verde) - a parte que será "cortada"
      const frenteGeometry = new THREE.PlaneGeometry(larguraBarra, alturaBarra);
      const frenteMaterial = new THREE.MeshBasicMaterial({ color: "rgb(231, 16, 16)" });
      let barraVida = new THREE.Mesh(frenteGeometry, frenteMaterial);
      const group = new THREE.Group();

      group.add(barraFundo);
      group.add(barraVida);
      group.visible = false;
      scene.add(group);

      let nome = 'lost_Soul';
      console.log(nome + (i + 1).toString());
      var obj_lost_soul = assetManagerLost[nome + (i + 1).toString()];
      obj_lost_soul.castShadow = true;
      obj_lost_soul.receiveShadow = true;

      group.position.copy(obj.position).add(new THREE.Vector3(0, 1.2, 0));

      barraVida.position.z = 0.01;

      obj_lost_soul.position.set(-70 - (i * 5), 5.5, -150 - (i * 5));
      let novo_lost_soul = new Lost_Soul(obj_lost_soul, camera, new THREE.Box3(), 0.6, 3, personagem);
      novo_lost_soul.barraFrente = barraVida;
      novo_lost_soul.barraFundo = barraFundo;
      novo_lost_soul.grupoBarras = group;
      novo_lost_soul.tamBarraVida = larguraBarra;
      lost_soulvet.push(novo_lost_soul);

      lancaMisseis.numInimigos = 5;
   }
}



var lancaMisseis = new LancaMisseis(camera, lost_soulvet, true);

var metralhadora = new Metralhadora(camera, scene, lost_soulvet);

var obj = controle.getObject(); // Objeto da câmera do Poniter lock Controls

var boxPersonagem = new THREE.Box3(); // Bounding box do personagem



var personagem = new Personagem(obj, camera, boxPersonagem, larg, speedPadrao, lancaMisseis, metralhadora);


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
let moveDown = false;
let tecla_arma1 = false;
let tecla_arma2 = false;


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
         moveLeft = value;
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
      case 80:
         moveDown = value;
         break;
      case 49:
         tecla_arma1 = value;
         break;
      case 50:
         tecla_arma2 = value;
         break;

   }
}

//var materialCubo = setDefaultMaterial("rgb(43, 175, 114)"); // create a basic material 







function estabeleceBoundingBoxes() {
   for (var i = 0; i < 4; i++) {

      for (var j = 0; j < 3; j++) {


         areas[i].boundingCubos.push(new THREE.Box3().setFromObject(areas[i].cubos[j]));
         if (i != 1) {
            let degraus = areas[i].degraus[0].degraus;


            for (var k = 0; k < 8; k++) {
               if (k == 0) {
                  const geometry = degraus[0].geometry;
                  geometry.computeBoundingBox();

                  const box = geometry.boundingBox.clone();


                  box.applyMatrix4(degraus[0].matrixWorld);
                  areas[i].boundingDegraus.push(box);
               }
               else {
                  areas[i].boundingDegraus.push(new THREE.Box3().setFromObject(degraus[k]));
                  ////console.log(areas[i].boundingDegraus[k]);
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
   for (var i = 0; i < areas[1].num_blocos_extras; i++) {
      areas[1].boundingBlocosExtras.push(new THREE.Box3().setFromObject(areas[1].blocosExtras[i]));
   }


   areas[1].porta.box = new THREE.Box3().setFromObject(areas[1].porta.mesh);
   const helper2 = new THREE.Box3Helper(areas[1].porta.box, 0xffff00); // Amarelo
   areas[1].fechadura.box = new THREE.Box3().setFromObject(areas[1].fechadura.mesh);
   const helper3 = new THREE.Box3Helper(areas[1].fechadura.box, 0xffff00); // Amarelo
   areas[1].plataforma.box = new THREE.Box3().setFromObject(areas[1].plataforma.mesh);
   const helper4 = new THREE.Box3Helper(areas[1].plataforma.box, 0xffff00); // Amarelo
   scene.add(helper2);
   scene.add(helper3);
   scene.add(helper4);

   for (let i = -33.6; i <= 33.6; i = i + 11.2)// parede direita
   {
      let vetorteste2 = new THREE.Vector3(i, 4.5, -49.6);
      areas[0].criaPilar(vetorteste2);
      //area1.pilares.push(pilar);
      //criarBoundingBox(pilar);
      //criarBoundingBox(pilar);
   }
   for (let i = -33.6; i <= 33.6; i = i + 11.2)// parede esqureda
   {
      let vetorteste3 = new THREE.Vector3(i, 4.5, 49.6);
      areas[0].criaPilar(vetorteste3);
      //area1.pilares.push(pilar);
      //criarBoundingBox(pilar);
   }
   for (let i = 49.6; i >= -49.6; i = i - 11.2)// parede tras
   {
      let vetorteste3 = new THREE.Vector3(-33.6, 4.5, i);
      areas[0].criaPilar(vetorteste3);
      //area1.pilares.push(pilar);
      ///criarBoundingBox(pilar);
   }
   for (let i = 49.6; i >= 0; i = i - 11.2)// parede escada esquerda
   {
      let vetorteste3 = new THREE.Vector3(33.6, 4.5, i);
      areas[0].criaPilar(vetorteste3);
      //area1.pilares.push(pilar);
      //criarBoundingBox(pilar);
   }
   for (let i = -49.6; i <= 0; i = i + 11.2)// parede escada direita
   {
      let vetorteste3 = new THREE.Vector3(33.6, 4.5, i);
      areas[0].criaPilar(vetorteste3);
      ////area1.pilares.push(pilar);
      //criarBoundingBox(pilar);
   }
   //area 1 a partir daqui
   if (areas[0].pilares && areas[0].pilares.length > 0) {

      for (var i = 0; i < areas[0].pilares.length; i++) {

         const pilar = areas[0].pilares[i];

         // Verifique se o pilar e sua malha existem
         if (pilar) {
            const box = new THREE.Box3().setFromObject(pilar);
            console.log(box);
            areas[0].boundingBoxesPilares.push(box);
            console.log(areas[0].boundingBoxesPilares);
            const helper4 = new THREE.Box3Helper(areas[0].boundingBoxesPilares[i], 0xffff00); // Amarelo
            scene.add(helper4);

         }
      }
   }
   areas[0].subir_Plataforma();
   const plat = areas[0].plat;
   const boxPlat = new THREE.Box3().setFromObject(plat);
   boxPlat.translate(new THREE.Vector3(0, 3, 0)); // sobe +2 no Y
   areas[0].boundingBoxplat = boxPlat;
   let helper5 = new THREE.Box3Helper(areas[0].boundingBoxplat, 0xffff00); // Amarelo
   scene.add(helper5);

}


let verdade = false;

const clock = new THREE.Clock();

let mudar_arma = false;

renderer.domElement.addEventListener("wheel", (event) => {
   mudar_arma = true;
});

window.addEventListener('mousedown', (event) => {
   if (event.button === 0 || event.button === 2)
      verdade = true;
   ////console.log(controle.pointerSpeed);
});
window.addEventListener('mouseup', (event) => {
   verdade = false;
});

let contadorMudancaLuz = 0;

let mudancaLuz = true;

let pode = false;
let entrou = false;

var Lost_soul_morreram = false;

var criou_elevar=false;

let elevacaoBloco = null;

render();


function render() {

   if (mudancaLuz) {
      contadorMudancaLuz++;
      if (contadorMudancaLuz == 2) {
         mudanca_luz();
         //console.log("mudou");
         contadorMudancaLuz = 0;
      }
   }

   assetManager.checkLoaded();
   if (!carregou_vetor_cac && assetManager.allLoaded) {
      carregar_cac();
      areas[1].posiciona_inimigos(cacodemons);
      carregou_vetor_cac = true;
   }



   assetManagerLost.checkLoaded();
   if (!carregou_vetor_lost && assetManagerLost.allLoaded) {
      console.log("CarregouLost");
      carregar_lost_Soul();
      carregou_vetor_lost = true;
   }

   // fps.update(0.016);

   if (controle.isLocked) {
      if (mudar_arma)
         personagem.mudar_arma();
      if (tecla_arma1)
         personagem.mudar_arma(1);
      else if (tecla_arma2)
         personagem.mudar_arma(2);
      mudar_arma = false;

      let delta = clock.getDelta();
      delta = Math.min(delta, 0.05);
      personagem.movimento(areas, fronteira, groundPlane, delta, moveForward, moveBackward, moveRight, moveLeft, moveUp, reset,scene, moveDown);
      let derrotados2 = null;
      if (personagem.num_arma_atual == 1)
         personagem.arma_atual.atirar(scene, camera, verdade);
      else
         derrotados2 = personagem.arma_atual.atirar(scene, areas, fronteira, camera, verdade);
      stats.update();
      let armasNovosDerrotados = lancaMisseis.controle_projeteis(scene, areas, fronteira);

      if (personagem.chegada_area2) {
         if (!cac_acordados) {
            for (var i = 0; i < cacodemons.length; i++) {
               cacodemons[i].acordar();
            }
         }

         if (armasNovosDerrotados.length != 0)
            cacodemons_derrotados = cacodemons_derrotados.concat(armasNovosDerrotados);
         if (derrotados2 != null)
            cacodemons_derrotados.push(derrotados2);
         for (var i = 0; i < cacodemons.length; i++) {

            cacodemons[i].movimento(areas, fronteira, groundPlane, delta, false, false, scene);
            cacodemons[i].arma.controle_projeteis(scene, areas, fronteira);

         }
         for (var i = 0; i < cacodemons_derrotados.length; i++) {
            cacodemons_derrotados[i].arma.controle_projeteis(scene, areas, fronteira);
            cacodemons_derrotados[i].sumir();
            if (cacodemons_derrotados[i].sumiu) {
               //console.log("AAA");
               scene.remove(cacodemons_derrotados[i].obj);
               scene.remove(cacodemons_derrotados[i].grupoBarras);
            }
            if (cacodemons_derrotados[i].arma.vetProjetil.length == 0 && cacodemons_derrotados[i].sumiu)
               cacodemons_derrotados.splice(i, 1);
         }
         if (cacodemons.length == 0) {
            if (areas[1].chave2 == null) {
               let chave = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: "rgb(231, 19, 19)" }));
               areas[1].posicionar_chave2(chave);
            }
            if (!areas[1].bloco_elevado && !areas[1].elevar_bloco && personagem.area == 1 && personagem.obj.position.y >= 5.98 && personagem.saiu_plataforma) {
               areas[1].elevar_bloco = true;

            }
            if (areas[1].elevar_bloco)
               areas[1].fazer_elevar_bloco();
            areas[1].tentar_retirar_chave2(personagem, scene);
            // //console.log(this.obj.position.y);
         }
      }
      if (personagem.chegada_area1) {
         if (!lost_soul_acordados) {
            for (var i = 0; i < lost_soulvet.length; i++) {
               lost_soulvet[i].acordar();
            }
         }

         if (armasNovosDerrotados.length != 0)
            lost_soul_derrotados = lost_soul_derrotados.concat(armasNovosDerrotados);
         if (derrotados2 != null)
            lost_soul_derrotados.push(derrotados2);
         for (var i = 0; i < lost_soulvet.length; i++) {

            lost_soulvet[i].movimento(areas, fronteira, groundPlane, delta, false, false, scene);
         }
         for (var i = 0; i < lost_soul_derrotados.length; i++) {

            lost_soul_derrotados[i].sumir();
            if (lost_soul_derrotados[i].sumiu) {
               console.log("AAA");
               scene.remove(lost_soul_derrotados[i].obj);
               scene.remove(lost_soul_derrotados[i].grupoBarras);
            }
            if (lost_soul_derrotados[i].sumiu)
               lost_soul_derrotados.splice(i, 1);
         }
         if (lost_soulvet.length == 0) {


            //    if(!areas[0].bloco_elevado && !areas[0].elevar_bloco)
            //      areas[0].elevar_bloco=true;
            //  if(areas[0].elevar_bloco)
            //      areas[0].fazer_elevar_bloco();
            if (lost_soul_derrotados == 0 && !Lost_soul_morreram) {

               lancaMisseis.inimigos = cacodemons;
               metralhadora.inimigos = cacodemons;
               //lancaMisseis.inimigos = cacodemons;
               lancaMisseis.type = 2;
               armasNovosDerrotados = [];
               Lost_soul_morreram = true;
               //areas[0].subir_Plataforma();
               pode = true;


            }
            // console.log(this.obj.position.y);
         }

      }
      if (pode) {
         personagem.pegou = true;
         if(!criou_elevar){
            criou_elevar=true;
            areas[0].plat;
            areas[0].boundingBoxplat.setFromObject(areas[0].plat);
            elevacaoBloco = new ElevacaoBloco(areas[0].plat,areas[0].boundingBoxplat,-3.2,2.5,240);
            
            elevacaoBloco.elevar_bloco=true;

         }
         if(elevacaoBloco.elevar_bloco==false && personagem.possui_chave1 && !areas[0].chaveRem){
            areas[0].plat.remove(areas[0].chave);
            areas[0].chave1=null;
            areas[0].chaveRem=true;
            console.log("aaa");
         }
           
         elevacaoBloco.fazer_elevar_bloco();

        

         

      }
      if (areas[1].porta.abrindo && areas[1].chave1 == null) {
         let chave = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: "rgb(95,40,180)" }));
         areas[1].posicionar_chave1(chave);
      }

   }
   ////console.log(verdade);
   ////console.log(groundPlane);

   renderer.render(scene, camera) // Render scene
   requestAnimationFrame(render);
   if (!inicializadasBoxes) {
      estabeleceBoundingBoxes();
      inicializadasBoxes = true;
   }
}