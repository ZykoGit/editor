// main.js

import { Renderer } from "./renderer.js";
import { Cube } from "./cube.js";
import { Bone } from "./bone.js";

let scene = [];
let bones = [];
let selected = null;

let grid;

let isDragging = false;
let lastX = 0;
let lastY = 0;

let mode = "none";

let ui = {};

window.onload = () => {
    const canvas = document.getElementById("glcanvas");
    Renderer.init(canvas);

    grid = Renderer.createGridMesh(40);

    // Root bone
    addBone("Root");

    // First cube
    addCube();

    // UI elements
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

    ui.boneSelect = document.getElementById("boneSelect");

    document.getElementById("addCube").onclick = addCube;

    ui.boneSelect.onchange = () => {
        if (selected) {
            const boneID = parseInt(ui.boneSelect.value);
            selected.bone = bones.find(b => b.id === boneID);
        }
    };

    for (let key in ui) {
        if (ui[key] instanceof HTMLInputElement) {
            ui[key].addEventListener("input", applyUI);
        }
    }

    // Mouse picking
    canvas.addEventListener("mousedown", e => {
        if (mode === "none") pickCube(e.clientX, e.clientY);

        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    window.addEventListener("mousemove", e => {
        if (!isDragging || !selected) return;

        const dx = (e.clientX - lastX) * 0.01;
        const dy = (e.clientY - lastY) * 0.01;

        if (mode === "move") {
            selected.position.x += dx;
            selected.position.z += dy;
        }

        if (mode === "rotate") {
            selected.rotation.y += dx;
            selected.rotation.x += dy;
        }

        if (mode === "scale") {
            selected.scale.x += dx;
            selected.scale.y += dx;
            selected.scale.z += dx;
        }

        updateUI();

        lastX = e.clientX;
        lastY = e.clientY;
    });

    // Keyboard shortcuts
    window.addEventListener("keydown", e => {
        if (e.key === "g") mode = "move";
        if (e.key === "r") mode = "rotate";
        if (e.key === "s") mode = "scale";
        if (e.key === "Escape") mode = "none";
    });

    requestAnimationFrame(loop);
};

function addBone(name) {
    const bone = new Bone(name);
    bones.push(bone);
    refreshBoneDropdown();
    return bone;
}

function refreshBoneDropdown() {
    ui.boneSelect.innerHTML = "";
    for (let bone of bones) {
        const opt = document.createElement("option");
        opt.value = bone.id;
        opt.textContent = bone.name;
        ui.boneSelect.appendChild(opt);
    }
}

function addCube() {
    const cube = new Cube();
    cube.position.x = Math.random() * 4 - 2;
    cube.position.z = Math.random() * 4 - 2;

    cube.mesh = Renderer.createMesh(cube.vertices, cube.indices);

    cube.bone = bones[0]; // assign to root

    scene.push(cube);
    selectCube(cube);
}

function selectCube(cube) {
    if (selected) selected.selected = false;

    selected = cube;
    selected.selected = true;

    updateUI();
}

function pickCube(mouseX, mouseY) {
    const rect = Renderer.canvas.getBoundingClientRect();

    const x = (mouseX - rect.left) / rect.width * 2 - 1;
    const y = -((mouseY - rect.top) / rect.height * 2 - 1);

    let closest = null;
    let closestDist = Infinity;

    for (let cube of scene) {
        const dx = x - cube.position.x * 0.1;
        const dy = y - cube.position.y * 0.1;

        const dist = dx * dx + dy * dy;

        if (dist < closestDist) {
            closestDist = dist;
            closest = cube;
        }
    }

    if (closest) selectCube(closest);
}

function applyUI() {
    if (!selected) return;

    selected.position.x = parseFloat(ui.posX.value);
    selected.position.y = parseFloat(ui.posY.value);
    selected.position.z = parseFloat(ui.posZ.value);

    selected.rotation.x = parseFloat(ui.rotX.value);
    selected.rotation.y = parseFloat(ui.rotY.value);
    selected.rotation.z = parseFloat(ui.rotZ.value);

    selected.scale.x = parseFloat(ui.scaleX.value);
    selected.scale.y = parseFloat(ui.scaleY.value);
    selected.scale.z = parseFloat(ui.scaleZ.value);

    const oldX = selected.lengthX;
    const oldY = selected.lengthY;
    const oldZ = selected.lengthZ;

    selected.lengthX = parseFloat(ui.lenX.value);
    selected.lengthY = parseFloat(ui.lenY.value);
    selected.lengthZ = parseFloat(ui.lenZ.value);

    if (selected.lengthX !== oldX || selected.lengthY !== oldY || selected.lengthZ !== oldZ) {
        selected.generateGeometry();
        selected.mesh = Renderer.createMesh(selected.vertices, selected.indices);
    }

    if (selected.bone) {
        ui.boneSelect.value = selected.bone.id;
    }
}

function updateUI() {
    if (!selected) return;

    ui.posX.value = selected.position.x.toFixed(2);
    ui.posY.value = selected.position.y.toFixed(2);
    ui.posZ.value = selected.position.z.toFixed(2);

    ui.rotX.value = selected.rotation.x.toFixed(2);
    ui.rotY.value = selected.rotation.y.toFixed(2);
    ui.rotZ.value = selected.rotation.z.toFixed(2);

    ui.scaleX.value = selected.scale.x.toFixed(2);
    ui.scaleY.value = selected.scale.y.toFixed(2);
    ui.scaleZ.value = selected.scale.z.toFixed(2);

    ui.lenX.value = selected.lengthX.toFixed(2);
    ui.lenY.value = selected.lengthY.toFixed(2);
    ui.lenZ.value = selected.lengthZ.toFixed(2);

    if (selected.bone) {
        ui.boneSelect.value = selected.bone.id;
    }
}

function loop() {
    const gl = Renderer.gl;

    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update bone hierarchy
    for (let bone of bones) {
        if (!bone.parent) bone.updateMatrix();
    }

    Renderer.drawGrid(grid);

    // ⭐ Draw bones
    for (let bone of bones) {
        Renderer.drawBone(bone);
    }

    // Draw cubes
    for (let cube of scene) {
        cube.updateMatrix();
        Renderer.drawCube(cube.mesh, cube.finalMatrix, cube.selected);
    }

    requestAnimationFrame(loop);
}
