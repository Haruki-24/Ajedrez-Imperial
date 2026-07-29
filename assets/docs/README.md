# ♔ Ajedrez Imperial (Versión Alfa - Demo)

![Estado del Proyecto](https://img.shields.io/badge/Estado-Alpha_v0.1-orange)
![Licencia](https://img.shields.io/badge/Licencia-Propiedad_Intelectual_Reservada-blue)

**Ajedrez Imperial** es una variante táctica y estratégica de ajedrez sobre un tablero extendido de 10x10. Fusiona la elegancia del ajedrez convencional con mecánicas avanzadas inspiradas en el shogi, como la evolución progresiva de piezas por capturas o control territorial y una arquitectura defensiva basada en la construcción de fortalezas y castillos.

Esta versión demo web interactiva incluye un entorno de prueba de movimientos, un *Editor de Juego* para la creación de escenarios, modo multijugador local y un motor de Inteligencia Artificial (CPU) optimizado en JavaScript.

## ✨ Novedades Recientes

🌐 **Soporte Bilingüe (ES / EN)**: Interfaz y documentación integradas en español e inglés (En desarrollo)

🎨 **Editor de Tablero**: Herramienta para creadores y pruebas tácticas de posiciones personalizadas.

⚡ **Motor CPU Avanzado**: Optimización con Poda Alpha-Beta en el algoritmo Minimax para búsquedas más profundas, respuestas más rápidas y jugadas dinámicas.

📄 **Reglamento Oficializado**: Documentos técnicos finales cargados en las rutas oficiales del proyecto.

🛠️ **Corrección de Errores (Bug Fixes)**: Ajustes en la interfaz móvil/escritorio y mayor estabilidad en el cálculo de movimientos de piezas evolucionadas, bloqueo del selector de dificultad luego de iniciar la partida.

## 🎮 Juega la Demo en Línea

Puedes probar la versión alfa directamente en tu navegador (compatible con PC y dispositivos móviles):
👉 **[Jugar Ajedrez Imperial Demo](https://haruki-24.github.io/Ajedrez-Imperial/)**

## 📖 Reglamento e Instrucciones

Para consultar la jerarquía militar completa, el movimiento de las unidades, las condiciones de victoria y la tabla de evoluciones por experiencia o territorio, accede a la documentación oficial:

* **[🇪🇸 Reglamento Oficial (Español)](https://github.com/Haruki-24/Ajedrez-Imperial/blob/main/assets/docs/reglamento-ajedrez-imperial-es.pdf)**

* **[🇬🇧 Official Rulebook (English)](https://github.com/Haruki-24/Ajedrez-Imperial/blob/main/assets/docs/official-rulebook-imperial-chess-en.pdf)**

* **Manual de tacticas avanzadas (En desarrollo)**

* 🧪 **Tablero de Práctica y Editor**: Incluidos en la demo web para explorar el alcance de cada pieza o diseñar escenarios personalizados.

## 🛠️ Arquitectura Técnica y Motor CPU

El proyecto está desarrollado desde cero utilizando estándares web modernos:

* **Frontend**: HTML5, CSS3 (Tailwind CSS) y JavaScript Vanilla.

* **Motor CPU** (`cpu.js`): Implementación del algoritmo Minimax con Poda Alpha-Beta (Alpha-Beta Pruning). Esta mejora permite descartar ramas ineficientes de exploración, mantener la profundidad de búsqueda optimizando drásticamente los tiempos de respuesta y ofrecer un nivel de competencia dinámico y variado.

### Modos de Juego:

* Editor de Juego / Modo Práctica (Sandbox para Creadores)

* PVP local - Modo Humano vs. Humano (Multijugador Local)

* PVC - Modo Humano vs. CPU (Minimax con Poda Alpha-Beta)

## 🧪 Fase de Pruebas (Alpha Testing) & Recolección de Feedback

Actualmente, **Ajedrez Imperial** se encuentra en una fase Alfa activa de recolección de métricas y sugerencias. Agradecemos especialmente a los colaboradores y a la comunidad de prueba por su retroalimentación en tres pilares clave:

* **Balance Táctico y Estrategia**: Evaluación de aperturas, control fronterizo y efectividad de castillos.

* **Usabilidad y Curva de Aprendizaje**: Evaluación de la interfaz, cambio de idioma y fluidez táctil en dispositivos móviles.

* **Rendimiento y Lógica de Código**: Auditoría técnica de la Poda Alpha-Beta y eficiencia computacional.

Si deseas compartir comentarios, sugerencias de balance o reportar un error de interfaz, puedes abrir un Issue en este repositorio o participar en la comunidad de *[Itch.io](https://gonza-2907.itch.io/ajedrez-imperial).*

---

## 📜 Licencia y Propiedad Intelectual

**Copyright © 2026 Gonzalo Costela (Haruki-24). Todos los derechos reservados.**

* El diseño del juego, las reglas particulares, la jerarquía de piezas, el nombre "Ajedrez Imperial", la simbología y la arquitectura de software contenida en este repositorio son obra intelectual de su autor.

* Este repositorio y su enlace web asociado se ofrecen exclusivamente con fines de demo, pruebas de concepto y evaluación alfa pública/privada.

* **Queda estrictamente prohibida** la reproducción total o parcial, redistribución, modificación con fines comerciales o venta no autorizada de este material sin el consentimiento explícito por escrito del autor.

* **Declaración de Asistencia de IA**: Para el desarrollo de este proyecto se utilizaron herramientas de Inteligencia Artificial Generativa como apoyo en la corrección, optimización y refactorización de código y documentación. Sin embargo, la idea original, las mecánicas de juego, la arquitectura del software y la supervisión final del producto son responsabilidad y autoría exclusiva del autor.

---

*Proyecto en desarrollo activo.*