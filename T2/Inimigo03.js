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

import { SpriteMixer } from '../libs/sprites/SpriteMixer.js';
import { armaSoldado } from './armaSoldado.js';


var eixo_x = new THREE.Vector3(1, 0, 0);
var eixo_y = new THREE.Vector3(0, 1, 0);
var eixo_z = new THREE.Vector3(0, 0, 1);


const clock = new THREE.Clock();

class Soldado {

    constructor(objeto, camera, boxInimigo, larg, speedPadrao, arma, personagem, scene) {
        this.voo = true;
        this.obj = objeto;

        this.tipo='soldado';
        this.camera = camera;

        this.tempoTiro=200;

        this.box = boxInimigo;
        this.personagem_rival = personagem;
        this.larg = larg;

        this.speedPadrao = speedPadrao;
        this.speed = speedPadrao;

        this.naPlataforma = false;

        this.possui_chave1 = true;

        this.preparando_ataque=false;

        this.perturbacao_tiro=0;

        this.grandeArea = 3; // Variável que armazena em qual das 6 grande as áreas o personagem está.
        /* As grandes áreas são: Transição(-1): Área base onde há apenas colisão com o chão para se testar. Todo lugar onde não há objetos por perto.
         Fronteira(0) : Região próxima às muralhas do mapa( tem formato de moldura quadrada)
         Grande Áreas de 1 a 4: Representam as áreas especiais do jogo(Plataformas em formato de paralelepípedo) e seus derredores( margem de 4 unidades de comprimento)
        
        */
        this.area = 2; // Variável que indica em qual área em formato de paralelepípedo presente no jogo.

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

        this.espera_tiro = 0;

        this.girando = false;

        this.coef_rot_hor = 0;

        this.coef_rot_ver = 0;

        this.t_max = 0;

        this.mult = 1;

        this.arma = arma;

        this.tempoDesap = 50;

        this.passos_desap = 0;

        this.taxaDesap = 0.02;

        this.sumiu = false;

        this.transparente = false;

        this.dormindo = true;

        this.vidaMax = 30;
        this.vida = this.vidaMax;

        this.levaDano = true;
        this.padeceu = false;


        this.posicao_anterior_inimigo=new THREE.Vector3();

        this.eixo_x = new THREE.Vector3(1, 0, 0);
        this.eixo_y = new THREE.Vector3(0, 1, 0);
        this.eixo_z = new THREE.Vector3(0, 0, 1);

        this.anterior_xz = 0;
        this.anterior_yz = 0;




        this.girando = false;
        this.espera_tiro = 0;
        this.t_max = 0;
        this.quaternionInicial = new THREE.Quaternion();
        this.quaternionFinal = new THREE.Quaternion();


        this.barraFrente = null;
        this.barraFundo = null;
        this.grupoBarras = null;
        this.tamBarraVida = 1.2;

        this.carregarSprites(scene);

        this.moveUp = false;
        this.moveDown = false;
        this.moveRight = false;
        this.moveLeft = false;


        this.armaSoldado = new armaSoldado(this.obj,scene,[this.personagem_rival]);
    }

    
    // Função para acordar inimigos para batalha
    acordar() {
        this.dormindo = false;
        this.obj.visible = true;
        this.grupoBarras.visible = true;
    }

