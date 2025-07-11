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
export class ElevacaoBloco
{
    constructor(bloco,boundingBoxBloco,inicio=0,limite=2,num_passos_elevacao=150){
        this.bloco=bloco;
        this.box=boundingBoxBloco;
        this.num_passos_elevacao=num_passos_elevacao;
        this.num_passos_exec=0;

        this.a=0;
        this.b=1.2;
        this.c=inicio;
        this.limite_elevacao=limite+this.c;
        this.a=(-2*this.limite_elevacao+3*this.c)/2;
        this.b=this.limite_elevacao-this.a-this.c;

        this.elevar_bloco=false;
        this.bloco_elevado=false;
        

    }
    mudar_limite_elevacao(limiteY){
        if(this.elevar_bloco)
            return;

      
        this.limite_elevacao=limiteY+this.c;
    
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
            this.bloco.position.y=this.funcao_movimento_elevacao(this.num_passos_exec/this.num_passos_elevacao)+2;
            this.box.setFromObject(this.bloco);
        }
        if(this.num_passos_exec>=this.num_passos_elevacao){
            this.bloco_elevado=true;
            this.elevar_bloco=false;
        }
        
        
    }
}