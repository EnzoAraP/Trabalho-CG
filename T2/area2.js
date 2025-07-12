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
import { criarChave } from './criacaoChave.js';

class Area2 {
    constructor(geomterias_cubos,materiais_cubos) {
        this.geometria_porta = new BoxGeometry(0.2, 4, 4);
        this.material_porta =  new THREE.MeshLambertMaterial({ color:"rgb(50,120,90)"});
        this.porta_area_2 = new THREE.Mesh(this.geometria_porta, this.material_porta);
        this.porta_area_2_aberta = false;
        this.porta_2_abrindo = false;

        this.geometria_suporte_fechadura = new THREE.BoxGeometry(1.5, 1, 1.5);
        this.material_suporte_fechadura = new THREE.MeshLambertMaterial({ color:"rgb(100,100,100)"});
        this.suporte_fechadura = new THREE.Mesh(this.geometria_suporte_fechadura, this.material_suporte_fechadura);
        this.geometria_plataforma_a2 = new BoxGeometry(4, 4, 4);
        this.material_plataforma_a2 = new THREE.MeshLambertMaterial({ color:"rgb(105, 152, 163)"});
        this.plataforma_area_2 = new THREE.Mesh(this.geometria_plataforma_a2, this.material_plataforma_a2);

        var cubeGeo1 = new THREE.BoxGeometry(70, 4, 48);
        var cubeGeo2 = new THREE.BoxGeometry(66, 4, 4);
        var cubeGeo3 = new THREE.BoxGeometry(70, 4, 48);

        geomterias_cubos[1]=cubeGeo1;
        geomterias_cubos[2]=cubeGeo2;
        geomterias_cubos[3]=cubeGeo3;
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

            //this.cube1.translateZ(0.5);
            //this.cube3.translateZ(-0.5);
            this.cube2.translateX(-1.75);
            this.cube0.add(this.suporte_fechadura);
        this.cube0.add(this.porta_area_2);
        this.cube0.add(this.plataforma_area_2);

        this.suporte_fechadura.translateX(40);
        this.suporte_fechadura.translateZ(-5);
        this.suporte_fechadura.translateY(0.5 - 2);
        this.porta_area_2.translateX(34.9);
        this.plataforma_area_2.translateX(33);
        this.plataforma_area_2.translateY(-3.949);
        this.porta = { mesh: this.porta_area_2, box: null, abrindo: false, aberta: false };
        this.fechadura = { mesh: this.suporte_fechadura, box: null };

        this.plataforma = { mesh: this.plataforma_area_2, box: null, em_movimento: false, subir: true, tempo_espera: 0, emEspera: false };
        this.porta.mesh.castShadow=true;
        this.porta.mesh.receiveShadow=true;
        this.plataforma.mesh.castShadow=true;
        this.plataforma.mesh.receiveShadow=true;
        this.fechadura.mesh.castShadow=true;
        this.fechadura.mesh.receiveShadow=true;




        this.cubos = [this.cube1, this.cube2, this.cube3];

        const material_blocos = new THREE.MeshLambertMaterial({ color:"rgb(255, 215, 0)"});

// posições fixas (offsets em relação ao centro da área)
        this.posicoes= [
        // cinco entre meio e periferia (distância = 0.5 * ex/ez)
        { x: 0.1 * this.ex, y:2, z: 0.5 * this.ez },
        { x:  0.2 * this.ex, y:2.7, z:    0.3 * this.ez },
        { x:  0.4 * this.ex, y:2, z:  0.7 * this.ez },
        { x:   0.83 * this.ex, y:2, z:   0.12 * this.ez },
        { x:  -0.3 * this.ex,   y:4.9, z: 0.6 * this.ez       }, // meio-lateral
        { x:  -0.52 * this.ex, y:3.2,  z:  0.85 * this.ez }, // canto superior levemente deslocado
        { x: -0.85 * this.ex, y:2, z: 0.21 * this.ez }, // canto inferior esquerdo
        { x:  -0.11 * this.ex, y:2, z: 0.48 * this.ez }, // canto inferior direito
        { x: -0.75 * this.ex, y:4, z:  -0.09 * this.ez }, // lateral esquerda média
        { x:  -0.39 * this.ex, y:2, z: -0.19 * this.ez }, // perto do centro, mas deslocado
        // bloco central (revelador), será o índice 10
        { x: 0,      y:2,     z: 0       },
        { x: -0.92 * this.ex, y:2,  z: -0.22 * this.ez },
        { x:  -0.17 * this.ex, y:2, z:    -0.78 * this.ez },
        { x:  0.29 * this.ex, y:2, z:  -0.84 * this.ez },
        { x:   0.03 * this.ex, y:2.9, z:   -0.38 * this.ez },
        { x:  0.47 * this.ex, y:3.2, z: -0.88  * this.ez     }, // meio-lateral
        { x:  0.9 * this.ex, y:4.9, z: -0.48  * this.ez     }, // meio-lateral
        ];

        this.blocosExtras = [];
        this.boundingBlocosExtras = [];
        this.dimensoes = [
        { w: 2.6,  d: 1.6+2,   h: 4.2+2  },  // bloco 0
        { w: 2.2,  d: 2.4+2,   h: 4.0+2  },  // bloco 1
        { w: 3.0,  d: 1.2+2,   h: 4.6+2  },  // bloco 2
        { w: 3.4,  d: 1.8+2,   h: 3.4+2  },  // bloco 3
        { w: 2.6,  d: 2.0+2,   h: 3.6+2  },  // bloco 4
        { w: 3.0,  d: 2.0+2,   h: 5.0+2  },  // bloco 5
        { w: 2.2,  d: 1.6+2,   h: 6.6+2  },  // bloco 6
        { w: 2.6,  d: 1.9+2,  h: 5.4+2  },  // bloco 7
        { w: 3.0,  d: 1.8+2,   h: 6.0+2  },  // bloco 8
        { w: 2.8,  d: 1.8+2,   h: 6.2+2  },  // bloco 9
        { w: 3.0,  d: 2.0+2,   h: 3.8+2  },   // bloco 10 (central, mais baixo)
        { w: 2.6,  d: 1.6+2,   h: 4.2+2  },  // bloco 0
        { w: 2.2,  d: 2.4+2,   h: 4.0+2  },  // bloco 1
        { w: 3.0,  d: 1.2+2,   h: 5.6+2  },  // bloco 2
        { w: 3.4,  d: 1.8+2,   h: 3.4+2  },  // bloco 3
        { w: 3.6,  d: 2.0+2,   h: 5.6+2  },  // bloco 4
        { w: 3.4,  d: 1.8+2,   h: 6.4+2  },  // bloco 3
        { w: 2.6,  d: 2.0+2,   h: 7.6+2  },  // bloco 4
        ];
        this.posicoes.forEach((pos, i) => {
        // defina tamanhos variados:
        const dim = this.dimensoes[i];

        const geo   = new THREE.BoxGeometry(dim.w, dim.h, dim.d);
        const mesh  = new THREE.Mesh(geo, material_blocos);
               mesh.castShadow=true;
    mesh.receiveShadow=true;
        // posição XZ
        this.cube0.add(mesh);
        mesh.position.set(pos.x, pos.y + dim.h /2 , pos.z);

        this.blocosExtras.push(mesh);

        // marque o bloco central para subir depois
        
        });
        this.num_passos_elevacao=240;
        this.indice_bloco_chave=10;
        this.elevar_bloco=false;
        this.bloco_elevado=false;
        
        this.limite_elevacao=1.6;
        this.num_blocos_extras=17;

        this.a=0;
        this.b=1.2;
        this.c=this.posicoes[10].y-2+this.dimensoes[10].h/2;
        this.num_passos_exec=0;
        this.qtd_movimento_plataforma=0;

        this.chave2box=null;
        this.chave2=null;

        this.chave2Retirada=false;

        this.chave1=null;
        this.chave1Box=null;

        this.comecou_a_abrir=false;


    }
    abrir_porta( limiteZ, multiplicador) {
        if(!this.comecou_a_abrir){
            this.porta.mesh.translateY(-0.01);
            this.porta.mesh.translateX(-0.01);
            
            this.comecou_a_abrir=true;
        }

        this.porta.mesh.position.z += multiplicador * 0.015;
       
        this.porta.box.setFromObject(this.porta.mesh);
        if (multiplicador * this.porta.mesh.position.z >= multiplicador * limiteZ) {
            this.porta.mesh.position.z = limiteZ;
            this.porta.box.setFromObject(this.porta.mesh);
            this.porta.abrindo=false;
            this.porta.aberta=true;
            this.porta.mesh.position.z += multiplicador * 0.015;
        }

    }
    posicionar_chave1(chave){

        this.chave1=criarChave(this.fechadura.mesh,new THREE.Vector3(0,0,0),0.5,"rgb(240, 7, 7)","rgb(250, 6, 11)");

        
        this.chave1.translateY(0.5);
        this.chave1Box = new THREE.Box3().setFromObject(this.chave1);
        const size = new THREE.Vector3();
        this.chave1Box.getSize(size);

        this.chave1.translateY(size.y/2);
        
        this.chave1Box.setFromObject(this.chave1);
    }

