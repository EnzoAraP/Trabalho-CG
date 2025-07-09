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
import { CSG } from '../libs/other/CSGMesh.js'  
class Area1{
  constructor(geomterias_cubos,materiais_cubos){
    //Cubos:
       this.cube0= new THREE.Mesh(geomterias_cubos[0], materiais_cubos[0]), //Cubo central-pai.
       // Cubos que compõem o cenário
       this.cube1= new THREE.Mesh(geomterias_cubos[1], materiais_cubos[0]),
       this.cube2= new THREE.Mesh(geomterias_cubos[2], materiais_cubos[0]),
       this.cube3= new THREE.Mesh(geomterias_cubos[3], materiais_cubos[0]),
    
       // Vetor das escadas, retorno de fução que retorna diversos elementos da escadaria( Ver mais na função): Vetor de objetos dos degraus, rampa para fazer subida e inclinação: 
       this.degraus= [],
       this.posicao_ini= new THREE.Vector3(-100, 2, -150), // Posição inicial do cubo central(núcleo) da área
       this.cubos= [], // Vetor dos cubos que compõem o cenário
       this.boundingCubos= [], // Vetor das boundigBoxes dos cubos acima
       this.boundingRampa= null, // boundingBox da rampa da escada
       this.boundingDegraus= [], // Vetor com a boudingBox dos degraus
       this.ex= 35, // Extensão da área em relação a seu centro no eixo x( Metade do comprimento do lado em x do paralelepípedo)
       this.ez= 51 // Extensão da área em relação a seu centro no eixo z( Metade do comprimento do lado em z do paralelepípedo)
       this.cubos = [this.cube1, this.cube2, this.cube3];
    }
    
  

 criaPilar(Posicao) {// Cria n
let cor = new THREE.Color(5/255,5/255,5/255);
let materialinvi= new THREE.MeshLambertMaterial({
  color: cor
});
let pi =Math.PI;


let cilindroGeometry = new THREE.CylinderGeometry(1,1,4,5);// cilindro centra do
let cilindro= new THREE.Mesh(cilindroGeometry,materialinvi);
let coneaGeometry = new THREE.ConeGeometry(1.4,2,20,10);
let cone1 = new THREE.Mesh(coneaGeometry,materialinvi);
let cone2 = new THREE.Mesh(coneaGeometry,materialinvi);
cilindro.position.copy(Posicao);
cilindro.add(cone1);
cilindro.add(cone2);
cone2.rotateX(pi);
cone1.position.set(0,-1.5,0);
cone2.position.set(0,1.5,0);
cone1.castShadow = true;
cone2.castShadow = true;
cilindro.castShadow = true;
cilindro.receiveShadow = false;
cone1.receiveShadow = false;
cone2.receiveShadow = false;
this.cube0.add(cilindro);
}
 criarChave(posicao,cuboLado){
let pi =Math.PI;
let cor = new THREE.Color(25/255,25/255,25/255);
let material= new THREE.MeshBasicMaterial({
  color: cor
}); 

let cubeGeometry = new THREE.BoxGeometry(cuboLado, cuboLado,cuboLado)// cria cubo que será usado no centro
let cube = new THREE.Mesh(cubeGeometry, material);
let CilindroGeometry = new THREE.CylinderGeometry(cuboLado/4,cuboLado/4,cuboLado*2,20,20);//cria cilindros usados para subtrair do cubo
let cilindro1 = new THREE.Mesh(CilindroGeometry, material);// cria cilindros para cortar o cubo
let cilindro2 = new THREE.Mesh(CilindroGeometry, material);
let cilindro3 = new THREE.Mesh(CilindroGeometry, material);

cilindro2.rotateX(pi/2);// rotaciona cubo 2 no eixo X
cilindro3.rotateZ(pi/2);// rotaciona cubo 3 no eixo Z
cilindro1.matrixAutoUpdate = false; // cancela update da matrix automatico depois atualiza manualmente
cilindro1.updateMatrix();
cilindro2.matrixAutoUpdate = false;
cilindro2.updateMatrix();
cilindro3.matrixAutoUpdate = false;
cilindro3.updateMatrix();

let cilindro1CSG = CSG.fromMesh(cilindro1);// cria CSGs apartir dos cilindros e cubo
let cilindro2CSG = CSG.fromMesh(cilindro2);
let cilindro3CSG = CSG.fromMesh(cilindro3);
let cuboCSG = CSG.fromMesh(cube);


let firstCSG = cuboCSG.subtract(cilindro1CSG);// retira cilindros um a um;
let secondCSG = firstCSG.subtract(cilindro2CSG);
let lastCSG = secondCSG.subtract(cilindro3CSG);
 let chave = CSG.toMesh(lastCSG, new THREE.Matrix4());// chave 
 chave.material = new THREE.MeshPhongMaterial({
  color: cor
 }) 

 chave.position.copy(posicao);

this.cube0.add(chave);
}

}

export {Area1};
