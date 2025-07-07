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

class Cacodemon{
   
    constructor(objeto,camera,boxInimigo,larg,speedPadrao,arma,personagem){
    this.voo=true;
    this.obj=objeto;
    
    this.camera=camera;

    this.box=boxInimigo;
   this.personagem_rival=personagem;
    this.larg=larg;

    this.speedPadrao=speedPadrao;
    this.speed=speedPadrao;

    this.naPlataforma=false;

    this.possui_chave1 = true; 

    this.grandeArea = -1; // Variável que armazena em qual das 6 grande as áreas o personagem está.
/* As grandes áreas são: Transição(-1): Área base onde há apenas colisão com o chão para se testar. Todo lugar onde não há objetos por perto.
 Fronteira(0) : Região próxima às muralhas do mapa( tem formato de moldura quadrada)
 Grande Áreas de 1 a 4: Representam as áreas especiais do jogo(Plataformas em formato de paralelepípedo) e seus derredores( margem de 4 unidades de comprimento)

*/
    this.area = -1; // Variável que indica em qual área em formato de paralelepípedo presente no jogo.

    this.redondezasDaFechadura=false;

    this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0, 2.1);    

    this.direcao_movimento=new THREE.Vector3(0,0,0);    

    this.contagemMudanca=0;

    this.maxMudanca=120;

    this.contagemEsperaAtaque=0;

    this.maxEsperaAtaque=4;

    this.contagemPreAtaque=0;

   this.tempoRotacao=30;

    this.arma=arma;
    this.obj.add(arma);    

