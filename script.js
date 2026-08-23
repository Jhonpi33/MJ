// ============================================================
// ROSÉ STUDIO — interacciones
// Nada de esto depende de un backend: el carrito vive en memoria
// mientras la página está abierta. El día que tengas un backend
// (o Google Forms / WhatsApp Business API), aquí es donde se
// conectaría el envío real de pedidos y reservas.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    /* ---------- Menú móvil ---------- */
    const header = document.getElementById("header");
    const btnMenu = document.getElementById("btnMenu");

    btnMenu.addEventListener("click", () => {
        const abierto = header.classList.toggle("menu-abierto");
        btnMenu.classList.toggle("abierto", abierto);
        btnMenu.setAttribute("aria-expanded", abierto);
    });

    document.querySelectorAll(".nav a").forEach((enlace) => {
        enlace.addEventListener("click", () => {
            header.classList.remove("menu-abierto");
            btnMenu.classList.remove("abierto");
            btnMenu.setAttribute("aria-expanded", "false");
        });
    });

    /* ---------- Animación de aparición al hacer scroll ---------- */
    const elementosReveal = document.querySelectorAll(".reveal");
    const observador = new IntersectionObserver(
        (entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("en-vista");
                    observador.unobserve(entrada.target);
                }
            });
        },
        { threshold: 0.15 }
    );
    elementosReveal.forEach((el) => observador.observe(el));

    /* ---------- Carrito de compras ---------- */
    const carrito = []; // { nombre, precio }

    const panel = document.getElementById("carritoPanel");
    const overlay = document.getElementById("carritoOverlay");
    const btnCarrito = document.getElementById("btnCarrito");
    const cerrarCarrito = document.getElementById("cerrarCarrito");
    const lista = document.getElementById("carritoLista");
    const vacioMsj = document.getElementById("carritoVacio");
    const totalEl = document.getElementById("carritoTotal");
    const contadorEl = document.getElementById("carritoContador");

    function formatearPrecio(numero) {
        return "$" + numero.toLocaleString("es-CO");
    }

    function abrirCarrito() {
        panel.classList.add("activo");
        overlay.classList.add("activo");
    }
    function cerrarPanelCarrito() {
        panel.classList.remove("activo");
        overlay.classList.remove("activo");
    }

    btnCarrito.addEventListener("click", abrirCarrito);
    cerrarCarrito.addEventListener("click", cerrarPanelCarrito);
    overlay.addEventListener("click", cerrarPanelCarrito);

    function renderizarCarrito() {
        lista.innerHTML = "";

        if (carrito.length === 0) {
            lista.appendChild(vacioMsj);
        } else {
            carrito.forEach((item, indice) => {
                const li = document.createElement("li");
                li.className = "carrito-item";
                li.innerHTML = `
          <span>${item.nombre} · ${formatearPrecio(item.precio)}</span>
          <button class="carrito-item__quitar" aria-label="Quitar ${item.nombre}">✕</button>
        `;
                li.querySelector(".carrito-item__quitar").addEventListener("click", () => {
                    carrito.splice(indice, 1);
                    renderizarCarrito();
                });
                lista.appendChild(li);
            });
        }

        const total = carrito.reduce((suma, item) => suma + item.precio, 0);
        totalEl.textContent = formatearPrecio(total);
        contadorEl.textContent = carrito.length;
    }

    document.querySelectorAll(".btn-agregar").forEach((boton) => {
        boton.addEventListener("click", () => {
            const nombre = boton.dataset.nombre;
            const precio = Number(boton.dataset.precio);
            carrito.push({ nombre, precio });
            renderizarCarrito();

            boton.classList.remove("agregado");
            void boton.offsetWidth; // reinicia la animación si se hace clic varias veces seguidas
            boton.classList.add("agregado");

            mostrarToast(`${nombre} agregado al carrito ✿`);
        });
    });

    renderizarCarrito();

    /* ---------- Toast de confirmación ---------- */
    const toast = document.getElementById("toast");
    let toastTimeout;

    function mostrarToast(mensaje) {
        toast.textContent = mensaje;
        toast.classList.add("mostrar");
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove("mostrar"), 2600);
    }

    /* ---------- Formulario de reserva ---------- */
    const formReserva = document.getElementById("formReserva");

    const NOMBRES_SERVICIOS = {
        cejas: "Diseño y arreglo de cejas",
        limpieza: "Limpieza facial profunda",
        maquillaje: "Maquillaje para eventos",
        otro: "Otro servicio",
    };

    const NUMERO_WHATSAPP = "573022957345";


    formReserva.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const datos = new FormData(formReserva);

        const nombre = datos.get("nombre");
        const servicioLegible = NOMBRES_SERVICIOS[datos.get("servicio")] || datos.get("servicio");
        const fecha = datos.get("fecha");
        const hora = datos.get("hora");
        const telefono = datos.get("telefono");

        const mensaje =
            `¡Hola! Quiero confirmar una cita%0A` +
            `*Nombre:* ${nombre}%0A` +
            `*Servicio:* ${servicioLegible}%0A` +
            `*Fecha:* ${fecha}%0A` +
            `*Hora:* ${hora}%0A` +
            `*Teléfono:* ${telefono}`;

        const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensaje}`;
        window.open(urlWhatsApp, "_blank");

        mostrarToast(`¡Gracias, ${nombre}! Tu solicitud de cita fue recibida ✿`);
        formReserva.reset();
    });

});