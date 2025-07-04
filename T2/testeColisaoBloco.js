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

function verifica_colisoes_com_blocos(objeto,largura_x,altura,largura_z,vetorMovimento,BoxObjetoATestar,speed){
   let intsc = "";
   let colisao=false;
            ["x", "z"].forEach(eixo => {
               objeto.position[eixo] += vetorMovimento[eixo]; // TEsta

               let boxObjeto = new THREE.Box3().setFromCenterAndSize(
                  new THREE.Vector3(objeto.position.x, objeto.position.y - altura/2, objeto.position.z),
                  new THREE.Vector3(largura_x, altura, largura_z) // largura, altura, profundidade desejadas
               );

               if (boxObjeto.intersectsBox(BoxObjetoATestar)) {

                  intsc = eixo; // Eixo intersectado
                  colisao=true;

               }
               objeto.position[eixo] -= vetorMovimento[eixo]; // Tira movimento-teste
            });

            if (colisao) {
               vetorMovimento.normalize(); // Normaliza para fazer verificações corretamente

               let fator = 1; // Fator a se multiplicar( Norma da projeção, que é o produto escalar padrão para projeção em vetores de norma 1, como os dos eixos)
               //console.log(intsc);
               if (intsc === "x") {
                  fator = vetorMovimento.dot(eixo_z); // Projeta em z
               }
               else {
                  fator = vetorMovimento.dot(eixo_x); // Projeta em x
               }
               //console.log(fator);
               speed = Math.abs(fator) * speed;
               vetorMovimento[intsc] = 0; // Zera o outro eixo
               //console.log(moveDir);
            }
            return [speed,colisao];
}

export{ verifica_colisoes_com_blocos };