    this.vida=50;
    this.levaDano=true;   
    this.padeceu=false;
    this.eixo_x = new THREE.Vector3(1, 0, 0);
    this.eixo_y = new THREE.Vector3(0, 1, 0);
    this.eixo_z = new THREE.Vector3(0, 0, 1);
    }

  gerarMovimento(personagem=this.personagem_rival.obj){
    //console.log(this.obj.position);
    //console.log(this.personagem_rival.obj);
    this.direcao_movimento.subVectors(personagem.position,this.obj.position);
    let direcao_imimigo_copia=(new THREE.Vector3(0,0,0)).copy(this.direcao_movimento);
    let giroY= (Math.random()**2)*(Math.PI/4);
    let positivo =(Math.random()>=0.5) ;
    if(!positivo)
      giroY=-giroY;
    let giroZ= (Math.random()**3)*(Math.PI/4);
    if(Math.abs(this.direcao_movimento.y)>0.5 && this.direcao_movimento.y<0 )
        giroZ/=5;
    if(this.direcao_movimento.y*this.direcao_movimento.x<0)
        giroZ=-giroZ;

        
    

    let rotMatrixY = new THREE.Matrix4().makeRotationY(giroY);
    
    this.direcao_movimento.applyMatrix4(rotMatrixY);

    if(this.direcao_movimento.y<-0.1 || this.direcao_movimento.y>0){
        let rotMatrixZ = new THREE.Matrix4().makeRotationZ(giroZ);
        this.direcao_movimento.applyMatrix4(rotMatrixZ);

   }
   let alvo = (new THREE.Vector3).addVectors(this.obj.position,this.direcao_movimento);
   this.obj.lookAt(
      alvo
   );

    

  }


  ataque_especial(scene){
    this.direcao_movimento.subVectors(this.personagem_rival.obj.position,this.obj.position);
    this.obj.lookAt(this.personagem_rival.obj.position);
    

  }


  sofrerAtaque(danoInfligido,scene){
        this.vida-=danoInfligido;
        console.log("Vida:")
        console.log(this.vida);
        if(!this.padeceu && this.vida<=0){
            this.obj.remove(this.arma);
            scene.remove(this.obj);
            this.padeceu=true;
        }
  }
 movimento(areas,fronteira,groundPlane,delta,moveUp,reset,scene=null) {

   if(this.contagemPreAtaque!=0){
      this.contagemPreAtaque++;
      if(this.contagemPreAtaque==25){
         this.contagemPreAtaque=0;
         this.arma.atirar(scene,this.obj,true,0.3);
         
}
      return;
   }
   this.contagemMudanca++;

   if(this.contagemMudanca>=this.maxMudanca){
         this.contagemEsperaAtaque++;
         if(this.contagemEsperaAtaque==this.maxEsperaAtaque){
               this.ataque_especial(scene);
               this.contagemEsperaAtaque=0;
               this.contagemPreAtaque=1;
               this.maxEsperaAtaque=2+Math.floor(Math.random() * 3);
         }
         else{
            this.gerarMovimento();
         }
         this.contagemMudanca=0;
         this.maxMudanca=50+Math.floor(Math.random() * 41);
   }
   this.raycaster.ray.origin.copy(this.obj.position);

   const frontal = new THREE.Vector3(); // Vetor direção da câmera
   this.obj.getWorldDirection(frontal);


   frontal.normalize();

   const direito = new THREE.Vector3(); // Vetor perpendicular à direita
   direito.crossVectors(frontal, this.eixo_y).normalize();


   let moveDir= new THREE.Vector3();

   moveDir.copy(this.direcao_movimento);


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
        
         let colisaoAreaAtual=false;
         for (var j = 0; j < 3; j++) { // Teste do movimento para os cubos
            let speedColisao=verifica_colisoes_com_blocos(this.obj,this.larg,1.2,this.larg,moveDir,areas[this.grandeArea-1].boundingCubos[j],this.speed);
            this.speed=speedColisao[0];
            if(!colisaoAreaAtual && speedColisao[1])
               colisaoAreaAtual=true;
         }
         if(this.grandeArea==2){
            
            let speedColisao=verifica_colisoes_com_blocos(this.obj,this.larg,1.2,this.larg,moveDir,areas[this.grandeArea-1].porta.box,this.speed);
            this.speed=speedColisao[0];
            let colisaoComAPorta=speedColisao[1];
            let colisaoComAPlataforma=false;
            if( this.redondezasDaFechadura){
               speedColisao=verifica_colisoes_com_blocos(this.obj,this.larg,1.2,this.larg,moveDir,areas[this.grandeArea-1].fechadura.box,this.speed);
               this.speed=speedColisao[0];
               
            }
            else{
               if((areas[1].plataforma.em_movimento || !areas[1].plataforma.subir)&& !this.naPlataforma ){
                  
                  let speedColisao=verifica_colisoes_com_blocos(this.obj,this.larg,1.2,this.larg,moveDir,areas[this.grandeArea-1].plataforma.box,this.speed);
                  this.speed=speedColisao[0];
                  colisaoComAPlataforma=speedColisao[1];
                  if(colisaoComAPlataforma){
                     //console.log("Plat");
                  }
               }
               else{
               //console.log("Porta");
               //console.log(colisaoAreaAtual);
               //console.log(speedColisao[1]);
            }
               

            }

            if(this.area==1 && !this.naPlataforma && !colisaoComAPorta){
               let colisaoExtras=false;
               for (var j = 0; j < areas[1].num_blocos_extras && !colisaoExtras; j++) { // Teste do movimento para os cubos
                  let speedColisao=verifica_colisoes_com_blocos(this.obj,this.larg,1.2,this.larg,moveDir,areas[this.grandeArea-1].boundingBlocosExtras[j],this.speed);
                  this.speed=speedColisao[0];
                  colisaoExtras=speedColisao[1];
                  
               }
            }
            

         }   
         else{
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

            let colisaoSpeed= verifica_colisoes_com_blocos(this.obj,this.larg,1.2,this.larg,moveDir,fronteira[j + 4],this.speed);
            this.speed=colisaoSpeed[0];
         }
      }
      else{
         if(this.redondezasDaFechadura){
            let colisaoSpeed=verifica_colisoes_com_blocos(this.obj,this.larg,1.2,this.larg,moveDir,areas[1].fechadura.box,this.speed);
            this.speed=colisaoSpeed[0];
         }
      }

      moveDir.normalize().multiplyScalar(this.speed * delta); // Faz ter a norma da velocidade atual


      this.speed = this.speedPadrao;
      this.obj.position.add(moveDir); //Movimenta objeto da câmera


      // Verifica saída e entrada de grandes áreas
     let grandeArea_e_fechadura=testeGrandesAreas(this.obj,this.grandeArea);
     this.grandeArea= grandeArea_e_fechadura[0];
     this.redondezasDaFechadura=grandeArea_e_fechadura[1];



   let isIntersectingGround = false;
   let isIntersectingStaircase = false;
   let intersectaPlataforma = false;
   this.raycaster.ray.origin.copy(this.obj.position);
   if (this.grandeArea >= 1) {
      if (this.area != -1) {
         if(this.grandeArea!=2)
            isIntersectingStaircase = this.raycaster.intersectObjects([areas[this.area].degraus[1].rampa, areas[this.grandeArea - 1].degraus[0].degraus[7]]).length > 0.00001;
         else
            intersectaPlataforma = this.raycaster.intersectObject(areas[1].plataforma.mesh);
         isIntersectingGround = this.raycaster.intersectObjects([...areas[this.grandeArea - 1].cubos]).length > 0.00001 || this.obj.position.y < 2;
      }
      else {
         if (this.voo) {
            ////console.log(areas[0].degraus[1].rampa)
            if(this.grandeArea!=2)
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
   if(this.grandeArea==2 && areas[1].porta.aberta){
      
      let objeto=this.obj;
         let pos_plataforma_a2=new THREE.Vector3(areas[1].plataforma.mesh.position.x,areas[1].plataforma.mesh.position.y,areas[1].plataforma.mesh.position.z);
         pos_plataforma_a2.addVectors(pos_plataforma_a2,areas[1].posicao_ini);
         this.naPlataforma = (objeto.position.x <= pos_plataforma_a2.x+1 && objeto.position.x >= pos_plataforma_a2.x-1
            && objeto.position.z <= pos_plataforma_a2.z+1 && objeto.position.z >= pos_plataforma_a2.z-1 
            //&& objeto.position.y-2 <= pos_plataforma_a2.y+2.1 && objeto.position.y-2 >= pos_plataforma_a2.y+1.95
         );
      

         if(this.naPlataforma && this.area==-1)
            this.area=1;  

         
         
         
   }


   if(this.grandeArea>0 && this.area==-1){
         let xi = (areas[this.grandeArea-1].posicao_ini).x;
            let zi = (areas[this.grandeArea-1].posicao_ini).z;
            let ex = (areas[this.grandeArea-1]).ex;
            let ez = (areas[this.grandeArea-1]).ez;


            // Verifica se saiu da área com blocos, indo para o plano base.
            if (this.obj.position.x <= (xi + ex + this.larg) && this.obj.position.x >= (xi - ex - this.larg) && this.obj.position.z <= (zi + ez + this.larg) && this.obj.position.z >= (zi - ez - this.larg)) {

               this.area = this.grandeArea-1;
            }
   }

   
   //console.log(moveDir.y);

  

   if(areas[1].porta.aberta && areas[1].plataforma.em_movimento && areas[1].plataforma.subir){

      
      if(this.naPlataforma && this.box.intersectsBox(areas[1].plataforma.box)){
        let qtd_mov=areas[1].qtd_movimento_plataforma;
         this.obj.position.y+=qtd_mov;
         //console.log(this.obj.position.y);
      }
   }
   if(this.obj.position.y<=0.6)
      this.obj.position.y=0.601;


 
   

   //console.log(this.obj.position.y);
}
}

export{ Cacodemon };