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
import { carregarArquivoGLB, loadOBJFile } from './funcoesGeometriasExternas.js';



class Area4 {
    constructor(geomterias_cubos, materiais_cubos) {
         this.loader = new THREE.TextureLoader();
        let textura_muralha = this.loader.load('./texturas_geral/area2/muralha_area4_text.jpg');
        let textura_torres =  this.loader.load('./texturas_geral/area2/normal_mapping/brickwall.jpg');
        let textura_torres_normal =  this.loader.load('./texturas_geral/area2/normal_mapping/brickwall_normal.jpg');
        let textura_pontes= this.loader.load('./texturas_geral/area2/madeira_mediana.webp');
        let textura_pontes2= new THREE.Texture().copy(textura_pontes);
        let cor_pontes= "rgba(160, 120, 120, 1)";
        this.material_pontes1=[
            this.estabelecerMaterialJaCarregado(textura_pontes, 6, 0.5, 0, 0,cor_pontes),
            this.estabelecerMaterialJaCarregado(textura_pontes, 6, 0.5, 0, 0,cor_pontes),
            this.estabelecerMaterialJaCarregado(textura_pontes2, 6, 2, 0, 0,cor_pontes),
            this.estabelecerMaterialJaCarregado(textura_pontes2, 6, 2, 0, 0,cor_pontes),
            new THREE.MeshBasicMaterial(),
            new THREE.MeshBasicMaterial()

        ];
        
        this.material_pontes2=[
            new THREE.MeshBasicMaterial(),
            new THREE.MeshBasicMaterial(),
            this.estabelecerMaterialJaCarregado(textura_pontes2, 6, 2, 0, 0,cor_pontes),
            this.estabelecerMaterialJaCarregado(textura_pontes2, 6, 2, 0, 0,cor_pontes),
            this.estabelecerMaterialJaCarregado(textura_pontes,  6, 0.5, 0, 0,cor_pontes),
            this.estabelecerMaterialJaCarregado(textura_pontes,  6, 0.5, 0, 0,cor_pontes),

        ];

        

        this.geometeria_pontes1= new THREE.BoxGeometry(5,1,166);
        this.geometeria_pontes2= new THREE.BoxGeometry(106,1,5);

        
        this.ponte1 = new THREE.Mesh(this.geometeria_pontes1, this.material_pontes1);
        this.ponte2 = new THREE.Mesh(this.geometeria_pontes1, this.material_pontes1);
        this.ponte3 = new THREE.Mesh(this.geometeria_pontes2, this.material_pontes2);
        this.ponte4 = new THREE.Mesh(this.geometeria_pontes2, this.material_pontes2);

        this.pontes=[this.ponte1,this.ponte2,this.ponte3,this.ponte4];
        this.pontes_box=[null,null,null,null];
        this.altura_plataformas=28;


        let textura_vertical_janela = this.loader.load('./texturas_geral/area2/neo_gothic.jpg');
        let textura_vertical_borda = this.loader.load('./texturas_geral/area2/rustic_brick2.jpg');
       this.geometria_base_topo= new THREE.BoxGeometry(1,2,75);
       this.geometria_vertical= new THREE.BoxGeometry(1,26,6);
       this.geometria_centro_janela= new THREE.BoxGeometry(0.5,4,74.5);

       
        this.material_vertical1=[
            this.estabelecerMaterialJaCarregado(textura_vertical_janela, 1, 2, 0, 0,'rgba(75, 67, 67, 1)'),
            this.estabelecerMaterialJaCarregado(textura_vertical_janela, 1, 2, 0, 0,'rgba(87, 78, 78, 1)'),
            new THREE.MeshBasicMaterial(),
            new THREE.MeshBasicMaterial(),
            this.estabelecerMaterialJaCarregado(new THREE.Texture().copy(textura_vertical_janela), 1/4, 2, 0, 0,'rgba(87, 78, 78, 1)'),
            this.estabelecerMaterialJaCarregado(new THREE.Texture().copy(textura_vertical_janela), 1/4, 2, 0, 0,'rgba(87, 78, 78, 1)'),

        ];

        let textura_vertical_borda2=new THREE.Texture().copy(textura_vertical_borda);
        this.material_vertical2=[
            this.estabelecerMaterialJaCarregado(textura_vertical_borda,1, 4, 0, 1/3,'rgba(131, 105, 105, 1)'),
            this.estabelecerMaterialJaCarregado(textura_vertical_borda,1, 4, 0, 1/3,'rgba(131, 105, 105, 1)'),
            new THREE.MeshBasicMaterial(),
            new THREE.MeshBasicMaterial(),
            this.estabelecerMaterialJaCarregado(textura_vertical_borda2,1/4, 4, 0, 1/3,'rgba(131, 105, 105, 1)'),
            this.estabelecerMaterialJaCarregado(textura_vertical_borda2, 1/4, 4, 0, 1/3,'rgba(77, 69, 69, 1)'),

        ];
        let textura_vertical_borda3=new THREE.Texture().copy(textura_vertical_borda);
        let textura_vertical_borda4=new THREE.Texture().copy(textura_vertical_borda);
        let textura_vertical_borda5=new THREE.Texture().copy(textura_vertical_borda);
        this.material_base_topo=[
            this.estabelecerMaterialJaCarregado(textura_vertical_borda3,12, 1/3, 0, 0,'rgba(131, 105, 105, 1)'),
            this.estabelecerMaterialJaCarregado(textura_vertical_borda3,12, 1/3, 0, 0,'rgba(131, 105, 105, 1)'),
            this.estabelecerMaterialJaCarregado(textura_vertical_borda4, 12, 1/9, 0, 0,'rgba(87, 78, 78, 1)'),
            this.estabelecerMaterialJaCarregado(textura_vertical_borda4, 12, 1/9, 0, 0,'rgba(87, 78, 78, 1)'),
            this.estabelecerMaterialJaCarregado(textura_vertical_borda5, 1/8, 1/3, 0, 0,'rgba(87, 78, 78, 1)'),
            this.estabelecerMaterialJaCarregado(textura_vertical_borda5, 1/8, 1/3, 0, 0,'rgba(87, 78, 78, 1)'),

        ];

         this.material_centro_janelas=this.estabelecerMaterialJaCarregado(new THREE.Texture().copy(textura_pontes), 6, 1, 0, 0,'rgba(87, 78, 78, 1)')
       this.paredes_janelas=[new THREE.Mesh(this.geometria_base_topo,this.material_base_topo),new THREE.Mesh(this.geometria_base_topo,this.material_base_topo),new THREE.Mesh(this.geometria_centro_janela,this.material_centro_janelas),
        new THREE.Mesh(this.geometria_vertical,this.material_vertical2),new THREE.Mesh(this.geometria_vertical,this.material_vertical1),new THREE.Mesh(this.geometria_vertical,this.material_vertical1),
        new THREE.Mesh(this.geometria_vertical,this.material_vertical2)
       ]
       this.paredes_janelas_box=[null,null,null,null,null,null,null];


       this.geometria_torre= new THREE.BoxGeometry(14,this.altura_plataformas,16);

       let normal_scale_torres=[2,4];
       let material_torres_padrao=this.estabelecerMaterialJaCarregado(textura_torres, 1, 3, 0, 0,"rgb(255,255,255)",textura_torres_normal,normal_scale_torres);
       
       this.material_torre=[
            material_torres_padrao,
            material_torres_padrao,
            this.estabelecerMaterialJaCarregado(new THREE.Texture().copy(textura_torres), 1, 1.5, 0, 0,"rgb(255,255,255)",new THREE.Texture().textura_torres_normal,[2,2]),
            new THREE.MeshBasicMaterial(),
            material_torres_padrao,
           material_torres_padrao,

        ];

        this.torres= [new THREE.Mesh(this.geometria_torre,this.material_torre),new THREE.Mesh(this.geometria_torre,this.material_torre),
            new THREE.Mesh(this.geometria_torre,this.material_torre),new THREE.Mesh(this.geometria_torre,this.material_torre)
        ];


        this.torres_box=[null,null,null,null];

        // Geometria e materias da muralha, do bloco fechadura e da muralha: 
        this.altura_muralha=40;

        this.geometria_muralha1 = new BoxGeometry(1, this.altura_muralha, 205);
        this.geometria_muralha2 = new BoxGeometry(141, 40, 1);
        this.material_muralha = new THREE.MeshLambertMaterial({ color: "rgb(50,120,90)" });


        

        let rep_muralha = 1 / 2;
        this.material_muralha = this.estabelecerMaterialJaCarregado(textura_muralha, 10, 8, 0, 0);

        this.muralha1_area_4 = new THREE.Mesh(this.geometria_muralha1, this.material_muralha);
        this.muralha2_area_4 = new THREE.Mesh(this.geometria_muralha1, this.material_muralha);
        this.muralha3_area_4 = new THREE.Mesh(this.geometria_muralha2, this.material_muralha);
        this.muralha4_area_4 = new THREE.Mesh(this.geometria_muralha2, this.material_muralha);
        this.muralha_area_4_aberta = false;
        this.muralha_2_abrindo = false;

        this.geometria_suporte_fechadura = new THREE.BoxGeometry(2.5, 1, 2.5);
        this.material_suporte_fechadura = this.estabelecerMaterial("./texturas_geral/area2/concreto.jpg",2,1,0,0);
        this.suporte_fechadura = new THREE.Mesh(this.geometria_suporte_fechadura, this.material_suporte_fechadura);
        this.geometria_plataforma_a2 = new BoxGeometry(4, this.altura_plataformas, 4);

        let texturaPlatA2 = this.loader.load("./texturas_geral/area2/5231.jpg");


        this.material_plataforma_a2 = [
            this.estabelecerMaterialJaCarregado(texturaPlatA2, 1, this.altura_plataformas/4, 0, 0),
            this.estabelecerMaterialJaCarregado(texturaPlatA2, 1, this.altura_plataformas/4, 0, 0),
            this.estabelecerMaterialJaCarregado(new THREE.Texture().copy(texturaPlatA2), 1, 1, 0, 0,"rgb(1, 1, 29)"),
            new THREE.MeshBasicMaterial(),
            this.estabelecerMaterialJaCarregado(texturaPlatA2, 1, this.altura_plataformas/4, 0, 0),
            this.estabelecerMaterialJaCarregado(texturaPlatA2, 1, this.altura_plataformas/4, 0, 0),

        ];

        //this.material_plataforma_a2= new THREE.MeshBasicMaterial({color: "rgb(0,0,0)"})

        this.plataforma1_area_4 = new THREE.Mesh(this.geometria_plataforma_a2, this.material_plataforma_a2);
        this.plataforma2_area_4 = new THREE.Mesh(this.geometria_plataforma_a2, this.material_plataforma_a2);
        

        let texturaCubes1 = this.loader.load("./texturas_geral/area2/textura_medieval_paredes.jpg");
        let texturaCubes2 =  new THREE.Texture().copy(texturaCubes1);
        let texturaCubes3 =  new THREE.Texture().copy(texturaCubes1);
        let texturaChao= this.loader.load("./texturas_geral/area2/chao_liso.webp");
        let texturaTapete = this.loader.load("./texturas_geral/area2/carpet.jpg");
        //let textura_torres_normal2 = new THREE.Texture().copy(textura_torres_normal)
        let textura_torres_normal2 =  this.loader.load("./texturas_geral/area2/normal_mapping/mapa2_wall.jpg")
        this.material_cubosaa = [
            this.estabelecerMaterialJaCarregado(texturaCubes1, 16, 1, 0, 0,"rgb(255,255,255)",textura_torres_normal2,[2,0.5]

            ), //x+
            this.estabelecerMaterialJaCarregado(texturaCubes1, 16, 1, 0, 0,"rgb(255,255,255)",textura_torres_normal2,[2,0.5]

            ),
            this.estabelecerMaterialJaCarregado(texturaChao, 55, 30, 0, 0,"rgb(255,255,255)"),// y+
            new THREE.MeshBasicMaterial(),
            this.estabelecerMaterialJaCarregado(texturaCubes2, 14, 1, 0, 0, "rgb(255,255,255)",textura_torres_normal2,[2,0.5]

            ), //z+
            this.estabelecerMaterialJaCarregado(texturaCubes2, 14, 1, 0, 0, "rgb(255,255,255)",textura_torres_normal2,[2,0.5]

            )

        ];

        this.material_cubosb = [
            this.estabelecerMaterialJaCarregado(texturaCubes3, 1/4, 1, 0, 0, "rgb(255,255,255)",new THREE.Texture().copy(textura_torres_normal2),[0.25,0.5]

            ),
            this.estabelecerMaterialJaCarregado(texturaCubes3, 1/4, 1, 0, 0,"rgb(255,255,255)",new THREE.Texture().copy(textura_torres_normal2),[0.25,0.5])
            ,
            this.estabelecerMaterialJaCarregado(texturaTapete, 15,1 , 0, 0,"rgba(255, 0, 0, 1)"),
            new THREE.MeshBasicMaterial(),
            new THREE.MeshBasicMaterial(),
            new THREE.MeshBasicMaterial()

        ];
        // Criação dos cubos da área:
        this.cube0 = new THREE.Mesh(geomterias_cubos[0], materiais_cubos[0]),
            this.cube1 = new THREE.Mesh(geomterias_cubos[1], this.material_cubosaa),
            this.cube2 = new THREE.Mesh(geomterias_cubos[2], this.material_cubosb),
            this.cube3 = new THREE.Mesh(geomterias_cubos[3], this.material_cubosaa),
            this.degraus = [],
            this.posicao_ini = new THREE.Vector3(150, 2, 0),
            this.cubos = [],
            this.boundingCubos = [],
            this.boundingRampa = null,
            this.boundingDegraus = [],
            this.ex = 70,
            this.ez = 101;

        for(let i=0;i<this.pontes.length;i++){
            this.pontes[i].castShadow = true;
            this.pontes[i].receiveShadow = true;
            this.pontes[i].translateY( 2+this.altura_plataformas-0.5 );
            if(i<2)
                this.pontes[i].translateX( (2*( (i+1)%2) - 1)*(this.ex-10) );
            else
                this.pontes[i].translateZ( (2*( (i+1)%2) - 1)*(this.ez-10) );
            this.cube0.add(this.pontes[i]);
        }

        for(let i=0;i<this.torres.length;i++){
            this.torres[i].castShadow = true;
            this.torres[i].receiveShadow = true;
            this.torres[i].translateY( 2+this.altura_plataformas/2 );
            if(i<2){
                this.torres[i].translateX( (2*( (i+1)%2) - 1)*(this.ex-10) );
                this.torres[i].translateZ( (2*( (i+1)%2) - 1)*(this.ez-10) );
            }
            else{
                this.torres[i].translateX( (2*( (i)%2) - 1)*(this.ex-10) );
                this.torres[i].translateZ( (2*( (i+1)%2) - 1)*(this.ez-10) );
            }
            this.cube0.add(this.torres[i]);
        }

        let desloc_inicial_janelas=-5;
        let translados_paredes_janelas=[[desloc_inicial_janelas,1,37.5+9],[desloc_inicial_janelas,1+30-2,37.5+9],[desloc_inicial_janelas,1+15-2,37.5+9],
        [desloc_inicial_janelas,13+2,75+6],[desloc_inicial_janelas,13+2,55+6],[desloc_inicial_janelas,13+2,55+6-24.5],[desloc_inicial_janelas,13+2,55+6-2*24.5]]

        for(let i=0;i<this.paredes_janelas.length;i++){
            this.paredes_janelas[i].castShadow = true;
           this.paredes_janelas[i].receiveShadow = true;
            this.paredes_janelas[i].translateY( 2+translados_paredes_janelas[i][1] );
         
                this.paredes_janelas[i].translateX( translados_paredes_janelas[i][0]  );
            
                this.paredes_janelas[i].translateZ( translados_paredes_janelas[i][2]  );
            this.cube0.add(this.paredes_janelas[i]);
        }
        

        this.cube0.add(this.suporte_fechadura);
        
        this.cube0.add(this.plataforma1_area_4);
        this.cube0.add(this.plataforma2_area_4);


        // Posicionamento do bloco fechadura, da muralha e da plataforma:
        this.suporte_fechadura.translateX(-this.ex-18);
        this.suporte_fechadura.translateZ(-5);
        this.suporte_fechadura.translateY(0.5 - 2);
        
        this.plataforma1_area_4.translateZ(this.ez-10-2.5-2);
        this.plataforma2_area_4.translateZ(-this.ez+10+2.5+2);
        this.plataforma1_area_4.translateY(-this.altura_plataformas/2+0.051+2);
        this.plataforma2_area_4.translateY(-this.altura_plataformas/2+0.051+2);

        this.muralha1 = { mesh: this.muralha1_area_4, box: null, abrindo: false, aberta: false };
        this.muralha2 = { mesh: this.muralha2_area_4, box: null, abrindo: false, aberta: false };
        this.muralha3 = { mesh: this.muralha3_area_4, box: null, abrindo: false, aberta: false };
        this.muralha4 = { mesh: this.muralha4_area_4, box: null, abrindo: false, aberta: false };
        this.muralhas = [this.muralha1,this.muralha2,this.muralha3,this.muralha4];
        this.fechadura = { mesh: this.suporte_fechadura, box: null };

        this.plataforma1 = { mesh: this.plataforma1_area_4, box: null, em_movimento: false, subir: true, tempo_espera: 0, emEspera: false };
        this.plataforma2 =  { mesh: this.plataforma2_area_4, box: null, em_movimento: false, subir: true, tempo_espera: 0, emEspera: false };
        for(var i=0; i<this.muralhas.length; i++){
            this.muralhas[i].mesh.castShadow = true;
            this.muralhas[i].mesh.receiveShadow = true;
            this.muralhas[i].mesh.translateY( -2+this.altura_muralha/2 );
            if(i<2)
                this.muralhas[i].mesh.translateX( (2*( (i+1)%2) - 1)*(this.ex+1) );
            else
                this.muralhas[i].mesh.translateZ( (2*( (i+1)%2) - 1)*(this.ez+1) );
            this.cube0.add(this.muralhas[i].mesh);
        }
        
        this.plataforma1.mesh.castShadow = true;
        this.plataforma1.mesh.receiveShadow = true;
        this.plataforma2.mesh.castShadow = true;
        this.plataforma2.mesh.receiveShadow = true;
        this.fechadura.mesh.castShadow = true;
        this.fechadura.mesh.receiveShadow = true;

        this.plataformas=[this.plataforma1,this.plataforma2];


        this.cubos = [this.cube1, this.cube2, this.cube3];

       const material_blocos = this.estabelecerMaterial("./texturas_geral/area2/caixa_madeira.jpg",3,3,0,0,"rgb(207, 122, 82)");
      this.blocosExtras = []; // Vetor dos blocos
        this.boundingBlocosExtras = []; // Vetor das bounding boxes

// Posições dos blocos com grupos próximos
this.posicoes = [
    // Grupo 1 (3 blocos lado a lado) - esquerda/frente
    { x: -0.85 * this.ex, y: 2,   z:  -0.55 * this.ez },
    { x: -0.85 * this.ex, y: 2,   z:  -0.55 * this.ez + 10 },
    { x: -0.85 * this.ex, y: 2,   z:  -0.55 * this.ez - 10 },

    // Grupo 2 (2 blocos empilhados) - direita/frente
    { x:  0.85 * this.ex, y: 2,   z:  -0.30 * this.ez },
    // pos.y do bloco de cima ajustada para ficar sobre o bloco abaixo (2 + altura do bloco abaixo)
    { x:  0.85 * this.ex, y: 6.5, z:  -0.30 * this.ez },

    // Grupo 3 (4 blocos em “L”) - centro/trás
    { x:  0.00 * this.ex, y: 2,   z: -0.60 * this.ez },
    { x:  0.00 * this.ex, y: 2,   z: -0.60 * this.ez + 10 },
    { x:  0.50 * this.ex, y: 2,   z: -0.60 * this.ez },
    // bloco empilhado sobre o anterior (pos.y = 2 + altura do bloco em x=0.50*this.ex)
    { x:  0.50 * this.ex, y: 6.5, z: -0.60 * this.ez },

    // Bloco central (no meio do mapa)
    { x:  0.30 * this.ex, y: 2,   z:  -0.2 * this.ez },

    // Grupo 4 (2 blocos lado a lado) - direita/trás
    { x:  0.65 * this.ex, y: 2,   z: 0.35 * this.ez },
    { x:  0.65 * this.ex, y: 2,   z: 0.35 * this.ez - 10 },

    // Grupo 5 (3 blocos juntos) - esquerda/trás (aglomerado)
    { x: -0.40 * this.ex, y: 2,   z: 0.80 * this.ez },
    { x: -0.40 * this.ex, y: 2,   z: 0.80 * this.ez + 10 },
    // terceiro empilhado sobre o primeiro (pos.y = 2 + altura do bloco 12)
    { x: -0.40 * this.ex, y: 6.2, z: 0.80 * this.ez },

    // Grupo 6 (novo) - farol esquerda/frente (3 blocos)
    { x: -0.45 * this.ex, y: 2,   z:  -0.45 * this.ez },
    { x: -0.45 * this.ex, y: 2,   z: - 0.45 * this.ez + 10 },
    // empilhado sobre o primeiro do grupo (pos.y = 2 + altura do bloco 15)
    { x: -0.45 * this.ex, y: 6.8, z:  -0.45 * this.ez },

    // Grupo 7 (novo) - canto direito/trás (3 blocos)
    { x:  0.95 * this.ex, y: 2,   z: 0.85 * this.ez },
    { x:  0.95 * this.ex, y: 2,   z: 0.85 * this.ez + 10 },
    // empilhado sobre o primeiro do grupo (pos.y = 2 + altura do bloco 18)
    { x:  0.95 * this.ex, y: 7.1, z: 0.85 * this.ez }
];

// Dimensões fixas, horizontais (TODAS 50% maiores que antes)
this.dimensoes = [
    { w: 13.5,  d: 9.3,  h: 4.8  }, // 0
    { w: 12.9,  d: 8.7,  h: 4.5  }, // 1
    { w: 14.25, d: 9.6,  h: 5.1  }, // 2
    { w: 13.2,  d: 8.4,  h: 4.5  }, // 3
    { w: 12.3,  d: 8.4,  h: 4.5  }, // 4
    { w: 13.8,  d: 9.9,  h: 5.4  }, // 5
    { w: 10.5,  d: 7.5,  h: 3.9  }, // 6
    { w: 12.0,  d: 8.7,  h: 4.5  }, // 7
    { w: 12.6,  d: 9.0,  h: 4.5  }, // 8
    { w: 11.7,  d: 8.4,  h: 4.5  }, // 9
    { w: 11.4,  d: 8.7,  h: 4.5  }, //10
    { w: 10.8,  d: 8.4,  h: 4.2  }, //11
    { w: 10.2,  d: 7.8,  h: 4.2  }, //12
    { w: 12.0,  d: 8.4,  h: 4.5  }, //13
    { w: 12.6,  d: 8.4,  h: 4.5  }, //14
    { w: 11.7,  d: 8.4,  h: 4.8  }, //15
    { w: 11.4,  d: 8.1,  h: 4.5  }, //16
    { w: 13.8,  d: 9.0,  h: 5.1  }, //17
    { w: 13.8,  d: 9.0,  h: 5.1  }, //18
    { w: 13.8,  d: 9.0,  h: 5.1  }, //19
    { w: 13.8,  d: 9.0,  h: 5.1  }  //20
];
// Criando e posicionando os blocos
this.posicoes.forEach((pos, i) => {
    const dim = this.dimensoes[i];

    const geo = new THREE.BoxGeometry(dim.w, dim.h, dim.d);
    const mesh = new THREE.Mesh(geo, material_blocos);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    this.cube0.add(mesh);
    mesh.position.set(pos.x, pos.y + dim.h / 2, pos.z);

    this.blocosExtras.push(mesh);
});

        // Variáveis de controle da elevação do bloco central ao se derrotar todos os inimgos: 
        this.num_passos_elevacao = 240;
        this.indice_bloco_chave = 10;
        this.elevar_bloco = false;
        this.bloco_elevado = false;
        this.limite_elevacao = 1.6;


        this.num_blocos_extras = 17; // Número de blocos extras( Por cima da área 2)


        // Coeficientes da função de elevação dos blocos:
        this.a = 0;
        this.b = 1.2;
        this.c = this.posicoes[10].y - 2 + this.dimensoes[10].h / 2;

        // Variáveis extras de controle de movimento da plataforma:
        this.num_passos_exec = 0;
        this.qtd_movimento_plataforma1 = 0;

    
        this.qtd_movimento_plataforma2 = 0;

        this.num_passos_exec_plataformas=[0,0];
        this.qtd_movimento_plataformas=[0,0];

        // Variáveis das chaves e suas BoundingBoxes:
        this.chave2box = null;
        this.chave2 = null;
        this.chave3 = null;
        this.chave3Box = null;

        this.chave2Retirada = false; // Controle para verificar se a chave 2 já foi obtida pelo jogador



        this.comecou_a_abrir = false; // Controle para se a muralha começou a abrir

        this.esferas=[];
        this.esferaras_box=[];

        let material_esfera = this.estabelecerMaterial("./texturas_geral/area2/esfera_rocha.jpg",5,5,0,0);
        let geometria_esfera= new THREE.SphereGeometry(4,32,32);

// ESFERAS: 6 ao todo (2 canto direito, 2 canto esquerdo, 2 atrás)
this.esferas = [];

// material (mantive sua função de material)


// helper para criar/escalar/adicionar esfera
function criarEsfera(radius, px, py, pz, name = null) {
    const geom = new THREE.SphereGeometry(radius, 32, 32);
    const mesh = new THREE.Mesh(geom, material_esfera);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (name) mesh.name = name;
    mesh.position.set(px, py, pz);
    this.cube0.add(mesh);
    this.esferas.push(mesh);
    return mesh;
}

// parâmetros ajustados para não penetrar o chão (y aumentado)
const rSmall = 3.0;                // raio das esferas
const yMargin = 1.5;               // margem extra acima do raio
const ySmall = rSmall + yMargin+0.5;   // centro Y para garantir que não entrem no chão

// posições: cantos direito/esquerdo próximos à periferia em z+ ; par atrás em z-
const zPerifPos = 0.75 * this.ez;   // perímetro z positivo (frente)
const zPerifNeg = -0.75 * this.ez;  // perímetro z negativo (trás)

// --- CANTO DIREITO (2 esferas) ---
criarEsfera.call(this, rSmall,  0.90 * this.ex, ySmall+21,  zPerifNeg - 4.7,          "esfera_dir_a");
criarEsfera.call(this, rSmall,  0.90 * this.ex, ySmall+21,  zPerifPos + 4.7,    "esfera_dir_b");

// --- CANTO ESQUERDO (2 esferas) ---
criarEsfera.call(this, rSmall, -0.92 * this.ex, ySmall,  zPerifPos,         "esfera_esq_a");
criarEsfera.call(this, rSmall, -0.85 * this.ex, ySmall+5.1,  zPerifNeg + 8.0,   "esfera_esq_b");

// --- ATRÁS (2 esferas centrais atrás) ---
criarEsfera.call(this, rSmall, -0.25 * this.ex, ySmall,  zPerifNeg,         "esfera_tras_a");
criarEsfera.call(this, rSmall,  0.25 * this.ex, ySmall,  zPerifNeg,         "esfera_tras_b");

// Resultado: this.esferas.length === 6
        

        this.carregar_objetos();

    }

