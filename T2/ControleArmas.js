

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
import { SpriteMixer } from '../libs/sprites/SpriteMixer.js';


const clock = new THREE.Clock();

class Metralhadora {
  constructor(donoDaArma, scene,inimigos) {

   this.tempoUltimoTiro = 0; // Tempo em que se realizou o último tiro
   this.inimigos = inimigos; // Vetor dos inimigos
   this.numInimigos = this.inimigos.length; // Quantidade de inimigos atualmente
   this.donoDaArma = donoDaArma; // Objeto dono da arma

   // Controle dos tiros para o dano:
   this.parou=true; 
   this.atirarAgora=false;

    this.scene = scene;


    this.framesX = 3;
    this.framesY = 1;

    this.currentFrame = 0;
    this.totalFrames = this.framesX * this.framesY;

    this.frameWidth = 1 / this.framesX;
    this.frameHeight = 1 / this.framesY;

    this.animando = false;
    this.frameDuracaoMs = 100;
    this.tempoUltimaAtualizacao = 0;

    this.disparando = false;  
    this.tempoUltimoTiro = 0; 
    this.cooldownDisparo = 100; 

    this.actionSprite = null;

    new THREE.TextureLoader().load('./2025.1_T2_Assets/chaingun.png', (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;

      tex.repeat.set(this.frameWidth, this.frameHeight);
      tex.offset.set(0, 1 - this.frameHeight);

      this.texture = tex;

      let geometry = new THREE.PlaneGeometry(0.8, 0.8);
      let material = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.4 

      });
      this.actionSprite = new THREE.Mesh(geometry, material);
      this.obj=this.actionSprite;
      this.actionSprite.position.set(0.0, -1.0, -3.3);
      this.actionSprite.scale.set(1, 1, 1);
      this.actionSprite.material.depthTest = false;

      donoDaArma.add(this.actionSprite);
    });
  }

  setVisible(flag) {
    if (this.actionSprite) this.actionSprite.visible = flag;
  }

  setFrame(frame) {
    this.currentFrame = frame % this.totalFrames; 
    const x = (this.currentFrame % this.framesX) * this.frameWidth;
    const y = 1 - this.frameHeight - Math.floor(this.currentFrame / this.framesX) * this.frameHeight;
    if (this.texture) {
      this.texture.offset.set(x, y);
    }
  }

  iniciarDisparo() {
    this.disparando = true;
    this.animando = true;
    //this.currentFrame = 1; //começa atirando no primeiro clique
    this.tempoUltimaAtualizacao = performance.now();
    this.setFrame(this.currentFrame);
  }

  pararDisparo() {
    this.disparando = false;
    this.animando = false;
    this.currentFrame = 0;
    this.setFrame(0);
  }

  atualizar() {
    const now = performance.now();
      this.atirarAgora=false;
    if (this.disparando) {
      if (now - this.tempoUltimoTiro >= this.cooldownDisparo) {
        this.tempoUltimoTiro = now;
        this.dispararAnimacao();
        this.atirarAgora=true;
      }
    } 
    else {
      if (this.animando) {
        this.animando = false;
        this.currentFrame = 0;
        this.setFrame(0);
      }
    }

    if (this.animando) {
      if (now - this.tempoUltimaAtualizacao > this.frameDuracaoMs) {
        this.currentFrame++;
        if (this.currentFrame >= this.framesX) {
          this.currentFrame = 0; // loop da animação
        }
        this.setFrame(this.currentFrame);
        this.tempoUltimaAtualizacao = now;
      }
    }
  }

  dispararAnimacao() {
    if (!this.animando) {
      this.animando = true;
      this.currentFrame = 0;
      this.tempoUltimaAtualizacao = performance.now();
      this.setFrame(0);
    }
  }


  // Função que controla o dano do tiro:
  atirar(scene,areas, fronteiras, camera, verdade) {
   if(!verdade){ // Se não estiver atirando, não faz nada
      if(!this.parou){ // Se não computou a parada, indica que o pressionamento para o tiro foi interrompido agora
         this.parou=true;
         this.pararDisparo();
      }
      return;
      
   }

   if(this.parou){ // Se estiver parado, indica que o movimento voltou e chama as funções de animação
      this.iniciarDisparo();
      this.atualizar();
      this.parou=false;
      return;

   }
   this.atualizar();
   const tentativaDisparo = performance.now();
   if (!this.atirarAgora) // Variável controlada pela função da annimação
      return;
   console.log("AAt")
   this.numInimigos=this.inimigos.length; // Atualiza número de inimigos
   const origem = new THREE.Vector3(); // Origem dos tiros(Arma)
   camera.getWorldPosition(origem);
   let distMax = 721;  // Distância máxima que computa os tiros
   const direcao = new THREE.Vector3(); // Direção dos tiros( Da câmera)
   camera.getWorldDirection(direcao).normalize();

   let pontoIntersecao = new THREE.Vector3(); // Variável do ponto de interseção dos tiros

   const raio = new THREE.Ray(origem, direcao); // Raio de disparo
   let inimigoAtingido = null; // Controle do inimigo atingido


   let posIniAtg=-1; // Pos do inimigo atingido no vetor
   let cont=-1; // Contador
   for (const inimigo of this.inimigos) {   //Para todos inimigos
      cont++;
      if (!inimigo.box) continue; // Se tiverem Bounding Box

      if (raio.intersectBox(inimigo.box, pontoIntersecao)) {  // Se o raio intersectá-la
         const distancia = origem.distanceTo(pontoIntersecao); // Pega distância até intersecção
         if (distancia < distMax) { // Se for menor que a distância máxima( A inicial ou a de outro inimigo mais próximo já atingido)
            inimigoAtingido = inimigo;
            distMax = distancia;  // Coloca esse como o limite para outros inimigos
            posIniAtg=cont;
         }
      }
   }
   let distMaxCubos = 751; // Ma´xima dos cubos
   let bloqueou = false; // Controla a existência de bloqueio do tiro por blocos
   if (inimigoAtingido != null) { //Se algum inimigo foi atingido
      let distancia=new THREE.Vector3(0,0,0); 
      for (var i = 0; i < 4; i++) {
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
         if (i != 1) { // Verificações de escadas
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
         }
         else {   // Verificação para as coisas especiais da área 2, começando pelo suporte da fechadura
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

         if (bloqueou)
            break;


      }
      if(!bloqueou){ // Se não bloqueou o inimigo atingido
         inimigoAtingido.sofrerAtaque(1,scene); // Faz ataque de dano 1
         
            if (inimigoAtingido.padeceu) { // Se ele padecer
               if(inimigoAtingido.arma) // Se tiver uma arma
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



class LancaMisseis {
   constructor(donoDaArma, inimigos, ehJogador, dano = 10, velocidadeProjetil = 1.4, corArma = "rgb(226, 17, 17)", corProjetil = "rgb(15, 187, 10)") {
      this.tempoUltimoTiro = 0;
      this.ehJogador = ehJogador;
      if (ehJogador) { // Para o jogador, um cilindro visível como arma
         this.cylinderGeometry = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 32);
         this.cylinderMaterial = new THREE.MeshLambertMaterial({ color: corArma });
         this.cylinder = new THREE.Mesh(this.cylinderGeometry, this.cylinderMaterial);
         this.cylinder.castShadow = true;
         this.cylinder.receiveShadow = true;
         this.projetilMaterial = new THREE.MeshLambertMaterial({ color: corProjetil });
      }


      else { // Para o inimigo(Cacodemon), um cilindro invisível, só para atirar

         this.abstractGunGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.1); 
         this.invisbleMaterial = new THREE.MeshBasicMaterial({
            color: "red",
            visible: false
         }); // Material invisível
         this.cylinder = new THREE.Mesh(this.abstractGunGeometry, this.invisbleMaterial);
         this.projetilMaterial = new THREE.MeshLambertMaterial({ color: "rgb(196, 168, 45)" });

      }

      this.cylinder.position.set(0, 0, 0); 
      this.cylinder.rotation.x = -Math.PI / 2; //  Girando a arma para ficar na posição correta

      ////console.log(cylinder);
      //criacao do projetil( vetor que os armazena a todos)
      this.vetProjetil = [];
      this.projetilGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      this.inimigos = inimigos;
      this.numInimigos = this.inimigos.length;
      this.donoDaArma = donoDaArma;

      donoDaArma.add(this.cylinder);// Adiciona arma no jogo
      this.cylinder.position.set(0, -0.3, -0.8); // Estabelece posição da rama para ficar corretamente na câmera
      this.velocidadeProjetil = velocidadeProjetil;
      this.danoInfligido = dano;

      this.obj = this.cylinder;

      this.parou=true;
   }





   // Criação da arma:





   
   atirar(scene, camera, verdade, dist = 1) {

      if (verdade == true) {

         const tentativaDisparo = performance.now();

         if (tentativaDisparo - this.tempoUltimoTiro >= 500) {
            this.tempoUltimoTiro = tentativaDisparo;
            const projetil = new THREE.Mesh(this.projetilGeometry, this.projetilMaterial);

            // posicao do projetil
            const spawnProjetil = new THREE.Vector3();
            spawnProjetil.copy(camera.position);

            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);

            spawnProjetil.add(direction.clone().multiplyScalar(dist));
            projetil.position.copy(spawnProjetil);

            this.vetProjetil.push({ mesh: projetil, direction, frames: 0, area_proj: -1 });

            scene.add(projetil);
         }
      }
   }

   controle_acerto_inimigos(boxBala, areaBala, scene) {
      if (this.ehJogador) {
         //console.log("AAAA");
      }
      this.numInimigos=this.inimigos.length;  // Atualiza numInimigos
      //console.log(this.inimigos);
      for (var i = 0; i < this.numInimigos; i++) {
         let atual = this.inimigos[i];

         if (atual.grandeArea == areaBala && atual.box.intersectsBox(boxBala)) {
            if (this.inimigos[i].levaDano) {
               console.log("INTS");
               this.inimigos[i].sofrerAtaque(this.danoInfligido, scene);
               if (this.inimigos[i].padeceu) {
                  this.inimigos[i].obj.remove(this.inimigos[i].arma.cylinder);
                  let derrotado = this.inimigos[i];
                  //scene.remove( this.inimigos[i].obj);
                  this.inimigos.splice(i, 1);
                  this.numInimigos--;
                  //console.log("Padece");
                  //console.log(this.inimigos);
                  //console.log(this.numInimigos);
                  return [true, derrotado];
               }
            }
            return [true, null];
         }
      }
      return [false, null];
   }

   controle_projeteis(scene, areas, fronteira) {

      let colidiu = false;
      let derrotados = [];
      let tamVet = this.vetProjetil.length;
      for (var q = 0; q < tamVet; q++) {
         colidiu = false;
         let proj = this.vetProjetil[q];
         let velocidadeProjetil = this.velocidadeProjetil;
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
            if (proj.mesh.position.y < -0.1) {
               colidiu = true;
               //console.log("B");
            }
            else {
               if (Math.abs(proj.mesh.position.x) > 252 || Math.abs(proj.mesh.position.z) > 252 || Math.abs(proj.mesh.position.y) > 15.1) {
                  proj.frames = 1;
               }
               else {
                  let boxBala = new THREE.Box3().setFromObject(proj.mesh);
                  let grande_area_e_fechadura = testeGrandesAreas(proj.mesh, proj.area_proj);
                  proj.area_proj = grande_area_e_fechadura[0];
                  let derr = null;
                  let colidiu_derr = this.controle_acerto_inimigos(boxBala, proj.area_proj, scene);
                  colidiu = colidiu_derr[0];
                  // console.log("colidiu?");
                  //console.log(colidiu);
                  if (colidiu_derr[1] != null) {
                     derrotados.push(colidiu_derr[1]);
                  }
                  let redFech = grande_area_e_fechadura[1];
                  if (!colidiu && proj.area_proj != -1) {
                     if (proj.area_proj == 0) {
                        for (var i = 0; i < 4; i++) {
                           if (fronteira[i + 4].intersectsBox(boxBala)) {
                              colidiu = true;
                              //console.log("B");
                              break;
                           }
                        }
                     }
                     else {
                        i = proj.area_proj - 1;
                        ////console.log(i);
                        let cubosBox = areas[i].boundingCubos;
                        let rampaBox = areas[i].boundingRampa;
                        if (redFech) {
                           colidiu = (areas[1].fechadura.box.intersectsBox(boxBala));

                           //console.log(areas[1].fechadura.box);
                           //console.log(colidiu);
                           if (!colidiu && areas[1].chave1 != null) {
                              colidiu = (areas[1].chave1Box.intersectsBox(boxBala));
                           }
                           //console.log("0-C")

                        }

                        for (var j = 0; !colidiu && j < 3; j++) {
                           if (cubosBox[j].intersectsBox(boxBala)) {
                              colidiu = true;
                              //console.log("C");

                           }

                        }
                        if (!colidiu) {
                           if (i != 1) {
                              if (rampaBox.intersectsBox(boxBala)) {
                                 let degrausBox = areas[i].boundingDegraus;
                                 ////console.log(degrausBox)
                                 for (var k = 0; k < 8; k++) {
                                    if (boxBala.intersectsBox(degrausBox[k])) {
                                       //console.log(degrausBox[k]);
                                       colidiu = true;
                                       //console.log("D");
                                       break;

                                    }
                                 }
                              }
                              else {
                                 if (areas[i].boundingDegraus[7].intersectsBox(boxBala)) {
                                    colidiu = true;
                                    //console.log("E");
                                 }
                              }
                           }
                           else {
                              if (areas[1].porta.aberta && (areas[1].plataforma.em_movimento || !areas[1].plataforma.subir) && areas[1].plataforma.box.intersectsBox(boxBala)) {
                                 colidiu = true;
                              }
                              else {
                                 colidiu = areas[1].porta.box.intersectsBox(boxBala);
                              }
                              for (var j = 0; !colidiu && j < areas[1].num_blocos_extras; j++) {
                                 if (areas[1].boundingBlocosExtras[j].intersectsBox(boxBala)) {
                                    colidiu = true;
                                    //console.log("F");
                                 }
                              }
                              if (!colidiu) {
                                 if ((areas[1].elevar_bloco || areas[1].bloco_elevado) && !areas[1].chave2Retirada && areas[1].chave2Box.intersectsBox(boxBala))
                                    colidiu = true;
                              }
                           }
                        }
                     }
                  }
                  else {
                     if (!colidiu && redFech) {

                        colidiu = (areas[1].fechadura.box.intersectsBox(boxBala));
                        //console.log(areas[1].fechadura.box);
                        //console.log(colidiu);
                        if (!colidiu && areas[1].chave1 != null) {
                           colidiu = (areas[1].chave1Box.intersectsBox(boxBala));
                        }
                        //console.log("0-C")


                     }
                  }

               }
            }
         }
         if (colidiu) {
            //console.log("Colisão" + proj.frames);
            scene.remove(proj.mesh);
            this.vetProjetil.splice(q, 1);
            q--;
            tamVet--;
         }
      }

      return derrotados;
   }
}

export { LancaMisseis, Metralhadora };