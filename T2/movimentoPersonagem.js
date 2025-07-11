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

var eixo_x = new THREE.Vector3(1, 0, 0);
var eixo_y = new THREE.Vector3(0, 1, 0);
var eixo_z = new THREE.Vector3(0, 0, 1);
class Personagem{
   
    constructor(objeto,camera,boxPersonagem,larg,speedPadrao){
    this.voo=true;
    this.obj=objeto;
    
    this.chegada_area1=false;
    
    this.chegada_area2=false;

    this.camera=camera;

    this.box=boxPersonagem;

    this.larg=larg;

    this.speedPadrao=speedPadrao;
    this.speed=speedPadrao;

    this.naPlataforma=false;

    this.saiu_plataforma=false;

    this.possui_chave1 = true; 

    this.grandeArea = -1; // Variável que armazena em qual das 6 grande as áreas o personagem está.
/* As grandes áreas são: Transição(-1): Área base onde há apenas colisão com o chão para se testar. Todo lugar onde não há objetos por perto.
 Fronteira(0) : Região próxima às muralhas do mapa( tem formato de moldura quadrada)
 Grande Áreas de 1 a 4: Representam as áreas especiais do jogo(Plataformas em formato de paralelepípedo) e seus derredores( margem de 4 unidades de comprimento)

*/
    this.area = -1; // Variável que indica em qual área em formato de paralelepípedo presente no jogo.

    this.redondezasDaFechadura=false;

    this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0).normalize(), 0, 2.1);    

       

    this.eixo_x = new THREE.Vector3(1, 0, 0);
    this.eixo_y = new THREE.Vector3(0, 1, 0);
    this.eixo_z = new THREE.Vector3(0, 0, 1);
    }

 movimento(areas,fronteira,groundPlane,delta,moveForward,moveBackward,moveRight,moveLeft,moveUp,reset) {

   this.raycaster.ray.origin.copy(this.obj.position);

   const frontal = new THREE.Vector3(); // Vetor direção da câmera
   this.obj.getWorldDirection(frontal);

   frontal.y = 0;// Tira parte em y para movimento x-z
   frontal.normalize();

   const direito = new THREE.Vector3(); // Vetor perpendicular à direita
   direito.crossVectors(frontal, this.eixo_y).normalize();


   const moveDir = new THREE.Vector3(); // Vetor para armazenar movimento
   if (moveForward) moveDir.add(frontal);
   if (moveBackward) moveDir.sub(frontal);
   if (moveRight) moveDir.add(direito);
   if (moveLeft) moveDir.sub(direito);
   this.box = new THREE.Box3().setFromCenterAndSize(
               new THREE.Vector3(this.obj.position.x, this.obj.position.y - 1.0, this.obj.position.z),
               new THREE.Vector3(this.larg, 2.0, this.larg) // largura, altura, profundidade desejadas
            );
   

   if (moveDir.lengthSq() !== 0) { // Se houver movimento
      
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
            let speedColisao=verifica_colisoes_com_blocos(this.obj,this.larg,2,this.larg,moveDir,areas[this.grandeArea-1].boundingCubos[j],this.speed);
            this.speed=speedColisao[0];
            if(!colisaoAreaAtual && speedColisao[1])
               colisaoAreaAtual=true;
         }
         if(this.grandeArea==2){
            
            let speedColisao=verifica_colisoes_com_blocos(this.obj,this.larg,2,this.larg,moveDir,areas[this.grandeArea-1].porta.box,this.speed);
            this.speed=speedColisao[0];
            let colisaoComAPorta=speedColisao[1];
            let colisaoComAPlataforma=false;
            if( this.redondezasDaFechadura){
               speedColisao=verifica_colisoes_com_blocos(this.obj,this.larg,2,this.larg,moveDir,areas[this.grandeArea-1].fechadura.box,this.speed);
               this.speed=speedColisao[0];
               let colisaoComFechadura=speedColisao[1];
               if(colisaoComFechadura && !areas[1].porta.aberta && !areas[1].porta.abrindo && this.possui_chave1){
                  areas[1].porta.abrindo=true;
               }
            }
            else{
               if((areas[1].plataforma.em_movimento || !areas[1].plataforma.subir)&& !this.naPlataforma ){
                  
                  let speedColisao=verifica_colisoes_com_blocos(this.obj,this.larg,2,this.larg,moveDir,areas[this.grandeArea-1].plataforma.box,this.speed);
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
                  let speedColisao=verifica_colisoes_com_blocos(this.obj,this.larg,2,this.larg,moveDir,areas[this.grandeArea-1].boundingBlocosExtras[j],this.speed);
                  this.speed=speedColisao[0];
                  colisaoExtras=speedColisao[1];
                  
               }
               if(areas[1].num_passos_exec==0){
                  areas[1].mudar_limite_elevacao(5);
               }
            }
            

         }   
         else{
            let isIntersectingStaircase = this.raycaster.intersectObject(areas[this.grandeArea - 1].degraus[1].rampa).length > 0.0001; // Teste da rampa


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
               //console.log(vetorProj);
               vetorProj.projectOnVector(dir_rampa);
               let moveProjecao = vetorProj.length();
               //console.log(moveProjecao);
               if (Math.abs(moveProjecao) > 0.0001) {
                  // Move na direção da rampa : incluir subida/descida
                  moveDir.y = vetorProj.y;
               }
               if (this.area == -1) {
                  this.area = this.grandeArea - 1; // Se entrou na rampa, entrou na área com blocos correspondente
                  console.log("Entrou na area " + this.area);
               }
               //console.log(moveDir.y);
            }
         }

      }
      else if (this.grandeArea == 0) {
         for (var j = 0; j < 4; j++) {

            let colisaoSpeed= verifica_colisoes_com_blocos(this.obj,this.larg,2,this.larg,moveDir,fronteira[j + 4],this.speed);
            this.speed=colisaoSpeed[0];
         }
      }
      else{
         if(this.redondezasDaFechadura){
            let colisaoSpeed=verifica_colisoes_com_blocos(this.obj,this.larg,2,this.larg,moveDir,areas[1].fechadura.box,this.speed);
            this.speed=colisaoSpeed[0];
            let colisaoComFechadura=colisaoSpeed[1];
               if(colisaoComFechadura && !areas[1].porta.aberta && !areas[1].porta.abrindo && this.possui_chave1){
                  areas[1].porta.abrindo=true;
               }
         }
      }

      moveDir.normalize().multiplyScalar(this.speed * delta); // Faz ter a norma da velocidade atual


      this.speed = this.speedPadrao;
      this.obj.position.add(moveDir); //Movimenta objeto da câmera


      // Verifica saída e entrada de grandes áreas
     let grandeArea_e_fechadura=testeGrandesAreas(this.obj,this.grandeArea);
     this.grandeArea= grandeArea_e_fechadura[0];
     this.redondezasDaFechadura=grandeArea_e_fechadura[1];
   }


   let isIntersectingGround = false;
   let isIntersectingStaircase = false;
   let intersectaPlataforma = false;
   this.raycaster.ray.origin.copy(this.obj.position);
   if (this.grandeArea >= 1) {
      if (this.area != -1) {
         if(this.grandeArea!=2)
            isIntersectingStaircase = this.raycaster.intersectObjects([areas[this.area].degraus[1].rampa, areas[this.grandeArea - 1].degraus[0].degraus[7]]).length > 0.0001;
         else
            intersectaPlataforma = this.raycaster.intersectObject(areas[1].plataforma.mesh).length>0.0001;
         isIntersectingGround = this.raycaster.intersectObjects([...areas[this.grandeArea - 1].cubos]).length > 0.0001 || this.obj.position.y <= 2;
      }
      else {
         if (this.voo) {
            //console.log(areas[0].degraus[1].rampa)
            if(this.grandeArea!=2)
               isIntersectingStaircase = this.raycaster.intersectObjects([areas[this.grandeArea - 1].degraus[1].rampa, areas[this.grandeArea - 1].degraus[0].degraus[7]]).length >0.0001;
            else
               intersectaPlataforma = this.raycaster.intersectObject(areas[1].plataforma.mesh).length>0.0001;
            isIntersectingGround = this.raycaster.intersectObjects([groundPlane, ...areas[this.grandeArea - 1].cubos]).length > 0.00001;
         }
         else {
            isIntersectingGround = this.raycaster.intersectObject(groundPlane).length > 0.0001;
         }
      }

   }
   else {
      isIntersectingGround = this.raycaster.intersectObject(groundPlane).length > 0.0001;

   }
   //console.log(intersectaPlataforma);
   if (!isIntersectingGround && !isIntersectingStaircase && !intersectaPlataforma) {
      console.log("queda");
      
      this.obj.position.y -= 5 * delta;
      this.raycaster.ray.origin.copy(this.obj.position);
      if (this.grandeArea >= 1) {
         //console.log(area);
         if (this.area != -1) {
            this.box = new THREE.Box3().setFromCenterAndSize(
               new THREE.Vector3(this.obj.position.x, this.obj.position.y - 1.0, this.obj.position.z),
               new THREE.Vector3(this.larg, 2.0, this.larg) // largura, altura, profundidade desejadas
            );
            if(this.grandeArea!=2)
               isIntersectingStaircase = this.raycaster.intersectObjects([areas[this.area].degraus[1].rampa, areas[this.grandeArea - 1].degraus[0].degraus[7]]).length > 0.0001;
            else
               intersectaPlataforma = this.raycaster.intersectObject(areas[1].plataforma.mesh).length>0.0001;
            isIntersectingGround = false;
            if(isIntersectingGround = this.raycaster.intersectObjects([...areas[this.grandeArea - 1].cubos]).length > 0.0001 || this.obj.position.y <= 2);
            if (isIntersectingGround || isIntersectingStaircase || intersectaPlataforma){
               //this.obj.position.y += 5 * delta;
               console.log("volta");
            }
         }



      }
   }
   if(this.grandeArea==2 && areas[1].porta.aberta){
      
      let objeto=this.obj;
         let pos_plataforma_a2=new THREE.Vector3(areas[1].plataforma.mesh.position.x,areas[1].plataforma.mesh.position.y,areas[1].plataforma.mesh.position.z);
         pos_plataforma_a2.addVectors(pos_plataforma_a2,areas[1].posicao_ini);
         this.naPlataforma = (objeto.position.x <= pos_plataforma_a2.x+0.75 && objeto.position.x >= pos_plataforma_a2.x-0.75
            && objeto.position.z <= pos_plataforma_a2.z+0.75 && objeto.position.z >= pos_plataforma_a2.z-0.75 
            //&& objeto.position.y-2 <= pos_plataforma_a2.y+2.1 && objeto.position.y-2 >= pos_plataforma_a2.y+1.95
         ) ;
         if(!this.saiu_plataforma && !this.naPlataforma)
            this.saiu_plataforma=objeto.position.x > pos_plataforma_a2.x || objeto.position.x < pos_plataforma_a2.x
            || objeto.position.z < pos_plataforma_a2.z || objeto.position.z > pos_plataforma_a2.z; 

        

         if(this.naPlataforma && this.area==-1)
            this.area=1;  
         if(!areas[1].plataforma.em_movimento && !areas[1].plataforma.subir && objeto.position.y<=2.2){
            //console.log("Desce");
            areas[1].plataforma.em_movimento=(objeto.position.x <= pos_plataforma_a2.x+(3+this.larg) && objeto.position.x >= pos_plataforma_a2.x-(3+this.larg) 
            && objeto.position.z <= pos_plataforma_a2.z+(3+this.larg) && objeto.position.z >= pos_plataforma_a2.z-(3+this.larg) );
           // console.log(areas[1].plataforma.em_movimento);
         }   
         else if(!areas[1].plataforma.em_movimento && !areas[1].plataforma.emEspera && this.naPlataforma &&(areas[1].plataforma.subir || this.saiu_plataforma)){
            areas[1].plataforma.emEspera=true;
         }

         if(areas[1].plataforma.emEspera)
         {  
            if(!this.naPlataforma){
               areas[1].plataforma.tempo_espera=0;
               areas[1].plataforma.emEspera=false;
            }
            else{
               areas[1].plataforma.tempo_espera++;
            if(areas[1].plataforma.tempo_espera>=120){
               areas[1].plataforma.em_movimento=true;
               areas[1].plataforma.tempo_espera=0;
               areas[1].plataforma.emEspera=false;
               this.saiu_plataforma=false;
            } 
            }
              
         }
        

         if(!this.chegada_area2 && this.area==1 && this.saiu_plataforma && this.obj.position.y>=5.99)
            this.chegada_area2=true;
         
         
         
   }
   //console.log(moveDir.y);
   
         if(!this.chegada_area1 && this.area==0 )
            this.chegada_area1=true;
   if (reset == true) {
      this.obj.position.set(-50, 8, -140);
      this.obj.rotation.set(0, 0, 0);
   }
   if (this.voo && moveUp == true) {
      this.obj.position.y += 20 * delta; // Se voo estiver ativado
   }
   //}

   if(areas[1].porta.abrindo){
      areas[1].abrir_porta(2,1);
  
   }
   else if(areas[1].porta.aberta && areas[1].plataforma.em_movimento){
      let mult=1;
      let limite=0;
      if(! areas[1].plataforma.subir){
         mult=-1;
         limite=-3.949;
      }
      let qtd_mov=areas[1].mover_plataforma(limite,mult);
      if(this.naPlataforma && this.raycaster.intersectObject(areas[1].plataforma.mesh).length>0.01){
         this.obj.position.y+=qtd_mov;
         console.log(this.obj.position.y);
      }
      //console.log("Plat");
   }

 
}
}

export{ Personagem };