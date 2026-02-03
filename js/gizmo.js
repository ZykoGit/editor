// gizmo.js

import { Renderer } from "./renderer.js";

export const Gizmo = {
    activeAxis: null, // "x" | "y" | "z" | null
    isDragging: false,
    startMouse: { x: 0, y: 0 },
    startPos: { x: 0, y: 0, z: 0 },

    draw(targetWorldPos) {
        if (!targetWorldPos) return;

        const size = 1;

        const [x, y, z] = targetWorldPos;

        // X axis (red)
        Renderer.drawGizmoLines([
            x, y, z,
            x + size, y, z
        ], [1, 0, 0]);

        // Y axis (green)
        Renderer.drawGizmoLines([
            x, y, z,
            x, y + size, z
        ], [0, 1, 0]);

        // Z axis (blue)
        Renderer.drawGizmoLines([
            x, y, z,
            x, y, z + size
        ], [0, 0, 1]);
    },

    pickAxis(mouseX, mouseY, targetWorldPos) {
        if (!targetWorldPos) return null;

        const rect = Renderer.canvas.getBoundingClientRect();
        const xNdc = (mouseX - rect.left) / rect.width * 2 - 1;
        const yNdc = -((mouseY - rect.top) / rect.height * 2 - 1);

        const [wx, wy, wz] = targetWorldPos;

        // Very rough: project axis endpoints to screen and check distance
        const proj = Renderer.getProjectionMatrix();
        const view = Renderer.getViewMatrix();

        function projectPoint(px, py, pz) {
            const v = [px, py, pz, 1];
            const mv = multiplyMat4Vec4(view, v);
            const clip = multiplyMat4Vec4(proj, mv);
            const ndcX = clip[0] / clip[3];
            const ndcY = clip[1] / clip[3];
            return [ndcX, ndcY];
        }

        function multiplyMat4Vec4(m, v) {
            const out = [0,0,0,0];
            for (let i = 0; i < 4; i++) {
                out[i] = m[i]*v[0] + m[i+4]*v[1] + m[i+8]*v[2] + m[i+12]*v[3];
            }
            return out;
        }

        const size = 1;

        const axes = [
            { axis: "x", p2: [wx + size, wy, wz] },
            { axis: "y", p2: [wx, wy + size, wz] },
            { axis: "z", p2: [wx, wy, wz + size] }
        ];

        const [sx, sy] = projectPoint(wx, wy, wz);
        let bestAxis = null;
        let bestDist = 0.05;

        for (let a of axes) {
            const [ex, ey] = projectPoint(a.p2[0], a.p2[1], a.p2[2]);

            // closest point on segment in NDC
            const vx = ex - sx;
            const vy = ey - sy;
            const wxm = xNdc - sx;
            const wym = yNdc - sy;
            const len2 = vx*vx + vy*vy;
            let t = len2 > 0 ? (wxm*vx + wym*vy) / len2 : 0;
            t = Math.max(0, Math.min(1, t));
            const cx = sx + vx * t;
            const cy = sy + vy * t;

            const dx = xNdc - cx;
            const dy = yNdc - cy;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < bestDist) {
                bestDist = dist;
                bestAxis = a.axis;
            }
        }

        return bestAxis;
    }
};
