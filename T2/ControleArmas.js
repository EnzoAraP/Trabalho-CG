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


const clock = new THREE.Clock();
class LancaMisseis{
   constructor(donoDaArma,inimigos,ehJogador,dano=10,velocidadeProjetil=0.4){
        this.tempoUltimoTiro=0;
        this.ehJogador=ehJogador;
        if(ehJogador){
            this.cylinderGeometry = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 32);
            this.cylinderMaterial = new THREE.MeshLambertMaterial({ color:"rgb(226, 17, 17)"});
            this.cylinder = new THREE.Mesh(this.cylinderGeometry, this.cylinderMaterial);
            this.projetilMaterial = new THREE.MeshLambertMaterial({ color:"rgb(15, 187, 10)"});
      }

      
        else{

                this.abstractGunGeometry = new THREE.BoxGeometry(0.1,0.1,0.1);
        this.invisbleMaterial = new THREE.MeshBasicMaterial({
              color: "red",
              visible: false
           });
        this.cylinder = new THREE.Mesh(this.abstractGunGeometry, this.invisbleMaterial);
        this.projetilMaterial = new THREE.MeshLambertMaterial({ color:"rgb(196, 168, 45)"});
        
}
        
        this.cylinder.position.set(0, 0, 0);
        this.cylinder.rotation.x = -Math.PI / 2; //  Girando a arma para ficar na posição correta

        ////console.log(cylinder);
        //criacao do projetil( vetor que os armazena a todos)
        this.vetProjetil = [];
        this.projetilGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        this.inimigos=inimigos;
        this.numInimigos=this.inimigos.length;
        this.donoDaArma=donoDaArma;

        donoDaArma.add(this.cylinder);// Adiciona arma no jogo
        this.cylinder.position.set(0, -0.3, -0.8); // Estabelece posição da rama para ficar corretamente na câmera
        this.velocidadeProjetil=velocidadeProjetil;
        this.danoInfligido=dano;
   } 


    


// Criação da arma:

      


    atirar(scene,camera,verdade,dist=1){
        
        if(verdade==true){
            
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

                this.vetProjetil.push({ mesh: projetil, direction,frames:0,area_proj:-1 });

                scene.add(projetil);
            }
        }
    }

      controle_acerto_inimigos(boxBala,areaBala,scene){
         if(this.ehJogador)
            console.log("AAAA");
         for(var i=0;i<this.numInimigos;i++){
            let atual=this.inimigos[i];
            if(atual.grandeArea == areaBala && atual.box.intersectsBox(boxBala)){
               if(this.inimigos[i].levaDano){
                  
                  this.inimigos[i].sofrerAtaque(this.danoInfligido,scene);
                     if(this.inimigos[i].padeceu){
                        this.inimigos[i].obj.remove(this.inimigos[i].arma.cylinder);
                        let arma_derrotado=this.inimigos[i].arma;
                        scene.remove( this.inimigos[i].obj);
                        this.inimigos.splice(i, 1);
                        this.numInimigos--;
                        //console.log("Padece");
                        //console.log(this.inimigos);
                        //console.log(this.numInimigos);
                        return [true,arma_derrotado];
                     }
               }
               return [true,null];
            }
         }
         return [false,null];
      }

 controle_projeteis(scene,areas,fronteira){
         
          let colidiu = false;
          let derrotados=[];
          let tamVet = this.vetProjetil.length;
          for (var q = 0; q < tamVet; q++) {
             colidiu = false;
             let proj = this.vetProjetil[q];
             let velocidadeProjetil=this.velocidadeProjetil;
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
                   if (Math.abs(proj.mesh.position.x) > 252 || Math.abs(proj.mesh.position.z) > 252 || Math.abs(proj.mesh.position.y) > 11.1) {
                      proj.frames = 1;
                   }
                   else {
                      let boxBala = new THREE.Box3().setFromObject(proj.mesh);
                      let grande_area_e_fechadura= testeGrandesAreas(proj.mesh, proj.area_proj);
                      proj.area_proj = grande_area_e_fechadura[0];
                      let derr=null;
                      let colidiu_arma_derr= this.controle_acerto_inimigos(boxBala,proj.area_proj,scene);
                      colidiu=colidiu_arma_derr[0];
                      console.log("colidiu?");
                      console.log(colidiu);
                      if(colidiu_arma_derr[1]!=null){
                        derrotados.push(colidiu_arma_derr[1]);
                      }
                      let redFech=grande_area_e_fechadura[1];
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
                            if(redFech){
                               colidiu=(areas[1].fechadura.box.intersectsBox(boxBala));
                               //console.log(areas[1].fechadura.box);
                               //console.log(colidiu);
                               if( colidiu){
                                  //console.log("C-0")
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
                               if(i!=1)
                               { 
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
                               else{
                                  if(areas[1].porta.aberta && (areas[1].plataforma.em_movimento || !areas[1].plataforma.subir) && areas[1].plataforma.box.intersectsBox(boxBala)){
                                     colidiu=true;
                                  }
                                  else{
                                     colidiu=areas[1].porta.box.intersectsBox(boxBala);
                                  } 
                                  for( var j=0;!colidiu && j<areas[1].num_blocos_extras;j++){
                                    if(areas[1].boundingBlocosExtras[j].intersectsBox(boxBala)){
                                       colidiu = true;
                                       //console.log("F");
                                    }
                                  }
                               }
                            }
                         }
                      }
                      else{
                        if( !colidiu && redFech){
                        
                               colidiu=(areas[1].fechadura.box.intersectsBox(boxBala));
                               //console.log(areas[1].fechadura.box);
                               //console.log(colidiu);
                               if( colidiu){
                                  //console.log("C-0")
                              } //console.log("0-C")
    
                        
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

export { LancaMisseis }