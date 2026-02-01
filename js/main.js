// main.js

import { Renderer } from "./renderer.js";
import { Cube } from "./cube.js";

let cube;
let cubeMesh;
let grid;

let isDragging = false;
let lastX = 0;
let lastY = 0;

window.onload = () => {
    const canvas = document.getElementById("glcanvas");
    Renderer.init(canvas);

    cube = new Cube();
    cubeMesh = Renderer.createMesh(cube.vertices, cube.indices);

    grid = Renderer.createGridMesh(40);

    canvas.addEventListener("mousedown", e => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    window.addEventListener("mousemove", e => {
        if (!isDragging) return;

        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;

        Renderer.camera.yaw += dx * 0.005;
        Renderer.camera.pitch += dy * 0.005;

        Renderer.camera.pitch = Math.max(-1.5, Math.min(1.5, Renderer.camera.pitch));

        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener("keydown", e => {
        const speed = 0.2;

        const forwardX = Math.sin(Renderer.camera.yaw);
        const forwardZ = Math.cos(Renderer.camera.yaw);

        const rightX = Math.cos(Renderer.camera.yaw);
        const rightZ = -Math.sin(Renderer.camera.yaw);

        if (e.key === "w") {
            Renderer.camera.x += forwardX * speed;
            Renderer.camera.z += forwardZ * speed;
        }
        if (e.key === "s") {
            Renderer.camera.x -= forwardX * speed;
            Renderer.camera.z -= forwardZ * speed;
        }
        if (e.key === "a") {
            Renderer.camera.x -= rightX * speed;
            Renderer.camera.z -= rightZ * speed;
        }
        if (e.key === "d") {
            Renderer.camera.x += rightX * speed;
            Renderer.camera.z += rightZ * speed;
        }
    });

    requestAnimationFrame(loop);
};

function loop() {
    const gl = Renderer.gl;
    const program = Renderer.program;

    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const uProjection = gl.getUniformLocation(program, "uProjection");
    const uView = gl.getUniformLocation(program, "uView");

    gl.uniformMatrix4fv(uProjection, false, Renderer.getProjectionMatrix());
    gl.uniformMatrix4fv(uView, false, Renderer.getViewMatrix());

    Renderer.drawGrid(grid);
    Renderer.drawMesh(cubeMesh, cube.modelMatrix);

    requestAnimationFrame(loop);
}