    // Função para operar seu sumiço gradativo
    sumir(areas,delta) {
        console.log("AAAAAAAAA");
         this.spriteMixer.update(delta);
        if(this.sumiu)
            return;
        if(this.actions.Die.isInLoop){
           
            return;
        }
        else if(!this.barraFundo.visible){
            //this.sumiu=true;
            return;
        }

        console.log("BBBBBBBBBBB")
        this.obj = this.actionSprite;
        this.grupoBarras.lookAt(this.personagem_rival.obj.position); // Barras continuam viradas ao usuário
        this.resetIsInLoopFlags([false,false,false,false]);
        this.actions.Die.playOnce(true);
        this.barraFundo.visible=false;
        areas[2].soldados_derrotados++;
  
        return;
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

    carregarSprites(scene) {

        
        this.spriteMixer, this.actionSprite = null, this.running, this.lastRunning, this.shooting = false, this.shootingFlag = 0, this.actions = {};
        this.dead = false; // Flag to control the die action
        this.parallelMovement = true; // Variable to control parallel movement

        this.spriteMixer = SpriteMixer();

        // Make sure to use the texture once it's fully loaded, by
        // passing a callback function to the loader.
        let loader = new THREE.TextureLoader();
        let texture = loader.load("../assets/textures/sprites/zombieman.png", (texture) => {

            // An ActionSprite is instantiated with these arguments :
            // - which THREE.Texture to use
            // - the number of columns in your animation
            // - the number of rows in your animation
            this.actionSprite = this.spriteMixer.ActionSprite(texture, 8, 8);

            this.actionSprite.position.y = 0.9; // Adjust the height of the sprite
            this.actionSprite.setFrame(0, 0); // set initial frame of the sprite

            // - which actionSprite to use
            // - duration of ONE FRAME in the animation, in milliseconds
            // - line and column of the beginning of the action
            // - line and column of the end of the action
            this.actions.runDown = this.spriteMixer.Action(this.actionSprite, 100, 0, 0, 3, 0);
            this.actions.runLD = this.spriteMixer.Action(this.actionSprite, 100, 0, 1, 3, 1); // Left Down
            this.actions.runLeft = this.spriteMixer.Action(this.actionSprite, 100, 0, 2, 3, 2);
            this.actions.runLU = this.spriteMixer.Action(this.actionSprite, 100, 0, 3, 3, 3); // Left Up
            this.actions.runUp = this.spriteMixer.Action(this.actionSprite, 100, 0, 4, 3, 4);
            this.actions.runRU = this.spriteMixer.Action(this.actionSprite, 100, 0, 5, 3, 5); // Right Up    
            this.actions.runRight = this.spriteMixer.Action(this.actionSprite, 100, 0, 6, 3, 6);
            this.actions.runRD = this.spriteMixer.Action(this.actionSprite, 100, 0, 7, 3, 7); // Right Down     

            this.actions.Die = this.spriteMixer.Action(this.actionSprite, 150, 7, 0, 7, 3); // Die action

            this.actions.ShootingDown = this.spriteMixer.Action(this.actionSprite, this.tempoTiro, 4, 0, 5, 0);
            this.actions.ShootingLD = this.spriteMixer.Action(this.actionSprite, 100, 4, 1, 5, 1);
            this.actions.ShootingLeft = this.spriteMixer.Action(this.actionSprite, 100, 4, 2, 5, 2);
            this.actions.ShootingLU = this.spriteMixer.Action(this.actionSprite, 100, 4, 3, 5, 3);
            this.actions.ShootingUp = this.spriteMixer.Action(this.actionSprite, 100, 4, 4, 5, 4);
            this.actions.ShootingRU = this.spriteMixer.Action(this.actionSprite, 100, 4, 5, 5, 5);
            this.actions.ShootingRight = this.spriteMixer.Action(this.actionSprite, 100, 4, 6, 5, 6);
            this.actions.ShootingRD = this.spriteMixer.Action(this.actionSprite, 100, 4, 7, 5, 7);

            this.actionSprite.scale.set(2, 2, 2);
            scene.add(this.actionSprite);
            this.obj = this.actionSprite;
            this.obj.visible=false;
        });
        texture.colorSpace = THREE.SRGBColorSpace; // Fix sprite color space 

        this.obj = this.actionSprite;
    }





    gerarMovimento(personagem = this.personagem_rival.obj) {
        if (this.actionSprite == null)
            return;
        this.obj = this.actionSprite;

        this.acordar();
        

        this.preparando_ataque = false; // Ativa giro
        this.espera_tiro = 0; //Estabelece tempo de giro


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
        let giroY = (Math.random() ** (exp)) * Math.PI / 2 + giroMin;  // Estabelece giro em relação à direção dele até o personagem

        let positivo = (Math.random() >= 0.5); // Sorteia o sentido

        if (!positivo) {
            giroY = -giroY;
        }




        let rotMatrixY = new THREE.Matrix4().makeRotationY(giroY); // Matriz de rotação

        this.direcao_movimento.applyMatrix4(rotMatrixY);

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

        let anterior= [this.moveUp, this.moveDown, this.moveLeft, this.moveRight];

        this.moveUp = this.moveDown = this.moveRight = this.moveLeft = false;
        const giroYG = THREE.MathUtils.radToDeg(giroY);
        if (giroYG <= 67.5 && giroYG >= -67.5) {
             this.moveDown = true;
        }
        if (giroYG >= 22.5 && giroYG <= 157.5) {
            this.moveLeft = true;
        }
        if (giroYG >= 112.5 || giroYG <= -112.5) {
           
            this.moveUp = true;
        }
        if (giroYG <= -22.5 && giroYG >= -157.5) {
            
            this.moveRight = true;
        }


        

        const dummy = new THREE.Object3D();
        dummy.position.copy(this.obj.position);
        dummy.lookAt(alvoPos);  // Simula giro total do objeto
        this.quaternionFinal.copy(dummy.quaternion); // Obtém quartenion final

        console.log(`${giroYG},${this.moveDown},${this.moveLeft},${this.moveUp},${this.moveRight}`);

            

        let chaves=[false,false,false,false];
        /*if (this.moveUp){  chaves[2]=true;}
        if (this.moveDown){  chaves[0]=true;}
        if (this.moveRight){ chaves[3]=true;}
        if (this.moveLeft){ chaves[1]=true;}
    */
        
         this.resetIsInLoopFlags(chaves); // Reset the isInLoop flags for all actions 
        

        this.animacao_sprite(null, null);

       

    }


    // ataque_especial com mesmo sistema, mas agora não se altera direção, alemja-se olhar diretamente para a posição atual do personagem
 


    // Dentro do movimento()

    animacao_sprite(moveDir, delta) {
        // 1) mixer
        
        console.log("chamou");

        if (this.moveLeft) {
            if (!this.moveUp && !this.moveDown) {
                this.lastRunning = this.running = 'left';
                if (!this.actions.runLeft.isInLoop) {this.actions.runLeft.playLoop();console.log(this.running); }
            } else if (this.moveDown) {
                this.lastRunning = this.running = 'ld';
                if (!this.actions.runLD.isInLoop) {this.actions.runLD.playLoop();console.log(this.running); }
            } else {
                this.lastRunning = this.running = 'lu';
                if (!this.actions.runLU.isInLoop) {this.actions.runLU.playLoop();console.log(this.running); }
            }
        }

        else if (this.moveRight) {
            if (!this.moveUp && !this.moveDown) {
                this.lastRunning = this.running = 'right';
                if (!this.actions.runRight.isInLoop) {this.actions.runRight.playLoop();console.log(this.running); }
            } else if (this.moveDown) {
                this.lastRunning = this.running = 'rd';
                if (!this.actions.runRD.isInLoop) {this.actions.runRD.playLoop();console.log(this.running); }

            } else {
                this.lastRunning = this.running = 'ru';
                if (!this.actions.runRU.isInLoop) {this.actions.runRU.playLoop();console.log(this.running); }
            }
        }

        else { // Finally, check if only UP or DOWN is pressed
            if (this.moveUp) { // Only left pressed
                this.lastRunning = this.running = 'up'; // Set running direction to up
                if (!this.actions.runUp.isInLoop){ this.actions.runUp.playLoop(); console.log(this.running); }
            } else {
                this.lastRunning = this.running = 'down'; // Set running direction to down
                if (!this.actions.runDown.isInLoop){ this.actions.runDown.playLoop();
                console.log(this.running);}
            }
        }

        
    }

    resetIsInLoopFlags(chaves) {
        if (this.actions.runDown && !chaves[0]) this.actions.runDown.isInLoop = false;
        if (this.actions.runLeft && !chaves[1]) this.actions.runLeft.isInLoop = false;
        if (this.actions.runUp && !chaves[2]) this.actions.runUp.isInLoop = false;
        if (this.actions.runRight && !chaves[3]) this.actions.runRight.isInLoop = false;

        if (this.actions.runLD && !(chaves[1] && chaves[0])){ this.actions.runLD.isInLoop = false;}
        if (this.actions.runLU && !(chaves[1] && chaves[2])) this.actions.runLU.isInLoop = false;
        if (this.actions.runRD && !(chaves[3] && chaves[0])) this.actions.runRD.isInLoop = false;
        if (this.actions.runRU && !(chaves[3] && chaves[2])) this.actions.runRU.isInLoop = false;
    }

    


       ataque_especial(scene) {
        this.preparando_ataque = true;
        this.espera_tiro = 0;
        this.resetIsInLoopFlags([false,false,false,false]);

        this.actionSprite.setFrame(4, 0);

        this.recalcular_perturbacao_tiro();

        
            
     
         
    }

    recalcular_perturbacao_tiro(){
        let exp=5;
        this.perturbacao_tiro = (Math.random() ** (exp)) * Math.PI/35;
        let negativo = (Math.random()<0.5);
        if(negativo)
            this.perturbacao_tiro=-this.perturbacao_tiro;
    }

    movimento(areas, fronteira, groundPlane, delta, moveUp, reset, scene = null) {
        console.log(this.vida);
        if(this.vida<=0){
                this.sumir(areas,delta);
                return;
            }
        if (this.dormindo) // Se estiver a dormir, não faz nada
            return;

            

            console.log("Azul");
        //console.log(this.personagem_rival.obj.position);
        this.grupoBarras.lookAt(this.personagem_rival.obj.position); // Faz barras de vida olharem para o jogador
        if (this.contagemPreAtaque != 0) {// Giro para o ataque é mais rápido
            this.contagemPreAtaque++;
            this.spriteMixer.update(delta)
            if (this.contagemPreAtaque == 20) {
                this.numTiros=0;
                this.numTirosMax=4;
                this.numero_troca=1+Math.round(Math.random()*3);
                console.log("Atacando");
                this.personagem_rival.obj.getWorldPosition(this.posicao_anterior_inimigo);
                this.tempoControle = performance.now();
                this.actions.ShootingDown.playLoop();
            }
            else if(this.contagemPreAtaque>20){
                 console.log("Atacando2");
                this.tempoAtual = performance.now();
                
                if(this.tempoAtual>=this.tempoControle+2*this.tempoTiro){
                    this.tempoControle = this.tempoAtual;
                    this.numTiros++;
                    this.armaSoldado.atirar(scene,areas,fronteira,this.obj,true,this.perturbacao_tiro,this.posicao_anterior_inimigo);
                    this.personagem_rival.obj.getWorldPosition(this.posicao_anterior_inimigo);
             
                    if(this.numTiros==this.numTirosMax){
                        this.contagemPreAtaque = 0;
                        this.actions.ShootingDown.inLoop=false;
                    }   
                    else{
                        this.recalcular_perturbacao_tiro();
                    } 
                    
                    
                    
                }
                else{
                    if((this.contagemEsperaAtaque-20)%this.numero_troca==0){
                        this.personagem_rival.obj.getWorldPosition(this.posicao_anterior_inimigo);
                    }
                }
            }
            return;
        }
        this.contagemMudanca++; // Incrementa a contagem de mudança

        if (this.contagemMudanca >= this.maxMudanca) { // Se chegar o momento,
            this.contagemEsperaAtaque++; // Mais uma mudança, mais um na contagem do ataque
            if ( this.contagemEsperaAtaque == this.maxEsperaAtaque) { // Se o número de mudanças for igual ao número esperado para atacar, prepara o ataque
                this.ataque_especial(scene); // Direcionar-se ao jogador
                this.contagemEsperaAtaque = 0; // Zera espera
                this.contagemPreAtaque = 1; // inicia pré-ataque
                this.maxEsperaAtaque = 15 + Math.floor(Math.random() * 3); // Sorteia nova espera máxima, de 2 a 4.
                return;
            }
            else {
                this.gerarMovimento(); // Gera movimento padrão de giro e define direção do movimento

                this.contagemMudanca = 0; // Reinicia
                this.maxMudanca = 50 + Math.floor(Math.random() * 41); // entre 50 e 90 frames para atacar
            }
        }
        if (this.obj == null)
            return;
        this.raycaster.ray.origin.copy(this.obj.position);
        
         
        const frontal = new THREE.Vector3(); // Vetor direção da câmera
         frontal.subVectors(this.personagem_rival.obj.position, this.obj.position); 
       
        frontal.y = 0;// Tira parte em y para movimento x-z

        frontal.normalize();

        const direito = new THREE.Vector3(); // Vetor perpendicular à direita
        direito.crossVectors(frontal, this.eixo_y).normalize();
    


        let moveDir = new THREE.Vector3(); // Vetor para armazenar movimento
        if (this.moveUp){ moveDir.sub(frontal); }
        if (this.moveDown){ moveDir.add(frontal); }
        if (this.moveRight){ moveDir.sub(direito); }
        if (this.moveLeft){ moveDir.add(direito);}
    
    
 this.spriteMixer.update(delta);
        
        

        




       

        moveDir.y = 0;

        

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
                let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].boundingCubos[j], this.speed, delta, true);
                this.speed = speedColisao[0];
                if (!colisaoAreaAtual && speedColisao[1])
                    colisaoAreaAtual = true;
            }

            if (this.grandeArea == 1) {
                //  console.log(areas[0].boundingBoxesPilares);

                for (var i = 0; i < areas[0].boundingBoxesPilares.length; i++) {

                    let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[0].boundingBoxesPilares[i], this.speed, delta, true);
                    this.speed = speedColisao[0];
                    if (speedColisao[1] == true) {
                        console.log("bateu");
                    }
                }

                let colisaoPlat = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[0].boundingBoxplat, this.speed, delta, true);
                this.speed = colisaoPlat[0];



            }
            if (this.grandeArea == 2) {

                let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].porta.box, this.speed, delta, true);
                this.speed = speedColisao[0];
                let colisaoComAPorta = speedColisao[1];
                let colisaoComAPlataforma = false;
                if (this.redondezasDaFechadura) {
                    speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].fechadura.box, this.speed, delta, true);
                    this.speed = speedColisao[0];
                    if (areas[this.grandeArea - 1].chave1 != null) {
                        speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].chave1Box, this.speed, delta, true);
                        this.speed = speedColisao[0];
                    }

                }
                else {
                    if ((areas[1].plataforma.em_movimento || !areas[1].plataforma.subir) && !this.naPlataforma) {

                        let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].plataforma.box, this.speed, delta, true);
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
                        let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[this.grandeArea - 1].boundingBlocosExtras[j], this.speed, delta, true);
                        this.speed = speedColisao[0];
                        colisaoExtras = speedColisao[1];

                    }
                }


            }
            else if (this.grandeArea == 3) {
               let speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[this.grandeArea - 1].porta1.box, this.speed,delta);
               this.speed = speedColisao[0];
               console.log(speedColisao[1]);

               speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[this.grandeArea - 1].porta2.box, this.speed,delta);
               this.speed = speedColisao[0];

               speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[this.grandeArea - 1].boundingCube4, this.speed,delta);
               this.speed = speedColisao[0];

               speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[this.grandeArea - 1].boundingCube5, this.speed,delta);
               this.speed = speedColisao[0];

               speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[this.grandeArea - 1].assetManager.planeBox, this.speed,delta);
               this.speed = speedColisao[0];


               speedColisao = verifica_colisoes_com_blocos(this.obj, this.larg, 2, this.larg, moveDir, areas[this.grandeArea - 1].bounding_caixa_bloqueio, this.speed,delta);
               this.speed = speedColisao[0];
            }
            else {
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
            }

        }
        else if (this.grandeArea == 0) {
            for (var j = 0; j < 4; j++) {

                let colisaoSpeed = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, fronteira[j + 4], this.speed, delta, true);
                this.speed = colisaoSpeed[0];
            }
        }
        else {
            if (this.redondezasDaFechadura) {
                let colisaoSpeed = verifica_colisoes_com_blocos(this.obj, this.larg, 1.2, this.larg, moveDir, areas[1].fechadura.box, this.speed, delta, true);
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
                if (this.grandeArea != 2 && this.grandeArea != 3)
                    isIntersectingStaircase = this.raycaster.intersectObjects([areas[this.area].degraus[1].rampa, areas[this.grandeArea - 1].degraus[0].degraus[7]]).length > 0.00001;
                else if(this.grandeArea == 2)
                    intersectaPlataforma = this.raycaster.intersectObject(areas[1].plataforma.mesh);
                isIntersectingGround = this.raycaster.intersectObjects([...areas[this.grandeArea - 1].cubos]).length > 0.00001 || this.obj.position.y < 2;
            }
            else {
                if (this.voo) {
                    ////console.log(areas[0].degraus[1].rampa)
                    if (this.grandeArea != 2 && this.grandeArea != 3)
                        isIntersectingStaircase = this.raycaster.intersectObjects([areas[this.grandeArea - 1].degraus[1].rampa, areas[this.grandeArea - 1].degraus[0].degraus[7]]).length > 0.00001;
                    else if(this.grandeArea == 2)
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
        if (this.obj.position.y <= 0.6)
            this.obj.position.y = 0.601;

        this.grupoBarras.position.copy(this.obj.position).add(new THREE.Vector3(0, 1.2, 0));

        this.actionSprite.position.copy(this.obj.position);
        //this.actionSprite.quaternion.copy(this.obj.quaternion);

        // e então:
         


        if (this.actionSprite) {
            if (this.parallelMovement) {
                const euler = new THREE.Euler(); // Converter o quaternion da câmera para Euler
                euler.setFromQuaternion(this.camera.quaternion, 'YXZ'); // Acerta ordem da transformação    
                this.actionSprite.rotation.y = euler.y; // Copia rotação para o sprite para mantê-lo perpendicular à camera
            } else {
                this.actionSprite.rotation.y = 0;
            }
        }

        //console.log(this.obj.position.y);
    }

    sofrerAtaque(danoInfligido, scene) {
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

export { Soldado };
