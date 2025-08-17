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

import {pain_elemental} from './Inimigo04.js';
import { areas, testeGrandesAreas, scene } from './criacaoAreas.js';
import { LancaMisseis, Metralhadora } from './ControleArmas.js';
import { Personagem } from './movimentoPersonagem.js';
import { Cacodemon } from './Inimigo02.js';
import { Lost_Soul } from './Inimigo01.js';
import { carregarArquivoGLB, carregarArquivoObj,carregarArquivoGLBGenerico } from './funcoesGeometriasExternas.js';
import { AmbientLight } from '../build/three.module.js';
import { ElevacaoBloco } from './funcaoElevarBlocoEmY.js';
import { Soldado } from './Inimigo03.js';
import { CubeTextureLoaderSingleFile } from '../libs/util/cubeTextureLoaderSingleFile.js';



let cubeMapTexture = new CubeTextureLoaderSingleFile().loadSingle('./2025.1_T2_Assets/subtract.png', 1);
scene.background = cubeMapTexture;
let possui_todas_as_chaves=false;
let tempo_exibindo=180;

let light, camera, keyboard, material;
var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);
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

let apagar_luzes = false;

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
//scene.add(helper);

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
   destination: new THREE.Vector3(0, 1, 0),
   alpha: 0.01,
   move: true
};

export function ativar_fim_da_luz_por_derrota() {
   apagar_luzes = true;
}

function findar_luz() {
   scene.remove(light);
   //console.log(personagem.area);
   if (light.intensity > 0)
      light.intensity = 0;
   if (dirLight.intensity > 0)
      dirLight.intensity -= 0.05;
   if (fillLight.intensity > 0)
      fillLight.intensity -= 0.05;
   if (areas[2].luz_local.intensity > 0)
      areas[2].luz_local.intensity -= 0.05;

}
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
////console.log("AAAA");
var listener = new THREE.AudioListener();
camera.add(listener);






window.addEventListener('resize', function () { onWindowResize(camera, renderer) }, false);
keyboard = new KeyboardState();
material;
let material2 = areas[3].estabelecerMaterial("./texturas_geral/area2/big_wall2.jpg", 65, 2, 0, 0,"rgba(145, 117, 112, 1)");
const controle = new PointerLockControls(camera, renderer.domElement);
controle.pointerSpeed = 0.6;
const raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0, 2.1);
let planegeometry = new THREE.BoxGeometry(500, 0.1, 500); // Plano base 500x500
let border_planeGeometry_YZ = new THREE.BoxGeometry(1, 9, 500); // Geometra das muralhas em z 
let border_planeGeometry_XY = new THREE.BoxGeometry(500, 9, 1); // Geomteria das muralhas em x

let groundPlane = new THREE.Mesh(planegeometry, areas[3].estabelecerMaterial("../assets/textures/intertravado.jpg", 125, 125, 0, 0));

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

         //console.log(somatorio);
         this.allLoaded = (this.lost_Soul1 != null) && (this.lost_Soul2 != null) && (this.lost_Soul3 != null) && (this.lost_Soul4 != null) && (this.lost_Soul5 != null);

      }
   },

   hideAll: function () {
      for (var i = 0; i < this.num; i++)
         this.lost_Soul[i].visilbility = false;
   }
}
let assetManagerElemental = {
   elemental_Soul: null,
   lost_SoulE1:null,
   lost_SoulE2:null,
   lost_SoulE3:null,
   lost_SoulE4:null,
   lost_SoulE5:null,
   num:0,
   num_total: 1,
   allLoaded: false,
   //Function
    checkLoaded: function () {
      if (!this.allLoaded) {
         var somatorio = 0;

         if (this.lost_SoulE1 == null) {
            somatorio++;
         }
           if (this.elemental_Soul == null) {
            somatorio++;
         }

     //    console.log(somatorio);

         this.allLoaded = (this.lost_SoulE1 != null) && (this.lost_SoulE2 != null) && (this.lost_SoulE3 != null) && (this.lost_SoulE4 != null) && (this.lost_SoulE5 != null) && (this.elemental_Soul !=null);
      //   console.log(" E1 = "+( this.lost_SoulE1 != null)+' E2 = ' +(this.lost_SoulE2 != null)+' E3 = ' +(this.lost_SoulE3 != null)+'E4 = ' +(this.lost_SoulE4 != null)+' E5 = ' +(this.lost_SoulE5 != null)+' Elemental = ' +(this.elemental_Soul !=null));
      //   console.log(this.allLoaded);
      }
   },
   //nunca usa
     hideAll: function () {
      for (var i = 0; i < this.num; i++)
         this.lost_Soul[i].visilbility = false;
   }

}

let assetManagerCacodemon = {
   // Properties ---------------------------------
   cacodemonE1: null,
   cacodemonE2: null,
   cacodemonE3: null,
    cacodemonE4: null,
   num: 0,
   num_total: 1,
   allLoaded: false,

   // Functions ----------------------------------
   checkLoaded: function () {/// cacos da area 4 
      if (!this.allLoaded) {
         this.allLoaded = (this.cacodemonE1 != null) && (this.cacodemonE2 != null) && (this.cacodemonE3 != null) && (this.cacodemonE4 !=null);

      }
      
   },

   hideAll: function () { // nunca usa 
      for (var i = 0; i < this.num; i++)
         this.cacodemon[i].visilbility = false;
   }
}


