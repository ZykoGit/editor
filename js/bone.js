// bone.js

import { Mat4 } from "./math.js";

let nextBoneID = 1;

export class Bone {
    constructor(name = "Bone") {
        this.id = nextBoneID++;
        this.name = name + "_" + this.id;

        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };

        this.parent = null;
        this.children = [];

        this.modelMatrix = Mat4.identity();
    }

    setParent(bone) {
        if (this.parent) {
            const i = this.parent.children.indexOf(this);
            if (i !== -1) this.parent.children.splice(i, 1);
        }

        this.parent = bone;

        if (bone) {
            bone.children.push(this);
        }
    }

    updateMatrix() {
        let m = Mat4.translation(this.position.x, this.position.y, this.position.z);

        m = Mat4.multiply(m, Mat4.rotationX(this.rotation.x));
        m = Mat4.multiply(m, Mat4.rotationY(this.rotation.y));
        m = Mat4.multiply(m, Mat4.rotationZ(this.rotation.z));

        if (this.parent) {
            this.parent.updateMatrix();
            m = Mat4.multiply(this.parent.modelMatrix, m);
        }

        this.modelMatrix = m;
    }
}
