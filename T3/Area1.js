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
import { BoxGeometry, TextureLoader } from '../build/three.module.js';
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
       this.pegavel=false;
       this.materialPlat = new THREE.MeshLambertMaterial({ color: "rgb(245, 245, 220)",map:this.chao}); // cria o material da plataforma
       this.geometriaPlat = new THREE.BoxGeometry(2,5,2);
       this.plat = new THREE.Mesh(this.geometriaPlat,this.materialPlat);
       this.plat.visible =false;
       this.plat.castShadow=true;
       this.plat.receiveShadow=true;
       this.visivel=false;
       this.boundingBoxesPilares=[];
       this.boundingBoxplat=null;
       this.pilares = [];
       this.chave = null;
       this.pedras = [];
       this.BoundingBoxpedras = [];

       this.chaveRem=false;
       this.carregarTexturaPilar()
       this.Cubos_Loader()
       this.Por_Textura_Cubo()
    }
    
Cubos_Loader(){ // carrega texturas antes para não lagar
  var textureLoader = new THREE.TextureLoader();
 this.chao = textureLoader.load('../T3/AssetsT3/GroundColor.jpg');//carrega textura do chao
 this.chaonormal = textureLoader.load('../T3/AssetsT3/GroundNormalGL.jpg');//carrega normal do chao
}
Por_Textura_Cubo(){// poe texturas nos cubos
  
  // cube1: 70x4x50 
  const cube1Materials = [
    this.changeMatCubo(0.0, 0.0, 10, 2),     // Right (+X) 
    this.changeMatCubo(0.0, 0.0, 10, 2),     // Left (-X) 
    this.changeMatCubo(0.0, 0.0, 10, 7),    // Top (+Y) 
    this.changeMatCubo(0.0, 0.0, 10, 7),    // Bottom (-Y)
    this.changeMatCubo(0.0, 0.0, 10, 1),    // Front (+Z) 
    this.changeMatCubo(0.0, 0.0, 10, 1)     // Back (-Z)
  ];
  
  // cube2: 64.5x4x2 
  const cube2Materials = [
    this.changeMatCubo(0.0, 0.0, 10, 1),    // Right (+X) 
    this.changeMatCubo(0.0, 0.0, 10, 1),    // Left (-X)
    this.changeMatCubo(0.0, 0.0, 10, 0.5),  // Top (+Y) 
    this.changeMatCubo(0.0, 0.0, 10, 0.5),  // Bottom (-Y)
    this.changeMatCubo(0.0, 0.0, 1, 1),     // Front (+Z) 
    this.changeMatCubo(0.0, 0.0, 1, 1)      // Back (-Z) 
  ];
  
  // cube3: 70x4x50 
  const cube3Materials = [
    this.changeMatCubo(0.0, 0.0, 10, 2),     // Right (+X) 
    this.changeMatCubo(0.0, 0.0, 10, 2),     // Left (-X) 
    this.changeMatCubo(0.0, 0.0, 10, 7),    // Top (+Y) 
    this.changeMatCubo(0.0, 0.0, 10, 7),    // Bottom (-Y) 
    this.changeMatCubo(0.0, 0.0, 10, 1),    // Front (+Z) 
    this.changeMatCubo(0.0, 0.0, 10, 1)     // Back (-Z) 
  ];
  
  // Apply materials to cubes
  this.cube1.material = cube1Materials;
  this.cube2.material = cube2Materials;
  this.cube3.material = cube3Materials;

}
 changeMatCubo(offsetX, offsetY, repeatX,repeatY) { // função para montar textura Pedra
  const tex =this.chao.clone(); //clona textura pra n ferrar ela
  const normal =this.chaonormal.clone(); // clona normal pra  ferrar
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;// wrap no repeat pra se der bosta
  tex.offset.set(offsetX, offsetY); // offset de antes(nem usa)
  tex.repeat.set(repeatX, repeatY); // repeat pra cada lado
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping; // mesma coisa pra normal pq se n fica estranho
 normal.offset.set(offsetX, offsetY);
  normal.repeat.set(repeatX, repeatY);

  return new THREE.MeshLambertMaterial({ map:tex, normalMap:normal}); // cria de vez
}
subir_Plataforma(){
  
  let localPlat = new THREE.Vector3(0,-2,0);
  let localchave = new THREE.Vector3(0,2.75,0);
  this.plat.position.copy(localPlat);
  this.criarChave(this.plat,localchave,0.5);
  this.cube0.add(this.plat);
  this.plat.visible=true;

}
carregarTexturaPilar(){ // funçaao para carregar a textura dos pilares a parte, fazendo assim que não pese ao olhar pra eles.
  var textureLoader = new THREE.TextureLoader();
 this.pedra = textureLoader.load('../T3/AssetsT3/BricksColor.jpg');//carrega textura do pilar
this.dismappedra = textureLoader.load('../T3/AssetsT3/BricksDisplacement.jpg'); // carrega displacment map feito
this.normalmappedra= textureLoader.load('../T3/AssetsT3/BricksNormalGL.jpg');
this.stone = textureLoader.load('../T3/AssetsT3/Stone_Columnbasecolor.jpg');//carrega textura do pilar
this.dismap = textureLoader.load('../T3/AssetsT3/Stone_Columnheight.png'); // carrega displacment map feito
this.normalmap = textureLoader.load('../T3/AssetsT3/Stone_Columnnormal.jpg');
  this.dismap.wrapS = THREE.RepeatWrapping;
    this.dismap.wrapT = THREE.RepeatWrapping; // ← IMPORTANTE para bordas
    
    this.stone.wrapS = THREE.RepeatWrapping;
    this.stone.wrapT = THREE.ClampToEdgeWrapping;
    
    this.normalmap.wrapS = THREE.RepeatWrapping;
    this.normalmap.wrapT = THREE.ClampToEdgeWrapping;

    this.pedra.wrapS = THREE.RepeatWrapping;
    this.pedra.wrapT = THREE.RepeatWrapping;
}
criarPedra(Posicao,largura,comprimento)
{
  let cor = new THREE.Color(15/255,125/255,125/255);

  let materialinvi = [ // faz material a partir da função MakeMat, com repeat. Usa em um dos 2 eixos
  this.makeMatPedra(0.0, 0.0,1,1), // Right (+X)
  this.makeMatPedra(0.0, 0.0,1,1), // Left (−X)
  this.makeMatPedra(0.0, 0.0,8,1), // Top (+Y)
  this.makeMatPedra(0.0, 0.0,8,1), // Bottom (−Y)
  this.makeMatPedra(0.0, 0.0,8,1), // Front (+Z)
  this.makeMatPedra(0.0, 0.0,8,1)  // Back (−Z)
];
  
  
  let materialinvi2 = [ // faz material a partir da função MakeMat, com repeat. Usa em um dos 2 eixos
  this.makeMatPedra(0.0, 0.0,12,1), // Right (+X)
  this.makeMatPedra(0.0, 0.0,12,1), // Left (−X)
  this.makeMatPedra(0.0, 0.0,1,12), // Top (+Y)
  this.makeMatPedra(0.0, 0.0,1,12), // Bottom (−Y)
  this.makeMatPedra(0.0, 0.0,1,1), // Front (+Z)
  this.makeMatPedra(0.0, 0.0,1,1)  // Back (−Z)
];
  
  
  let cuboGeometry = new THREE.BoxGeometry(largura,2,comprimento);
    let Pedra ;
if (largura>comprimento){ //
Pedra = new THREE.Mesh(cuboGeometry,materialinvi);
}
if(largura<=comprimento){
  Pedra = new THREE.Mesh(cuboGeometry,materialinvi2);
}
  Pedra.position.copy(Posicao);
  this.cube0.add(Pedra);
  console.log(Pedra);
  this.pedras.push(Pedra);

}
 makeMatPedra(offsetX, offsetY, repeatX,repeatY) { // função para montar textura Pedra
  const tex =this.pedra.clone(); //clona textura pra n ferrar ela
  const normal =this.normalmappedra.clone(); // clona normal pra  ferrar
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;// wrap no repeat pra se der bosta
  tex.offset.set(offsetX, offsetY); // offset de antes(nem usa)
  tex.repeat.set(repeatX, repeatY); // repeat pra cada lado
  normal.wrapS = normal.wrapT = THREE.RepeatWrapping; // mesma coisa pra normal pq se n fica estranho
 normal.offset.set(offsetX, offsetY);
  normal.repeat.set(repeatX, repeatY);

  return new THREE.MeshLambertMaterial({ map:tex, normalMap:normal}); // cria de vez
}
 criaPilar(Posicao) {// Cria n


let materialcilindro= new THREE.MeshLambertMaterial({
  
  
  reflectivity:0.35,
  refractionRatio: 0.5,
   side: THREE.DoubleSide 

});
let materialTopoEBaixo =new THREE.MeshLambertMaterial({ // separa o material em 2 para tentar n ferra displacement map
  reflectivity:0.35,
  refractionRatio: 0.5,
   side: THREE.DoubleSide 
})
// tirou os cones
let pi =Math.PI;

//let cilindroGeometry = new THREE.BoxGeometry(3,3,3,32,16);// cilindro centra do
let cilindroGeometry = new THREE.CylinderGeometry(1,1,6,32,16);// cilindro centra do
materialcilindro.map = this.stone;
materialcilindro.normalMap= this.normalmap;
materialcilindro.normalScale= new THREE.Vector2(1,1);
materialcilindro.displacementMap = this.dismap; /// adiciona displacement map
materialcilindro.displacementScale = 0.6;
materialTopoEBaixo.map = this.stone;


let cilindro= new THREE.Mesh(cilindroGeometry,[materialcilindro,materialTopoEBaixo,materialTopoEBaixo]);


cilindro.position.copy(Posicao);

cilindro.castShadow = true;
cilindro.receiveShadow = true;

this.cube0.add(cilindro)
this.pilares.push(cilindro);
}
 criarChave(objcolocar,posicao,cuboLado){
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
 let cor2;
 cor="rgb(0,0,0)";
 cor2="rgb(100,10,0)";
 chave.material = new THREE.MeshPhongMaterial({
  color: cor, 
        emissive: cor2,
        specular: 0xffffff, 
        shininess: 50,
        reflectivity: 0.35,
        refractionRatio: 0.5
 }) 
 
 chave.position.copy(posicao);
this.chave=chave;
objcolocar.add(chave);
}

}

export {Area1};
