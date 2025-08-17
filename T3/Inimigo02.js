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

import { verifica_colisoes_com_blocos } from './testeColisaoBloco.js';

import { LancaMisseis } from './ControleArmas.js';

var eixo_x = new THREE.Vector3(1, 0, 0);
var eixo_y = new THREE.Vector3(0, 1, 0);
var eixo_z = new THREE.Vector3(0, 0, 1);



class Cacodemon {

   constructor(objeto, camera, boxInimigo, larg, speedPadrao, arma, personagem) {
      this.tipo = "cacodemon";
      this.voo = true;
      this.obj = objeto;

      this.camera = camera;

      this.box = boxInimigo;
      this.personagem_rival = personagem;
      this.larg = larg;

      this.speedPadrao = speedPadrao;
      this.speed = speedPadrao;

      this.naPlataforma = false;

      this.naPlataforma_a4 = [false, false];

      this.possui_chave1 = true;

      this.grandeArea = -1; // Variável que armazena em qual das 6 grande as áreas o personagem está.
      /* As grandes áreas são: Transição(-1): Área base onde há apenas colisão com o chão para se testar. Todo lugar onde não há objetos por perto.
       Fronteira(0) : Região próxima às muralhas do mapa( tem formato de moldura quadrada)
       Grande Áreas de 1 a 4: Representam as áreas especiais do jogo(Plataformas em formato de paralelepípedo) e seus derredores( margem de 4 unidades de comprimento)
      
      */
      this.area = -1; // Variável que indica em qual área em formato de paralelepípedo presente no jogo.

      this.redondezasDaFechadura = false;

      this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0, 2.1);

      this.direcao_movimento = new THREE.Vector3(0, 0, 0);

      this.contagemMudanca = 115;

      this.maxMudanca = 120;

      this.contagemEsperaAtaque = 0;

      this.maxEsperaAtaque = 4;

      this.contagemPreAtaque = 0;

      this.giroMax = 0;

      this.giroAcumulado = 0;

      this.qtdGiroAtual = 0;

      this.eixoRotacao = new THREE.Vector3(0, 0, 0);

      this.tempoDeGiro = 0;

      this.girando = false;

      this.coef_rot_hor = 0;

      this.coef_rot_ver = 0;

      this.t_max = 0;

      this.mult = 1;

      this.arma = arma;

      arma.danoInfligido = 8;

      this.tempoDesap = 50;

      this.passos_desap = 0;

      this.taxaDesap = 0.02;

      this.sumiu = false;

      this.transparente = false;

      this.dormindo = true;

      this.vidaMax = 50;
      this.vida = this.vidaMax;

      this.levaDano = true;
      this.padeceu = false;


      this.eixo_x = new THREE.Vector3(1, 0, 0);
      this.eixo_y = new THREE.Vector3(0, 1, 0);
      this.eixo_z = new THREE.Vector3(0, 0, 1);

      this.anterior_xz = 0;
      this.anterior_yz = 0;


      //som
      this.listener = null;
      this.audioLoader = null;
      this.Somdano = null;
      this.SomDash = null;
      this.SomMorte = null;
      this.SomNascer = null;
      this.SomPerto = null;

      this.girando = false;
      this.tempoDeGiro = 0;
      this.t_max = 0;
      this.quaternionInicial = new THREE.Quaternion();
      this.quaternionFinal = new THREE.Quaternion();


