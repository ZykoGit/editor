// math.js

export const Mat4 = {
    identity() {
        return new Float32Array([
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        ]);
    },

    perspective(fov, aspect, near, far) {
        const f = 1.0 / Math.tan(fov / 2);
        const nf = 1 / (near - far);

        return new Float32Array([
            f/aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far+near)*nf, -1,
            0, 0, (2*far*near)*nf, 0
        ]);
    },

    lookAt(eye, target, up) {
        const ex = eye[0], ey = eye[1], ez = eye[2];
        const tx = target[0], ty = target[1], tz = target[2];

        let zx = ex - tx;
        let zy = ey - ty;
        let zz = ez - tz;

        const zLen = Math.hypot(zx, zy, zz);
        zx /= zLen; zy /= zLen; zz /= zLen;

        let xx = up[1]*zz - up[2]*zy;
        let xy = up[2]*zx - up[0]*zz;
        let xz = up[0]*zy - up[1]*zx;

        const xLen = Math.hypot(xx, xy, xz);
        xx /= xLen; xy /= xLen; xz /= xLen;

        let yx = zy*xz - zz*xy;
        let yy = zz*xx - zx*xz;
        let yz = zx*xy - zy*xx;

        return new Float32Array([
            xx, yx, zx, 0,
            xy, yy, zy, 0,
            xz, yz, zz, 0,
            -(xx*ex + xy*ey + xz*ez),
            -(yx*ex + yy*ey + yz*ez),
            -(zx*ex + zy*ey + zz*ez),
            1
        ]);
    }
};