carregarArquivoGLB(assetManager, './2025.1_T2_Assets/', 'cacodemon', false, "1", scene, 1);
carregarArquivoGLB(assetManager, './2025.1_T2_Assets/', 'cacodemon', false, "2", scene, 1);
carregarArquivoGLB(assetManager, './2025.1_T2_Assets/', 'cacodemon', false, "3", scene, 1);

///Carregar do Lost SoulArea1
carregarArquivoObj(assetManagerLost, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "1", scene,"lost_Soul");
carregarArquivoObj(assetManagerLost, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "2", scene,"lost_Soul");
carregarArquivoObj(assetManagerLost, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "3", scene,"lost_Soul");
carregarArquivoObj(assetManagerLost, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "4", scene,"lost_Soul");
carregarArquivoObj(assetManagerLost, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "5", scene,"lost_Soul");

//Carregar do Elemental+LostSoulElemental
carregarArquivoObj(assetManagerElemental, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "1", scene,"lost_SoulE");
carregarArquivoObj(assetManagerElemental, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "2", scene,"lost_SoulE");
carregarArquivoObj(assetManagerElemental, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "3", scene,"lost_SoulE");
carregarArquivoObj(assetManagerElemental, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "4", scene,"lost_SoulE");
carregarArquivoObj(assetManagerElemental, './2025.1_T2_Assets/', 'skull', false, './2025.1_T2_Assets/skull/', 'skull', "5", scene,"lost_SoulE");
carregarArquivoGLBGenerico(assetManagerElemental, '../T3/ElementalBlender/', 'Corrigido', false,null, scene, 1.8,"elemental_Soul");
carregarArquivoGLBGenerico(assetManagerCacodemon, './2025.1_T2_Assets/', 'cacodemon', false, "1", scene, 1,"cacodemonE");
carregarArquivoGLBGenerico(assetManagerCacodemon, './2025.1_T2_Assets/', 'cacodemon', false, "2", scene, 1,"cacodemonE");
carregarArquivoGLBGenerico(assetManagerCacodemon, './2025.1_T2_Assets/', 'cacodemon', false, "3", scene, 1,"cacodemonE");
carregarArquivoGLBGenerico(assetManagerCacodemon, './2025.1_T2_Assets/', 'cacodemon', false, "4", scene, 1,"cacodemonE");
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
///ElementalSoul
var Elementalvet = [];
var InimigosArea5 = [];
var carregouElemental = false;
var inimigosArea5Morreram = false;
var Area5Derrotados = [];
var ElementalAcordado = false;
function carregar_Elemental() {
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

      let nome = 'elemental_Soul';
      console.log(nome + (i + 1).toString());
      var obj_Elemental_Soul = assetManagerElemental[nome];
      obj_Elemental_Soul.castShadow = true;
      obj_Elemental_Soul.receiveShadow = true;

      group.position.copy(obj.position).add(new THREE.Vector3(0, 1.2, 0));

      barraVida.position.z = 0.01;

      obj_Elemental_Soul.position.set(120,10,0);
      let novo_Elemental_Soul = new pain_elemental(obj_Elemental_Soul, camera, new THREE.Box3(), 0.6, 3, personagem);
      novo_Elemental_Soul.barraFrente = barraVida;
      novo_Elemental_Soul.barraFundo = barraFundo;
      novo_Elemental_Soul.grupoBarras = group;
      novo_Elemental_Soul.tamBarraVida = larguraBarra;
      Elementalvet.push(novo_Elemental_Soul);
       InimigosArea5.push(novo_Elemental_Soul);

      lancaMisseis.numInimigos =lancaMisseis.numInimigos+1;
   
}

// lostSoulE
var lost_soulvetE = [];

