import * as THREE from  'three';
import Stats from '../build/jsm/libs/stats.module.js';
import GUI from '../libs/util/dat.gui.module.js';
import { OrbitControls } from '../build/jsm/controls/OrbitControls.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {ConvexGeometry} from '../build/jsm/geometries/ConvexGeometry.js';
import {initRenderer, 
        initDefaultBasicLight,
        createGroundPlane,
        onWindowResize, 
        initCamera,
      getMaxSize} from "../libs/util/util.js";

function carregarArquivoGLB(caminho, nomeArq, visbilidadeInicial, escala,scene)
{
   var loader = new GLTFLoader( );
   
   loader.load( caminho + nomeArq + '.glb', function ( gltf ) {
      var obj = gltf.scene;
      console.log(obj);
      obj.name = nomeArq;
      obj.visible = visbilidadeInicial;
      obj.traverse( function ( child ) {
         if( child.isMesh ) child.castShadow = true;
         if( child.material ) child.material.side = THREE.DoubleSide;         
      });

      var obj = normalizeAndRescale(obj, escala);
      var obj = fixPosition(obj);

      scene.add ( obj );

      assetManager[nome] = obj;
      console.log(nome);  
    });


}

export {carregarArquivoGLB}