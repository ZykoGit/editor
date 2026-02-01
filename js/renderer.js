// renderer.js

import { Mat4 } from "./math.js";

export const Renderer = {
    gl: null,
    program: null,
    canvas: null,

    camera: {
        x: 0,
        y: 2,
        z: 6,
        pitch: -0.3,
        yaw: 0
    },

    init(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl");

        if (!this.gl) {
            alert("WebGL not supported");
            return;
        }

        this.resize();
        window.addEventListener("resize", () => this.resize());

        this.program = this.createProgram(
            this.vertexShaderSource(),
            this.fragmentShaderSource()
        );

        this.gl.useProgram(this.program);

        this.gl.enable(this.gl.DEPTH_TEST);
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    },

    getProjectionMatrix() {
        return Mat4.perspective(
            Math.PI / 3,
            this.canvas.width / this.canvas.height,
            0.1,
            100
        );
    },

    getViewMatrix() {
        const cx = this.camera.x;
        const cy = this.camera.y;
        const cz = this.camera.z;

        const dirX = Math.cos(this.camera.pitch) * Math.sin(this.camera.yaw);
        const dirY = Math.sin(this.camera.pitch);
        const dirZ = Math.cos(this.camera.pitch) * Math.cos(this.camera.yaw);

        const target = [cx + dirX, cy + dirY, cz + dirZ];

        return Mat4.lookAt([cx, cy, cz], target, [0, 1, 0]);
    },

    createMesh(vertices, indices) {
        const gl = this.gl;

        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const ebo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        const stride = 5 * 4;

        const posLoc = gl.getAttribLocation(this.program, "position");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, stride, 0);

        const uvLoc = gl.getAttribLocation(this.program, "uv");
        gl.enableVertexAttribArray(uvLoc);
        gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, stride, 3 * 4);

        gl.bindVertexArray(null);

        return { vao, count: indices.length };
    },

    drawMesh(mesh, modelMatrix) {
        const gl = this.gl;

        const uModel = gl.getUniformLocation(this.program, "uModel");
        gl.uniformMatrix4fv(uModel, false, modelMatrix);

        gl.bindVertexArray(mesh.vao);
        gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    },

    vertexShaderSource() {
        return `
        attribute vec3 position;
        attribute vec2 uv;

        uniform mat4 uProjection;
        uniform mat4 uView;
        uniform mat4 uModel;

        varying vec2 vUV;

        void main() {
            vUV = uv;
            gl_Position = uProjection * uView * uModel * vec4(position, 1.0);
        }
        `;
    },

    fragmentShaderSource() {
        return `
        precision mediump float;

        varying vec2 vUV;

        void main() {
            gl_FragColor = vec4(vUV, 1.0, 1.0);
        }
        `;
    },

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error("Shader error:", this.gl.getShaderInfoLog(shader));
        }

        return shader;
    },

    createProgram(vsSource, fsSource) {
        const vs = this.createShader(this.gl.VERTEX_SHADER, vsSource);
        const fs = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);

        return program;
    }
};