var lost_soul_acordadosE = [];
var acordados = 0;
function carregar_lost_SoulE(posicaoElemental = null, direcaoElemental = null) {
   if (acordados >= 5) {
      console.log("Limite de Lost Souls atingido");
      return;
   }

   const larguraBarra = 1.2;
   const alturaBarra = 0.15;
   const fundoGeometry = new THREE.PlaneGeometry(larguraBarra, alturaBarra);
   const fundoMaterial = new THREE.MeshBasicMaterial({
      color: "rgb(0, 0, 0)",
      transparent: true
   });
   let barraFundo = new THREE.Mesh(fundoGeometry, fundoMaterial);

   // Frente (vermelha) - barra de vida
   const frenteGeometry = new THREE.PlaneGeometry(larguraBarra, alturaBarra);
   const frenteMaterial = new THREE.MeshBasicMaterial({ color: "rgb(231, 16, 16)" });
   let barraVida = new THREE.Mesh(frenteGeometry, frenteMaterial);
   const group = new THREE.Group();

   group.add(barraFundo);
   group.add(barraVida);
   
   // Posicionamento correto da barra vermelha
   barraVida.position.z = 0.01;
   
   group.visible = true;
   scene.add(group);

   let nome = 'lost_SoulE';
   var obj_lost_soul = assetManagerElemental[nome + (acordados + 1).toString()];
   
   if (!obj_lost_soul) {
      console.log("Não foi possível encontrar o modelo do Lost Soul");
      return;
   }
   
   obj_lost_soul.castShadow = true;
   obj_lost_soul.receiveShadow = true;

   // Posicionamento do Lost Soul
   if (posicaoElemental && direcaoElemental) {
      // Usado quando criado pelo Pain Elemental
      const direcaoNormalizada = direcaoElemental.clone().normalize();
      direcaoNormalizada.multiplyScalar(3); // 3 unidades à frente
      
      obj_lost_soul.position.copy(posicaoElemental);
      obj_lost_soul.position.add(direcaoNormalizada);
      obj_lost_soul.position.y += 1; // Levemente acima para não colidir
   } else {
      // Posição padrão se não for criado pelo elemental
      obj_lost_soul.position.set(-70 - (acordados * 5), 5.5, -150 - (acordados * 5));
   }
   
   // Criar com dash ativado quando gerado pelo Pain Elemental
   let dash = (posicaoElemental != null);
   let novo_lost_soul = new Lost_Soul(obj_lost_soul, camera, new THREE.Box3(), 0.6, 3, personagem, dash);
   
   novo_lost_soul.barraFrente = barraVida;
   novo_lost_soul.barraFundo = barraFundo;
   novo_lost_soul.grupoBarras = group;
   novo_lost_soul.tamBarraVida = larguraBarra;
   
   // Posicionamento do grupo de barras
   group.position.copy(obj_lost_soul.position).add(new THREE.Vector3(0, 1.2, 0));
   group.lookAt(camera.position);
   
   novo_lost_soul.acordar();
   lost_soulvetE.push(novo_lost_soul);
     InimigosArea5.push(novo_lost_soul);
   acordados++;
   
   lancaMisseis.numInimigos++;
   
   return novo_lost_soul;
}
function carregar_lost_SoulE2(posicaoElemental= null,direcaoElemental=null) {
   if (acordados<=5){
      
      console.log(acordados);
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

      let nome = 'lost_SoulE';
      console.log(nome + (acordados + 1).toString());
      var obj_lost_soul = assetManagerElemental[nome + (acordados + 1).toString()];
      obj_lost_soul.castShadow = true;
      obj_lost_soul.receiveShadow = true;
       if (posicaoElemental && direcaoElemental) {
      // Usado quando criado pelo Pain Elemental
      const direcaoNormalizada = direcaoElemental.clone().normalize();
    //  direcaoNormalizada.multiplyScalar(3); // 3 unidades à frente
      
      obj_lost_soul.position.copy(posicaoElemental);
      obj_lost_soul.position.add(direcaoNormalizada);
    //  obj_lost_soul.position.y += 1; // Levemente acima para não colidir
   }
      group.position.copy(obj_lost_soul.position).add(new THREE.Vector3(0, 1.2, 0));

      barraVida.position.z = 0.01;


      let novo_lost_soul = new Lost_Soul(obj_lost_soul, camera, new THREE.Box3(), 0.6, 3, personagem,true);
      novo_lost_soul.barraFrente = barraVida;
      novo_lost_soul.barraFundo = barraFundo;
      novo_lost_soul.grupoBarras = group;
      novo_lost_soul.tamBarraVida = larguraBarra;
      lost_soulvetE.push(novo_lost_soul);
       InimigosArea5.push(novo_lost_soul);
        novo_lost_soul.acordar();
      acordados++;
      lancaMisseis.numInimigos =  lancaMisseis.numInimigos+1;
      return novo_lost_soul;
   }
}
var cacodemons_Area5 = [];
var carregou_cac_Area5 = false;

