import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import GUI from '../libs/util/dat.gui.module.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {OBJLoader} from '../build/jsm/loaders/OBJLoader.js';
import {MTLLoader} from '../build/jsm/loaders/MTLLoader.js';
import {ConvexGeometry} from '../build/jsm/geometries/ConvexGeometry.js';
import {initRenderer, 
        initDefaultBasicLight,
        createGroundPlane,
        onWindowResize, 
        initCamera,
      getMaxSize} from "../libs/util/util.js";

function carregarArquivoGLB(assetManager, caminho, nomeArq, visbilidadeInicial,numero,scene, escala=1)
{
   var loader = new GLTFLoader( );
   
   loader.load( caminho + nomeArq + '.glb', function ( gltf ) {
      var obj = gltf.scene.clone(true);
      //console.log(obj);
      obj.name = nomeArq;
      obj.visible = visbilidadeInicial;
      obj.traverse( function ( child ) {
         if( child.isMesh ){ child.castShadow = true; child.receiveShadow=true;}
         if( child.material ) child.material.side = THREE.DoubleSide;         
      });

      obj = normalizeAndRescale(obj,1);
      obj = fixPosition(obj);

      scene.add ( obj );

      assetManager[nomeArq+numero] = obj;
      console.log(nomeArq+numero);  
    });


}
function carregarArquivoObj(assetManager, caminho, nomeArq, visibilidade, caminhomtl, nomeArqMTL, numero, scene) {
 var loader_mtl = new MTLLoader();
  var loader_ob = new OBJLoader();
  loader_mtl.load(caminhomtl + nomeArqMTL + '.mtl', function (mtl) {
   mtl.preload();
    for (const material of Object.values(mtl.materials)) {
      material.side = THREE.DoubleSide;
    }

    loader_ob.setMaterials(mtl);
    loader_ob.load(caminho + nomeArq + '.obj', function (obj) {
      var helper = obj.clone(true);
      helper.name = nomeArq;
      helper.visible = visibilidade;
      helper.traverse(function (child) {
        if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
      });
      helper = normalizeAndRescale(helper, 1);
      helper = fixPosition(helper);
      assetManager["lost_Soul"+ numero] = helper;
      console.log("lost_Soul" + numero);
       scene.add(helper);
    });
  });
}


// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); 
  obj.scale.set(newScale * (1.0/scale),
                newScale * (1.0/scale),
                newScale * (1.0/scale));
  return obj;
}

function fixPosition(obj)
{
  // Fix position of the object over the ground plane
  var box = new THREE.Box3().setFromObject( obj );
  if(box.min.y > 0)
    obj.translateY(-box.min.y);
  else
    obj.translateY(-1*box.min.y);
  return obj;
}

export {carregarArquivoGLB,carregarArquivoObj}