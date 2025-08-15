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
import { BoxGeometry } from '../build/three.module.js';

var eixo_x = new THREE.Vector3(1, 0, 0);
var eixo_y = new THREE.Vector3(0, 1, 0);
var eixo_z = new THREE.Vector3(0, 0, 1);

var x_y = (new THREE.Vector3()).addVectors(eixo_x, eixo_y).normalize();

var x_z = (new THREE.Vector3()).addVectors(eixo_x, eixo_z).normalize();

var y_z = (new THREE.Vector3()).addVectors(eixo_y, eixo_z).normalize();

function verifica_colisoes_com_blocos(objeto, largura_x, altura, largura_z, vetorMovimento, BoxObjetoATestar, speed, delta, contarSubida = false) {
   let intsc = "";
   let colisao = false;

   let vetor_eixos = null;
   let intersec = [false, false, false];
   let cont = 0;
   if (contarSubida)
      vetor_eixos = ["x", "y", "z"];
   else
      vetor_eixos = ["x", "z"];
   // Dimensões do objeto a ser testado
   const boxSize = new THREE.Vector3();
   BoxObjetoATestar.getSize(boxSize);
   const maxMoveTest = Math.min(boxSize.x, boxSize.y, boxSize.z) * 0.5; // metade da menor dimensão

   const minDim = 0.5;
const size = new THREE.Vector3();
BoxObjetoATestar.getSize(size);

// Aplica o limite mínimo
size.x = Math.max(size.x, minDim);
size.y = Math.max(size.y, minDim);
size.z = Math.max(size.z, minDim);

// Se quiser criar uma nova box com esse tamanho e o mesmo centro:
const center = new THREE.Vector3();
BoxObjetoATestar.getCenter(center);

const newBox = new THREE.Box3().setFromCenterAndSize(center, size);

   let fator = 1;
   vetor_eixos.forEach(eixo => {
      // Calcula deslocamento-teste proporcional ao objeto testado
      let deslocamento = 5* speed * delta * vetorMovimento[eixo];
      if (Math.abs(deslocamento) > maxMoveTest) {
         deslocamento =  maxMoveTest;
         fator=0.25;
      }

      objeto.position[eixo] += deslocamento;

      let boxObjeto = new THREE.Box3().setFromCenterAndSize(
         new THREE.Vector3(objeto.position.x, objeto.position.y - altura / 2, objeto.position.z),
         new THREE.Vector3(largura_x, altura, largura_z)
      );

      if (boxObjeto.intersectsBox(newBox)) {
         intersec[cont] = true;
         colisao = true;
      }

      objeto.position[eixo] -= deslocamento;

      if (contarSubida) cont++;
      else cont += 2;
   });

   if (colisao) {
      vetorMovimento.normalize(); // Normaliza para fazer verificações corretamente
       // Fator a se multiplicar( Norma da projeção, que é o produto escalar padrão para projeção em vetores de norma 1, como os dos eixos)
      //console.log(intsc);
      if (intersec[0]) {
         fator *= Math.sqrt((vetorMovimento.dot(eixo_y)) ** 2 + (vetorMovimento.dot(eixo_z)) ** 2); // Projeta em z
         vetorMovimento["x"] = 0;
      }
      else if (intersec[2]) {
         fator *= Math.sqrt((vetorMovimento.dot(eixo_x)) ** 2 + (vetorMovimento.dot(eixo_y)) ** 2); // Projeta em x
         vetorMovimento["z"] = 0;
      }
      else if (intersec[1] && !intersec[0]) {
         fator *= Math.sqrt((vetorMovimento.dot(eixo_x)) ** 2 + (vetorMovimento.dot(eixo_z)) ** 2);
         vetorMovimento["y"] = 0;
      }


      //console.log(fator);
      speed = Math.abs(fator) * speed;
      //console.log(moveDir);
   }
   return [speed, colisao];
}

export { verifica_colisoes_com_blocos };