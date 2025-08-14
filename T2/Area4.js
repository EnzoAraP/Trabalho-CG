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



class Area4 {
    constructor(geomterias_cubos, materiais_cubos) {
         this.loader = new THREE.TextureLoader();
        let textura_muralha = './texturas_geral/area2/metal-door-texture-compressed.jpg';
        this.material_pontes=[
            this.estabelecerMaterial(textura_muralha, 1 / 2, 1, 0, 0),
            this.estabelecerMaterial(textura_muralha, 1 / 2, 1, 0, 0),
            this.estabelecerMaterial(textura_muralha, 1 / 2, 1, 0, 0),
            new THREE.MeshBasicMaterial(),
            this.estabelecerMaterial(textura_muralha, 1 / 8, 1, 0, 0),
            new THREE.MeshBasicMaterial()

        ];
        this.geometeria_pontes1= new THREE.BoxGeometry(5,1,170);
        this.geometeria_pontes2= new THREE.BoxGeometry(110,1,5);
        this.ponte1 = new THREE.Mesh(this.geometeria_pontes1, this.material_pontes);
        this.ponte2 = new THREE.Mesh(this.geometeria_pontes1, this.material_pontes);
        this.ponte3 = new THREE.Mesh(this.geometeria_pontes2, this.material_pontes);
        this.ponte4 = new THREE.Mesh(this.geometeria_pontes2, this.material_pontes);

        this.pontes=[this.ponte1,this.ponte2,this.ponte3,this.ponte4];
        this.pontes_box=[null,null,null,null];
        this.altura_plataformas=20;

       
        // Geometria e materias da muralha, do bloco fechadura e da muralha: 
        this.altura_muralha=40;

        this.geometria_muralha1 = new BoxGeometry(1, this.altura_muralha, 205);
        this.geometria_muralha2 = new BoxGeometry(141, 40, 1);
        this.material_muralha = new THREE.MeshLambertMaterial({ color: "rgb(50,120,90)" });


        

        let rep_muralha = 1 / 2;
        this.material_muralha = [
            this.estabelecerMaterial(textura_muralha, 1 / 2, 1, 0, 0),
            this.estabelecerMaterial(textura_muralha, 1 / 2, 1, 0, 0),
            this.estabelecerMaterial(textura_muralha, 1 / 2, 1, 0, 0),
            new THREE.MeshBasicMaterial(),
            this.estabelecerMaterial(textura_muralha, 1 / 8, 1, 0, 0),
            new THREE.MeshBasicMaterial()

        ];

        this.muralha1_area_4 = new THREE.Mesh(this.geometria_muralha1, this.material_muralha);
        this.muralha2_area_4 = new THREE.Mesh(this.geometria_muralha1, this.material_muralha);
        this.muralha3_area_4 = new THREE.Mesh(this.geometria_muralha2, this.material_muralha);
        this.muralha4_area_4 = new THREE.Mesh(this.geometria_muralha2, this.material_muralha);
        this.muralha_area_4_aberta = false;
        this.muralha_2_abrindo = false;

        this.geometria_suporte_fechadura = new THREE.BoxGeometry(2.5, 1, 2.5);
        this.material_suporte_fechadura = new THREE.MeshLambertMaterial({ color: "rgb(100,100,100)" });
        this.suporte_fechadura = new THREE.Mesh(this.geometria_suporte_fechadura, this.material_suporte_fechadura);
        this.geometria_plataforma_a2 = new BoxGeometry(4, this.altura_plataformas, 4);

        let texturaPlatA2 = "./texturas_geral/area2/5231.jpg";


        this.material_plataforma_a2 = [
            this.estabelecerMaterial(texturaPlatA2, 1, this.altura_plataformas/4, 0, 0),
            this.estabelecerMaterial(texturaPlatA2, 1, this.altura_plataformas/4, 0, 0),
            this.estabelecerMaterial(texturaPlatA2, 1, 1, 0, 0),
            new THREE.MeshBasicMaterial(),
            this.estabelecerMaterial(texturaPlatA2, 1, this.altura_plataformas/4, 0, 0),
            this.estabelecerMaterial(texturaPlatA2, 1, this.altura_plataformas/4, 0, 0),

        ];

        //this.material_plataforma_a2= new THREE.MeshBasicMaterial({color: "rgb(0,0,0)"})

        this.plataforma1_area_4 = new THREE.Mesh(this.geometria_plataforma_a2, this.material_plataforma_a2);
        this.plataforma2_area_4 = new THREE.Mesh(this.geometria_plataforma_a2, this.material_plataforma_a2);
        

        let texturaCubes = "./texturas_geral/area2/Arte_Conceitual.jpg";
        let texturaChao = "./texturas_geral/area2/mad_metal_reduzido.webp"
        this.material_cubosaa = [
            this.estabelecerMaterial(texturaCubes, 12, 2, 0, 0), //x+
            this.estabelecerMaterial(texturaCubes, 12, 2, 0, 0),
            this.estabelecerMaterial(texturaChao, 15, 10, 0, 0),// y+
            new THREE.MeshBasicMaterial(),
            this.estabelecerMaterial(texturaCubes, 16, 2, 0, 0, "rgba(240, 146, 5, 1)"), //z+
            this.estabelecerMaterial(texturaCubes, 16, 2, 0, 0, "rgba(240, 146, 5, 1)")

        ];

        this.material_cubosb = [
            this.estabelecerMaterial(texturaCubes, 1, 1, 0, 0, "rgb(5, 232, 240)"),
            this.estabelecerMaterial(texturaCubes, 1, 1, 0, 0),
            this.estabelecerMaterial(texturaChao, 15, 1 / 2, 0, 0),
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

        const material_blocos = new THREE.MeshLambertMaterial({ color: "rgb(255, 215, 0)" });

        // Posições dos blocos que ficam em cima da área 2:
        this.posicoes = [

            { x: 0.1 * this.ex, y: 2, z: 0.5 * this.ez },
            { x: 0.2 * this.ex, y: 2.7, z: 0.3 * this.ez },
            { x: 0.4 * this.ex, y: 2, z: 0.7 * this.ez },
            { x: 0.83 * this.ex, y: 2, z: 0.12 * this.ez },
            { x: -0.3 * this.ex, y: 4.9, z: 0.6 * this.ez },
            { x: -0.52 * this.ex, y: 3.2, z: 0.85 * this.ez },
            { x: -0.85 * this.ex, y: 2, z: 0.21 * this.ez },
            { x: -0.11 * this.ex, y: 2, z: 0.48 * this.ez },
            { x: -0.75 * this.ex, y: 4, z: -0.09 * this.ez },
            { x: -0.39 * this.ex, y: 2, z: -0.19 * this.ez },
            // bloco central (revelador), será o índice 10
            { x: 0, y: 2, z: 0 },
            { x: -0.92 * this.ex, y: 2, z: -0.22 * this.ez },
            { x: -0.17 * this.ex, y: 2, z: -0.78 * this.ez },
            { x: 0.29 * this.ex, y: 2, z: -0.84 * this.ez },
            { x: 0.03 * this.ex, y: 2.9, z: -0.38 * this.ez },
            { x: 0.47 * this.ex, y: 3.2, z: -0.88 * this.ez },
            { x: 0.9 * this.ex, y: 4.9, z: -0.48 * this.ez },
        ];

        this.blocosExtras = []; // Vetor dos blocos
        this.boundingBlocosExtras = []; // Vetor das bounding boxes

        // Dimensões dos blocos para a geometria:
        this.dimensoes = [
            { w: 2.6, d: 1.6 + 2, h: 4.2 + 2 }, // bloco 0
            { w: 2.2, d: 2.4 + 2, h: 4.0 + 2 }, // bloco 1
            { w: 3.0, d: 1.2 + 2, h: 4.6 + 2 }, // bloco 2
            { w: 3.4, d: 1.8 + 2, h: 3.4 + 2 }, // bloco 3
            { w: 2.6, d: 2.0 + 2, h: 3.6 + 2 }, // bloco 4
            { w: 3.0, d: 2.0 + 2, h: 5.0 + 2 }, // bloco 5
            { w: 2.2, d: 1.6 + 2, h: 6.6 + 2 }, // bloco 6
            { w: 2.6, d: 1.9 + 2, h: 5.4 + 2 }, // bloco 7
            { w: 3.0, d: 1.8 + 2, h: 6.0 + 2 }, // bloco 8
            { w: 2.8, d: 1.8 + 2, h: 6.2 + 2 }, // bloco 9
            { w: 3.0, d: 2.0 + 2, h: 3.8 + 2 }, // bloco 10 (central, mais baixo)
            { w: 2.6, d: 1.6 + 2, h: 4.2 + 2 }, // bloco 0
            { w: 2.2, d: 2.4 + 2, h: 4.0 + 2 }, // bloco 1
            { w: 3.0, d: 1.2 + 2, h: 5.6 + 2 }, // bloco 2
            { w: 3.4, d: 1.8 + 2, h: 3.4 + 2 }, // bloco 3
            { w: 3.6, d: 2.0 + 2, h: 5.6 + 2 }, // bloco 4
            { w: 3.4, d: 1.8 + 2, h: 6.4 + 2 }, // bloco 3
            { w: 2.6, d: 2.0 + 2, h: 7.6 + 2 }, // bloco 4
        ];

        // Criando e poscicionando blocos adequadamente:
        this.posicoes.forEach((pos, i) => {
            // defina tamanhos variados:
            const dim = this.dimensoes[i];

            const geo = new THREE.BoxGeometry(dim.w, dim.h, dim.d);
            const mesh = new THREE.Mesh(geo, material_blocos);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            // posição XZ
            this.cube0.add(mesh);
            mesh.position.set(pos.x, pos.y + dim.h / 2, pos.z);

            this.blocosExtras.push(mesh);

            // marque o bloco central para subir depois

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



    }

    estabelecerMaterial(arquivo, repeticoesU, repeticoesV, offsetX = 0, offsetY = 0, cor = "rgb(255, 255, 255)") {
        let material = new THREE.MeshBasicMaterial({ color: cor });
        material.map = this.loader.load(arquivo);

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


        plataforma.position.y += multiplicador * 0.04; // Elevação da plataforma por frame
        //console.log(plataforma.position.y);
        plataformaBox.setFromObject(plataforma);
        if (multiplicador * plataforma.position.y > multiplicador * limiteY) { // Se passou do limite
            let dif = limiteY - plataforma.position.y + multiplicador * 0.04; // Obtém a diferença anterior
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
        this.qtd_movimento_plataformas[indice] = multiplicador * 0.04; // variável que armazena último incremento de movimento, caso se queria obtê-lo
        return multiplicador * 0.04;

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