var cac_Area5_acordados= false;
function carregar_cac_Area5() {
   for (var i = 0; i < 4; i++) {
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

      let nome = 'cacodemonE';
      var obj_cacodemon = assetManagerCacodemon[nome + (i + 1).toString()];
      obj_cacodemon.castShadow = true;
      obj_cacodemon.receiveShadow = true;

      group.position.copy(obj.position).add(new THREE.Vector3(0, 1.2, 0));

      barraVida.position.z = 0.01;
      if( i ===0)
      {
   obj_cacodemon.position.set(91, 40, 90);
      }
      if( i===1)
      {
   obj_cacodemon.position.set(90, 40, -89);
      }
      if( i===2)
      {
   obj_cacodemon.position.set(210,40, -90);
      }
      if( i ===3)
      {
   obj_cacodemon.position.set(210, 40, 90);
      }
      
      let arma_cac = new LancaMisseis(obj_cacodemon, [personagem], false);
      let novo_cac = new Cacodemon(obj_cacodemon, camera, new THREE.Box3(), 0.6, 5, arma_cac, personagem);
      novo_cac.barraFrente = barraVida;
      novo_cac.barraFundo = barraFundo;
      novo_cac.grupoBarras = group;
      novo_cac.tamBarraVida = larguraBarra;
      console.log(novo_cac);
      cacodemons_Area5.push(novo_cac);
      InimigosArea5.push(novo_cac);


   }
   lancaMisseis.numInimigos = lancaMisseis.numInimigos +3;
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
      //console.log(nome + (i + 1).toString());
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


var inimigos_atual = [];

var lancaMisseis = new LancaMisseis(camera, inimigos_atual, true);

var metralhadora = new Metralhadora(camera, scene, inimigos_atual);

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
// --- Audio setup (corrigido) ---
var firstClick = true;      // <-- declarado corretamente
let bgReady = false;        // indica quando o buffer está carregado

const backgroundMusic = new THREE.Audio(listener);
let audioLoader = new THREE.AudioLoader();

// Carrega o áudio
audioLoader.load('../0_assetsT3/sounds/doom.mp3',
  function(buffer) { // onLoad
    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setLoop(true);
    backgroundMusic.setVolume(0.4);
    bgReady = true;
    // Se o usuário já interagiu (click ocorreu antes do load), pode começar agora
    if (!firstClick) {
      backgroundMusic.play();
    }
  },
  undefined, // onProgress (opcional)
  function(err) { // onError
    console.error('Erro ao carregar audio doom.mp3:', err);
  }
);

// NÃO chame backgroundMusic.play() imediatamente aqui (autoplay bloqueado)
// let musicOn = true; // variáveis de estado (define depois)
let musicOn = true;

// Click (ou outro gesto) autoriza o áudio no navegador
window.addEventListener('click', function () {
  let startMessage = document.getElementById('start-message');
  if (startMessage) startMessage.style.display = 'none';

  if (firstClick) {
    firstClick = false;
    // Se o buffer já estiver pronto, toca; caso contrário, o callback do loader fará tocar.
    if (bgReady) {
      backgroundMusic.play();
    } else {
      // opcional: mostra loading visual até bgReady ficar true
      console.log('Áudio ainda carregando — vai iniciar assim que pronto.');
    }
  }
});

// Atalho para ligar/desligar com Q (mantém seu comportamento)
window.addEventListener('keydown', function(event) {
  if(event.code === 'KeyQ') {
    if(musicOn) {
      console.log("musika");
      backgroundMusic.pause();
      musicOn = false;
    } else {
      backgroundMusic.play();
      // só tenta tocar se buffer pronto
      musicOn = true;
    }
  }
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
      case 71:
         if (value) {
            personagem.levaDano = !personagem.levaDano;
            personagem.grupoBarras.visible = !personagem.grupoBarras.visible;
         }
         break;
         case 67:
         if (!possui_todas_as_chaves) {
            const msg = document.getElementById('mensagemChaves');
            msg.style.display = 'block';
            personagem.possui_chave1=true;
            personagem.possui_chave2=true;
            personagem.possui_chave3=true;
            possui_todas_as_chaves=true;
         }
         break;

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
   if (key == 16) {
      console.log("Shift");
      if (value) {
         personagem.speed = 2 * personagem.speedBase;
         personagem.speedPadrao = 2 * personagem.speedBase;
      }
      else {
         personagem.speed = personagem.speedBase;
         personagem.speedPadrao = personagem.speedBase;
      }
   }
}

//var materialCubo = setDefaultMaterial("rgb(43, 175, 114)"); // create a basic material 







function estabeleceBoundingBoxes() {
   for (var i = 0; i < 4; i++) {

      for (var j = 0; j < 3; j++) {

         if (i == 2)
            areas[i].boundingCubos.push(new THREE.Box3().setFromObject(areas[i].cubos2[j]));
         else
            areas[i].boundingCubos.push(new THREE.Box3().setFromObject(areas[i].cubos[j]));
         if (i != 1 && i != 2) {
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
                  //////console.log(areas[i].boundingDegraus[k]);
                  const helper = new THREE.Box3Helper(areas[i].boundingDegraus[k], 0xffff00); // Amarelo
                  // scene.add(helper);
               }
            }
            areas[i].boundingRampa = new THREE.Box3().setFromObject(areas[i].degraus[1].rampa);
         }

      }

      //const helper = new THREE.Box3Helper(areas[i].boundingRampa, 0xff0000); // Cor vermelha
      //scene.add(helper);
      fronteira.push(new THREE.Box3().setFromObject(fronteira[i]));


   }

   
   areas[3].box_extras_area4();
   for (let i = 0; i < areas[3].muralhas.length; i++) {
      areas[3].muralhas[i].box = new THREE.Box3().setFromObject(areas[3].muralhas[i].mesh);
   }
   for (let i = 0; i < areas[3].pontes_box.length; i++) {
      areas[3].pontes_box[i] = new THREE.Box3().setFromObject(areas[3].pontes[i]);
   }
   for (let i = 0; i < areas[3].paredes_janelas_box.length; i++) {
      areas[3].paredes_janelas_box[i] = new THREE.Box3().setFromObject(areas[3].paredes_janelas[i]);
   }
   for (let i = 0; i < areas[3].torres_box.length; i++) {
      areas[3].torres_box[i] = new THREE.Box3().setFromObject(areas[3].torres[i]);
   }
   areas[3].fechadura.box = new THREE.Box3().setFromObject(areas[3].fechadura.mesh);
   areas[3].plataformas[0].box = new THREE.Box3().setFromObject(areas[3].plataformas[0].mesh);
   areas[3].plataformas[1].box = new THREE.Box3().setFromObject(areas[3].plataformas[1].mesh);
   const helper23 = new THREE.Box3Helper(areas[3].plataformas[0].box, 0xffff00); // Amarelo
   scene.add(helper23);
   const helper27 = new THREE.Box3Helper(areas[3].plataformas[1].box, 0xffff00); // Amarelo
   scene.add(helper27);

   areas[2].tetoOvalBox=new THREE.Box3().setFromObject(areas[2].tetoOval);
   areas[2].plat_chave_box = new THREE.Box3().setFromObject(areas[2].plat_chave);
   areas[2].posicionar_chave3();
   areas[2].elevador_bloco = new ElevacaoBloco(areas[2].plat_chave, areas[2].plat_chave_box, -areas[2].altura_geral / 2 - 1.5, -areas[2].altura_geral / 2 + 1, 240);

   areas[2].porta1.box = new THREE.Box3().setFromObject(areas[2].porta1.mesh);
   areas[2].porta2.box = new THREE.Box3().setFromObject(areas[2].porta2.mesh);
   const helper22 = new THREE.Box3Helper(areas[2].porta1.box, 0xffff00); // Amarelo
   scene.add(helper22);
   areas[2].fachadaOvalbox1 = new THREE.Box3().setFromObject(areas[2].fachadaOval1);

   areas[2].fachadaOvalbox2 = new THREE.Box3().setFromObject(areas[2].fachadaOval2);
   areas[2].tetoOvalBox = new THREE.Box3().setFromObject(areas[2].tetoOval);


   areas[2].boundingCube4 = new THREE.Box3().setFromObject(areas[2].cube4);
   areas[2].boundingCube5 = new THREE.Box3().setFromObject(areas[2].cube5);

   areas[2].bounding_caixa_bloqueio = new THREE.Box3().setFromObject(areas[2].caixa_bloqueio);
   const helper42 = new THREE.Box3Helper(areas[2].bounding_caixa_bloqueio, 0xffff00);
   scene.add(helper42);


   for (var i = 0; i < areas[1].num_blocos_extras; i++) {
      areas[1].boundingBlocosExtras.push(new THREE.Box3().setFromObject(areas[1].blocosExtras[i]));
   }
   areas[1].porta.box = new THREE.Box3().setFromObject(areas[1].porta.mesh);
   const helper2 = new THREE.Box3Helper(areas[1].porta.box, 0xffff00); // Amarelo
   areas[1].fechadura.box = new THREE.Box3().setFromObject(areas[1].fechadura.mesh);
   const helper3 = new THREE.Box3Helper(areas[1].fechadura.box, 0xffff00); // Amarelo
   areas[1].plataforma.box = new THREE.Box3().setFromObject(areas[1].plataforma.mesh);
   const helper4 = new THREE.Box3Helper(areas[1].plataforma.box, 0xffff00); // Amarelo
   //  scene.add(helper2);
   //   scene.add(helper3);
   // scene.add(helper4);

   for (let i = -33.6; i <= 33.6; i = i + 11.2)// parede direita
   {
      let vetorteste2 = new THREE.Vector3(i, 5, -49.6);
      areas[0].criaPilar(vetorteste2);
      //area1.pilares.push(pilar);
      //criarBoundingBox(pilar);
      //criarBoundingBox(pilar);
   }
   for (let i = -33.6; i <= 33.6; i = i + 11.2)// parede esqureda
   {
      let vetorteste3 = new THREE.Vector3(i, 5, 49.6);
      areas[0].criaPilar(vetorteste3);
      //area1.pilares.push(pilar);
      //criarBoundingBox(pilar);
   }
   for (let i = 49.6; i >= -49.6; i = i - 11.2)// parede tras
   {
      let vetorteste3 = new THREE.Vector3(-33.6, 5, i);
      areas[0].criaPilar(vetorteste3);
      //area1.pilares.push(pilar);
      ///criarBoundingBox(pilar);
   }
   for (let i = 49.6; i >= 0; i = i - 11.2)// parede escada esquerda
   {
      let vetorteste3 = new THREE.Vector3(33.6, 5, i);
      areas[0].criaPilar(vetorteste3);
      //area1.pilares.push(pilar);
      //criarBoundingBox(pilar);
   }
   for (let i = -49.6; i <= 0; i = i + 11.2)// parede escada direita
   {
      let vetorteste3 = new THREE.Vector3(33.6, 5, i);
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
            //console.log(box);
            areas[0].boundingBoxesPilares.push(box);
            //console.log(areas[0].boundingBoxesPilares);
            const helper4 = new THREE.Box3Helper(areas[0].boundingBoxesPilares[i], 0xffff00); // Amarelo
            //  scene.add(helper4);

         }
      }
   }
   let vetorPedra1 = new THREE.Vector3(0.2,9,-49.6);
   areas[0].criarPedra(vetorPedra1,26,3);
   let vetorPedra2 = new THREE.Vector3(-22.07,9,49.6);
   areas[0].criarPedra(vetorPedra2,26,3);
   let vetorPedra3 = new THREE.Vector3(-33.6,9,30.6);
   areas[0].criarPedra(vetorPedra3,3,35);
   let vetorPedra4 = new THREE.Vector3(33.6,9,-21.5);
   areas[0].criarPedra(vetorPedra4,3,38);
    if (areas[0].pedras && areas[0].pedras.length > 0) {// cria bounding box para as pedras dos pilares
      console.log('Entrou pedras');
      for (var i = 0; i < areas[0].pedras.length; i++) {

         const pedra = areas[0].pedras[i];

         // Verifique se o pilar e sua malha existem
         if (pedra) {
            const box = new THREE.Box3().setFromObject(pedra);
       //     console.log(box);
            areas[0].BoundingBoxpedras.push(box);
         //   console.log(areas[0].boundingBoxesPilares);
            const helper4 = new THREE.Box3Helper(areas[0].BoundingBoxpedras[i], 0xffff00); // Amarelo
         //   scene.add(helper4);

         }
      }
   }
   areas[0].subir_Plataforma();
   const plat = areas[0].plat;
   const boxPlat = new THREE.Box3().setFromObject(plat);
   boxPlat.translate(new THREE.Vector3(0, 3, 0)); // sobe +2 no Y
   areas[0].boundingBoxplat = boxPlat;
   let helper5 = new THREE.Box3Helper(areas[0].boundingBoxplat, 0xffff00); // Amarelo
   // scene.add(helper5);



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
   //////console.log(controle.pointerSpeed);
});
window.addEventListener('mouseup', (event) => {
   verdade = false;
});

