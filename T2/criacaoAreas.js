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
import {Area2} from './area2.js'


let scene = new THREE.Scene(); // Create main scene



//var materialCubo = setDefaultMaterial("rgb(43, 175, 114)"); // create a basic material 
var materialCubo1 = setDefaultMaterial("rgb(47, 235, 9)"); // cria o material dos cubos da área 1
var materialCubo2 = setDefaultMaterial("rgb(185, 51, 27)"); // cria o material dos cubos da área 2
var materialCubo3 = setDefaultMaterial("rgb(12, 26, 92)"); // cria o material dos cubos da área 3
var materialCubo4 = setDefaultMaterial("rgb(221, 158, 22)"); // cria o material dos cubos da área 4



var materiais_cubos=[
 setDefaultMaterial("rgb(47, 235, 9)") // cria o material dos cubos da área 1
,setDefaultMaterial("rgb(185, 51, 27)") // cria o material dos cubos da área 2
, setDefaultMaterial("rgb(12, 26, 92)") // cria o material dos cubos da área 3
, setDefaultMaterial("rgb(221, 158, 22)") // cria o material dos cubos da área 4
];


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




var area1 = {
   //Cubos:
   cube0: new THREE.Mesh(cubeGeo0, materialCubo1), //Cubo central-pai.
   // Cubos que compõem o cenário
   cube1: new THREE.Mesh(cubeGeo1, materialCubo1),
   cube2: new THREE.Mesh(cubeGeo2, materialCubo1),
   cube3: new THREE.Mesh(cubeGeo3, materialCubo1),

   // Vetor das escadas, retorno de fução que retorna diversos elementos da escadaria( Ver mais na função): Vetor de objetos dos degraus, rampa para fazer subida e inclinação: 
   degraus: criar_degraus(new THREE.Vector3(-65.5, 0, -150), 4, 5, 2, 8, 90, materialCubo2),
   posicao_ini: new THREE.Vector3(-100, 2, -150), // Posição inicial do cubo central(núcleo) da área
   cubos: [], // Vetor dos cubos que compõem o cenário
   boundingCubos: [], // Vetor das boundigBoxes dos cubos acima
   boundingRampa: null, // boundingBox da rampa da escada
   boundingDegraus: [], // Vetor com a boudingBox dos degraus
   ex: 35, // Extensão da área em relação a seu centro no eixo x( Metade do comprimento do lado em x do paralelepípedo)
   ez: 51 // Extensão da área em relação a seu centro no eixo z( Metade do comprimento do lado em z do paralelepípedo)
}
area1.cubos = [area1.cube1, area1.cube2, area1.cube3];
var area2 = new Area2([cubeGeo0,cubeGeo1,cubeGeo2,cubeGeo3],[materialCubo1,materialCubo2]);
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

// Função que cria a escada ( Posição inicial da escada, em relação à base, altura total da escada, comprimento total, largua total, número de degraus, rotação em relação à cena( Graus),
// material dos degraus)


function testeGrandesAreas(objeto, areaAnalisada) {
   let rednFech=false;
   if (areaAnalisada == -1) {
      if (Math.abs(objeto.position.x) >= 245 || Math.abs(objeto.position.z) >= 245)
         areaAnalisada = 0;
      else {
         let posicao_ini, ex, ez;
         let pos_fechadura_a2=new THREE.Vector3(areas[1].fechadura.mesh.position.x,areas[1].fechadura.mesh.position.y,areas[1].fechadura.mesh.position.z);
         pos_fechadura_a2.addVectors(pos_fechadura_a2,areas[1].posicao_ini);
         rednFech = (objeto.position.x <= pos_fechadura_a2.x+3 && objeto.position.x >= pos_fechadura_a2.x-3 && objeto.position.z <= pos_fechadura_a2.z+3 && objeto.position.z >= pos_fechadura_a2.z-3);
         
         for (var i = 0; i < 4; i++) {
            posicao_ini = areas[i].posicao_ini;
            ex = areas[i].ex;
            ez = areas[i].ez;
            if (objeto.position.x >= posicao_ini.x - ex - 4 && objeto.position.x <= posicao_ini.x + ex + 4 && objeto.position.z >= posicao_ini.z - ez - 4 && objeto.position.z <= posicao_ini.z + ez + 4) {
               areaAnalisada = i + 1;
               break;
            }

         }
      }
   }
   else {
      if (areaAnalisada == 0) {
         if (Math.abs(objeto.position.x) < 245 && Math.abs(objeto.position.z) < 245)
            areaAnalisada = -1;
      }
      else {
         if(areaAnalisada==2){
            let pos_fechadura_a2=new THREE.Vector3(areas[1].fechadura.mesh.position.x,areas[1].fechadura.mesh.position.y,areas[1].fechadura.mesh.position.z);
            pos_fechadura_a2.addVectors(pos_fechadura_a2,areas[1].posicao_ini);
            rednFech = objeto.position.x <= pos_fechadura_a2.x+3 && objeto.position.x >= pos_fechadura_a2.x-3 && objeto.position.z <= pos_fechadura_a2.z+3 && objeto.position.z >= pos_fechadura_a2.z-3;
         }
         let posicao_ini = areas[areaAnalisada - 1].posicao_ini, ex = areas[areaAnalisada - 1].ex, ez = areas[areaAnalisada - 1].ez;
         if (objeto.position.x < posicao_ini.x - ex - 4 || objeto.position.x > posicao_ini.x + ex + 4 || objeto.position.z < posicao_ini.z - ez - 4 || objeto.position.z > posicao_ini.z + ez + 4) {
            areaAnalisada = -1;
         }

      }

   }
   return [areaAnalisada,rednFech];
}






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


export{ areas, testeGrandesAreas,scene };