    carregar_objetos() {

        this.assetManager = {
            // Properties ---------------------------------
            BigBen: null,
            BigBenBox: null,
            objTower:null,
            allLoaded: false,
            in_position: false,

            // Functions ----------------------------------
            checkLoaded: function () {
                if (!this.allLoaded) {
                    if (
                        this.BigBen  )  {
                        this.allLoaded = true;
                    }
                }
            },

            hideAll: function () {
                this.orca.visible = this.woodenGoose.visible = this.statue.visible =
                    this.plane.visible = this.L200.visible = this.tank.visible = false;
            }
        }
        carregarArquivoGLB(this.assetManager, './assets_local/', 'BigBen',true,-1,this.cube0,40);
        

    }

     posicionar_objetos() {
    
            if (this.assetManager.in_position)
                return;
            if (this.assetManager.BigBenBox == null)
                this.assetManager.BigBenBox = new THREE.Box3();
            this.assetManager.checkLoaded();
            //console.log(this.assetManager.allLoaded);
            if (!this.assetManager.allLoaded)
                return;
    
            //this.cube0.add(this.assetManager.objTower);
            this.assetManager.BigBen.translateY(2);
            
            this.assetManager.BigBen.rotateY(Math.PI/4.7);
            this.assetManager.BigBen.translateX(-185);
            this.assetManager.BigBen.translateZ(-6.5);
            this.assetManager.BigBenBox = new THREE.Box3().setFromObject(this.assetManager.BigBen);
            //console.log(this.assetManager.plane);
            this.assetManager.in_position = true;
            console.log("pos_obj");
    
        }
    estabelecerMaterial(arquivo, repeticoesU, repeticoesV, offsetX = 0, offsetY = 0, cor = "rgb(255, 255, 255)",normal_map=null,phong=false) {
        let material = null;
        if(normal_map==null && !phong){
            material= new THREE.MeshLambertMaterial({ color: cor });
            material.map = this.loader.load(arquivo);
        }    
        else if(normal_map!=null){
            material=new THREE.MeshPhongMaterial({ color: cor , map:this.loader.load(arquivo) ,normalMap: this.loader.load(normal_map)});

        }
        else{
            material=new THREE.MeshPhongMaterial({ color: cor , map:this.loader.load(arquivo) });
            console.log("phong")
        }
           
       
        console.log("material");
        console.log(material.map);
        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;
        material.map.minFilter = material.map.magFilter = THREE.LinearFilter;
        material.map.repeat.set(repeticoesU, repeticoesV);
        material.map.offset.x = offsetX;
        material.map.offset.y = offsetY;
        return material;

    }
    estabelecerMaterialJaCarregado(arquivoCarregado, repeticoesU, repeticoesV, offsetX = 0, offsetY = 0, cor = "rgb(255, 255, 255)",normal_map_car=null,normal_scale=[1,1]) {
       let material = null;
        if(normal_map_car==null){
            material= new THREE.MeshLambertMaterial({ color: cor });
            material.map = arquivoCarregado;
        }    
        else{
            material=new THREE.MeshPhongMaterial({ color: cor ,map: arquivoCarregado ,normalMap: normal_map_car});
            material.normalScale.set(normal_scale[0], normal_scale[1]);
            console.log("AAAAFAS");
        }
        console.log("material");
        console.log(material.map);
        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;
        material.map.minFilter = material.map.magFilter = THREE.LinearFilter;
        material.map.repeat.set(repeticoesU, repeticoesV);
        material.map.offset.x = offsetX;
        material.map.offset.y = offsetY;
        return material;

    }

