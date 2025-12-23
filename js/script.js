// Función para establecer el idioma (Mantenida)
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
                const hasChildElements = Array.from(element.childNodes).some(node => node.nodeType === 1); 

                if (hasChildElements && element.firstChild && element.firstChild.nodeType === 3) {
                    element.firstChild.textContent = translationData[key] + " "; 
                } else {
                    element.innerHTML = translationData[key];
                }
            }
        } else {
            // console.warn(`Clave de traducción no encontrada para '${key}' en '${lang}'`);
        }
    });

    // Guardar preferencia en localStorage
    localStorage.setItem('lang', lang);

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
}


// --- FUNCIÓN SCROLLSPY (Solo para Index.html) ---
function activateScrollSpy(sectionIds, navLinksSelector) {
    const desktopNavLinks = document.querySelectorAll(navLinksSelector);
    
    if (desktopNavLinks.length === 0) return;

    // Crear mapa de enlaces por href (usamos ID para mapear)
    const navMap = {};
    desktopNavLinks.forEach(link => {
        let href = link.getAttribute('href');
        if (href.startsWith('#')) {
            href = href.substring(1);
        } else if (href.toLowerCase().includes('index.html') || href === 'javascript:void(0);') {
            // Mapeamos el enlace "INICIO" y el enlace "SERVICIOS" (dropdown sin href)
            href = 'hero-section'; // Asumimos que el inicio es el Hero
        }
        navMap[href] = link;
    });

    const headerHeight = 70;
    const rootMarginValue = `-${headerHeight}px 0px 0px 0px`; 

    const observerOptions = {
        root: null, 
        rootMargin: rootMarginValue, 
        threshold: 0 
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                const targetId = entry.target.id;

                // Limpiamos todos los estados activos del menú principal y drawer
                document.querySelectorAll('.desktop-nav a').forEach(a => {
                    // Mantener el estado activo en los sub-enlaces de servicio
                    if (!a.closest('.dropdown-content')) {
                        a.classList.remove('active');
                    }
                });
                document.querySelectorAll('.drawer-nav a').forEach(a => a.classList.remove('active'));

                // Marcar el enlace directo del menú principal
                const targetLink = document.querySelector(`.desktop-nav a[href="#${targetId}"]`) || document.querySelector(`.desktop-nav a[href*="${targetId.replace('-mobile', '')}.html"]`);
                if (targetLink) {
                    targetLink.classList.add('active');
                }

                // Marcar el enlace directo del drawer
                const drawerLink = document.querySelector(`.mobile-drawer a[href="#${targetId}"]`) || document.querySelector(`.mobile-drawer a[href*="${targetId.replace('-mobile', '')}.html"]`); 
                if (drawerLink) {
                    drawerLink.classList.add('active');
                }
                
                // --- Lógica Especial para el Dropdown SERVICIOS ---
                if (targetId.includes('services-section')) {
                     // 1. Marcar el enlace padre "SERVICIOS" en el desktop
                     const desktopDropdown = document.querySelector('.desktop-nav .dropdown a[data-lang-key="nav_servicios"]');
                     if (desktopDropdown) desktopDropdown.classList.add('active');

                     // 2. Marcar el enlace "SERVICIOS" en el drawer
                     const mobileServiceLink = document.querySelector('.drawer-nav a[data-lang-key="nav_servicios"]');
                     if (mobileServiceLink) mobileServiceLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    // Observar cada sección por ID
    sectionIds.forEach(id => {
        const target = document.getElementById(id);
        if (target) {
            observer.observe(target);
        }
    });
}
// --- FIN FUNCIÓN SCROLLSPY ---


document.addEventListener("DOMContentLoaded", function() {

    // Función para activar el estado activo del enlace al cargar (para páginas de servicio)
    function activateNavOnLoad() {
        // Obtenemos el nombre de archivo actual (ej: lamarr-cloud.html)
        const currentPath = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';

        document.querySelectorAll('.desktop-nav a, .drawer-nav a').forEach(a => {
            const hrefPath = a.getAttribute('href')?.split('/').pop().toLowerCase() || 'index.html';
            
            // 1. Marcar el sub-enlace o enlace principal si es la página actual
            if (hrefPath === currentPath) {
                a.classList.add('active');
                
                // 2. Marcar el enlace padre "SERVICIOS" si es una página de servicio
                if (['lamarr-cloud.html', 'lamarr-integrate.html', 'lamarr-data-ai.html', 'lamarr-secure.html', 'services-sap.html'].includes(currentPath)) {
                    
                    // Marcar en escritorio (el elemento A que tiene el data-lang-key="nav_servicios")
                    const desktopDropdown = document.querySelector('.desktop-nav .dropdown a[data-lang-key="nav_servicios"]');
                    if (desktopDropdown) desktopDropdown.classList.add('active');

                    // Marcar en móvil (el enlace de "SERVICIOS" en el drawer)
                    const mobileServiceLink = document.querySelector('.drawer-nav a[data-lang-key="nav_servicios"]');
                    if (mobileServiceLink) mobileServiceLink.classList.add('active');
                }
            } else {
                 a.classList.remove('active');
            }
        });
    }

    function initLanguageSwitcher() {
        const switchers = document.querySelectorAll('.language-switcher');
        if (switchers.length === 0) return;

        window.addEventListener('click', function(e) {
            switchers.forEach(switcher => {
                const dropdown = switcher.querySelector('.lang-dropdown');
                if (dropdown && dropdown.classList.contains('show')) {
                    if (!switcher.contains(e.target)) {
                        dropdown.classList.remove('show');
                    }
                }
            });
        });

        switchers.forEach(switcher => {
            const langBtn = switcher.querySelector('.lang-btn');
            const langDropdown = switcher.querySelector('.lang-dropdown');

            if (langBtn && langDropdown) {
                langBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); 
                    switchers.forEach(otherSwitcher => {
                        if (otherSwitcher !== switcher) {
                            otherSwitcher.querySelector('.lang-dropdown')?.classList.remove('show');
                        }
                    });
                    langDropdown.classList.toggle('show');
                });

                langDropdown.addEventListener('click', function(e) {
                    e.stopPropagation();
                });

                const langLinks = langDropdown.querySelectorAll('a[data-lang]');
                langLinks.forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        const selectedLang = this.getAttribute('data-lang');
                        setLanguage(selectedLang); 
                        langDropdown.classList.remove('show'); 
                    });
                });
            }
        });
    }


    // --- Carga inicial ---
    if (typeof translations === 'undefined') {
        console.error("Error: El archivo idiomas.js no se cargó o no se cargó a tiempo.");
        return;
    }

    // Nota: initMobileMenu ya está en mobile-script.js
    activateNavOnLoad(); // Ejecutar lógica de activación de enlaces al cargar
    initLanguageSwitcher(); 
    
    const savedLang = localStorage.getItem('lang') || 'es'; 
    setLanguage(savedLang);

    // --- ACTIVACIÓN DEL SCROLLSPY (Solo en Index) ---
    const path = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
    if (path === 'index.html' || path === '') {
        // Usamos los IDs de las secciones principales del index para el ScrollSpy
        const sectionIds = ['hero-section', 'services-section-mobile', 'partners-section', 'presencia-global', 'cta-final-section']; 
        
        // El selector apunta solo a los enlaces de anclaje de la navegación de escritorio (que tienen hash o son el padre)
        activateScrollSpy(sectionIds, '.desktop-nav a');
    }
});