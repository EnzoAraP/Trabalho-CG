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
import { loadOBJFile } from './funcoesGeometriasExternas.js';



class Area3 {
    constructor(geomterias_cubos, materiais_cubos) {
        this.loader = new THREE.TextureLoader();
        // Geometria e materias da porta, do bloco fechadura e da porta: 
        this.altura_geral = 16;
        this.compPorta = 30;
        this.geometria_porta = new BoxGeometry(0.2, this.altura_geral, this.compPorta);
        this.material_porta = new THREE.MeshLambertMaterial({ color: "rgb(50,120,90)" });
        this.porta_area_3 = new THREE.Mesh(this.geometria_porta, this.material_porta);

        this.porta_area_3_2 = new THREE.Mesh(this.geometria_porta, this.material_porta);

        this.porta_area_3_aberta = false;
        this.porta_3_abrindo = false;

        this.geometria_suporte_fechadura = new THREE.BoxGeometry(1.5, 1, 1.5);
        this.material_suporte_fechadura = new THREE.MeshLambertMaterial({ color: "rgb(100,100,100)" });
        this.suporte_fechadura = new THREE.Mesh(this.geometria_suporte_fechadura, this.material_suporte_fechadura);


        let texturaPlatA2 = "./texturas_geral/area2/seamless-metal-strong-locked-box-texture.jpg";

        let planegeometry = new THREE.BoxGeometry(70, 0.1, 96); // Plano base 500x500
        let border_planeGeometry_YZ = new THREE.BoxGeometry(1, 9, 500); // Geometra das muralhas em z 
        let border_planeGeometry_XY = new THREE.BoxGeometry(500, 9, 1); // Geomteria das muralhas em x
        let materialP = new THREE.MeshLambertMaterial({ color: "rgba(240, 3, 3, 1)" });

        this.plano = new THREE.Mesh(planegeometry, materialP);

        //this.material_plataforma_a2= new THREE.MeshBasicMaterial({color: "rgb(0,0,0)"})



        // Alteração das geometrias para comportar uma pltaforma maior:
        var cubeGeo1 = new THREE.BoxGeometry(70, this.altura_geral, 2);
        var cubeGeo2 = new THREE.BoxGeometry(2, this.altura_geral, 96);
        var cubeGeo3 = new THREE.BoxGeometry(70, this.altura_geral, 2);



        geomterias_cubos[1] = cubeGeo1;
        geomterias_cubos[2] = cubeGeo2;
        geomterias_cubos[3] = cubeGeo3;

        // Criação dos cubos da área:

        this.cube0 = new THREE.Mesh(geomterias_cubos[0], materiais_cubos[0]),
            this.cube1 = new THREE.Mesh(geomterias_cubos[1], materiais_cubos[1]),
            this.cube2 = new THREE.Mesh(geomterias_cubos[2], materiais_cubos[1]),
            this.cube3 = new THREE.Mesh(geomterias_cubos[3], materiais_cubos[1]),
            this.degraus = [],
            this.posicao_ini = new THREE.Vector3(-100, this.altura_geral / 2, 150),
            this.cubos = [],
            this.boundingCubos = [],
            this.boundingRampa = null,
            this.boundingDegraus = [],
            this.ex = 35,
            this.ez = 51,
            this.cube0.material.transparent = true;
        this.cube0.opacity = 0;
        //this.cube1.translateZ(0.5);
        //this.cube3.translateZ(-0.5);

        //this.cube0.add(this.suporte_fechadura);
        this.cube0.add(this.porta_area_3);
        this.cube0.add(this.porta_area_3_2);
        this.cube0.add(this.plano);
        this.plano.translateY(-this.altura_geral / 2 + 0.01);
        console.log("AREA3");
        console.log(this.cube0);

        // Posicionamento do bloco fechadura, da porta e da plataforma:
        this.suporte_fechadura.translateX(40);
        this.suporte_fechadura.translateZ(-5);
        this.suporte_fechadura.translateY(0.5 - 2);

        this.porta_area_3.translateX(35);
        this.porta_area_3.translateZ(this.compPorta / 2);


        this.porta_area_3_2.translateX(35);
        this.porta_area_3_2.translateZ(-this.compPorta / 2);

        this.porta1 = { mesh: this.porta_area_3, box: null, abrindo: false, aberta: false };
        this.porta2 = { mesh: this.porta_area_3_2, box: null, abrindo: false, aberta: false };
        this.fechadura = { mesh: this.suporte_fechadura, box: null };

        this.porta1.mesh.castShadow = true;
        this.porta1.mesh.receiveShadow = true;

        this.porta2.mesh.castShadow = true;
        this.porta2.mesh.receiveShadow = true;

        this.fechadura.mesh.castShadow = true;
        this.fechadura.mesh.receiveShadow = true;




        this.cubos = [this.cube1, this.cube2, this.cube3];


        // Posições dos blocos que ficam em cima da área 2:


        // Variáveis de controle da elevação do bloco central ao se derrotar todos os inimgos: 
        this.num_passos_elevacao = 240;
        this.indice_bloco_chave = 10;
        this.elevar_bloco = false;
        this.bloco_elevado = false;
        this.limite_elevacao = 1.6;



        // Variáveis extras de controle de movimento da plataforma:
        this.num_passos_exec = 0;



        // Variáveis das chaves e suas BoundingBoxes:
        this.chave2box = null;
        this.chave2 = null;
        this.chave1 = null;
        this.chave1Box = null;

        this.chave3Retirada = false; // Controle para verificar se a chave 2 já foi obtida pelo jogador



        this.comecou_a_abrir = false; // Controle para se a porta começou a abrir




        var cubeGeo4 = new THREE.BoxGeometry(2, this.altura_geral, (96 - 2 * this.compPorta) / 2);
        this.cube4 = new THREE.Mesh(cubeGeo4, materiais_cubos[1]);
        this.cube5 = new THREE.Mesh(cubeGeo4, materiais_cubos[1]);
        this.cube0.add(this.cube4);
        this.cube0.add(this.cube5);
        this.cube4.translateX(34);
        this.cube5.translateX(34);
        this.cube4.translateZ(this.compPorta + (96 - this.compPorta * 2) / 4);
        this.cube5.translateZ(-(this.compPorta + (96 - this.compPorta * 2) / 4));
        this.boundingCube4 = null;
        this.boundingCube5 = null;



        const shape = new THREE.Shape();
        shape.absellipse(0, 0, 49.9, 19.8, Math.PI, 0, true); // meia elipse

        const extrudeSettings = {
            depth: 1.8, bevelEnabled: true, curveSegments: 256, // Mais pontos no contorno da elipse
            steps: 1           // Quantidade de divisões na profundidade
        };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const material = new THREE.MeshBasicMaterial({});
        this.hangar = new THREE.Mesh(geometry, material);
        this.cube0.add(this.hangar);
        this.hangar.translateY(this.altura_geral / 2 + 0.2);
        this.hangar.translateX(35 - extrudeSettings.depth - 0.2);
        this.hangar.rotateY(Math.PI / 2);

        this.fachadaOval1 = this.hangar;


        this.fachadaOval2 = new THREE.Mesh(geometry, material);
        this.fachadaOval2.translateY(this.altura_geral / 2 + 0.2);
        this.fachadaOval2.translateX(-(35) + 0.2);
        this.fachadaOval2.rotateY(Math.PI / 2);
        this.cube0.add(this.fachadaOval2);

        // Cria um contorno meia elipse (sem preenchimento) com base no mesmo shape da frente

        const pontosPerfil = [];
        const raioX = 50;
        const raioY = 20;
        const segmentos = 256;

        for (let i = 0; i <= segmentos; i++) {
            const theta = Math.PI - (i / segmentos) * Math.PI; // de PI a 0
            const x = Math.cos(theta) * raioX;
            const y = Math.sin(theta) * raioY;
            pontosPerfil.push(new THREE.Vector3(x, y, 0));
        }

        // Extrudir os pontos ao longo do eixo Z para formar o arco longo (casca)
        const comprimento = 66; // comprimento do hangar
        const geometria = new THREE.BufferGeometry();
        const vertices = [];

        const segmentosZ = 1; // apenas início e fim

        for (let i = 0; i <= segmentosZ; i++) {
            const z = (i / segmentosZ) * comprimento;
            for (let j = 0; j < pontosPerfil.length; j++) {
                const p = pontosPerfil[j];
                vertices.push(p.x, p.y, z);
            }
        }

        // Criar faces (triângulos) ligando os dois perfis
        const indices = [];
        for (let i = 0; i < segmentosZ; i++) {
            const base = i * pontosPerfil.length;
            for (let j = 0; j < pontosPerfil.length - 1; j++) {
                const a = base + j;
                const b = base + j + 1;
                const c = base + j + pontosPerfil.length;
                const d = base + j + 1 + pontosPerfil.length;

                indices.push(a, b, d);
                indices.push(a, d, c);
            }
        }

        geometria.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
        geometria.setIndex(indices);
        geometria.computeVertexNormals();

        // Material e Mesh
        const material2 = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const tetoOval = new THREE.Mesh(geometria, material2);


        // Posicionamento

        this.tetoOval = tetoOval;

        this.cube0.add(this.tetoOval);
        this.tetoOval.translateY(this.altura_geral / 2);
        this.tetoOval.rotateY(Math.PI / 2);
        this.tetoOval.translateZ(-33);
        this.tetoOvalBox = null;
        this.fachadaOvalBox1 = null;
        this.fachadaOvalBox2 = null;


        this.carregar_aviao();
    }

