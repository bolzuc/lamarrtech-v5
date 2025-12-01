document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. CONFIGURACIÓN Y ESTRUCTURA DE MENÚ (Drawer) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const body = document.body;
    
    if (menuToggle && drawer && overlay) {
        
        function toggleDrawer() {
            menuToggle.classList.toggle('active');
            drawer.classList.toggle('open');
            overlay.classList.toggle('open');
            
            if (drawer.classList.contains('open')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        }

        menuToggle.addEventListener('click', toggleDrawer);
        overlay.addEventListener('click', toggleDrawer);

        // Cerrar menú al hacer clic en un enlace
        const drawerLinks = document.querySelectorAll('.drawer-nav a');
        drawerLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                 if (drawer.classList.contains('open')) {
                    menuToggle.classList.remove('active');
                    drawer.classList.remove('open');
                    overlay.classList.remove('open');
                    body.style.overflow = '';
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

            // 1. Actualizar botones de idioma en el DRAWER
            document.querySelectorAll('.lang-opt').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll(`.lang-opt[data-lang='${lang}']`).forEach(btn => btn.classList.add('active'));

            // 2. Actualizar texto en el HEADER (ES/EN/PT)
            const currentLangSpan = document.querySelector('.current-lang');
            if(currentLangSpan) currentLangSpan.textContent = lang.toUpperCase();

            // 3. Aplicar traducciones
            const elements = document.querySelectorAll('[data-lang-key]');
            elements.forEach(element => {
                const key = element.getAttribute('data-lang-key');
                if (translationData[key]) {
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
        
        // Cierre suave del drawer
        if (drawer && drawer.classList.contains('open')) {
             const toggleEvent = new Event('click');
             menuToggle.dispatchEvent(toggleEvent);
        }
    };
    
    // Inicializar idioma al cargar
    const savedLang = localStorage.getItem('lang') || 'es';
    window.changeLang(savedLang);
});