    posicionar_chave2(chave){
        chave=criarChave(this.cube0,new THREE.Vector3(0,0,0),0.5,"rgb(235, 184, 19)","rgb(130, 228, 19)");
        
        chave.translateY(2);
        this.chave2Box = new THREE.Box3().setFromObject(chave);
        const size = new THREE.Vector3();
        this.chave2Box.getSize(size);

        chave.translateY(size.y/2);

        this.chave2=chave;
        this.chave2Box.setFromObject(this.chave2);

        
    }

    tentar_retirar_chave2(personagem,scene){{
        if((this.elevar_bloco || this.bloco_elevado) && !this.chave2Retirada)
            console.log(this.chave2Box);
            if(personagem.box.intersectsBox(this.chave2Box)){
                this.cube0.remove(this.chave2);
                scene.remove(this.chave2);
                this.chave2Retirada=true;
            }
        }

    }

    mover_plataforma( limiteY, multiplicador) {

        let plataforma = this.plataforma.mesh;
        let plataformaBox = this.plataforma.box;


        plataforma.position.y += multiplicador * 0.02;
        //console.log(plataforma.position.y);
        plataformaBox.setFromObject(plataforma);
        if (multiplicador * plataforma.position.y > multiplicador * limiteY) {
            let dif = limiteY - plataforma.position.y + multiplicador * 0.02;
            plataforma.position.y = limiteY;

            //console.log(plataforma.position.y);
            plataformaBox.setFromObject(plataforma);
            this.plataforma.em_movimento = false;
            this.plataforma.subir = (!this.plataforma.subir);
            if(dif>=0)
                dif+=0.055;
            else
                dif-=0.054;
            this.qtd_movimento_plataforma=dif;
            return dif;
        }
        this.qtd_movimento_plataforma=multiplicador*0.02;
        return multiplicador * 0.02;

    }
    mudar_limite_elevacao(limiteY){
        if(this.elevar_bloco)
            return;

        //console.log(this.c);
        this.limite_elevacao=limiteY+this.c;
        //console.log(this.limite_elevacao);
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
            //console.log(bloco_chave.position.y);
            //console.log(this.num_passos_exec);
        }
        if(this.num_passos_exec>=this.num_passos_elevacao){
            this.bloco_elevado=true;
            this.elevar_bloco=false;
        }
        
        
    }

    posiciona_inimigos(inimigos,indices=[1,5,12]){
        for(var i=0;i<inimigos.length;i++)
        {
            let posicaoInimigo = new THREE.Vector3(0,0,0);

            posicaoInimigo.addVectors(this.cube0.position,this.blocosExtras[indices[i]].position);

            posicaoInimigo.y+=(this.dimensoes[indices[i]].h/2)+1.5;

            inimigos[i].obj.position.copy(posicaoInimigo);
        }    
    }
}



export { Area2 };