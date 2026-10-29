<div align="center">
  <img src="assets/img/logo-512.png" alt="Logo Ajedrez Imperial" width="100%" style="border-radius: 15px;">
  
  ## 10x10 Tactical Chess — Open Core Engine

</div>

![Estado del Proyecto](https://img.shields.io/badge/Estado-Alpha_v0.1-orange)
[![Jugar Versión Final en itch.io](https://img.shields.io/badge/🎮_Jugar_Versión_Final-itch.io-FA5C5C?&logo=itch.io&logoColor=white)](https://gonza-2907.itch.io/ajedrez-imperial)
[![Probar Demo en GitHub Pages](https://img.shields.io/badge/Probar_Demo_Alfa-GitHub_Pages-181717?&logo=github&logoColor=white)](https://haruki-24.github.io/Ajedrez-Imperial/)
[![Licencia](https://img.shields.io/badge/Licencia-Open_Core-blue)](LICENSE)

<img align="right" src="assets/img/portada-ajedrez-imperial.png" alt="Tablero 10x10 Ajedrez Imperial" width="45%" style="border-radius: 8px;">

**Ajedrez Imperial** es una variante táctica y estratégica de ajedrez sobre un tablero extendido de 10x10. Fusiona la elegancia del ajedrez convencional con mecánicas avanzadas inspiradas en el shogi, que presentan un nuevo paradigma en el arte de la guerra sobre el tablero.

No es un simple juego de capturas; es un sistema de evolución constante, donde cada pieza tiene el potencial de transformarse en una versión más poderosa de sí misma. No se gana con ataques relámpago, sino con una gestión sofisticada de recursos, una planificación meticulosa de la evolución y una arquitectura defensiva que convierta tu retaguardia en una fortaleza impenetrable.

Esta versión demo web interactiva incluye un entorno de prueba de movimientos, un *Editor de Juego* para la creación de escenarios, modo multijugador local y un motor de Inteligencia Artificial (CPU) optimizado en JavaScript.

> (La versión Open Core incluye un editor reducido; la versión premium de **[itch.io](https://gonza-2907.itch.io/ajedrez-imperial)** ofrecera el editor completo con generación aleatoria).
<br clear="right" />

## 🎯 El Modelo "Open Core"

Este repositorio contiene el **código fuente del motor de juego (Open Core)**, el sistema de reglas base y la documentación técnica. 

👉 **La experiencia completa** (gráficos 2.5D, modo editor, manual avanzado y 4 niveles de dificultad) está publicada de forma independiente en **[itch.io](https://gonza-2907.itch.io/ajedrez-imperial)**.

*   **GitHub:** Es la vitrina técnica y el punto de encuentro para desarrolladores y pruebas de concepto.
*   **itch.io:** Es el producto final pulido. Las donaciones y compras del Modo Editor/Manual Estratégico van destinadas a financiar la publicación en Google Play.

## 🎨 Galería de Arte y Diseño

*Un vistazo al diseño visual y la identidad de las piezas.*

### Personajes
<div align="center">
  <img src="assets/chibi/b-caballero_chibi-2D.png" alt="Caballero" width="200" style="margin: 10px;">
  <img src="assets/chibi/w-paladin_chibi-2D.png" alt="Paladin" width="200" style="margin: 10px;">
  <img src="assets/chibi/w-emperador_chibi-2D.png" alt="Emperador" width="200" style="margin: 10px;">
  <img src="assets/chibi/b-emperatriz_chibi-2D.png" alt="Reina" width="200" style="margin: 10px;">
</div>

### Escenarios
<div align="center">
  <img src="assets/background/ice.png" alt="Ice" width="300" style="margin: 50px;">
  <img src="assets/background/volcano-1.png" alt="Volcano" width="300" style="margin: 50px;">
  <img src="assets/background/city.png" alt="City" width="300" style="margin: 50px;">
</div>

## ✨ Características Principales

* 🌐 **Soporte Bilingüe (ES / EN)**: Interfaz y documentación integradas en español e inglés (En desarrollo)
* ⚡ **Motor CPU Avanzado**: Optimización con Poda Alpha-Beta en el algoritmo Minimax para búsquedas más profundas, respuestas más rápidas y jugadas dinámicas.
* 🎨 **Editor de Tablero (Demo):** Herramienta ligera incluida en la demo de GitHub para colocar piezas y probar posiciones manualmente. La versión completa con generación aleatoria, exportación JSON y juego contra la CPU está disponible en la versión Premium de [itch.io.](https://gonza-2907.itch.io/ajedrez-imperial)
* 🏰 **Mecánicas Evolutivas:** Sistema de promoción por Caza (Shogi) y por Territorio.
* 🛡️ **Enroque Imperial:** Creación de castillos defensivos (Anaguma, Yagura, Mino).

## 📖 Reglamento y Documentación

Para consultar la jerarquía militar completa, el movimiento de las unidades y las condiciones de victoria, accede a los documentos oficiales incluidos en este repositorio:

*   📜 **[Reglamento Oficial (Español)](./assets/docs/reglamento-ajedrez-imperial-es.pdf)**
*   📜 **[Official Rulebook (English)](./assets/docs/official-rulebook-imperial-chess-en.pdf)**

> 📘 *El **Manual de Estrategias Avanzadas** (aperturas, castillos y tácticas avanzadas) se ofrece como un extra premium en la página de itch.io para apoyar el desarrollo.*


## 🎮 Juega la Demo en Línea

Puedes probar la versión alfa directamente en tu navegador (compatible con PC y dispositivos móviles):
👉 **[Jugar Ajedrez Imperial Demo](https://haruki-24.github.io/Ajedrez-Imperial/)**

### Modos de Juego:

* Editor de Juego / Modo Práctica (Sandbox para Creadores)
* PVP local - Modo Humano vs. Humano (Multijugador Local)
* PVC - Modo Humano vs. CPU (Minimax con Poda Alpha-Beta)
* Editor de Tablero (Open Core): Coloca piezas, prueba movimientos manuales y guarda posiciones. Acceder al [**Editor**](https://haruki-24.github.io/Ajedrez-Imperial/editor.html)


## 🏗️ Arquitectura Técnica
El proyecto está desarrollado desde cero utilizando estándares web modernos (Sin frameworks pesados), priorizando la escalabilidad y el rendimiento del motor.

### ⚡ Motor de IA (cpu.js) - El Núcleo del Proyecto

El sistema de Inteligencia Artificial es el componente más avanzado del juego, implementando técnicas de optimización de nivel profesional:

* **Minimax con Poda Alpha-Beta**: Algoritmo de búsqueda en árbol que descarta ramas ineficientes, permitiendo explorar jugadas más profundas en milisegundos.
* **Búsqueda de Quietud (Quiescence Search)**: Evita el "efecto horizonte" evaluando secuencias de capturas antes de tomar una decisión, evitando que la IA regale piezas.
* **Zobrist Hashing & Tabla de Transposiciones**: Sistema de memoria que evita recalcular posiciones ya evaluadas, optimizando drásticamente el rendimiento.
*   *Nota: La versión completa de itch.io expande este motor con un **Libro de Aperturas Estratégico** y **Personalidades de IA** adaptativas (desde nivel principiante hasta maestro) que ejecutan castillos defensivos (Anaguma, Yagura) y tácticas avanzadas.*

### 🧩 Arquitectura Modular (Core / UI)

El código implementa una separación estricta de responsabilidades (Patrón MVC simplificado), garantizando que la lógica del juego sea independiente de la interfaz gráfica:
* `core/` **(Lógica Pura)**: Motor de reglas desacoplado del DOM (game.js, cpu.js, constants.js). Las funciones son puras y deterministas, reutilizables en el navegador, en la CPU y en los editores.
* `ui/` **(Renderizado)**: Capa de presentación encargada de manipular el DOM, capturar eventos, gestionar temas visuales y renderizar el tablero en 2D/2.5D.
* `editor/` **(Apps Independientes)**: Módulos de edición empaquetados de forma autónoma (Free y Premium) que consumen el mismo motor core/ pero con su propia interfaz.

### 🚀 Visión de la Versión Premium (itch.io)

La versión completa alojada en itch.io expande las capacidades del motor con:

* **Libro de Aperturas Estratégico**: La IA no solo calcula, sino que ejecuta formaciones tácticas (Sistema Londres, Castillos Anaguma, Carreras de Caballos) adaptándose al nivel del jugador, volviendo el juego sumamente entretenido y desafiante.

*(Si eres desarrollador, puedes explorar el código del motor en la carpeta js/core/ para ver la implementación de los algoritmos).*

## 📂 Estructura del Proyecto

```txt
├── index.html               # Juego principal (Demo)
├── js/
│   ├── core/                # Motor lógico puro (Reglas, CPU, Constantes)
│   └── ui/                  # Renderizado e interfaz (Main, Render, Translate)
├── editor/
│   ├── free/                # Editor Free (Open Core)
│   └── premium/             # Editor Premium (Distribuido vía itch.io)
└── assets/                  # Recursos gráficos (Piezas, Tableros, Fuentes)
```

## 🗺️ Próximas Etapas de Desarrollo (Roadmap)

Tras la reciente refactorización arquitectónica y la corrección de los bugs del motor, el proyecto entra en su fase más ambiciosa:

*   **🏰 Modo Historia / Campaña:** Aprovechando los recursos visuales 2.5D (City, Volcano, Ice, etc.), implementaremos un modo campaña donde cada nivel represente una batalla táctica con condiciones de victoria únicas y escenarios cambiantes.
*   **📖 Expansión del Lore:** Integración de una narrativa ligera que contextualice el avance de las piezas (la evolución de Escudero a Alfil, etc.).
*   **🌐 Multiplayer Online:** Exploración de WebSockets para conectar jugadores a través de la red.

## 🚀 Apoya el Proyecto (Meta: Google Play)

Actualmente estoy recaudando **$25 USD** para habilitar la cuenta de desarrollador en Google Play y lanzar la versión móvil oficial de Ajedrez Imperial. 

Si te gusta el juego o te interesa el motor, puedes apoyar de las siguientes formas:
1.  **[Jugando y donando en itch.io](https://gonza-2907.itch.io/ajedrez-imperial)**.
2.  **Compartiendo el proyecto** con entusiastas de los juegos de estrategia.
3.  **Contribuyendo al código** o reportando issues en este repositorio.

## 🧪 Fase de Pruebas (Alpha Testing)

La demo en GitHub Pages sigue activa para recolección de métricas y sugerencias sobre:
*   **Balance Táctico:** Evaluación de aperturas y control fronterizo.
*   **Rendimiento:** Auditoría técnica de la Poda Alpha-Beta.
*   **UI/UX:** Fluidez en móviles.

Puedes abrir un **Issue** si encuentras algún bug en la versión demo.

## 📜 Licencia y Propiedad Intelectual

**Copyright © 2026 Gonzalo Costela (Haruki-24). Todos los derechos reservados.**

*   **Código Fuente (Open Core):** El código JavaScript del motor lógico y la representación del tablero se comparten con fines de portafolio, evaluación técnica y contribución comunitaria.
*   **Propiedad Intelectual del Juego:** El diseño del juego, la jerarquía de piezas, el nombre "Ajedrez Imperial", los recursos gráficos (arte de personajes, tableros) y el reglamento oficial son obra intelectual de su autor. 
*   **Queda estrictamente prohibida** la venta, distribución comercial o modificación del arte y las reglas sin el consentimiento explícito del autor.
* **Declaración de Asistencia de IA**: Para el desarrollo de este proyecto se utilizaron herramientas de Inteligencia Artificial Generativa como apoyo en la corrección, optimización y refactorización de código y documentación. Sin embargo, la idea original, las mecánicas de juego, la arquitectura del software y la supervisión final del producto son responsabilidad y autoría exclusiva del autor.

---

*Proyecto en desarrollo activo.*
