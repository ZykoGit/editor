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

    multiply(a, b) {
        const out = new Float32Array(16);

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                out[i*4 + j] =
                    a[i*4 + 0] * b[0*4 + j] +
                    a[i*4 + 1] * b[1*4 + j] +
                    a[i*4 + 2] * b[2*4 + j] +
                    a[i*4 + 3] * b[3*4 + j];
            }
        }

        return out;
    },

    translation(x, y, z) {
        const m = Mat4.identity();
        m[12] = x;
        m[13] = y;
        m[14] = z;
        return m;
    },

    scale(x, y, z) {
        const m = Mat4.identity();
        m[0] = x;
        m[5] = y;
        m[10] = z;
        return m;
    },

    rotationX(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return new Float32Array([
            1,0,0,0,
            0,c,-s,0,
            0,s,c,0,
            0,0,0,1
        ]);
    },

    rotationY(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return new Float32Array([
            c,0,s,0,
            0,1,0,0,
            -s,0,c,0,
            0,0,0,1
        ]);
    },

    rotationZ(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        return new Float32Array([
            c,-s,0,0,
            s,c,0,0,
            0,0,1,0,
            0,0,0,1
        ]);
    }
};
