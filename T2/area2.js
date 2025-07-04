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


class Area2 {
    constructor(geomterias_cubos,materiais_cubos) {
        this.geometria_porta = new BoxGeometry(0.2, 4, 2);
        this.material_porta = setDefaultMaterial("rgb(50,120,90)");
        this.porta_area_2 = new THREE.Mesh(this.geometria_porta, this.material_porta);
        this.porta_area_2_aberta = false;
        this.porta_2_abrindo = false;

        this.geometria_suporte_fechadura = new THREE.BoxGeometry(1.5, 1, 1.5);
        this.material_suporte_fechadura = setDefaultMaterial("rgb(100,100,100)");
        this.suporte_fechadura = new THREE.Mesh(this.geometria_suporte_fechadura, this.material_suporte_fechadura);
        this.geometria_plataforma_a2 = new BoxGeometry(2, 4, 2);
        this.material_plataforma_a2 = setDefaultMaterial("rgb(105, 152, 163)");
        this.plataforma_area_2 = new THREE.Mesh(this.geometria_plataforma_a2, this.material_plataforma_a2);




        this.cube0 = new THREE.Mesh(geomterias_cubos[0], materiais_cubos[0]),
            this.cube1 = new THREE.Mesh(geomterias_cubos[1], materiais_cubos[1]),
            this.cube2 = new THREE.Mesh(geomterias_cubos[2], materiais_cubos[1]),
            this.cube3 = new THREE.Mesh(geomterias_cubos[3], materiais_cubos[1]),
            this.degraus = [],
            this.posicao_ini = new THREE.Vector3(-100, 2, 0),
            this.cubos = [],
            this.boundingCubos = [],
            this.boundingRampa = null,
            this.boundingDegraus = [],
            this.ex = 35,
            this.ez = 51,


            this.cube0.add(this.suporte_fechadura);
        this.cube0.add(this.porta_area_2);
        this.cube0.add(this.plataforma_area_2);

        this.suporte_fechadura.translateX(40);
        this.suporte_fechadura.translateZ(-5);
        this.suporte_fechadura.translateY(0.5 - 2);
        this.porta_area_2.translateX(35.1);
        this.plataforma_area_2.translateX(34);
        this.plataforma_area_2.translateY(-3.949);
        this.porta = { mesh: this.porta_area_2, box: null, abrindo: false, aberta: false };
        this.fechadura = { mesh: this.suporte_fechadura, box: null };

        this.plataforma = { mesh: this.plataforma_area_2, box: null, em_movimento: false, subir: true, tempo_espera: 0, emEspera: false };





        this.cubos = [this.cube1, this.cube2, this.cube3];
    }
    abrir_porta( limiteZ, multiplicador) {
      
        this.porta.mesh.position.z += multiplicador * 0.01;
       
        this.porta.box.setFromObject(this.porta.mesh);
        if (multiplicador * this.porta.mesh.position.z >= multiplicador * limiteZ) {
            this.porta.mesh.position.z = limiteZ;
            this.porta.box.setFromObject(this.porta.mesh);
            this.porta.abrindo=false;
            this.porta.aberta=true;
        }

    }

    mover_plataforma( limiteY, multiplicador) {

        let plataforma = this.plataforma.mesh;
        let plataformaBox = this.plataforma.box;


        plataforma.position.y += multiplicador * 0.02;
        console.log(plataforma.position.y);
        plataformaBox.setFromObject(plataforma);
        if (multiplicador * plataforma.position.y > multiplicador * limiteY) {
            let dif = limiteY - plataforma.position.y + multiplicador * 0.02;
            plataforma.position.y = limiteY;

            console.log(plataforma.position.y);
            plataformaBox.setFromObject(plataforma);
            this.plataforma.em_movimento = false;
            this.plataforma.subir = (!this.plataforma.subir);
            if(dif<0)
                dif-0.051;
            else
                dif+=0.07;

            return dif;
        }
        return multiplicador * 0.02;

    }
}



export { Area2 };