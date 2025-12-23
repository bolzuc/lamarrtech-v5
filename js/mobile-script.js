document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. CONFIGURACIÓN Y ESTRUCTURA DE MENÚ (Drawer) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const body = document.body;
    const currentPath = window.location.pathname.split('/').pop().toLowerCase() || 'index.html'; // Usado para lógica de cierre

    if (menuToggle && drawer && overlay) {
        
        function toggleDrawer() {
            // El CSS maneja la visibilidad de los íconos de abrir/cerrar basado en la clase 'active'
            menuToggle.classList.toggle('active'); 
            drawer.classList.toggle('open');
            overlay.classList.toggle('open');
            
            if (drawer.classList.contains('open')) {
                // Bloquear scroll del body cuando el menú está abierto
                body.style.overflow = 'hidden';
            } else {
                // Restaurar scroll del body
                body.style.overflow = '';
            }
        }

        // Aseguramos que el evento click siempre esté activo
        menuToggle.addEventListener('click', toggleDrawer);
        overlay.addEventListener('click', toggleDrawer);

        // Cerrar menú al hacer clic en un enlace (con delay para la animación)
        const drawerLinks = document.querySelectorAll('.drawer-nav a:not(.drawer-label)');
        drawerLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                 if (drawer.classList.contains('open')) {
                    // Lógica de Scroll interno (solo para index.html)
                    if (currentPath === 'index.html' || currentPath === '') {
                        if (link.getAttribute('href')?.startsWith('#')) {
                            e.preventDefault(); 
                            const targetId = link.getAttribute('href').substring(1);
                            const targetElement = document.getElementById(targetId);
                            if (targetElement) {
                                window.scrollTo({
                                    top: targetElement.offsetTop - 70, 
                                    behavior: 'smooth'
                                });
                            }
                        }
                    }
                    setTimeout(toggleDrawer, 300);
                 }
            });
        });
    }

    // --- 2. MANEJO DE IDIOMA (Integración con js/idiomas.js) ---
    // Función central de cambio de idioma
    window.changeLang = function(lang) {
        localStorage.setItem('lang', lang);

        if (typeof translations !== 'undefined') {
            const translationData = translations[lang];
            if (!translationData) return;

            // 1. Actualizar botones de idioma en el DRAWER y en otros lugares
            document.querySelectorAll('.lang-opt').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll(`.lang-opt[data-lang='${lang}']`).forEach(btn => btn.classList.add('active'));

            // 2. Actualizar texto en el HEADER (ES/EN/PT)
            document.querySelectorAll('.lang-btn-text').forEach(span => {
                 span.textContent = lang.toUpperCase();
            });

            // 3. Aplicar traducciones
            const elements = document.querySelectorAll('[data-lang-key]');
            elements.forEach(element => {
                const key = element.getAttribute('data-lang-key');
                if (translationData[key]) {
                    // Lógica para INPUTS, TEXTAREAS, SELECTS (placeholders, values)
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT' || element.tagName === 'BUTTON') {
                         if (element.placeholder !== undefined && (element.placeholder.trim().length > 0 || !element.placeholder)) {
                             element.placeholder = translationData[key];
                         }
                         if (element.tagName === 'SELECT' && element.options[0]) {
                            element.options[0].textContent = translationData[key];
                         }
                         if (element.type === 'submit' || element.type === 'button') {
                              element.textContent = translationData[key];
                         }
                    } else {
                        // Lógica para TAGS de contenido (H1, P, A, SPAN, etc.)
                        const hasChildElements = Array.from(element.childNodes).some(node => node.nodeType === 1);
                        
                        if (hasChildElements && element.firstChild && element.firstChild.nodeType === 3) {
                            element.firstChild.textContent = translationData[key] + " ";
                        } else {
                            element.innerHTML = translationData[key];
                        }
                    }
                }
            });
        }
        
        // Cierre suave del drawer si está abierto (si la función existe)
        if (typeof toggleDrawer === 'function' && drawer && drawer.classList.contains('open')) {
             toggleDrawer();
        }
    };
    
    // Inicializar idioma al cargar
    const savedLang = localStorage.getItem('lang') || 'es';
    window.changeLang(savedLang);
});