let contadorMudancaLuz = 0;

let mudancaLuz = true;

let pode = false;
let entrou = false;

var Lost_soul_morreram = false;

var criou_elevar = false;

let elevacaoBloco = null;


// Create the cube
let loader = new THREE.TextureLoader();
let geometry = new THREE.BoxGeometry(10, 5, 5);
let cubeMaterials = [
   setMaterial('./texturas_geral/area2/seamless-metal-cargo-box-texture-optimized.webp', 2, 2), //x+
   setMaterial('./texturas_geral/area2/seamless-metal-cargo-box-texture-optimized.webp', 1, 1, 'orange'), //x-   Texture + color
   setMaterial('./texturas_geral/area2/seamless-metal-cargo-box-texture-optimized.webp', 2, 1), //y+
   new THREE.MeshBasicMaterial({ color: 'rgb(0,200,100)' }), //y-  Just a color
   setMaterial('./texturas_geral/area2/seamless-metal-cargo-box-texture-optimized.webp', 2, 1), //z+
   setMaterial('./texturas_geral/area2/seamless-metal-cargo-box-texture-optimized.webp', 2, 1) //z-
];
let cube = new THREE.Mesh(geometry, cubeMaterials);

cube.scale.set(10, 10, 10);
scene.add(cube);

cube.position.set(100, 100, 100);
// To access textures individually, you should use their indexes
//console.log(cube.material[0].map)

