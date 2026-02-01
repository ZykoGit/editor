// main.js

import { Renderer } from "./renderer.js";
import { Cube } from "./cube.js";

let cube;

window.onload = () => {
    const canvas = document.getElementById("glcanvas");
    Renderer.init(canvas);

    cube = new Cube();

    requestAnimationFrame(loop);
};

function loop() {
    const gl = Renderer.gl;

    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // TODO: draw cube

    requestAnimationFrame(loop);
}