      this.barraFrente = null;
      this.barraFundo = null;
      this.grupoBarras = null;
      this.tamBarraVida = 1.2;
      this.IniciaSound();
   }
   IniciaSound() {
      if (!this.listener)
         this.listener = new THREE.AudioListener();
      this.camera.add(this.listener);
      this.audioLoader = new THREE.AudioLoader();


   }
   SomLostSoulGerenciamento(SomEscolha) {


      if (SomEscolha === "levardano") {
         // Criar o som apenas se ainda não existir
         if (!this.Somdano) {
            this.Somdano = new THREE.PositionalAudio(this.listener);
            this.audioLoader.load('../0_assetsT3/sounds/cacoDemon/cacodemonInjured.wav', (buffer) => {
               this.Somdano.setBuffer(buffer);
               this.Somdano.setRefDistance(5); // Ajuste conforme necessário
               this.Somdano.setLoop(false);  // false para tocar apenas uma vez quando ferido
               this.obj.add(this.Somdano);   // Adicionar ao objeto para que o som siga o inimigo
               this.Somdano.play();          // Iniciar reprodução
            });
         } else if (!this.Somdano.isPlaying) {
            this.Somdano.play();             // Tocar novamente se já existir e não estiver tocando
         }
      }

      if (SomEscolha === "atirou") {
          console.log("Attack");
         // Criar o som apenas se ainda não existir
         if (!this.SomDash) {
            
            this.SomDash = new THREE.PositionalAudio(this.listener);
            this.audioLoader.load('../0_assetsT3/sounds/cacoDemon/cacodemonAttack.wav', (buffer) => {
               this.SomDash.setBuffer(buffer);
               this.SomDash.setRefDistance(2); // Ajuste conforme necessário
               this.SomDash.setLoop(false);    // false para tocar apenas uma vez por dash
               this.obj.add(this.SomDash);     // Adicionar ao objeto para que o som siga o inimigo
               this.SomDash.play();            // Iniciar reprodução
            });
         } else if (!this.SomDash.isPlaying) {
           
            this.SomDash.play();               // Tocar novamente se já existir e não estiver tocando
         }
      }


      if (SomEscolha === "morrer") {
         // Criar o som apenas se ainda não existir
         if (!this.SomMorte) {
            this.SomMorte = new THREE.PositionalAudio(this.listener);
            this.audioLoader.load('../0_assetsT3/sounds/cacoDemon/cacodemonDeath.wav', (buffer) => {
               this.SomMorte.setBuffer(buffer);
               this.SomMorte.setRefDistance(5); // Ajuste conforme necessário
               this.SomMorte.setLoop(false);// false para tocar apenas uma vez por dash
               this.obj.add(this.SomMorte);     // Adicionar ao objeto para que o som siga o inimigo
               this.SomMorte.play();            // Iniciar reprodução
            });
         } else if (!this.SomMorte.isPlaying) {
            this.SomMorte.play();               // Tocar novamente se já existir e não estiver tocando
         }
      }

      if (SomEscolha === "perto_esta") {
         console.log("PertoEsta1");
      if (!this.SomPerto) {
         this.SomPerto = new THREE.PositionalAudio(this.listener);
         this.audioLoader.load('../0_assetsT3/sounds/cacoDemon/cacodemonNearby.wav', (buffer) => {
            this.SomPerto.setBuffer(buffer);
            this.SomPerto.setRefDistance(5);
            this.SomPerto.setLoop(true);
            this.SomPerto.setVolume(1.2);
            this.obj.add(this.SomPerto);
            this.SomPerto.play();
         });
      } else  {
         console.log("Play");
         this.SomPerto.play();
      }
   }

      if (SomEscolha === "nascer") {
         // Criar o som apenas se ainda não existir
         if (!this.SomNascer) {
            this.SomNascer = new THREE.PositionalAudio(this.listener);
            this.audioLoader.load('../0_assetsT3/sounds/cacoDemon/cacodemonSight.wav', (buffer) => {
               this.SomNascer.setBuffer(buffer);
               this.SomNascer.setRefDistance(2); // Ajuste conforme necessário
                  // false para tocar apenas uma vez por dash
               this.obj.add(this.SomNascer);     // Adicionar ao objeto para que o som siga o inimigo
               this.SomNascer.play();            // Iniciar reprodução
            });
         } else if (!this.SomNascer.isPlaying) {
            this.SomNascer.play();               // Tocar novamente se já existir e não estiver tocando
         }
      }




   }

  

   // Função para acordar inimigos para batalha
   acordar() {
      this.dormindo = false;
      this.obj.visible = true;
      this.grupoBarras.visible = true;
      this.SomLostSoulGerenciamento("nascer");

   }


   // Função para operar seu sumiço gradativo
   sumir() {
      this.SomLostSoulGerenciamento("morrer");
      this.grupoBarras.lookAt(this.personagem_rival.obj.position); // Barras continuam viradas ao usuário

      if (!this.sumiu) { // Se ele ainda não sumiu
         let taxa_desap = this.taxaDesap; // Estabelece desaparecimento
         if (!this.transparente) {
            this.transparente = true;

            //console.log("AA");
            this.obj.traverse(function (child) {  // Para cada filho que é mesh
               if (child.isMesh) {
                  //console.log("TP")
                  child.material.transparent = true; // Habilita transparência
               }
            });

            this.barraFundo.material.transparent = true;
         }
         this.barraFundo.material.opacity -= taxa_desap; // Faz barra ir desaparecendo
         //console.log(this.barraFundo.material.opacity);
         this.obj.traverse(function (child) {
            if (child.isMesh) {
               child.material.opacity -= taxa_desap; // Faz objetos irem desaparecendo
               //console.log(child.material.opacity );
            }
         });
         this.passos_desap++; // Incrementa despareciment
         if (this.passos_desap == this.tempoDesap)// Se acabou, indica o sumiço
            this.sumiu = true;

      }
   }

   gerarMovimento(personagem = this.personagem_rival.obj) { // Gera movimento do personagem
      this.girando = true; // Ativa giro
      this.tempoDeGiro = 0; //Estabelece tempo de giro

      
      this.direcao_movimento.subVectors(personagem.position, this.obj.position);  // Direção até o personagem
      let giroMin = 0;
      let exp = 1.2;
      
      if (this.direcao_movimento.length() <= 9)
         giroMin = Math.PI / 2; // Muito perto, pelo menos 90 graus
      else if (this.direcao_movimento.length() <= 20) {
         giroMin = Math.PI / 4; // Mais ou menos perto, ao menos 45
         exp = 0.8;
      }
      else if (this.direcao_movimento.length() >= 40) {
         exp = 2; // Um pouco longe, tende a se aproximar
      }
      else if (this.direcao_movimento.length() >= 60)
         exp = 5; // Muito longe, tende a se aproximar mais e mais


      let direcao_imimigo_copia = (new THREE.Vector3(0, 0, 0)).copy(this.direcao_movimento);
      let giroY = (Math.random() ** (exp)) * (3 * Math.PI / 8) + giroMin;  // Estabelece giro em relação à direção dele até o personagem

      let positivo = (Math.random() >= 0.5); // Sorteia o sentido

      if (!positivo)
         giroY = -giroY;
      let giroZ = (Math.random() ** 4) * (Math.PI / 6); // Giro vertical
      if (Math.abs(this.direcao_movimento.y) > 0.5 && this.direcao_movimento.y < 0)
         giroZ /= 5;// Reduz giro em certas condições
      if (this.direcao_movimento.y < 0)
         giroZ = -giroZ; // Adequa giro em z




      let rotMatrixY = new THREE.Matrix4().makeRotationY(giroY); // Matriz de rotação

      this.direcao_movimento.applyMatrix4(rotMatrixY);



      if (this.direcao_movimento.y < -0.1 || this.direcao_movimento.y > 0) {

         let rotMatrixZ = new THREE.Matrix4().makeRotationX(giroZ);
         this.direcao_movimento.applyMatrix4(rotMatrixZ);

      }

      let alvoPos = new THREE.Vector3(0, 0, 0);
      alvoPos.addVectors(this.direcao_movimento, this.obj.position); // Alvo a se mirar em absoluto
      const origem = this.obj.position.clone(); // Posição do inimigo

      const direcao = alvoPos.clone().sub(origem); // Direção a se mirar em relação ao inimigo
      const angulo = this.obj.getWorldDirection(new THREE.Vector3()).angleTo(direcao); //Ângulo a se girar para alcançar direção

      const giroEmGraus = Math.min(THREE.MathUtils.radToDeg(angulo), 180); // Em graus

      // Estabelece tempos de giro, de acordo com o tamanho do ângulo
      if (giroEmGraus <= 30)
         this.t_max = 1 + Math.floor(giroEmGraus * 2);
      else if (giroEmGraus <= 90)
         this.t_max = Math.floor((giroEmGraus - 30)) + 60;
      else
         this.t_max = Math.floor((giroEmGraus - 90) * 1.8 + 120);

      this.quaternionInicial.copy(this.obj.quaternion); // Quartenion de origem




      const dummy = new THREE.Object3D();
      dummy.position.copy(this.obj.position);
      dummy.lookAt(alvoPos);  // Simula giro total do objeto
      this.quaternionFinal.copy(dummy.quaternion); // Obtém quartenion final


   }


   // ataque_especial com mesmo sistema, mas agora não se altera direção, alemja-se olhar diretamente para a posição atual do personagem
   ataque_especial(scene) {
      this.girando = true;
      this.tempoDeGiro = 0;

      const alvoPos = this.personagem_rival.obj.position.clone();
      const origem = this.obj.position.clone();

      const direcao = alvoPos.clone().sub(origem);
      const angulo = this.obj.getWorldDirection(new THREE.Vector3()).angleTo(direcao);
      const giroEmGraus = Math.min(THREE.MathUtils.radToDeg(angulo), 180);

      if (giroEmGraus <= 30)
         this.t_max = 1 + Math.floor(giroEmGraus * 2);
      else if (giroEmGraus <= 90)
         this.t_max = Math.floor((giroEmGraus - 30)) + 60;
      else
         this.t_max = Math.floor((giroEmGraus - 90) * 1.8 + 120);
      if (this.t_max > 15)
         this.t_max
      this.quaternionInicial.copy(this.obj.quaternion);

      const dummy = new THREE.Object3D();
      dummy.position.copy(this.obj.position);
      dummy.lookAt(alvoPos);
      this.quaternionFinal.copy(dummy.quaternion);
   }


   // Dentro do movimento()




   movimento(areas, fronteira, groundPlane, delta, moveUp, reset, scene = null) {

      if (this.girando && false) {
         this.tempoDeGiro++;
         let atual_xz = this.funcaoRotacaoHor(this.tempoDeGiro);
         let qtd_xz = atual_xz - this.anterior_xz;
         this.anterior_xz = atual_xz;
         let atual_yz = this.funcaoRotacaoVert(this.tempoDeGiro);
         let qtd_yz = atual_yz - this.anterior_yz;
         this.anterior_yz = atual_yz;
         if (qtd_xz != 0)
            this.obj.rotateY(qtd_xz);
         if (qtd_yz != 0)
            //this.obj.rotateX(qtd_yz);
            if (this.tempoDeGiro >= this.t_max) {
               console.log(this.coef_rot_hor);
               console.log("A");
               console.log(atual_xz);
               this.girando = false;
               this.giroAcumulado = 0;
               this.giroMax = 0;
               this.t_max = 0;
               this.tempoDeGiro = 0;
               this.anterior_xz = 0;
               this.anterior_yz = 0;
            }



      }

      if (this.dormindo || this.vida <= 0) // Se estiver a dormir, não faz nada
         return;

         if (this.direcao_movimento.length() <= 20){
            console.log("PertoEsta");
         this.SomLostSoulGerenciamento("perto_esta");
      }
      //console.log(this.personagem_rival.obj.position);
      this.grupoBarras.lookAt(this.personagem_rival.obj.position); // Faz barras de vida olharem para o jogador
      if (this.girando) {// Se estiver girando
         this.tempoDeGiro++;

         let t = this.tempoDeGiro / this.t_max;
         if (this.contagemPreAtaque != 0)
            t = this.tempoDeGiro / 20;
         const alpha = Math.min(t, 1); // Relação máxima entre tempos é 1
         const easedAlpha = -2 * alpha ** 3 + 3 * alpha ** 2; // curva suave

         this.obj.quaternion.slerp(this.quaternionFinal, easedAlpha); // Faz o slerp até o quartenion final
         this.obj.quaternion.normalize();// Normaliza

         if (this.tempoDeGiro >= this.t_max) {
            this.girando = false;
            this.tempoDeGiro = 0;
            this.t_max = 0;
         }
      }
      if (this.contagemPreAtaque != 0) {// Giro para o ataque é mais rápido
         this.contagemPreAtaque++;
         if (this.contagemPreAtaque == 20) {
            //this.SomLostSoulGerenciamento("atirou");
            this.contagemPreAtaque = 0;
            this.arma.atirar(scene, this.obj, true, 0.3);// Se chegar o momento, faz a arma atirar
         }
         return;
      }
      this.contagemMudanca++; // Incrementa a contagem de mudança

      if (this.contagemMudanca >= this.maxMudanca) { // Se chegar o momento,
         this.contagemEsperaAtaque++; // Mais uma mudança, mais um na contagem do ataque
         if (this.contagemEsperaAtaque == this.maxEsperaAtaque) { // Se o número de mudanças for igual ao número esperado para atacar, prepara o ataque
            this.ataque_especial(scene); // Direcionar-se ao jogador
            this.contagemEsperaAtaque = 0; // Zera espera
            this.contagemPreAtaque = 1; // inicia pré-ataque
            this.maxEsperaAtaque = 2 + Math.floor(Math.random() * 3); // Sorteia nova espera máxima, de 2 a 4.
         }
         else {
            this.gerarMovimento(); // Gera movimento padrão de giro e define direção do movimento

            this.contagemMudanca = 0; // Reinicia
            this.maxMudanca = 50 + Math.floor(Math.random() * 41); // entre 50 e 90 frames para atacar
         }
      }
      this.raycaster.ray.origin.copy(this.obj.position);

      const frontal = new THREE.Vector3(); // Vetor direção da câmera
      this.obj.getWorldDirection(frontal);


      frontal.normalize();

      const direito = new THREE.Vector3(); // Vetor perpendicular à direita
      direito.crossVectors(frontal, this.eixo_y).normalize();


      let moveDir = this.obj.getWorldDirection(new THREE.Vector3());




      this.box = new THREE.Box3().setFromObject(this.obj);
      if (this.grandeArea >= 1) { // Se estivermos numa grande área que contém blocos

         moveDir.normalize().multiplyScalar(this.speed * delta); // Normaliza e multiplica pela velocidade, considerando o delta(Diferença entre quadros)

         if (this.area != -1) { // Se estivermos sobre uma área de blocos

            // Extensões das áreas definidas( Metade do lado em cada eixo)
            let xi = (areas[this.area].posicao_ini).x;
            let zi = (areas[this.area].posicao_ini).z;
            let ex = (areas[this.area]).ex;
            let ez = (areas[this.area]).ez;


            // Verifica se saiu da área com blocos, indo para o plano base.
            if (this.obj.position.x > (xi + ex + this.larg) || this.obj.position.x < (xi - ex - this.larg) || this.obj.position.z > (zi + ez + this.larg) || this.obj.position.z < (zi - ez - this.larg)) {

               this.area = -1;
            }
         }

         let colisaoAreaAtual = false;
         for (var j = 0; j < 3; j++) { // Teste do movimento para os cubos
            let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].boundingCubos[j], this.speed, true);
            this.speed = speedColisao[0];
            if (!colisaoAreaAtual && speedColisao[1])
               colisaoAreaAtual = true;
         }

         if (this.grandeArea == 1) {
            //  console.log(areas[0].boundingBoxesPilares);

            for (var i = 0; i < areas[0].boundingBoxesPilares.length; i++) {

               let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[0].boundingBoxesPilares[i], this.speed, true);
               this.speed = speedColisao[0];
               if (speedColisao[1] == true) {
                  console.log("bateu");
               }
            }
            for (var i = 0; i < areas[0].BoundingBoxpedras.length; i++) {// verifica bater com pedras em cima do pilar

               let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[0].BoundingBoxpedras[i], this.speed, true);
               this.speed = speedColisao[0];
               if (speedColisao[1] == true) {
                  console.log("bateu");
               }
            }

            let colisaoPlat = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[0].boundingBoxplat, this.speed, true);
            this.speed = colisaoPlat[0];



         }
         if (this.grandeArea == 2) {

            let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].porta.box, this.speed, true);
            this.speed = speedColisao[0];
            let colisaoComAPorta = speedColisao[1];
            let colisaoComAPlataforma = false;
            if (this.redondezasDaFechadura) {
               speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].fechadura.box, this.speed, true);
               this.speed = speedColisao[0];
               if (areas[this.grandeArea - 1].chave1 != null) {
                  speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].chave1Box, this.speed, true);
                  this.speed = speedColisao[0];
               }

            }
            else {
               if ((areas[1].plataforma.em_movimento || !areas[1].plataforma.subir) && !this.naPlataforma) {

                  let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].plataforma.box, this.speed, true);
                  this.speed = speedColisao[0];
                  colisaoComAPlataforma = speedColisao[1];
                  if (colisaoComAPlataforma) {
                     //console.log("Plat");
                  }
               }
               else {
                  //console.log("Porta");
                  //console.log(colisaoAreaAtual);
                  //console.log(speedColisao[1]);
               }


            }

            if (this.area == 1 && !this.naPlataforma && !colisaoComAPorta) {
               let colisaoExtras = false;
               for (var j = 0; j < areas[1].num_blocos_extras && !colisaoExtras; j++) { // Teste do movimento para os cubos
                  let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].boundingBlocosExtras[j], this.speed, true);
                  this.speed = speedColisao[0];
                  colisaoExtras = speedColisao[1];

               }
            }


         }
         else if (this.grandeArea == 3) {
            this.speed = areas[this.grandeArea - 1].colisoes_area3(this.speed, this.obj, this.larg, 2, this.larg, moveDir, true, this.area);
            if (areas[this.grandeArea - 1].soldados_derrotados == 8) {
               speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[this.grandeArea - 1].plat_chave_box, this.speed, true);

            }


            /*
            let isIntersectingStaircase = this.raycaster.intersectObject(areas[this.grandeArea - 1].degraus[1].rampa).length > 0.01; // Teste da rampa


            if (isIntersectingStaircase) {

               // Está colidindo com a rampa

               let comp_total = areas[this.grandeArea - 1].degraus[1].comprimento;
               let altura_total = areas[this.grandeArea - 1].degraus[1].altura;



               let dir_rampa = new THREE.Vector3(0, altura_total, -comp_total).normalize(); // Vetor diração da rampa
               let rotMatrix = new THREE.Matrix4().makeRotationY(areas[this.grandeArea - 1].degraus[1].angulo_rotacao);
               dir_rampa.applyMatrix4(rotMatrix);

               // Está na rampa
               moveDir.normalize();
               moveDir.y += (altura_total / comp_total);
               let vetorProj = new THREE.Vector3();
               vetorProj.copy(moveDir);
               ////console.log(vetorProj);
               vetorProj.projectOnVector(dir_rampa);
               let moveProjecao = vetorProj.length();
               ////console.log(moveProjecao);
               if (Math.abs(moveProjecao) > 0.0001) {
                  // Move na direção da rampa : incluir subida/descida
                  moveDir.y = vetorProj.y;
               }
               if (this.area == -1) {
                  this.area = this.grandeArea - 1; // Se entrou na rampa, entrou na área com blocos correspondente
               }
               //console.log(moveDir.y);
            }
               */
         }
         else {
            for (var j = 0; j < areas[this.grandeArea - 1].boundingDegraus.length; j++) {

               let colisaoSpeed = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].boundingDegraus[j], this.speed, true);
               this.speed = colisaoSpeed[0];
            }
         }
         if (this.grandeArea == 4) {
            //  //console.log(areas[0].boundingBoxesPilares);
            this.speed = areas[this.grandeArea - 1].colisoes_area4(this.speed, this.obj, this.larg, 2, this.larg, moveDir, false, this.area, this.naPlataforma_a4, true);
            if (areas[3].porta.abrindo || areas[3].porta.aberta) {
               let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[this.grandeArea - 1].painel_box, this.speed, delta);
               this.speed = speedColisao[0];

            }

         }


      }
      else if (this.grandeArea == 0) {
         for (var j = 0; j < 4; j++) {

            let colisaoSpeed = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, fronteira[j + 4], this.speed, true);
            this.speed = colisaoSpeed[0];
         }
      }
      else {
         if (this.redondezasDaFechadura) {
            let colisaoSpeed = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[1].fechadura.box, this.speed, true);
            this.speed = colisaoSpeed[0];
         }
      }

      moveDir.normalize().multiplyScalar(this.speed * delta); // Faz ter a norma da velocidade atual


      this.speed = this.speedPadrao;
      this.obj.position.add(moveDir); //Movimenta objeto da câmera


      // Verifica saída e entrada de grandes áreas
      let grandeArea_e_fechadura = testeGrandesAreas(this.obj, this.grandeArea);
      this.grandeArea = grandeArea_e_fechadura[0];
      this.redondezasDaFechadura = grandeArea_e_fechadura[1];



      let isIntersectingGround = false;
      let isIntersectingStaircase = false;
      let intersectaPlataforma = false;
      this.raycaster.ray.origin.copy(this.obj.position);
      if (this.grandeArea >= 1) {
         if (this.area != -1) {
            if (this.grandeArea != 2)
               isIntersectingStaircase = this.raycaster.intersectObjects([areas[this.area].degraus[1].rampa, areas[this.grandeArea - 1].degraus[0].degraus[7]]).length > 0.00001;
            else
               intersectaPlataforma = this.raycaster.intersectObject(areas[1].plataforma.mesh);
            isIntersectingGround = this.raycaster.intersectObjects([...areas[this.grandeArea - 1].cubos]).length > 0.00001 || this.obj.position.y < 2;
         }
         else {
            if (this.voo) {
               ////console.log(areas[0].degraus[1].rampa)
               if (this.grandeArea != 2)
                  isIntersectingStaircase = this.raycaster.intersectObjects([areas[this.grandeArea - 1].degraus[1].rampa, areas[this.grandeArea - 1].degraus[0].degraus[7]]).length > 0.00001;
               else
                  intersectaPlataforma = this.raycaster.intersectObject(areas[1].plataforma.mesh);
               isIntersectingGround = this.raycaster.intersectObjects([groundPlane, ...areas[this.grandeArea - 1].cubos]).length > 0.00001;
            }
            else {
               isIntersectingGround = this.raycaster.intersectObject(groundPlane).length > 0.1;
            }
         }

      }
      else {
         isIntersectingGround = this.raycaster.intersectObject(groundPlane).length > 0.1;

      }
      if (this.grandeArea == 2 && areas[1].porta.aberta) {

         let objeto = this.obj;
         let pos_plataforma_a2 = new THREE.Vector3(areas[1].plataforma.mesh.position.x, areas[1].plataforma.mesh.position.y, areas[1].plataforma.mesh.position.z);
         pos_plataforma_a2.addVectors(pos_plataforma_a2, areas[1].posicao_ini);
         this.naPlataforma = (objeto.position.x <= pos_plataforma_a2.x + 2 && objeto.position.x >= pos_plataforma_a2.x - 2
            && objeto.position.z <= pos_plataforma_a2.z + 2 && objeto.position.z >= pos_plataforma_a2.z - 2
            //&& objeto.position.y-2 <= pos_plataforma_a2.y+2.1 && objeto.position.y-2 >= pos_plataforma_a2.y+1.95
         );


         if (this.naPlataforma && this.area == -1)
            this.area = 1;




      }

      if (this.grandeArea == 4 && areas[3].muralhas[0].aberta) {
         let objeto = this.obj;
         let pos_plataforma_a4 = new THREE.Vector3(areas[3].plataformas[0].mesh.position.x,
            areas[3].plataformas[0].mesh.position.y, areas[3].plataformas[0].mesh.position.z);
         pos_plataforma_a4.addVectors(pos_plataforma_a4, areas[3].posicao_ini);
         this.naPlataforma_a4[0] = (objeto.position.x <= pos_plataforma_a4.x + 2 && objeto.position.x >= pos_plataforma_a4.x - 2
            && objeto.position.z <= pos_plataforma_a4.z + 2 && objeto.position.z >= pos_plataforma_a4.z - 2
            //&& objeto.position.y-2 <= pos_plataforma_a2.y+2.1 && objeto.position.y-2 >= pos_plataforma_a2.y+1.95
         );
      }
      if (!this.naPlataforma_a4[0] && this.grandeArea == 4 && areas[3].muralhas[0].aberta) {
         let objeto = this.obj;
         let pos_plataforma_a4 = new THREE.Vector3(areas[3].plataformas[1].mesh.position.x,
            areas[3].plataformas[1].mesh.position.y, areas[3].plataformas[1].mesh.position.z);
         pos_plataforma_a4.addVectors(pos_plataforma_a4, areas[3].posicao_ini);
         this.naPlataforma_a4[1] = (objeto.position.x <= pos_plataforma_a4.x + 2 && objeto.position.x >= pos_plataforma_a4.x - 2
            && objeto.position.z <= pos_plataforma_a4.z + 2 && objeto.position.z >= pos_plataforma_a4.z - 2
            //&& objeto.position.y-2 <= pos_plataforma_a2.y+2.1 && objeto.position.y-2 >= pos_plataforma_a2.y+1.95
         );
      }


      if (this.grandeArea > 0 && this.area == -1) {
         let xi = (areas[this.grandeArea - 1].posicao_ini).x;
         let zi = (areas[this.grandeArea - 1].posicao_ini).z;
         let ex = (areas[this.grandeArea - 1]).ex;
         let ez = (areas[this.grandeArea - 1]).ez;


         // Verifica se saiu da área com blocos, indo para o plano base.
         if (this.obj.position.x <= (xi + ex + this.larg) && this.obj.position.x >= (xi - ex - this.larg) && this.obj.position.z <= (zi + ez + this.larg) && this.obj.position.z >= (zi - ez - this.larg)) {

            this.area = this.grandeArea - 1;
         }
      }


      //console.log(moveDir.y);



      if (areas[1].porta.aberta && areas[1].plataforma.em_movimento && areas[1].plataforma.subir) {


         if (this.naPlataforma && this.box.intersectsBox(areas[1].plataforma.box)) {
            let qtd_mov = areas[1].qtd_movimento_plataforma;
            this.obj.position.y += qtd_mov;
            //console.log(this.obj.position.y);
         }
      }

      if (areas[3].plataformas[0].em_movimento && areas[3].plataformas[0].subir) {


         if (this.naPlataforma_a4[0] && this.box.intersectsBox(areas[3].plataformas[0].box)) {
            let qtd_mov = areas[3].qtd_movimento_plataformas[0];
            this.obj.position.y += qtd_mov;
            //console.log(this.obj.position.y);
         }
      }
      if (areas[3].plataformas[1].em_movimento && areas[3].plataformas[1].subir) {


         if (this.naPlataforma_a4[1] && this.box.intersectsBox(areas[3].plataformas[1].box)) {
            let qtd_mov = areas[3].qtd_movimento_plataformas[1];
            this.obj.position.y += qtd_mov;
            //console.log(this.obj.position.y);
         }
      }
      if (this.obj.position.y <= 0.6)
         this.obj.position.y = 0.601;

      this.grupoBarras.position.copy(this.obj.position).add(new THREE.Vector3(0, 1.2, 0));




      //console.log(this.obj.position.y);
   }
   sofrerAtaque(danoInfligido, scene) {
      this.SomLostSoulGerenciamento("levardano");
      this.vida -= danoInfligido;// Decrementa vida em caso de ataque

      console.log("Vida:");
      console.log(this.vida);
      if (!this.padeceu && this.vida <= 0) { // Se ainda não padeceu e a vida chegou a 0 ou algo menor que isso, coloca 0 na vida e acusa fim do inimigo
         this.vida = 0;
         this.padeceu = true;
      }
      // Para adequar a barra;
      const escala = this.vida / this.vidaMax; // Proporção de vida atual 
      this.barraFrente.scale.set(escala, 1, 1);  // reduz proporcionalmente na largura

      const deslocamentoX = -(this.tamBarraVida * (1 - escala)) / 2; // Descola para continuar onde estava, à esquerda, na visão do jogador
      this.barraFrente.position.x = deslocamentoX; // desloca

   }
}

export { Cacodemon };