function setMaterial(file, repeatU = 1, repeatV = 1, color = 'rgb(255,255,255)') {
   let mat = new THREE.MeshBasicMaterial({ map: loader.load(file), color: color });
   mat.map.colorSpace = THREE.SRGBColorSpace;
   mat.map.wrapS = mat.map.wrapT = THREE.RepeatWrapping;
   mat.map.minFilter = mat.map.magFilter = THREE.LinearFilter;
   mat.map.repeat.set(repeatU, repeatV);
   return mat;
}


let soldados = [];
let soldados_derrotados = [];
for (let i = 0; i < 8; i++) {
   let soldado = new Soldado(null, camera, new THREE.Box3(), 0.6, 2, null, personagem, scene);

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
   barraVida.position.z = 0.05;

   const group = new THREE.Group();

   group.add(barraFundo);
   group.add(barraVida);
   group.visible = false;
   scene.add(group);
   group.position.add(new THREE.Vector3(0, 1.2, 0));

   barraVida.position.z = 0.01;

   soldado.barraFrente = barraVida;
   soldado.barraFundo = barraFundo;
   soldado.grupoBarras = group;
   soldado.tamBarraVida = larguraBarra;

   soldados.push(soldado);

}

let sold_acordados = false;
/*
personagem.obj.position.set(areas[3].cube0.position.x + 5, areas[3].cube0.position.y + 4.2, areas[3].cube0.position.z);
personagem.area = 3;
personagem.grandeArea = 4;
areas[3].muralhas[0].abrindo = true;
*/

let losts_adicionados = false;
let cacs_adicionados = false;
let soldados_adicionados = false;
var Elemental_Soul_morreu = false; // verifica se o Elemental Soul morreu
let teste = true;

personagem.gerarBarraDeVida();
render();


