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
export function criarChave(obj,posicao,cuboLado,cor="rgb(0,0,0)",cor2="rgb(100,10,0)"){
    let pi =Math.PI;
    
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
        color: cor, 
        emissive: cor2, 
        specular: 0xffffff, 
        shininess: 50,
        reflectivity: 0.35,
        refractionRatio: 0.5
     }) 
    chave.castShadow=true;
    chave.receiveShadow=true;
     chave.position.copy(posicao);
    obj.add(chave);
    return chave;
}
    

    
  