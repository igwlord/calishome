# 💧 Propuestas de Rediseño: Tracker de Hidratación (WaterTracker)

El actual modelo de "vasos individuales" es funcional, pero podemos llevarlo a un nivel mucho más estético, interactivo y alineado con el diseño premium y moderno (Calm Futurism / Fitness) del resto de **CalisHome**.

Aquí tienes 3 propuestas visuales de Alta Fidelidad (UX/UI) para reemplazar el componente actual:

---

### Opción 1: El Anillo de Completitud Líquida (Liquid Ring Progress) 💫

**Concepto:** En lugar de mostrar múltiples vasitos pequeños, pasamos a un diseño centrado y poderoso, similar al temporizador de descanso, pero enfocado en tu meta diaria.

- **Visual:** Un círculo minimalista brillante (como los anillos de actividad de Apple Watch). En el centro, un número grande y legible (ej: **"4 / 10"**) acompañado de la palabra "Vasos".
- **Interactividad:** Al pulsar el botón gigante de "+", el anillo no solo avanza su porcentaje, sino que el trazo del círculo brilla con un tono _Cyan (Azul Neón)_ y emite una leve luz (drop-shadow).
- **Ventaja:** Ahorra muchísimo espacio en pantalla y luce extremadamente moderno y tecnológico. Encaja perfecto con el temporizador circular de la rutina.

---

### Opción 2: La Botella Dinámica (Dynamic Smart Bottle) 🍼

**Concepto:** Una representación visual y literal de un termo o botella de agua deportiva que se va llenando en la pantalla.

- **Visual:** Una silueta vertical estilizada de una botella en el centro de una tarjeta (Card) redondeada.
- **Interactividad:** Cada vez que registras un vaso, una "marea" azul sube dentro de la botella mediante una animación CSS fluida (incluso con sutiles burbujas animadas subiendo).
- **Ventaja:** Es altamente inmersivo y gratificante. Satisface el deseo psicológico humano de "llenar contenedores", haciendo que tomar agua se sienta como un juego (Gamificación pura).

---

### Opción 3: La Barra de Trazos Minimalista (Minimalist Tick Bar) ➖

**Concepto:** Para un enfoque súper profesional, discreto y que no robe protagonismo al resto de tus analíticas (Racha, Calorías).

- **Visual:** Una barra horizontal elegante y delgada dividida exactamente en 10 segmentos o "trazos" sutiles.
- **Interactividad:** Al tocar sobre la tarjeta, el siguiente bloque vacío se llena con un gradiente azul eléctrico que fluye de izquierda a derecha de forma continua.
- **Ventaja:** Es el diseño más limpio y adulto. Ocupa muy poco espacio vertical, permitiendo que la pestaña de "INICIO" se enfoque más en tus estadísticas y gráficas sin hacer tanto scroll.

---

**🛠️ ¿Qué sigue?**
Dime, ¿cuál de los 3 conceptos te emociona más para tu pantalla principal?
_(Por ejemplo: "Me gusta la Opción 1, el Anillo", o "Haz la Botella Animada")._
En cuanto elijas uno, reescribiré y reemplazaré el archivo actual `WaterTracker.tsx` inyectando todo el CSS y las animaciones necesarias para que cobre vida de inmediato.
