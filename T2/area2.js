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

        const material_blocos = setDefaultMaterial("rgb(255, 215, 0)");

// posições fixas (offsets em relação ao centro da área)
        const posicoes= [
        // cinco entre meio e periferia (distância = 0.5 * ex/ez)
        { x: 0.5 * this.ex, z: 0.62 * this.ez },
        { x:  0.82 * this.ex, z:    -0.7 * this.ez },
        { x:  -0.2 * this.ex, z:  -0.34 * this.ez },
        { x: -  0.63 * this.ex, z:   0.18 * this.ez },
        { x:  0.5 * this.ex, z: 0.08       }, // meio-lateral
        { x:  0.15 * this.ex,  z:  0.85 * this.ez }, // canto superior levemente deslocado
        { x: -0.85 * this.ex,  z: -0.20 * this.ez }, // canto inferior esquerdo
        { x:  0.20 * this.ex,  z: -0.75 * this.ez }, // canto inferior direito
        { x: -0.75 * this.ex,  z:  0.50 * this.ez }, // lateral esquerda média
        { x:  0.35 * this.ex,  z: -0.10 * this.ez }, // perto do centro, mas deslocado
        // bloco central (revelador), será o índice 10
        { x: 0,           z: 0       }
        ];

        this.blocosExtras = [];
        this.boundingBlocosExtras = [];
        const dimensoes = [
        { w: 1.6,  d: 1.6,   h: 1.2  },  // bloco 0
        { w: 1.2,  d: 2.4,   h: 2.0  },  // bloco 1
        { w: 2.0,  d: 1.2,   h: 1.6  },  // bloco 2
        { w: 2.4,  d: 0.8,   h: 2.4  },  // bloco 3
        { w: 1.6,  d: 2.0,   h: 1.6  },  // bloco 4
        { w: 2.0,  d: 2.0,   h: 1.0  },  // bloco 5
        { w: 1.2,  d: 1.6,   h: 1.6  },  // bloco 6
        { w: 1.6,  d: 0.95,  h: 1.4  },  // bloco 7
        { w: 2.0,  d: 0.8,   h: 2.0  },  // bloco 8
        { w: 1.8,  d: 1.8,   h: 1.2  },  // bloco 9
        { w: 2.0,  d: 2.0,   h: 0.8  }   // bloco 10 (central, mais baixo)
        ];
        posicoes.forEach((pos, i) => {
        // defina tamanhos variados:
        const dim = dimensoes[i];

        const geo   = new THREE.BoxGeometry(dim.w, dim.h, dim.d);
        const mesh  = new THREE.Mesh(geo, material_blocos);
               mesh.castShadow=true;
    mesh.receiveShadow=true;
        // posição XZ
        this.cube0.add(mesh);
        mesh.position.set(pos.x, dim.h /2 + 2, pos.z);

        this.blocosExtras.push(mesh);

        // marque o bloco central para subir depois
        
        });
        this.num_passos_elevacao=240;
        this.indice_bloco_chave=10;
        this.elevar_bloco=false;
        
        this.limite_elevacao=1.6;
        this.num_blocos_extras=11;

        this.a=0;
        this.b=1.2;
        this.c=0.4;
        this.num_passos_exec=0;
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
            if(dif>=0)
                dif+=0.055;
            else
                dif-=0.054;

            return dif;
        }
        return multiplicador * 0.02;

    }
    mudar_limite_elevacao(limiteY){
        if(this.elevar_bloco)
            return;
        this.limite_elevacao=limiteY-this.c;
        this.a=(-2*this.limite_elevacao+3*this.c)/2;
        this.b=this.limite_elevacao-this.a-this.c;

    }
    funcao_movimento_elevacao(x){
        return this.a*(x**2)+this.b*x+this.c;
    }
    fazer_elevar_bloco(){
        if(!this.elevar_bloco)
            return;
        if(this.num_passos_exec<this.num_passos_elevacao){
            this.num_passos_exec++;
            let bloco_chave = this.blocosExtras[this.indice_bloco_chave];
            let bloco_chave_box=this.boundingBlocosExtras[this.indice_bloco_chave];
            bloco_chave.position.y=this.funcao_movimento_elevacao(this.num_passos_exec/this.num_passos_elevacao)+2;
            bloco_chave_box.setFromObject(bloco_chave);
            console.log(bloco_chave.position.y);
            console.log(this.num_passos_exec);
        }
        if(this.num_passos_exec>=this.num_passos_elevacao)
            this.elevar_bloco=false;
        
        
        
    }
}



export { Area2 };