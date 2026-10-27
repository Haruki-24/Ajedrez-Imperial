/**
 * constants-scenes.js — GitHub (Open Core)
 * Versión reducida para la demo de portafolio.
 *
 * Diferencias con la versión completa (itch.io):
 *  - backgroundImage: solo 2 escenarios (city, volcano1). Son elegidos
 *    al azar al iniciar sesión nueva; el usuario no los selecciona.
 *  - SCENARIO_LABELS: eliminado (no hay UI de escenario en la demo).
 *  - BOARD_TILES: eliminado (render.js usa PIECE_THEMES.chibi.tiles).
 *
 * Los escenarios restantes (dessert, ice, port, valley, volcano2) y el
 * selector de escenario viven SOLO en la versión completa de itch.io.
 */

export const PIECE_THEMES = {
    // --- Tema Clásico ---
    classic: {
        label: 'Clásico',
        perspective: '2d',
        boardType: 'color',
        backgroundImage: null,
        transformOrigin: 'center center',
        scales: { default: 0.8 },
        white: {
            peon:         'assets/icons/b-peon-b.png',
            sargento:     'assets/icons/b-sargento.png',
            vigia:        'assets/icons/b-vigia.png',
            torre:        'assets/icons/b-torre.png',
            caballo:      'assets/icons/b-caballo.png',
            caballero:    'assets/icons/b-caballero.png',
            escudero:     'assets/icons/b-escudero.png',
            alfil:        'assets/icons/b-alfil.png',
            paladin:      'assets/icons/b-paladin.png',
            general_real: 'assets/icons/b-general-real.png',
            reina:        'assets/icons/b-reina.png',
            emperatriz:   'assets/icons/b-emperatriz.png',
            emperador:    'assets/icons/b-emperador.png'
        },
        black: {
            peon:         'assets/icons/n-peon.png',
            sargento:     'assets/icons/n-sargento.png',
            vigia:        'assets/icons/n-vigia.png',
            torre:        'assets/icons/n-torre.png',
            caballo:      'assets/icons/n-caballo.png',
            caballero:    'assets/icons/n-caballero.png',
            escudero:     'assets/icons/n-escudero.png',
            alfil:        'assets/icons/n-alfil.png',
            paladin:      'assets/icons/n-paladin.png',
            general_real: 'assets/icons/n-general-real.png',
            reina:        'assets/icons/n-reina.png',
            emperatriz:   'assets/icons/n-emperatriz.png',
            emperador:    'assets/icons/n-emperador.png'
        }
    },

    // --- Tema Chibi / Final Fantasy ---
    chibi: {
        label: 'Chibi FF',
        perspective: '2.5d',
        boardType: 'texture',
        // GitHub: 2 escenarios aleatorios. itch.io tiene 8.
        backgroundImage: {
            city:     'assets/background/city.png',
            volcano1: 'assets/background/volcano-1.png'
        },
        transformOrigin: 'bottom center',
        scales: {
            default: 1,
            vigia: 1.5,
            torre: 1.6,
            caballo: 1.35,
            caballero: 1.35,
            emperador: 1.1,
            emperatriz: 1.1
        },
        tiles: {
            light: ['assets/board-themes/stone-light-2.png'],
            dark:  ['assets/board-themes/stone-dark-2.png'],
            fallbackLight: '#c4b59d',
            fallbackDark:  '#4a4a4a'
        },
        highlightColors: {
            lightHighlight: '#f6f669',
            darkHighlight:  '#f6f669',
            lastMoveLight:  '#cdd26a',
            lastMoveDark:   '#aaa23b',
            check:          '#ff0000'
        },
        white: {
            peon:         'assets/chibi/w-peon_chibi-2D.png',
            sargento:     'assets/chibi/w-sargento_chibi-2D.png',
            vigia:        'assets/chibi/w-vigia_chibi-2D.png',
            torre:        'assets/chibi/w-torre_chibi-2D.png',
            caballo:      'assets/chibi/w-caballo_chibi-2D.png',
            caballero:    'assets/chibi/w-caballero_chibi-2D.png',
            escudero:     'assets/chibi/w-escudero_chibi-2D.png',
            alfil:        'assets/chibi/w-alfil_chibi-2D.png',
            paladin:      'assets/chibi/w-paladin_chibi-2D.png',
            general_real: 'assets/chibi/w-general_chibi-2D.png',
            reina:        'assets/chibi/w-reina_chibi-2D.png',
            emperatriz:   'assets/chibi/w-emperatriz_chibi-2D.png',
            emperador:    'assets/chibi/w-emperador_chibi-2D.png'
        },
        black: {
            peon:         'assets/chibi/b-peon_chibi-2D.png',
            sargento:     'assets/chibi/b-sargento_chibi-2D.png',
            vigia:        'assets/chibi/b-vigia_chibi-2D.png',
            torre:        'assets/chibi/b-torre_chibi-2D.png',
            caballo:      'assets/chibi/b-caballo_chibi-2D.png',
            caballero:    'assets/chibi/b-caballero_chibi-2D.png',
            escudero:     'assets/chibi/b-escudero_chibi-2D.png',
            alfil:        'assets/chibi/b-alfil_chibi-2D.png',
            paladin:      'assets/chibi/b-paladin_chibi-2D.png',
            general_real: 'assets/chibi/b-general_chibi-2D.png',
            reina:        'assets/chibi/b-reina_chibi-2D.png',
            emperatriz:   'assets/chibi/b-emperatriz_chibi-2D.png',
            emperador:    'assets/chibi/b-emperador_chibi-2D.png'
        }
    }
};