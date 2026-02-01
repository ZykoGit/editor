// renderer.js

export const Renderer = {
    gl: null,
    program: null,
    canvas: null,
    camera: {
        x: 0, y: 0, z: 5,
        pitch: 0,
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
    },

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
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

