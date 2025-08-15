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
export class ElevacaoBloco {
    constructor(bloco, boundingBoxBloco, inicio = 0, limite = 2, num_passos_elevacao = 150) {
        this.bloco = bloco;
        this.box = boundingBoxBloco;
        this.num_passos_elevacao = num_passos_elevacao;

        // Posições inicial e final
        this.c = inicio;
        this.limite_elevacao = limite;

        this.num_passos_exec = 0;
        this.elevar_bloco = false;
        this.bloco_elevado = false;
    }

    mudar_limite_elevacao(limiteY) {
        if (this.elevar_bloco) return;
        this.limite_elevacao = limiteY;
    }

    // Função de suavização (ease-in-out cúbica)
    funcao_movimento_elevacao(t) {
        // t varia de 0 a 1
        return this.c + (this.limite_elevacao - this.c) * (3 * t ** 2 - 2 * t ** 3);
    }

    iniciar_elevacao() {
        if (!this.elevar_bloco && !this.bloco_elevado) {
            this.num_passos_exec = 0; // resetar contador
            this.elevar_bloco = true;
        }
    }

    fazer_elevar_bloco() {
        if (!this.elevar_bloco) return;

        if (this.num_passos_exec < this.num_passos_elevacao) {
            this.num_passos_exec++;
            let t = this.num_passos_exec / this.num_passos_elevacao;
            this.bloco.position.y = this.funcao_movimento_elevacao(t);
            this.box.setFromObject(this.bloco);
        } else {
            this.bloco_elevado = true;
            this.elevar_bloco = false;
        }
    }
}