# ♔ Ajedrez Imperial (Versión Alfa - Demo)

![Estado del Proyecto](https://img.shields.io/badge/Estado-Alpha_v0.1-orange)
![Licencia](https://img.shields.io/badge/Licencia-Propiedad_Intelectual_Reservada-blue)

**Ajedrez Imperial** es una variante táctica de ajedrez sobre un tablero extendido de 10x10 que introduce mecánicas de evolución de piezas (promoción progresiva por capturas) y una jerarquía de unidades ampliada. 

Esta versión demo web interactiva incluye un entorno de prueba de movimientos, un modo de juego local y un **motor de Inteligencia Artificial (CPU)** desarrollado en JavaScript utilizando el algoritmo **Minimax**.

---

## 🎮 Juega la Demo en Línea

Puedes probar la versión alfa directamente en tu navegador (compatible con PC y dispositivos móviles):
👉 **[Jugar Ajedrez Imperial Demo](https://haruki-24.github.io/Ajedrez-Imperial/)**

---

## 📖 Reglamento e Instrucciones

Para consultar las reglas oficiales, la jerarquía militar completa de las piezas y la tabla de evoluciones por experiencia, accede a la documentación oficial:

* 📄 **[Documentación y Reglamento Oficial](assets/docs/)** *(o indica la ruta a tu archivo de reglas)*
* 🧪 **Tablero de Práctica:** Incluido en la demo web para explorar el alcance y movimiento de cada pieza antes de jugar.

---

## 🛠️ Arquitectura Técnica y Motor CPU

El proyecto está construido desde cero con tecnologías web estándar:

* **Frontend:** HTML5, CSS3 (Tailwind CSS) y JavaScript Vanilla.
* **Motor CPU:** Implementación propia basada en el algoritmo **Minimax** con funciones de evaluación estática del tablero, análisis de movilidad y ponderación de capturas clave en JS.
* **Modos de juego:**
  * Modo Práctica / Guía Interactiva (`test.js`)
  * Modo Humano vs. Humano
  * Modo Humano vs. CPU Minimax (`cpu.js`)

---

## 🧪 Fase de Pruebas (Alpha Testing) & Recolección de Feedback

Actualmente, **Ajedrez Imperial** se encuentra en una fase Alfa cerrada de recolección de métricas y sugerencias. Agradecemos especialmente a los colaboradores del grupo de prueba inicial por su retroalimentación en tres pilares clave:

1. **Balance Táctico y Estrategia:** Evaluación por parte de jugadores experimentados de ajedrez clásico.
2. **Usabilidad y Curva de Aprendizaje:** Evaluación del flujo visual y comprensión de reglas por parte de jugadores casuales.
3. **Rendimiento y Lógica de Código:** Auditoría técnica del motor Minimax y eficiencia de algoritmos por desarrolladores de software.

Si estás probando la demo y deseas compartir comentarios, sugerencias de balance o reportar un error de interfaz, puedes abrir un *Issue* en este repositorio.

---

## 📜 Licencia y Propiedad Intelectual

**Copyright © 2026 Gonzalo Costela (Haruki-24). Todos los derechos reservados.**

* El diseño del juego, las reglas particulares, la jerarquía de piezas, el nombre "Ajedrez Imperial", la simbología y la arquitectura de software contenida en este repositorio son obra intelectual de su autor.
* Este repositorio y su enlace web asociado se ofrecen exclusivamente con fines de **demo, pruebas de concepto y evaluación alfa pública/privada**.
* **Queda estrictamente prohibida** la reproducción total o parcial, redistribución, modificación con fines comerciales o venta no autorizada de este material sin el consentimiento explícito por escrito del autor.

---

*Proyecto en desarrollo activo.*
