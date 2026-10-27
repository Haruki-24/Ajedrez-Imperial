/**
 * storage.js — Persistencia de sesión (localStorage)
 * Guarda un snapshot serializable del estado de la partida para que
 * recargar el navegador no reinicie la sesión.
 *
 * No guarda funciones ni referencias DOM. Solo datos planos.
 */

const KEY = 'ajedrez-imperial:session:v1';
const VERSION = 1;

let saveTimer = null;

/**
 * Guarda el snapshot con debounce (~200ms) para no escribir en cada click.
 * @param {Object} state — snapshot plano (ver snapshot() en main.js)
 */
export function saveState(state) {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        try {
            localStorage.setItem(KEY, JSON.stringify({ version: VERSION, ...state }));
        } catch (e) {
            console.warn('[storage] no se pudo guardar la sesión', e);
        }
    }, 200);
}

/**
 * Carga el snapshot. Devuelve null si no hay, o si la versión no coincide.
 */
export function loadState() {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const data = JSON.parse(raw);
        if (!data || data.version !== VERSION) return null;
        return data;
    } catch (e) {
        console.warn('[storage] no se pudo leer la sesión', e);
        return null;
    }
}

/**
 * Borra la sesión guardada. Usar al iniciar partida nueva.
 */
export function clearState() {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    try { localStorage.removeItem(KEY); } catch {}
}