// cube.js

import { Mat4 } from "./math.js";

export class Cube {
    constructor() {
        this.modelMatrix = Mat4.identity();

        this.vertices = new Float32Array([
            // x, y, z,   u, v
            -1, -1,  1,  0, 0,
             1, -1,  1,  1, 0,
             1,  1,  1,  1, 1,
            -1,  1,  1,  0, 1,
        ]);

        this.indices = new Uint16Array([
            0, 1, 2,
            2, 3, 0
        ]);
    }
}

