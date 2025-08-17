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
import { testeGrandesAreas } from './criacaoAreas.js';
import { SpriteMixer } from '../libs/sprites_antigo/SpriteMixer.js';


const clock = new THREE.Clock();

class armaSoldado {
   constructor(donoDaArma, scene, inimigos) {

      this.tempoUltimoTiro = 0; // Tempo em que se realizou o último tiro
      this.inimigos = inimigos; // Vetor dos inimigos
      this.numInimigos = this.inimigos.length; // Quantidade de inimigos atualmente
      this.donoDaArma = donoDaArma; // Objeto dono da arma

      // Controle dos tiros para o dano:
      this.parou = true;
      this.atirarAgora = false;

      this.scene = scene;

      this.animando = false;
    
      this.disparando = false;
   }


   // Função que controla o dano do tiro:
   atirar(scene, areas, fronteiras, camera, verdade,angPert,referencia_ataque=this.inimigos[0].obj.getWorldPosition(new THREE.Vector3())) {
      if (!verdade) { // Se não estiver atirando, não faz nada
         return;

      }

      

      const tentativaDisparo = performance.now();
      
      console.log("AAt");
      this.numInimigos = this.inimigos.length; // Atualiza número de inimigos
      const origem = new THREE.Vector3(); // Origem dos tiros(Arma)
      camera.getWorldPosition(origem);
      let distMax = 721;  // Distância máxima que computa os tiros
      const direcao = new THREE.Vector3(); // Direção dos tiros( Da câmera)
      direcao.subVectors(referencia_ataque,origem);

      let rotMatrixY = new THREE.Matrix4().makeRotationY(angPert); // Matriz de rotação
      
      direcao.applyMatrix4(rotMatrixY);

      console.log(angPert);

      let pontoIntersecao = new THREE.Vector3(); // Variável do ponto de interseção dos tiros

      const raio = new THREE.Ray(origem, direcao); // Raio de disparo
      let inimigoAtingido = null; // Controle do inimigo atingido


      let posIniAtg = -1; // Pos do inimigo atingido no vetor
      let cont = -1; // Contador
      for (const inimigo of this.inimigos) {   //Para todos inimigos
         cont++;
         console.log("Axforne");
         if (!inimigo.box) continue; // Se tiverem Bounding Box
         console.log("Axarum");
         if (raio.intersectBox(inimigo.box, pontoIntersecao)) {  // Se o raio intersectá-la
            const distancia = origem.distanceTo(pontoIntersecao); // Pega distância até intersecção
            if (distancia < distMax) { // Se for menor que a distância máxima( A inicial ou a de outro inimigo mais próximo já atingido)
               inimigoAtingido = inimigo;
               distMax = distancia;  // Coloca esse como o limite para outros inimigos
               posIniAtg = cont;
            }
         }
      }
      let distMaxCubos = 751; // Ma´xima dos cubos
      let bloqueou = false; // Controla a existência de bloqueio do tiro por blocos
      if (inimigoAtingido != null) { //Se algum inimigo foi atingido
         let distancia = new THREE.Vector3(0, 0, 0);
         for (var i = 2; i < 4; i++) {
            if (origem.distanceTo(areas[i].cube0.position) > distMaxCubos)  // verifica se distância atual é menor que a do centro da área, se for, continua
               continue;
            let cubosBox = areas[i].boundingCubos;
            let rampaBox = areas[i].boundingRampa;
            for (var j = 0; j < 3; j++) {

               if (raio.intersectBox(cubosBox[j], pontoIntersecao)) { // Verifica se há intersecção, se houver, coloca na variável pontoIntersecao o ponto(Vector3) mais próximo de interseção
                  distancia = origem.distanceTo(pontoIntersecao); // Calcula a distância da origem até este ponto
                  if (distancia < distMax) { // Se for menor que a distância de interseção do inimigo mais próximo, acusa o bloqueio do tiro e para a verificação.
                     bloqueou = true;
                     break;
                  }
                  else if (distancia < distMaxCubos) {  // Senão, verifica se é a menor distância entre os cubos, para estabelecer novo limite máximo
                     distMaxCubos = distancia;

                  }

               }
               //console.log("C");

            }
            if (bloqueou)
               break;
            if (i != 2 && i!= 1 ) { // Verificações de escadas
               let degrausBox = areas[i].boundingDegraus;
               if (raio.intersectBox(rampaBox, pontoIntersecao)) { // Se adentra bloco onde está a escada, faz a mesma verificação para os degraus
                  distancia = origem.distanceTo(pontoIntersecao);
                  if (distancia < distMax) {  // Se a distância para o bloco que envolve a escada for menor que a distância ao inimigo mais próximo, faz-se o teste

                     ////console.log(degrausBox)
                     for (var k = 0; k < 8; k++) { // Verificação para todos os blocos
                        if (raio.intersectBox(degrausBox[k], pontoIntersecao)) {
                           distancia = origem.distanceTo(pontoIntersecao);
                           if (distancia < distMax) {
                              bloqueou = true;
                              break;
                           }
                           else if (distancia < distMaxCubos) {
                              distMaxCubos = distancia;

                           }
                        }
                     }
                  }
               }
               else {
                  if (raio.intersectBox(degrausBox[7], pontoIntersecao)) { // Verificação especial para o oitavo degrau, caso não intersecte o bloco de escadas
                     distancia = origem.distanceTo(pontoIntersecao);
                     if (distancia < distMax) {
                        bloqueou = true;

                     }
                     else if (distancia < distMaxCubos) {
                        distMaxCubos = distancia;

                     }
                  }
               }
               if (i == 0) {
                  for (var j = 0; j < areas[0].boundingBoxesPilares.length; j++) {

                     if (areas[0].boundingBoxesPilares[j].intersectsBox(boxBala)) {

                        colidiu = true;
                        console.log(colidiu);
                        break;
                     }
                  }
               }

            }
            else if(i==1)
                {   // Verificação para as coisas especiais da área 2, começando pelo suporte da fechadura
               if (raio.intersectBox(areas[1].fechadura.box, pontoIntersecao)) {
                  distancia = origem.distanceTo(pontoIntersecao);
                  if (distancia < distMax) {
                     bloqueou = true;
                     break;
                  }
                  else if (distancia < distMaxCubos) {
                     distMaxCubos = distancia;

                  }
               }

               //console.log(areas[1].fechadura.box);
               //console.log(colidiu);
               if (areas[1].chave1 != null) { // Se a chave estiver posicionada
                  if (raio.intersectBox(areas[1].chave1Box, pontoIntersecao)) {
                     distancia = origem.distanceTo(pontoIntersecao);
                     if (distancia < distMax) {
                        bloqueou = true;
                        break;
                     }
                     else if (distancia < distMaxCubos) {
                        distMaxCubos = distancia;

                     }
                  }
               }
               if (areas[1].porta.aberta && (areas[1].plataforma.em_movimento || !areas[1].plataforma.subir) && raio.intersectBox(areas[1].plataforma.box, pontoIntersecao)) { // Se a porta estiver aberta, verifica para a plataforma
                  distancia = origem.distanceTo(pontoIntersecao);
                  if (distancia < distMax) {
                     bloqueou = true;
                     break;
                  }
                  else if (distancia < distMaxCubos) {
                     distMaxCubos = distancia;

                  }
               }

               if (areas[1].porta.aberta && (areas[1].plataforma.em_movimento || !areas[1].plataforma.subir) && raio.intersectBox(areas[1].porta.box, pontoIntersecao)) {
                  distancia = origem.distanceTo(pontoIntersecao);
                  if (distancia < distMax) {
                     bloqueou = true;
                     break;
                  }
                  else if (distancia < distMaxCubos) {
                     distMaxCubos = distancia;

                  }
               }

               for (var j = 0; j < areas[1].num_blocos_extras; j++) { // Blocos extras da área 2

                  if (raio.intersectBox(areas[1].boundingBlocosExtras[j], pontoIntersecao)) {
                     distancia = origem.distanceTo(pontoIntersecao);
                     if (distancia < distMax) {
                        bloqueou = true;
                        break;
                     }
                     else if (distancia < distMaxCubos) {
                        distMaxCubos = distancia;

                     }
                  }

               }
               if (bloqueou)
                  break;

               if ((areas[1].elevar_bloco || areas[1].bloco_elevado) && !areas[1].chave2Retirada && raio.intersectBox(areas[1].chave2Box, pontoIntersecao)) { // Chave 2, se estiver posicionada
                  distancia = origem.distanceTo(pontoIntersecao);
                  if (distancia < distMax) {
                     bloqueou = true;
                     break;
                  }
                  else if (distancia < distMaxCubos) {
                     distMaxCubos = distancia;

                  }
               }

            }

            else if(i==2){
                if (raio.intersectBox(areas[i].boundingCube4, pontoIntersecao)) {
                  distancia = origem.distanceTo(pontoIntersecao);
                  if (distancia < distMax) {
                     bloqueou = true;
                     break;
                  }
                  else if (distancia < distMaxCubos) {
                     distMaxCubos = distancia;

                  }
               }

               if (raio.intersectBox(areas[i].boundingCube5, pontoIntersecao)) {
                  distancia = origem.distanceTo(pontoIntersecao);
                  if (distancia < distMax) {
                     bloqueou = true;
                     break;
                  }
                  else if (distancia < distMaxCubos) {
                     distMaxCubos = distancia;

                  }
               }

               if (raio.intersectBox(areas[i].assetManager.planeBox, pontoIntersecao)) {
                  distancia = origem.distanceTo(pontoIntersecao);
                  if (distancia < distMax) {
                     bloqueou = true;
                     break;
                  }
                  else if (distancia < distMaxCubos) {
                     distMaxCubos = distancia;

                  }
               }

               if (raio.intersectBox(areas[i].porta1.box, pontoIntersecao)) {
                  distancia = origem.distanceTo(pontoIntersecao);
                  if (distancia < distMax) {
                     bloqueou = true;
                     break;
                  }
                  else if (distancia < distMaxCubos) {
                     distMaxCubos = distancia;

                  }
               }

               if (raio.intersectBox(areas[i].porta2.box, pontoIntersecao)) {
                  distancia = origem.distanceTo(pontoIntersecao);
                  if (distancia < distMax) {
                     bloqueou = true;
                     break;
                  }
                  else if (distancia < distMaxCubos) {
                     distMaxCubos = distancia;

                  }
               }
            }

            if (bloqueou)
               break;


         }
         if (!bloqueou) { // Se não bloqueou o inimigo atingido
            inimigoAtingido.sofrerAtaque(2, scene); // Faz ataque de dano 1

            if (inimigoAtingido.padeceu) { // Se ele padecer
               if (inimigoAtingido.arma != null) // Se tiver uma arma
                  inimigoAtingido.obj.remove(inimigoAtingido.arma.cylinder); // Tira a arma dele
               let derrotado = inimigoAtingido; // Indica que ele foi o derrotado
               //scene.remove( this.inimigos[i].obj);
               this.inimigos.splice(posIniAtg, 1); // Tira-o do vetor
               this.numInimigos--; // Decrementa o número de inimigos
               //console.log("Padece");
               //console.log(this.inimigos);
               //console.log(this.numInimigos);
               return derrotado; // Retorna o derrotado
            }



         }
      }
      return null; // Retorna nulo, niguém foi derrotado
   }

}

export {armaSoldado};