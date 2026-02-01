// main.js

import { Renderer } from "./renderer.js";
import { Cube } from "./cube.js";

let cube;
let cubeMesh;
let grid;

let isDragging = false;
let lastX = 0;
let lastY = 0;

let mode = "none"; // "move", "rotate", "scale"

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

        const dx = (e.clientX - lastX) * 0.01;
        const dy = (e.clientY - lastY) * 0.01;

        if (mode === "move") {
            cube.position.x += dx;
            cube.position.z += dy;
        }

        if (mode === "rotate") {
            cube.rotation.y += dx;
            cube.rotation.x += dy;
        }

        if (mode === "scale") {
            cube.scale.x += dx;
            cube.scale.y += dx;
            cube.scale.z += dx;
        }

        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener("keydown", e => {
        if (e.key === "g") mode = "move";
        if (e.key === "r") mode = "rotate";
        if (e.key === "s") mode = "scale";
        if (e.key === "Escape") mode = "none";
    });

    requestAnimationFrame(loop);
};

function loop() {
    const gl = Renderer.gl;

    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    cube.updateMatrix();

    Renderer.drawGrid(grid);
    Renderer.drawMesh(cubeMesh, cube.modelMatrix);

    requestAnimationFrame(loop);
}