    // Função para abrir a muralha inicial, passa-se o limite absouluto do movimento em Z e o multiplicador para verificar se será positivo ou negativo
    abrir_muralha(limiteY, multiplicador) {
        if (!this.comecou_a_abrir ) {
            // Fazer com que a porte adentre a área 2 e não fique para fora:
            //this.muralha1.mesh.translateY(-0.02);
            //this.muralha2.mesh.translateX(-0.02);
            //this.muralha3.mesh.translateX(-0.02);
            //this.muralha4.mesh.translateX(-0.02);

            this.comecou_a_abrir = true;
        }
        let vel_muralha=3;
        for(let i=0; i<this.muralhas.length;i++){    
            this.muralhas[i].mesh.position.y += multiplicador * vel_muralha; 
            this.muralhas[i].box.setFromObject(this.muralhas[i].mesh);
        }  

        

        // Se alcançar o limite:
        if ( multiplicador * this.muralhas[0].mesh.position.y >= multiplicador * limiteY) {
            
            this.muralhas[0].abrindo = false;
            this.muralhas[0].aberta = true;
            
        }

    }
    posicionar_chave3(chave) {

        this.chave3 = criarChave(this.fechadura.mesh, new THREE.Vector3(0, 0, 0), 0.5, "rgba(7, 16, 194, 1)", "rgba(6, 129, 88, 1)"); // Vai à função de criação de chave


        this.chave3.translateY(0.5); // Coloca o centro na parte de cima do suporte-fechadura
        this.chave3Box = new THREE.Box3().setFromObject(this.chave3);
        const size = new THREE.Vector3();
        this.chave3Box.getSize(size); // Obtém tamanho da chave

        this.chave3.translateY(size.y / 2); // Translada metade do tamanho da chave para que ela fique com a base sobre o suporte

        this.chave3Box.setFromObject(this.chave3);
    }

