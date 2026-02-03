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

    translation(x, y, z) {
        const m = Mat4.identity();
        m[12] = x;
        m[13] = y;
        m[14] = z;
        return m;
    },

    rotationX(a) {
        const c = Math.cos(a), s = Math.sin(a);
        return new Float32Array([
            1,0,0,0,
            0,c,s,0,
            0,-s,c,0,
            0,0,0,1
        ]);
    },

    rotationY(a) {
        const c = Math.cos(a), s = Math.sin(a);
        return new Float32Array([
            c,0,-s,0,
            0,1,0,0,
            s,0,c,0,
            0,0,0,1
        ]);
    },

    rotationZ(a) {
        const c = Math.cos(a), s = Math.sin(a);
        return new Float32Array([
            c,s,0,0,
            -s,c,0,0,
            0,0,1,0,
            0,0,0,1
        ]);
    },

    multiply(a, b) {
        const out = new Float32Array(16);
        for (let i = 0; i < 4; i++) {
            const ai0 = a[i], ai1 = a[i+4], ai2 = a[i+8], ai3 = a[i+12];
            out[i]      = ai0*b[0] + ai1*b[1] + ai2*b[2] + ai3*b[3];
            out[i+4]    = ai0*b[4] + ai1*b[5] + ai2*b[6] + ai3*b[7];
            out[i+8]    = ai0*b[8] + ai1*b[9] + ai2*b[10]+ ai3*b[11];
            out[i+12]   = ai0*b[12]+ ai1*b[13]+ ai2*b[14]+ ai3*b[15];
        }
        return out;
    },

    perspective(fov, aspect, near, far) {
        const f = 1 / Math.tan(fov / 2);
        const nf = 1 / (near - far);
        const out = new Float32Array(16);
        out[0] = f / aspect;
        out[5] = f;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[14] = (2 * far * near) * nf;
        return out;
    },

    lookAt(eye, target, up) {
        const [ex, ey, ez] = eye;
        const [tx, ty, tz] = target;
        let [ux, uy, uz] = up;

        let zx = ex - tx;
        let zy = ey - ty;
        let zz = ez - tz;
        let len = Math.hypot(zx, zy, zz);
        zx /= len; zy /= len; zz /= len;

        let xx = uy * zz - uz * zy;
        let xy = uz * zx - ux * zz;
        let xz = ux * zy - uy * zx;
        len = Math.hypot(xx, xy, xz);
        xx /= len; xy /= len; xz /= len;

        let yx = zy * xz - zz * xy;
        let yy = zz * xx - zx * xz;
        let yz = zx * xy - zy * xx;

        const out = Mat4.identity();
        out[0] = xx; out[4] = yx; out[8]  = zx;
        out[1] = xy; out[5] = yy; out[9]  = zy;
        out[2] = xz; out[6] = yz; out[10] = zz;

        out[12] = -(xx*ex + yx*ey + zx*ez);
        out[13] = -(xy*ex + yy*ey + zy*ez);
        out[14] = -(xz*ex + yz*ey + zz*ez);

        return out;
    },

    invert(m) {
        const out = new Float32Array(16);
        const a = m;
        const b00 = a[0] * a[5] - a[1] * a[4];
        const b01 = a[0] * a[6] - a[2] * a[4];
        const b02 = a[0] * a[7] - a[3] * a[4];
        const b03 = a[1] * a[6] - a[2] * a[5];
        const b04 = a[1] * a[7] - a[3] * a[5];
        const b05 = a[2] * a[7] - a[3] * a[6;
        const b06 = a[8] * a[13] - a[9] * a[12];
        const b07 = a[8] * a[14] - a[10] * a[12];
        const b08 = a[8] * a[15] - a[11] * a[12];
        const b09 = a[9] * a[14] - a[10] * a[13];
        const b10 = a[9] * a[15] - a[11] * a[13];
        const b11 = a[10] * a[15] - a[11] * a[14];

        let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return Mat4.identity();
        det = 1.0 / det;

        out[0]  = ( a[5] * b11 - a[6] * b10 + a[7] * b09) * det;
        out[1]  = (-a[1] * b11 + a[2] * b10 - a[3] * b09) * det;
        out[2]  = ( a[13]* b05 - a[14]* b04 + a[15]* b03) * det;
        out[3]  = (-a[9] * b05 + a[10]* b04 - a[11]* b03) * det;
        out[4]  = (-a[4] * b11 + a[6] * b08 - a[7] * b07) * det;
        out[5]  = ( a[0] * b11 - a[2] * b08 + a[3] * b07) * det;
        out[6]  = (-a[12]* b05 + a[14]* b02 - a[15]* b01) * det;
        out[7]  = ( a[8] * b05 - a[10]* b02 + a[11]* b01) * det;
        out[8]  = ( a[4] * b10 - a[5] * b08 + a[7] * b06) * det;
        out[9]  = (-a[0] * b10 + a[1] * b08 - a[3] * b06) * det;
        out[10] = ( a[12]* b04 - a[13]* b02 + a[15]* b00) * det;
        out[11] = (-a[8] * b04 + a[9] * b02 - a[11]* b00) * det;
        out[12] = (-a[4] * b09 + a[5] * b07 - a[6] * b06) * det;
        out[13] = ( a[0] * b09 - a[1] * b07 + a[2] * b06) * det;
        out[14] = (-a[12]* b03 + a[13]* b01 - a[14]* b00) * det;
        out[15] = ( a[8] * b03 - a[9] * b01 + a[10]* b00) * det;

        return out;
    }
};
