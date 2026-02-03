// bone.js

import { Mat4 } from "./math.js";

let nextBoneID = 1;

export class Bone {
    constructor(name = "Bone") {
        this.id = nextBoneID++;
        this.name = name + "_" + this.id;

        this.parent = null;
        this.children = [];

        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };

        this.modelMatrix = Mat4.identity();
        this.worldMatrix = Mat4.identity();

        this.selected = false;
    }

    isDescendantOf(bone) {
        let p = this.parent;
        while (p) {
            if (p === bone) return true;
            p = p.parent;
        }
        return false;
    }

    setParent(newParent) {
        if (newParent === this) return;
        if (newParent && newParent.isDescendantOf(this)) return;

        this.updateMatrix();
        const oldWorld = this.worldMatrix.slice();

        if (this.parent) {
            const i = this.parent.children.indexOf(this);
            if (i !== -1) this.parent.children.splice(i, 1);
        }

        this.parent = newParent;
        if (newParent) newParent.children.push(this);

        const parentInv = newParent ? Mat4.invert(newParent.worldMatrix) : Mat4.identity();
        this.modelMatrix = Mat4.multiply(parentInv, oldWorld);

        this.position.x = this.modelMatrix[12];
        this.position.y = this.modelMatrix[13];
        this.position.z = this.modelMatrix[14];
    }

    updateMatrix() {
        let m = Mat4.translation(this.position.x, this.position.y, this.position.z);
        m = Mat4.multiply(m, Mat4.rotationX(this.rotation.x));
        m = Mat4.multiply(m, Mat4.rotationY(this.rotation.y));
        m = Mat4.multiply(m, Mat4.rotationZ(this.rotation.z));

        this.modelMatrix = m;

        if (this.parent) {
            this.parent.updateMatrix();
            this.worldMatrix = Mat4.multiply(this.parent.worldMatrix, this.modelMatrix);
        } else {
            this.worldMatrix = this.modelMatrix;
        }

        for (let child of this.children) {
            child.updateMatrix();
        }
    }
}