    carregar_aviao() {

       this.assetManager = {
            // Properties ---------------------------------
            plane: null,
            planeBox: null,
            allLoaded: false,
            in_position:false,

            // Functions ----------------------------------
            checkLoaded: function () {
                if (!this.allLoaded) {
                    if (
                        this.plane ) {
                        this.allLoaded = true;
                    }
                }
            },

            hideAll: function () {
                this.orca.visible = this.woodenGoose.visible = this.statue.visible =
                    this.plane.visible = this.L200.visible = this.tank.visible = false;
            }
        }
        loadOBJFile(this.assetManager,'../assets/objects/', 'plane', 20, 0, true);
        
        
    }

    posicionar_aviao(){
        
        if(this.assetManager.in_position)
            return;
        if(this.assetManager.planeBox==null)
            this.assetManager.planeBox= new THREE.Box3();
        this.assetManager.checkLoaded();
        console.log(this.assetManager.allLoaded);
        if(!this.assetManager.allLoaded)
            return;
        
        this.cube0.add(this.assetManager.plane);
        this.assetManager.plane.translateY(-8);
        this.assetManager.planeBox=new THREE.Box3().setFromObject(this.assetManager.plane);
        console.log(this.assetManager.plane);
        this.assetManager.in_position=true;

    }

    estabelecerMaterial(arquivo, repeticoesU, repeticoesV, offsetX = 0, offsetY = 0, cor = "rgb(255, 255, 255)") {
        let material = new THREE.MeshBasicMaterial({ color: cor });
        material.map = this.loader.load(arquivo);

        material.map.wrapS = THREE.RepeatWrapping;
        material.map.wrapT = THREE.RepeatWrapping;
        material.map.minFilter = material.map.magFilter = THREE.LinearFilter;
        material.map.repeat.set(repeticoesU, repeticoesV);
        material.map.offset.x = offsetX;
        material.map.offset.y = offsetY;
        return material;

    }

