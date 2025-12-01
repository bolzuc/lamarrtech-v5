
// Función para establecer el idioma
function setLanguage(lang) {
    // translations se carga desde idiomas.js
    if (!translations[lang]) {
        console.error(`Idioma no encontrado: ${lang}`);
        return;
    }

    const elements = document.querySelectorAll('[data-lang-key]');
    const translationData = translations[lang];

    elements.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translationData[key]) {
            // Manejar diferentes tipos de elementos (ej. placeholders en inputs)
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.placeholder !== undefined) {
                    // Solo actualiza si 'placeholder' es una propiedad válida (evita errores en selects)
                    // Y si el placeholder actual no es un espacio (usado para la animación de label flotante)
                    if(element.placeholder.trim().length > 0 || !element.placeholder) {
                         element.placeholder = translationData[key];
                    }
                }
                // Si es un botón de submit
                if (element.type === 'submit' || element.type === 'button') {
                     element.value = translationData[key];
                }
            } else if (element.tagName === 'OPTION' && element.value === "") {
                // Para el option deshabilitado
                element.textContent = translationData[key];
            }
             else {
                // Para la mayoría de los elementos (p, h1, a, span, button, strong, etc.)
                
                // --- INICIO DE LA MODIFICACIÓN ---
                // Verificamos si el elemento tiene hijos que sean elementos (como el SVG de la flecha)
                const hasChildElements = Array.from(element.childNodes).some(node => node.nodeType === 1); // 1 = Element Node

                if (hasChildElements && element.firstChild && element.firstChild.nodeType === 3) { // 3 = Text Node
                    // Si tiene hijos elementos (SVG) Y su primer hijo es un nodo de texto
                    // Solo reemplazamos el contenido de ese primer nodo de texto.
                    // Esto preserva el SVG que viene después.
                    element.firstChild.textContent = translationData[key] + " "; // Añadir espacio para separar del icono
                } else {
                    // Si no tiene hijos elementos (es solo texto) o no empieza con texto,
                    // usamos innerHTML para renderizar tags como <br> y <strong>
                    element.innerHTML = translationData[key];
                }
                // --- FIN DE LA MODIFICACIÓN ---
            }
        } else {
            // console.warn(`Clave de traducción no encontrada para '${key}' en '${lang}'`);
        }
    });

    // Guardar preferencia en localStorage
    localStorage.setItem('lang', lang);

    // --- INICIO: MODIFICACIÓN PARA MÚLTIPLES BOTONES ---
    // Actualizar TODOS los botones principales
    const langBtnTexts = document.querySelectorAll('.lang-btn-text');
    if (langBtnTexts) {
        langBtnTexts.forEach(btn => {
            btn.textContent = lang.toUpperCase();
        });
    }

    // Actualizar TODAS las listas de dropdown
    const allLangLinks = document.querySelectorAll('.lang-dropdown a');
    allLangLinks.forEach(link => {
        if (link.getAttribute('data-lang') === lang) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Cerrar TODOS los dropdowns
    const allLangDropdowns = document.querySelectorAll('.lang-dropdown');
    if (allLangDropdowns) {
        allLangDropdowns.forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
    // --- FIN: MODIFICACIÓN PARA MÚLTIPLES BOTONES ---
}


document.addEventListener("DOMContentLoaded", function() {

    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const mobileNavContainer = document.querySelector('.mobile-nav-container');
        const menuIconOpen = document.querySelector('#menu-icon-open');
        const menuIconClose = document.querySelector('#menu-icon-close');

        if (menuToggle && mobileNavContainer && menuIconOpen && menuIconClose) {
            menuToggle.addEventListener('click', function() {
                mobileNavContainer.classList.toggle('open');
                
                const isOpen = mobileNavContainer.classList.contains('open');
                menuIconOpen.style.display = isOpen ? 'none' : 'block';
                menuIconClose.style.display = isOpen ? 'block' : 'none';
            });
        }

        const submenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
        submenuToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const submenuContent = this.nextElementSibling;
                const arrow = this.querySelector('.dropdown-arrow');

                if (submenuContent && submenuContent.classList.contains('mobile-submenu-content')) {
                    if (submenuContent.style.maxHeight) {
                        submenuContent.style.maxHeight = null;
                        if (arrow) {
                            arrow.classList.remove('rotated');
                        }
                    } else {
                        submenuContent.style.maxHeight = submenuContent.scrollHeight + "px";
                        if (arrow) {
                            arrow.classList.add('rotated');
                        }
                    }
                }
            });
        });
    }

    // --- INICIO: MODIFICADO - Función para MÚLTIPLES botones de idioma ---
    function initLanguageSwitcher() {
        // Find ALL switcher components on the page
        const switchers = document.querySelectorAll('.language-switcher');

        if (switchers.length === 0) return;

        // Cierra todos los dropdowns si se hace clic fuera
        window.addEventListener('click', function(e) {
            switchers.forEach(switcher => {
                const dropdown = switcher.querySelector('.lang-dropdown');
                if (dropdown && dropdown.classList.contains('show')) {
                    // Si el clic fue fuera del switcher actual
                    if (!switcher.contains(e.target)) {
                        dropdown.classList.remove('show');
                    }
                }
            });
        });

        // Asignar eventos a CADA switcher
        switchers.forEach(switcher => {
            const langBtn = switcher.querySelector('.lang-btn');
            const langDropdown = switcher.querySelector('.lang-dropdown');

            if (langBtn && langDropdown) {
                // 1. Abrir/Cerrar ESTE dropdown con SU botón
                langBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Evita que el clic se propague al window
                    
                    // Primero, cierra otros dropdowns abiertos
                    switchers.forEach(otherSwitcher => {
                        if (otherSwitcher !== switcher) {
                            otherSwitcher.querySelector('.lang-dropdown')?.classList.remove('show');
                        }
                    });
                    
                    // Luego, alterna el actual
                    langDropdown.classList.toggle('show');
                });

                // 2. Evita que el clic en el dropdown lo cierre
                langDropdown.addEventListener('click', function(e) {
                    e.stopPropagation();
                });

                // 3. Asignar eventos a los enlaces de idioma
                const langLinks = langDropdown.querySelectorAll('a[data-lang]');
                langLinks.forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        const selectedLang = this.getAttribute('data-lang');
                        // 'setLanguage' está definido globalmente
                        setLanguage(selectedLang); 
                        // Oculta ESTE dropdown después de seleccionar (ya lo hace setLanguage, pero por si acaso)
                        langDropdown.classList.remove('show'); 
                    });
                });
            }
        });
    }
    // --- FIN MODIFICADO ---


    function initAnimations() {
        // ... (código de animación existente si lo hay) ...
    }

    // --- Carga inicial ---
    // Verificamos que 'translations' se haya cargado desde idiomas.js
    if (typeof translations === 'undefined') {
        console.error("Error: El archivo idiomas.js no se cargó o no se cargó a tiempo.");
        return;
    }

    initAnimations();
    initMobileMenu();
    initLanguageSwitcher(); // Llamada a la función actualizada
    
    // Establecer idioma al cargar la página
    const savedLang = localStorage.getItem('lang') || 'es'; // 'es' como default
    setLanguage(savedLang);
});