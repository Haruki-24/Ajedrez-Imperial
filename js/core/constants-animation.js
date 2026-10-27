/**
 * constants-animation.js — GitHub (Open Core)
 * Solo lo necesario para perspectivas y transiciones básicas.
 * Las animaciones de sprites (SpriteAnimator) son exclusivas de itch.io.
 */

// ─── DURACIONES (ms) ───
export const DURATIONS = {
    fast:     150,
    normal:   300,
    slow:     500,
    message:  3000,
    fadeIn:   200,
    fadeOut:  150,
    board:    400,
    piece:    250
};

// ─── EASINGS ───
export const EASINGS = {
    default:    'ease',
    smooth:     'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce:     'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    snap:       'cubic-bezier(0.86, 0, 0.07, 1)',
    gentle:     'cubic-bezier(0.25, 0.1, 0.25, 1)'
};

// ─── TRANSFORMACIONES 3D ───
export const PERSPECTIVE = {
    depth2d:    'none',
    depth25d:   'rotateX(15deg) rotateZ(60deg)',   // ← valores oficiales itch
    depth3d:    'perspective(800px) rotateX(25deg)',
    origin:     'center center'
};