function render() {
   if (apagar_luzes) {
      findar_luz();
      return;
   }
   if(personagem.simulacao_finalizada)
      return;
  // console.log(possui_todas_as_chaves);
   if(possui_todas_as_chaves && tempo_exibindo>=0){
      tempo_exibindo--;
     // console.log(tempo_exibindo)
      if(tempo_exibindo==0){
      //   console.log("none");
         const msg = document.getElementById('mensagemChaves');
            msg.style.display = 'none';
      }


   }

   areas[2].troca_de_luz(dirLight, fillLight, personagem);

   if (mudancaLuz) {
      contadorMudancaLuz++;
      if (contadorMudancaLuz == 2) {
         mudanca_luz();
         ////console.log("mudou");
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
      //console.log("CarregouLost");
      carregar_lost_Soul();
      carregou_vetor_lost = true;
   }
///Elemental
      assetManagerElemental.checkLoaded(); // verifica se o Elemental e seus Lost carregaram
   if (!carregouElemental && assetManagerElemental.allLoaded) {
      console.log("CarregouElemental");
      carregar_Elemental();
    
      carregouElemental = true;
   }

    //Cacos area4
      assetManagerCacodemon.checkLoaded(); // verifica se o Elemental e seus Lost carregaram
   if (!carregou_cac_Area5 && assetManagerCacodemon.allLoaded) {
      console.log("CarregouElemental");
     carregar_cac_Area5();
      carregou_cac_Area5 = true;
   }
   // fps.update(0.016);

   if (controle.isLocked) {
      areas[2].posiciona_inimigos(soldados);
      if (mudar_arma)
         personagem.mudar_arma();
      if (tecla_arma1)
         personagem.mudar_arma(1);
      else if (tecla_arma2)
         personagem.mudar_arma(2);
      mudar_arma = false;

      let delta = clock.getDelta();
      delta = Math.min(delta, 0.05);



      personagem.movimento(areas, fronteira, groundPlane, delta, moveForward, moveBackward, moveRight, moveLeft, moveUp, reset, scene, moveDown);
      let derrotados2 = null;
      if (personagem.num_arma_atual == 1)
         personagem.arma_atual.atirar(scene, camera, verdade);
      else
         derrotados2 = personagem.arma_atual.atirar(scene, areas, fronteira, camera, verdade);
      stats.update();
      let armasNovosDerrotados = lancaMisseis.controle_projeteis(scene, areas, fronteira);

      if (personagem.chegada_area3 && !personagem.chegada_area4) {

         if (!sold_acordados) {
            for (var i = 0; i < soldados.length; i++) {

               console.log("acordou");
               soldados[i].acordar();

            }
            lancaMisseis.inimigos = lancaMisseis.inimigos.concat(soldados);
            metralhadora.inimigos = lancaMisseis.inimigos;
            sold_acordados = true;
         }
         for (var i = 0; i < soldados.length; i++) {

            soldados[i].movimento(areas, fronteira, groundPlane, delta, moveUp, reset, scene);
         }
         if (armasNovosDerrotados.length != 0) {
            for (let cont = 0; cont < armasNovosDerrotados.length; cont++) {
               if (armasNovosDerrotados[cont].tipo == 'soldado')
                  soldados_derrotados.push(armasNovosDerrotados[cont]);
            }
         }
         if (derrotados2 != null && derrotados2.tipo == "soldado")
            soldados_derrotados.push(derrotados2);
         for (var i = 0; i < soldados_derrotados.length; i++) {
            soldados_derrotados[i].sumir(areas, delta);
            if (soldados_derrotados[i].sumiu) {
               ////console.log("AAA");

            }
         }
      }

      if (personagem.chegada_area2 && !personagem.chegada_area4) {
         
         if (!cac_acordados) {
            for (var i = 0; i < cacodemons.length; i++) {
               cacodemons[i].acordar();

            }
            lancaMisseis.inimigos = lancaMisseis.inimigos.concat(cacodemons);
            metralhadora.inimigos = lancaMisseis.inimigos;
            cac_acordados = true;
         }

         if (armasNovosDerrotados.length != 0) {
            for (let cont = 0; cont < armasNovosDerrotados.length; cont++) {
               if (armasNovosDerrotados[cont].tipo == 'cacodemon')
                  cacodemons_derrotados.push(armasNovosDerrotados[cont]);
            }
         }
         if (derrotados2 != null && derrotados2.tipo == "cacodemon")
            cacodemons_derrotados.push(derrotados2);
         for (var i = 0; i < cacodemons.length; i++) {
            if (cacodemons[i].vida <= 0) {
               cacodemons.splice(i, 1);
               i--;
               continue;
            }


            cacodemons[i].movimento(areas, fronteira, groundPlane, delta, false, false, scene);
            cacodemons[i].arma.controle_projeteis(scene, areas, fronteira);

         }
         for (var i = 0; i < cacodemons_derrotados.length; i++) {
            cacodemons_derrotados[i].arma.controle_projeteis(scene, areas, fronteira);
            cacodemons_derrotados[i].sumir();
            if (cacodemons_derrotados[i].sumiu) {
               ////console.log("AAA");
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
            // ////console.log(this.obj.position.y);
         }
      }
      if (personagem.chegada_area1&& !personagem.chegada_area4) {
         if (!lost_soul_acordados) {
            for (var i = 0; i < lost_soulvet.length; i++) {
               lost_soul_acordados = true;
               lost_soulvet[i].acordar();


            }
            lost_soul_acordados= true;
            lancaMisseis.inimigos = lancaMisseis.inimigos.concat(lost_soulvet);
            metralhadora.inimigos = lancaMisseis.inimigos;
         }

         if (armasNovosDerrotados.length != 0) {
            for (let cont = 0; cont < armasNovosDerrotados.length; cont++) {
               if (armasNovosDerrotados[cont].tipo == 'lost_soul')
                  lost_soul_derrotados.push(armasNovosDerrotados[cont]);
            }
         }
         if (derrotados2 != null && derrotados2.tipo == "lost_soul")
            lost_soul_derrotados.push(derrotados2);
         for (var i = 0; i < lost_soulvet.length; i++) {
            if (lost_soulvet[i].vida <= 0) {
               lost_soulvet.splice(i, 1);
               i--;
               continue;
            }


            lost_soulvet[i].movimento(areas, fronteira, groundPlane, delta, false, false, scene);
         }
         for (var i = 0; i < lost_soul_derrotados.length; i++) {

            lost_soul_derrotados[i].sumir();
            if (lost_soul_derrotados[i].sumiu) {
               //console.log("AAA");
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

               //lancaMisseis.inimigos = cacodemons;
               //metralhadora.inimigos = cacodemons;
               //lancaMisseis.inimigos = cacodemons;
               lancaMisseis.type = 2;
               armasNovosDerrotados = [];
               Lost_soul_morreram = true;
               //areas[0].subir_Plataforma();
               pode = true;


            }
            // //console.log(this.obj.position.y);
         }

      }
      if (pode) {
         personagem.pegou = true;
         if (!criou_elevar) {
            criou_elevar = true;
            areas[0].plat;
            areas[0].boundingBoxplat.setFromObject(areas[0].plat);
            elevacaoBloco = new ElevacaoBloco(areas[0].plat, areas[0].boundingBoxplat, -3.2, 2.5, 240);

            elevacaoBloco.elevar_bloco = true;

         }
         if (elevacaoBloco.elevar_bloco == false && personagem.possui_chave1 && !areas[0].chaveRem) {
            areas[0].plat.remove(areas[0].chave);
            areas[0].chave1 = null;
            areas[0].chaveRem = true;
            //console.log("aaa");
         }

         elevacaoBloco.fazer_elevar_bloco();





      }
       if(personagem.chegada_area4)
      {
         console.log("entrou");
            lancaMisseis.inimigos = InimigosArea5;
               metralhadora.inimigos = InimigosArea5;
         if (!ElementalAcordado) {
             Elementalvet[0].acordar();
            ElementalAcordado = true;
            
         }
          Elementalvet[0].movimento(areas, fronteira, groundPlane, delta, false, false, scene);
           if(!cac_Area5_acordados)
         {
            console.log('acordou Caco');
            console.log(cacodemons_Area5);
            for(var i =0;i<cacodemons_Area5.length;i++)
            {
               console.log('Entrou no for')
             cacodemons_Area5[i].acordar();
            }
            cac_Area5_acordados = true;
         }
          for (var i = 0; i < cacodemons_Area5.length; i++) {

            cacodemons_Area5[i].movimento(areas, fronteira, groundPlane, delta, false, false, scene);
              cacodemons_Area5[i].arma.controle_projeteis(scene, areas, fronteira);
         }
         if (lost_soulvetE.length > 0) {
  // Movimentar cada Lost Soul no vetor
  for (var i = 0; i < lost_soulvetE.length; i++) {
    if (lost_soulvetE[i]) {
      // Fazer o movimento
      lost_soulvetE[i].movimento(areas, fronteira, groundPlane, delta, false, false, scene);
      
    
    }
  }
}
         
         if (armasNovosDerrotados.length != 0)
            Area5Derrotados = Area5Derrotados.concat(armasNovosDerrotados);
         if (derrotados2 != null)
            Area5Derrotados.push(derrotados2);
        
         for (var i = 0; i < Area5Derrotados.length; i++) {

            Area5Derrotados[i].sumir();
            if (Area5Derrotados[i].sumiu) {
               console.log("AAA");
               scene.remove(Area5Derrotados[i].obj);
               scene.remove(Area5Derrotados[i].grupoBarras);
            }
            if (Area5Derrotados[i].sumiu)
               Area5Derrotados.splice(i, 1);
         }
         if (InimigosArea5.length == 0) {


            //    if(!areas[0].bloco_elevado && !areas[0].elevar_bloco)
            //      areas[0].elevar_bloco=true;
            //  if(areas[0].elevar_bloco)
            //      areas[0].fazer_elevar_bloco();
            if (Area5Derrotados == 0 && !inimigosArea5Morreram) {

           
               //lancaMisseis.inimigos = cacodemons;
               lancaMisseis.type = 2;
               armasNovosDerrotados = [];
               inimigosArea5Morreram = true;
               //areas[0].subir_Plataforma();
              


            }
         
      }
   }
      if (personagem.chegada_area4 && lancaMisseis.inimigos.length==0 && !areas[3].porta.abrindo && !areas[3].porta.aberta){
         console.log("Abrir!");
         areas[3].porta.abrindo=true;
      }

      if (areas[3].porta.abrindo) {
          console.log("Abrindo!");
         areas[3].abrir_porta(6.6, 1);

      }

      if (areas[1].porta.abrindo && areas[1].chave1 == null) {
         let chave = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({ color: "rgb(95,40,180)" }));
         areas[1].posicionar_chave1(chave);
      }

      if (areas[3].muralhas[0].abrindo && areas[3].chave3 == null) {

         areas[3].posicionar_chave3(null);
      }

      
      
      //Elemental
      /*
      if(assetManagerElemental.allLoaded && assetManagerCacodemon.allLoaded) // acorda elemental para ele aparecer
      {
         if(!ElementalAcordado)
         {
         console.log('acordou');
         Elementalvet[0].acordar();
         ElementalAcordado=true;
         }
          Elementalvet[0].movimento(areas, fronteira, groundPlane, delta, false, false, scene);
         if(!cac_Area5_acordados)
         {
            console.log('acordou Caco');
            console.log(cacodemons_Area5);
            for(var i =0;i<cacodemons_Area5.length;i++)
            {
               console.log('Entrou no for')
             cacodemons_Area5[i].acordar();
            }
            cac_Area5_acordados = true;
         }
          for (var i = 0; i < cacodemons_Area5.length; i++) {

            cacodemons_Area5[i].movimento(areas, fronteira, groundPlane, delta, false, false, scene);
              cacodemons_Area5[i].arma.controle_projeteis(scene, areas, fronteira);
         }
         if (lost_soulvetE.length > 0) {
  // Movimentar cada Lost Soul no vetor
  for (var i = 0; i < lost_soulvetE.length; i++) {
    if (lost_soulvetE[i]) {
      // Fazer o movimento
      lost_soulvetE[i].movimento(areas, fronteira, groundPlane, delta, false, false, scene);
      
      // Não atualizamos o grupo de barras aqui, conforme solicitado
    }
  }
}
      }*/
   } 
   //////console.log(verdade);
   //////console.log(groundPlane);


   renderer.render(scene, camera) // Render scene
   requestAnimationFrame(render);
   if (!inicializadasBoxes) {
      estabeleceBoundingBoxes();

      inicializadasBoxes = true;
   }
   areas[2].elevador_bloco.fazer_elevar_bloco();
   areas[2].posicionar_aviao();
   areas[3].posicionar_objetos();
   //console.log(lancaMisseis.inimigos);
}
export {carregar_lost_SoulE,carregar_lost_SoulE2};