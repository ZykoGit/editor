// cube.js

import { Mat4 } from "./math.js";

export class Cube {
    constructor() {
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };

        this.lengthX = 1;
        this.lengthY = 1;
        this.lengthZ = 1;

        this.vertices = null;
        this.indices = null;
        this.mesh = null;

        this.localMatrix = Mat4.identity();
        this.worldMatrix = Mat4.identity();
        this.finalMatrix = Mat4.identity();

        this.bone = null;
        this.selected = false;

        this.generateGeometry();
    }

    generateGeometry() {
        const x = this.lengthX / 2;
        const y = this.lengthY / 2;
        const z = this.lengthZ / 2;

        this.vertices = new Float32Array([
            -x,-y,-z, 0,0,
             x,-y,-z, 1,0,
             x, y,-z, 1,1,
            -x, y,-z, 0,1,

            -x,-y, z, 0,0,
             x,-y, z, 1,0,
             x, y, z, 1,1,
            -x, y, z, 0,1,
        ]);

        this.indices = new Uint16Array([
            0,1,2, 2,3,0,
            4,5,6, 6,7,4,
            0,4,7, 7,3,0,
            1,5,6, 6,2,1,
            3,2,6, 6,7,3,
            0,1,5, 5,4,0
        ]);
    }

    updateLocalMatrix() {
        let m = Mat4.translation(this.position.x, this.position.y, this.position.z);
        m = Mat4.multiply(m, Mat4.rotationX(this.rotation.x));
        m = Mat4.multiply(m, Mat4.rotationY(this.rotation.y));
        m = Mat4.multiply(m, Mat4.rotationZ(this.rotation.z));
        this.localMatrix = m;
    }

    updateMatrix() {
        this.updateLocalMatrix();
        if (this.bone) {
            this.bone.updateMatrix();
            this.finalMatrix = Mat4.multiply(this.bone.worldMatrix, this.localMatrix);
        } else {
            this.finalMatrix = this.localMatrix;
        }
    }
}
