// cube.js

import { Mat4 } from "./math.js";

export class Cube {
    constructor() {
        this.position = { x: 0, y: 1, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };

        // NEW: dimensions
        this.lengthX = 2;
        this.lengthY = 2;
        this.lengthZ = 2;

        this.modelMatrix = Mat4.identity();

        this.generateGeometry();
    }

    generateGeometry() {
        const lx = this.lengthX / 2;
        const ly = this.lengthY / 2;
        const lz = this.lengthZ / 2;

        this.vertices = new Float32Array([
            // Front
            -lx, -ly,  lz,  0, 0,
             lx, -ly,  lz,  1, 0,
             lx,  ly,  lz,  1, 1,
            -lx,  ly,  lz,  0, 1,

            // Back
            -lx, -ly, -lz,  1, 0,
             lx, -ly, -lz,  0, 0,
             lx,  ly, -lz,  0, 1,
            -lx,  ly, -lz,  1, 1,

            // Left
            -lx, -ly, -lz,  0, 0,
            -lx, -ly,  lz,  1, 0,
            -lx,  ly,  lz,  1, 1,
            -lx,  ly, -lz,  0, 1,

            // Right
             lx, -ly, -lz,  1, 0,
             lx, -ly,  lz,  0, 0,
             lx,  ly,  lz,  0, 1,
             lx,  ly, -lz,  1, 1,

            // Top
            -lx,  ly,  lz,  0, 0,
             lx,  ly,  lz,  1, 0,
             lx,  ly, -lz,  1, 1,
            -lx,  ly, -lz,  0, 1,

            // Bottom
            -lx, -ly,  lz,  0, 0,
             lx, -ly,  lz,  1, 0,
             lx, -ly, -lz,  1, 1,
            -lx, -ly, -lz,  0, 1,
        ]);

        this.indices = new Uint16Array([
            0,1,2, 2,3,0,
            4,5,6, 6,7,4,
            8,9,10, 10,11,8,
            12,13,14, 14,15,12,
            16,17,18, 18,19,16,
            20,21,22, 22,23,20
        ]);
    }

    updateMatrix() {
        let m = Mat4.translation(this.position.x, this.position.y, this.position.z);

        m = Mat4.multiply(m, Mat4.rotationX(this.rotation.x));
        m = Mat4.multiply(m, Mat4.rotationY(this.rotation.y));
        m = Mat4.multiply(m, Mat4.rotationZ(this.rotation.z));

        m = Mat4.multiply(m, Mat4.scale(this.scale.x, this.scale.y, this.scale.z));

        this.modelMatrix = m;
    }
}
