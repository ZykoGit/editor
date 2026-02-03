// main.js

import { Renderer } from "./renderer.js";
import { Cube } from "./cube.js";
import { Bone } from "./bone.js";

let scene = [];
let bones = [];
let selectedCube = null;
let selectedBone = null;

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

    const root = addBone("Root");
    addCube();

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

    ui.bonePosX = document.getElementById("bonePosX");
    ui.bonePosY = document.getElementById("bonePosY");
    ui.bonePosZ = document.getElementById("bonePosZ");

    ui.boneRotX = document.getElementById("boneRotX");
    ui.boneRotY = document.getElementById("boneRotY");
    ui.boneRotZ = document.getElementById("boneRotZ");
    
    ui.boneSelect = document.getElementById("boneSelect");

    ui.boneEditSelect = document.getElementById("boneEditSelect");
    ui.boneParentSelect = document.getElementById("boneParentSelect");
    ui.boneName = document.getElementById("boneName");

    document.getElementById("addCube").onclick = addCube;

    document.getElementById("addBone").onclick = () => {
        const name = ui.boneName.value || "Bone";
        const bone = addBone(name);
        bone.parent = bones[0];
        bones[0].children.push(bone);
        refreshBoneDropdowns();
    };

    document.getElementById("setParent").onclick = () => {
        const boneID = parseInt(ui.boneEditSelect.value);
        const parentID = parseInt(ui.boneParentSelect.value);

        const bone = bones.find(b => b.id === boneID);
        const parent = bones.find(b => b.id === parentID) || null;

        if (!bone) return;
        if (parent === bone) return;
        if (parent && parent.isDescendantOf(bone)) return;

        bone.setParent(parent);
    };

    ui.boneSelect.onchange = () => {
        if (selectedCube) {
            const boneID = parseInt(ui.boneSelect.value);
            selectedCube.bone = bones.find(b => b.id === boneID) || null;
        }
    };

    ui.boneEditSelect.onchange = () => {
        const boneID = parseInt(ui.boneEditSelect.value);
        const bone = bones.find(b => b.id === boneID);
        if (bone) selectBone(bone);
    };

    for (let key in ui) {
        if (ui[key] instanceof HTMLInputElement) {
            ui[key].addEventListener("input", applyUI);
        }
    }

    canvas.addEventListener("mousedown", e => {
        if (mode === "none") {
            if (!pickBone(e.clientX, e.clientY)) {
                pickCube(e.clientX, e.clientY);
            }
        }

        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    window.addEventListener("mousemove", e => {
        if (!isDragging || !selectedCube) return;

        const dx = (e.clientX - lastX) * 0.01;
        const dy = (e.clientY - lastY) * 0.01;

        if (mode === "move") {
            selectedCube.position.x += dx;
            selectedCube.position.z += dy;
        }

        if (mode === "rotate") {
            selectedCube.rotation.y += dx;
            selectedCube.rotation.x += dy;
        }

        if (mode === "scale") {
            selectedCube.scale.x += dx;
            selectedCube.scale.y += dx;
            selectedCube.scale.z += dx;
        }

        updateCubeUI();

        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener("keydown", e => {
        if (e.key === "g") mode = "move";
        if (e.key === "r") mode = "rotate";
        if (e.key === "s") mode = "scale";
        if (e.key === "Escape") mode = "none";
    });

    refreshBoneDropdowns();
    requestAnimationFrame(loop);
};

function addBone(name) {
    const bone = new Bone(name);
    bones.push(bone);
    return bone;
}

function refreshBoneDropdowns() {
    ui.boneSelect.innerHTML = "";
    ui.boneEditSelect.innerHTML = "";
    ui.boneParentSelect.innerHTML = "";

    for (let bone of bones) {
        const opt1 = document.createElement("option");
        opt1.value = bone.id;
        opt1.textContent = bone.name;
        ui.boneSelect.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = bone.id;
        opt2.textContent = bone.name;
        ui.boneEditSelect.appendChild(opt2);

        const opt3 = document.createElement("option");
        opt3.value = bone.id;
        opt3.textContent = bone.name;
        ui.boneParentSelect.appendChild(opt3);
    }
}

function addCube() {
    const cube = new Cube();
    cube.position.x = Math.random() * 4 - 2;
    cube.position.z = Math.random() * 4 - 2;

    cube.mesh = Renderer.createMesh(cube.vertices, cube.indices);

    cube.bone = bones[0];

    scene.push(cube);
    selectCube(cube);
}

function selectCube(cube) {
    if (selectedCube) selectedCube.selected = false;
    if (selectedBone) selectedBone.selected = false;

    selectedCube = cube;
    selectedCube.selected = true;
    selectedBone = null;

    updateCubeUI();
}

function selectBone(bone) {
    if (selectedCube) selectedCube.selected = false;
    if (selectedBone) selectedBone.selected = false;

    selectedCube = null;
    selectedBone = bone;
    bone.selected = true;

    ui.boneEditSelect.value = bone.id;
    if (bone.parent) {
        ui.boneParentSelect.value = bone.parent.id;
    }
}

function pickBone(mouseX, mouseY) {
    const rect = Renderer.canvas.getBoundingClientRect();

    const x = (mouseX - rect.left) / rect.width * 2 - 1;
    const y = -((mouseY - rect.top) / rect.height * 2 - 1);

    let closest = null;
    let closestDist = 0.05;

    for (let bone of bones) {
        if (!bone.parent) continue;

        const p = bone.worldMatrix;
        const bx = p[12] * 0.1;
        const by = p[13] * 0.1;

        const dx = x - bx;
        const dy = y - by;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < closestDist) {
            closestDist = dist;
            closest = bone;
        }
    }

    if (closest) {
        selectBone(closest);
        return true;
    }

    return false;
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
    if (!selectedCube) return;

    selectedCube.position.x = parseFloat(ui.posX.value);
    selectedCube.position.y = parseFloat(ui.posY.value);
    selectedCube.position.z = parseFloat(ui.posZ.value);

    selectedCube.rotation.x = parseFloat(ui.rotX.value);
    selectedCube.rotation.y = parseFloat(ui.rotY.value);
    selectedCube.rotation.z = parseFloat(ui.rotZ.value);

    selectedCube.scale.x = parseFloat(ui.scaleX.value);
    selectedCube.scale.y = parseFloat(ui.scaleY.value);
    selectedCube.scale.z = parseFloat(ui.scaleZ.value);

    const oldX = selectedCube.lengthX;
    const oldY = selectedCube.lengthY;
    const oldZ = selectedCube.lengthZ;

    selectedCube.lengthX = parseFloat(ui.lenX.value);
    selectedCube.lengthY = parseFloat(ui.lenY.value);
    selectedCube.lengthZ = parseFloat(ui.lenZ.value);

    if (selectedCube.lengthX !== oldX || selectedCube.lengthY !== oldY || selectedCube.lengthZ !== oldZ) {
        selectedCube.generateGeometry();
        selectedCube.mesh = Renderer.createMesh(selectedCube.vertices, selectedCube.indices);
    }

    if (selectedCube.bone) {
        ui.boneSelect.value = selectedCube.bone.id;
    }
}

function updateCubeUI() {
    if (!selectedCube) return;

    ui.posX.value = selectedCube.position.x.toFixed(2);
    ui.posY.value = selectedCube.position.y.toFixed(2);
    ui.posZ.value = selectedCube.position.z.toFixed(2);

    ui.rotX.value = selectedCube.rotation.x.toFixed(2);
    ui.rotY.value = selectedCube.rotation.y.toFixed(2);
    ui.rotZ.value = selectedCube.rotation.z.toFixed(2);

    ui.scaleX.value = selectedCube.scale.x.toFixed(2);
    ui.scaleY.value = selectedCube.scale.y.toFixed(2);
    ui.scaleZ.value = selectedCube.scale.z.toFixed(2);

    ui.lenX.value = selectedCube.lengthX.toFixed(2);
    ui.lenY.value = selectedCube.lengthY.toFixed(2);
    ui.lenZ.value = selectedCube.lengthZ.toFixed(2);

    if (selectedCube.bone) {
        ui.boneSelect.value = selectedCube.bone.id;
    }
}

function loop() {
    const gl = Renderer.gl;

    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    for (let bone of bones) {
        if (!bone.parent) bone.updateMatrix();
    }

    Renderer.drawGrid(grid);

    for (let bone of bones) {
        Renderer.drawBone(bone, bone.selected);
    }

    for (let cube of scene) {
        cube.updateMatrix();
        Renderer.drawCube(cube.mesh, cube.finalMatrix, cube.selected);
    }

    requestAnimationFrame(loop);
}