    // Função para abrir a porta inicial, passa-se o limite absouluto do movimento em Z e o multiplicador para verificar se será positivo ou negativo
    abrir_porta(limiteZ, multiplicador) {
        console.log("catapimbas");
        if (!this.comecou_a_abrir) {
            // Fazer com que a porte adentre a área 2 e não fique para fora:
            this.porta1.mesh.translateY(-0.02);
            this.porta1.mesh.translateX(-0.02);

            this.porta2.mesh.translateY(0.02);
            this.porta2.mesh.translateX(0.02);

            this.comecou_a_abrir = true;
        }

        this.porta1.mesh.position.z += multiplicador * 0.055; // Incremento de movimento
        this.porta2.mesh.position.z -= multiplicador * 0.055; // Incremento de movimento

        this.porta1.box.setFromObject(this.porta1.mesh);
        this.porta2.box.setFromObject(this.porta2.mesh);

        // Se alcançar o limite:
        if (multiplicador * this.porta1.mesh.position.z >= multiplicador * limiteZ) {
            this.porta1.mesh.position.z = limiteZ; // Coloca no limite
            this.porta2.mesh.position.z = -limiteZ; // Coloca no -limite
            this.porta1.box.setFromObject(this.porta1.mesh);
            this.porta2.box.setFromObject(this.porta2.mesh);
            this.porta1.abrindo = false;
            this.porta1.aberta = true;
            this.porta2.aberta = true;
            this.porta2.abrindo = false;
        }

    }
    posicionar_chave1(chave) {

        this.chave1 = criarChave(this.fechadura.mesh, new THREE.Vector3(0, 0, 0), 0.5, "rgb(240, 7, 7)", "rgb(250, 6, 11)"); // Vai à função de criação de chave


        this.chave1.translateY(0.5); // Coloca o centro na parte de cima do suporte-fechadura
        this.chave1Box = new THREE.Box3().setFromObject(this.chave1);
        const size = new THREE.Vector3();
        this.chave1Box.getSize(size); // Obtém tamanho da chave

        this.chave1.translateY(size.y / 2); // Translada metade do tamanho da chave para que ela fique com a base sobre o suporte

        this.chave1Box.setFromObject(this.chave1);
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
        if ((this.elevar_bloco || this.bloco_elevado) && !this.chave2Retirada) {  // Só faz sentido retirar a chave se o bloco estiver sendo elevado ou terminou de se elevar e a chave ainda não foi retirada
            console.log(this.chave2Box);
            if (personagem.box.intersectsBox(this.chave2Box)) {
                this.cube0.remove(this.chave2);
                scene.remove(this.chave2);
                this.chave2Retirada = true;
            }
        }

    }

    // Função para mover plataforma: passa-se limite e multiplicador ( -1 ou 1 )


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
        if (this.num_passos_exec >= this.num_passos_elevacao) {  // Se chegou ao limite
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


    teste_abertura_porta(obj, possui_chave) {
        let pos_teste = this.posicao_ini;
        let qtdZ = 42;
        let qtdXMax = 67;
        let qtdXMin = 33;
        if (possui_chave && !this.porta1.aberta && !this.porta1.abrindo &&
            (obj.position.z < pos_teste.z + qtdZ && obj.position.z > pos_teste.z - qtdZ &&
                obj.position.x < pos_teste.x + qtdXMax && obj.position.x > pos_teste.x + qtdXMin
            )
        ) {
            this.porta1.abrindo = true;
            this.porta2.abrindo = true;
        }
        // console.log(obj.position.z < pos_teste.z + qtdZ && obj.position.z > pos_teste.z - qtdZ);
    }
}



export { Area3 };