    posicionar_chave2(chave) {
        chave = criarChave(this.cube0, new THREE.Vector3(0, 0, 0), 0.5, "rgb(235, 184, 19)", "rgb(130, 228, 19)");// Vai à função de criação de chave

        chave.translateY(2); // Posciona corretamente o centro sobre a área2
        this.chave2Box = new THREE.Box3().setFromObject(chave);
        const size = new THREE.Vector3();
        this.chave2Box.getSize(size); // Obtém tamanho da chave

        chave.translateY(size.y / 2); // Translada metade do tamanho da chave para que ela fique com a base sobre o suporte


        this.chave2 = chave;
        this.chave2Box.setFromObject(this.chave2);


    }


    // Função para lidar com a retirada da chave2
    tentar_retirar_chave2(personagem, scene) {
        if ((this.elevar_bloco || this.bloco_elevado) && !this.chave2Retirada) { // Só faz sentido retirar a chave se o bloco estiver sendo elevado ou terminou de se elevar e a chave ainda não foi retirada
            console.log(this.chave2Box);
            if (personagem.box.intersectsBox(this.chave2Box)) {

                this.cube0.remove(this.chave2);
                scene.remove(this.chave2);
                this.chave2Retirada = true;
            }
        }

    }

    // Função para mover plataforma: passa-se limite e multiplicador ( -1 ou 1 )
    mover_plataforma(limiteY, multiplicador,indice=0) {

        let plataforma = this.plataformas[indice].mesh;
        let plataformaBox = this.plataformas[indice].box;
        
        let vel_plat=0.08;
        if(!this.plataformas[indice].subindo)
            vel_plat=0.06;
        plataforma.position.y += multiplicador * vel_plat; // Elevação da plataforma por frame
        //console.log(plataforma.position.y);
        plataformaBox.setFromObject(plataforma);
        if (multiplicador * plataforma.position.y > multiplicador * limiteY) { // Se passou do limite
            let dif = limiteY - plataforma.position.y + multiplicador * vel_plat; // Obtém a diferença anterior
            plataforma.position.y = limiteY; // Coloca plataforma no limite

            //console.log(plataforma.position.y);
            plataformaBox.setFromObject(plataforma);
            this.plataformas[indice].em_movimento = false; // Assinala parada de movimento
            this.plataformas[indice].subir = (!this.plataformas[indice].subir); // Inverte sentido de movimento
            // Para posicionar corretamente o player sem problemas de travamento em bloco:
            if (dif >= 0)
                dif += 0.055;
            else
                dif -= 0.054;
            this.qtd_movimento_plataformas[indice] = dif; // variável que armazena último incremento de movimento, caso se queria obtê-lo
            return dif;
        }
        this.qtd_movimento_plataformas[indice] = multiplicador * vel_plat; // variável que armazena último incremento de movimento, caso se queria obtê-lo
        return multiplicador * vel_plat;

    }

