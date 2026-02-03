// main.js

import { Renderer } from "./renderer.js";
import { Cube } from "./cube.js";
import { Bone } from "./bone.js";
import { Gizmo } from "./gizmo.js";

let scene = [];
let bones = [];
let selectedCube = null;
let selectedBone = null;

let grid;

let isDragging = false;
let lastX = 0;
let lastY = 0;

let mode = "none"; // "none" | "move" | "rotate" | "scale"

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

    ui.boneSelect = document.getElementById("boneSelect");

    ui.bonePosX = document.getElementById("bonePosX");
    ui.bonePosY = document.getElementById("bonePosY");
    ui.bonePosZ = document.getElementById("bonePosZ");

    ui.boneRotX = document.getElementById("boneRotX");
    ui.boneRotY = document.getElementById("boneRotY");
    ui.boneRotZ = document.getElementById("boneRotZ");

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

    ui.posX.addEventListener("input", applyCubeUI);
    ui.posY.addEventListener("input", applyCubeUI);
    ui.posZ.addEventListener("input", applyCubeUI);

    ui.rotX.addEventListener("input", applyCubeUI);
    ui.rotY.addEventListener("input", applyCubeUI);
    ui.rotZ.addEventListener("input", applyCubeUI);

    ui.scaleX.addEventListener("input", applyCubeUI);
    ui.scaleY.addEventListener("input", applyCubeUI);
    ui.scaleZ.addEventListener("input", applyCubeUI);

    ui.lenX.addEventListener("input", applyCubeUI);
    ui.lenY.addEventListener("input", applyCubeUI);
    ui.lenZ.addEventListener("input", applyCubeUI);

    ui.bonePosX.addEventListener("input", applyBoneUI);
    ui.bonePosY.addEventListener("input", applyBoneUI);
    ui.bonePosZ.addEventListener("input", applyBoneUI);

    ui.boneRotX.addEventListener("input", applyBoneUI);
    ui.boneRotY.addEventListener("input", applyBoneUI);
    ui.boneRotZ.addEventListener("input", applyBoneUI);

    canvas.addEventListener("mousedown", e => {
        const rect = Renderer.canvas.getBoundingClientRect();
        const mx = e.clientX;
        const my = e.clientY;

        const targetPos = getSelectedWorldPos();
        const axis = Gizmo.pickAxis(mx, my, targetPos);

        if (axis) {
            Gizmo.activeAxis = axis;
            Gizmo.isDragging = true;
            Gizmo.startMouse.x = mx;
            Gizmo.startMouse.y = my;

            if (selectedCube) {
                Gizmo.startPos = { ...selectedCube.position };
            } else if (selectedBone) {
                Gizmo.startPos = { ...selectedBone.position };
            }

            return;
        }

        if (mode === "none") {
            if (!pickBone(mx, my)) {
                pickCube(mx, my);
            }
        }

        isDragging = true;
        lastX = mx;
        lastY = my;
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
        Gizmo.isDragging = false;
        Gizmo.activeAxis = null;
    });

    window.addEventListener("mousemove", e => {
        const mx = e.clientX;
        const my = e.clientY;

        if (Gizmo.isDragging && Gizmo.activeAxis) {
            const dx = (mx - Gizmo.startMouse.x) * 0.01;
            const dy = (my - Gizmo.startMouse.y) * 0.01;

            let delta = dx; // simple: use x movement only
            if (selectedCube) {
                if (Gizmo.activeAxis === "x") selectedCube.position.x = Gizmo.startPos.x + delta;
                if (Gizmo.activeAxis === "y") selectedCube.position.y = Gizmo.startPos.y - dy;
                if (Gizmo.activeAxis === "z") selectedCube.position.z = Gizmo.startPos.z + delta;
                updateCubeUI();
            } else if (selectedBone) {
                if (Gizmo.activeAxis === "x") selectedBone.position.x = Gizmo.startPos.x + delta;
                if (Gizmo.activeAxis === "y") selectedBone.position.y = Gizmo.startPos.y - dy;
                if (Gizmo.activeAxis === "z") selectedBone.position.z = Gizmo.startPos.z + delta;
                updateBoneUI();
            }
            return;
        }

        if (!isDragging || !selectedCube) return;

        const dx = (mx - lastX) * 0.01;
        const dy = (my - lastY) * 0.01;

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

        lastX = mx;
        lastY = my;
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
    if (bone.parent) ui.boneParentSelect.value = bone.parent.id;

    updateBoneUI();
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

function applyCubeUI() {
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

function applyBoneUI() {
    if (!selectedBone) return;

    selectedBone.position.x = parseFloat(ui.bonePosX.value);
    selectedBone.position.y = parseFloat(ui.bonePosY.value);
    selectedBone.position.z = parseFloat(ui.bonePosZ.value);

    selectedBone.rotation.x = parseFloat(ui.boneRotX.value);
    selectedBone.rotation.y = parseFloat(ui.boneRotY.value);
    selectedBone.rotation.z = parseFloat(ui.boneRotZ.value);

    selectedBone.updateMatrix();
}

function updateBoneUI() {
    if (!selectedBone) return;

    ui.bonePosX.value = selectedBone.position.x.toFixed(2);
    ui.bonePosY.value = selectedBone.position.y.toFixed(2);
    ui.bonePosZ.value = selectedBone.position.z.toFixed(2);

    ui.boneRotX.value = selectedBone.rotation.x.toFixed(2);
    ui.boneRotY.value = selectedBone.rotation.y.toFixed(2);
    ui.boneRotZ.value = selectedBone.rotation.z.toFixed(2);
}

function getSelectedWorldPos() {
    if (selectedCube) {
        selectedCube.updateMatrix();
        const m = selectedCube.finalMatrix;
        return [m[12], m[13], m[14]];
    }
    if (selectedBone) {
        selectedBone.updateMatrix();
        const m = selectedBone.worldMatrix;
        return [m[12], m[13], m[14]];
    }
    return null;
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

    const targetPos = getSelectedWorldPos();
    Gizmo.draw(targetPos);

    requestAnimationFrame(loop);
}
