// main.js

import { Renderer } from "./renderer.js";
import { Cube } from "./cube.js";

let cube;
let cubeMesh;
let grid;

let isDragging = false;
let lastX = 0;
let lastY = 0;

let mode = "none";

let ui = {};

window.onload = () => {
    const canvas = document.getElementById("glcanvas");
    Renderer.init(canvas);

    cube = new Cube();
    cubeMesh = Renderer.createMesh(cube.vertices, cube.indices);

    grid = Renderer.createGridMesh(40);

    ui.posX = document.getElementById("posX");
    ui.posY = document.getElementById("posY");
    ui.posZ = document.getElementById("posZ");

    ui.rotX = document.getElementById("rotX");
    ui.rotY = document.getElementById("rotY");
    ui.rotZ = document.getElementById("rotZ");

    ui.scaleX = document.getElementById("scaleX");
    ui.scaleY = document.getElementById("scaleY");
    ui.scaleZ = document.getElementById("scaleZ");

    ui.lenX = document.getElementById("lenX");
    ui.lenY = document.getElementById("lenY");
    ui.lenZ = document.getElementById("lenZ");

    updateUI();

    for (let key in ui) {
        ui[key].addEventListener("input", applyUI);
    }

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

        updateUI();

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

function applyUI() {
    cube.position.x = parseFloat(ui.posX.value);
    cube.position.y = parseFloat(ui.posY.value);
    cube.position.z = parseFloat(ui.posZ.value);

    cube.rotation.x = parseFloat(ui.rotX.value);
    cube.rotation.y = parseFloat(ui.rotY.value);
    cube.rotation.z = parseFloat(ui.rotZ.value);

    cube.scale.x = parseFloat(ui.scaleX.value);
    cube.scale.y = parseFloat(ui.scaleY.value);
    cube.scale.z = parseFloat(ui.scaleZ.value);

    cube.lengthX = parseFloat(ui.lenX.value);
    cube.lengthY = parseFloat(ui.lenY.value);
    cube.lengthZ = parseFloat(ui.lenZ.value);
}

function updateUI() {
    ui.posX.value = cube.position.x.toFixed(2);
    ui.posY.value = cube.position.y.toFixed(2);
    ui.posZ.value = cube.position.z.toFixed(2);

    ui.rotX.value = cube.rotation.x.toFixed(2);
    ui.rotY.value = cube.rotation.y.toFixed(2);
    ui.rotZ.value = cube.rotation.z.toFixed(2);

    ui.scaleX.value = cube.scale.x.toFixed(2);
    ui.scaleY.value = cube.scale.y.toFixed(2);
    ui.scaleZ.value = cube.scale.z.toFixed(2);

    ui.lenX.value = cube.lengthX?.toFixed(2) ?? "1.00";
    ui.lenY.value = cube.lengthY?.toFixed(2) ?? "1.00";
    ui.lenZ.value = cube.lengthZ?.toFixed(2) ?? "1.00";
}

function loop() {
    const gl = Renderer.gl;

    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    cube.updateMatrix();

    Renderer.drawGrid(grid);
    Renderer.drawMesh(cubeMesh, cube.modelMatrix);

    requestAnimationFrame(loop);
}