    // Muda limite de elevação do bloco central
    mudar_limite_elevacao(limiteY) {
        if (this.elevar_bloco) // Se já esiver sendo elevado, não pode alterá-lo
            return;

        //console.log(this.c);
        this.limite_elevacao = limiteY + this.c; // Para limite ser medido pela posição da base do blobo
        //console.log(this.limite_elevacao);
        this.a = (-2 * this.limite_elevacao + 3 * this.c) / 2; // Coeficiente 'a' da função, que é uma parábola de concavidade virada para baixo( velocidade diminui gradativamente)
        this.b = this.limite_elevacao - this.a - this.c; // Coeficiente 'b' da mesma função

    }

    // Função quadrática para elevar bloco desacelerando:
    funcao_movimento_elevacao(x) {
        return this.a * (x ** 2) + this.b * x + this.c;
    }

    // Lida com a elevação do bloco:
    fazer_elevar_bloco() {
        if (!this.elevar_bloco) // Se não está a elevar o bloco, não faz nada
            return;
        if (this.num_passos_exec < this.num_passos_elevacao) { // Se estiver no número esperado de passos para elevar o bloco
            this.num_passos_exec++;
            let bloco_chave = this.blocosExtras[this.indice_bloco_chave];
            let bloco_chave_box = this.boundingBlocosExtras[this.indice_bloco_chave];
            bloco_chave.position.y = this.funcao_movimento_elevacao(this.num_passos_exec / this.num_passos_elevacao) + 2; // Calcula a posição atual( valor da função + altura do cubo central à base da plataforma)
            bloco_chave_box.setFromObject(bloco_chave);
            //console.log(bloco_chave.position.y);
            //console.log(this.num_passos_exec);
        }
        if (this.num_passos_exec >= this.num_passos_elevacao) { // Se chegou ao limite
            this.bloco_elevado = true;
            this.elevar_bloco = false;
        }


    }

    // Posiciona cacodemons no mapa:
    posiciona_inimigos(inimigos, indices = [1, 5, 12]) {
        for (var i = 0; i < inimigos.length; i++) // Para todos eles
        {
            let posicaoInimigo = new THREE.Vector3(0, 0, 0);

            posicaoInimigo.addVectors(this.cube0.position, this.blocosExtras[indices[i]].position); // Coloca na posição do cubo0+ posição central do bloco extra

            posicaoInimigo.y += (this.dimensoes[indices[i]].h / 2) + 1.5; // Eleva metade do tamanho do bloco + 1.5 para que eles fiquem por cima destes

            inimigos[i].obj.position.copy(posicaoInimigo); // Posiciona inimigo
        }
    }
}



export { Area4 };