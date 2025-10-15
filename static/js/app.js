// Main application module
const App = (function() {
    // Constants
    const DEFAULT_LANGUAGE = 'en';
    const MENU_ITEM_LIMIT = 7;
    
    // State
    let currentLanguage = localStorage.getItem("language") || DEFAULT_LANGUAGE;
    let navbarMenuContent = document.querySelector(".navbar-menu")?.innerHTML || "";
    
    // Language functions
    function setLanguage(lang) {
        const langImg = document.getElementById("header-lang-img");
        if (!langImg) return;
        
        const flagMap = {
            'en': '/static/images/flags/us.svg',
            'sp': '/static/images/flags/spain.svg',
            'gr': '/static/images/flags/germany.svg',
            'it': '/static/images/flags/italy.svg',
            'ru': '/static/images/flags/russia.svg',
            'ch': '/static/images/flags/china.svg',
            'fr': '/static/images/flags/french.svg',
            'ar': '/static/images/flags/ae.svg'
        };
        
        if (flagMap[lang]) {
            langImg.src = flagMap[lang];
            currentLanguage = lang;
            localStorage.setItem("language", lang);
            loadLanguageFile(lang);
        }
    }
    
    function loadLanguageFile(lang) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", `/static/lang/${lang}.json`);
        xhr.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                try {
                    const translations = JSON.parse(this.responseText);
                    applyTranslations(translations);
                } catch (error) {
                    console.error("Error parsing language file:", error);
                }
            }
        };
        xhr.send();
    }
    
    function applyTranslations(translations) {
        Object.keys(translations).forEach(key => {
            const elements = document.querySelectorAll(`[data-key='${key}']`);
            elements.forEach(el => {
                el.textContent = translations[key];
            });
        });
    }
    
    function initLanguage() {
        setLanguage(currentLanguage);
        
        const languageElements = document.getElementsByClassName("language");
        if (languageElements) {
            Array.from(languageElements).forEach(el => {
                el.addEventListener("click", function() {
                    setLanguage(this.getAttribute("data-lang"));
                });
            });
        }
    }
    
    // Menu and navigation functions
    function initMenu() {
        initCollapsibleMenus();
        setupTwoColumnLayout();
    }
    
    function initCollapsibleMenus() {
        const collapses = document.querySelectorAll(".navbar-nav .collapse");
        if (!collapses) return;
        
        Array.from(collapses).forEach(menu => {
            const collapse = new bootstrap.Collapse(menu, { toggle: false });
            
            menu.addEventListener("show.bs.collapse", function(e) {
                e.stopPropagation();
                handleMenuShow(this, collapse);
            });
            
            menu.addEventListener("hide.bs.collapse", function(e) {
                e.stopPropagation();
                handleMenuHide(this);
            });
        });
    }
    
    function handleMenuShow(menu, currentCollapse) {
        const parentCollapse = menu.parentElement.closest(".collapse");
        
        if (parentCollapse) {
            const childCollapses = parentCollapse.querySelectorAll(".collapse");
            Array.from(childCollapses).forEach(child => {
                const childCollapse = bootstrap.Collapse.getInstance(child);
                if (childCollapse && childCollapse !== currentCollapse) {
                    childCollapse.hide();
                }
            });
        } else {
            const siblings = getSiblings(menu.parentElement);
            Array.from(siblings).forEach(sibling => {
                if (sibling.childNodes.length > 2) {
                    const firstChild = sibling.firstElementChild;
                    if (firstChild) firstChild.setAttribute("aria-expanded", "false");
                    
                    const collapsedElements = sibling.querySelectorAll("*[id]");
                    Array.from(collapsedElements).forEach(el => {
                        el.classList.remove("show");
                        if (el.childNodes.length > 2) {
                            const links = el.querySelectorAll("ul li a");
                            Array.from(links).forEach(link => {
                                if (link.hasAttribute("aria-expanded")) {
                                    link.setAttribute("aria-expanded", "false");
                                }
                            });
                        }
                    });
                }
            });
        }
    }
    
    function handleMenuHide(menu) {
        const childCollapses = menu.querySelectorAll(".collapse");
        Array.from(childCollapses).forEach(child => {
            const childCollapse = bootstrap.Collapse.getInstance(child);
            if (childCollapse) childCollapse.hide();
        });
    }
    
    function getSiblings(element) {
        const siblings = [];
        let sibling = element.parentNode.firstChild;
        
        while (sibling) {
            if (sibling.nodeType === 1 && sibling !== element) {
                siblings.push(sibling);
            }
            sibling = sibling.nextSibling;
        }
        
        return siblings;
    }
    
    function setupTwoColumnLayout() {
        const layout = document.documentElement.getAttribute("data-layout");
        if (layout !== "twocolumn") return;
        
        const navbarMenu = document.querySelector(".navbar-menu");
        if (!navbarMenu) return;
        
        navbarMenuContent = navbarMenu.innerHTML;
        createTwoColumnMenu();
    }
    
    function createTwoColumnMenu() {
        const twoColumnMenu = document.getElementById("two-column-menu");
        if (!twoColumnMenu) return;
        
        const iconList = document.createElement("ul");
        iconList.innerHTML = '<a href="#" class="logo"><img src="/static/images/logo-sm.png" alt="" height="22"></a>';
        
        const menuLinks = document.getElementById("navbar-nav")?.querySelectorAll(".menu-link");
        if (!menuLinks) return;
        
        Array.from(menuLinks).forEach(link => {
            const listItem = document.createElement("li");
            const clonedLink = link.cloneNode(true);
            
            // Hide text spans in icon view
            clonedLink.querySelectorAll("span").forEach(span => {
                span.classList.add("d-none");
            });
            
            // Add active class if needed
            if (link.parentElement.classList.contains("twocolumn-item-show")) {
                clonedLink.classList.add("active");
            }
            
            // Update classes
            clonedLink.classList.remove("collapsed", "menu-link");
            if (clonedLink.classList.contains("nav-link")) {
                clonedLink.classList.replace("nav-link", "nav-icon");
            }
            
            listItem.appendChild(clonedLink);
            iconList.appendChild(listItem);
        });
        
        iconList.className = "twocolumn-iconview";
        twoColumnMenu.innerHTML = iconList.outerHTML;
        setupTwoColumnInteractions();
    }
    
    function setupTwoColumnInteractions() {
        const twoColumnLinks = document.querySelectorAll("#two-column-menu ul li a");
        if (!twoColumnLinks) return;
        
        const currentPath = window.location.pathname;
        const page = currentPath === "/" ? "/" : currentPath.substring(currentPath.lastIndexOf("/") + 1);
        
        twoColumnLinks.forEach(link => {
            link.addEventListener("click", handleTwoColumnClick);
            
            // Set active link
            const href = link.getAttribute("href");
            if (href && `/${href}` === currentPath && !link.getAttribute("data-bs-toggle")) {
                link.classList.add("active");
                document.getElementById("navbar-nav").classList.add("twocolumn-nav-hide");
                document.querySelector(".hamburger-icon")?.classList.add("open");
            }
        });
    }
    
    function handleTwoColumnClick(event) {
        const target = event.target;
        const link = target.matches("a.nav-icon") ? target : target.closest("a.nav-icon");
        
        if (!link) return;
        
        // Remove active class from all links
        document.querySelectorAll("#two-column-menu ul .nav-icon.active").forEach(el => {
            el.classList.remove("active");
        });
        
        // Add active class to clicked link
        link.classList.add("active");
        
        // Handle menu display
        const targetId = link.getAttribute("href")?.slice(1);
        if (targetId) {
            // Hide all twocolumn items
            document.querySelectorAll(".twocolumn-item-show").forEach(el => {
                el.classList.remove("twocolumn-item-show");
            });
            
            // Show target item
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.parentElement.classList.add("twocolumn-item-show");
            }
        }
    }
    
    // Layout and responsive functions
    function handleResponsiveLayout() {
        const width = document.documentElement.clientWidth;
        
        if (width > 1024) {
            // Desktop layout
            handleDesktopLayout();
        } else if (width > 767 && width <= 1024) {
            // Tablet layout
            handleTabletLayout();
        } else {
            // Mobile layout
            handleMobileLayout();
        }
        
        setupMenuInteractions();
    }
    
    function handleDesktopLayout() {
        document.body.classList.remove("twocolumn-panel");
        
        const savedLayout = sessionStorage.getItem("data-layout");
        if (savedLayout === "twocolumn") {
            document.documentElement.setAttribute("data-layout", "twocolumn");
            document.getElementById("customizer-layout03")?.click();
            initMenu();
            setupTwoColumnLayout();
        }
        
        document.querySelector(".hamburger-icon")?.classList.remove("open");
    }
    
    function handleTabletLayout() {
        document.body.classList.remove("twocolumn-panel");
        
        const savedLayout = sessionStorage.getItem("data-layout");
        if (savedLayout === "twocolumn") {
            document.documentElement.setAttribute("data-layout", "twocolumn");
            document.getElementById("customizer-layout03")?.click();
            initMenu();
            setupTwoColumnLayout();
        }
        
        document.querySelector(".hamburger-icon")?.classList.add("open");
    }
    
    function handleMobileLayout() {
        document.body.classList.remove("vertical-sidebar-enable");
        document.body.classList.add("twocolumn-panel");
        
        const savedLayout = sessionStorage.getItem("data-layout");
        if (savedLayout === "twocolumn") {
            document.documentElement.setAttribute("data-layout", "vertical");
            resetLayout("vertical");
            initMenu();
        }
        
        document.querySelector(".hamburger-icon")?.classList.add("open");
    }
    
    function setupMenuInteractions() {
        const navItems = document.querySelectorAll("#navbar-nav > li.nav-item");
        if (!navItems) return;
        
        navItems.forEach(item => {
            item.addEventListener("click", handleMenuInteraction);
            item.addEventListener("mouseover", handleMenuInteraction);
        });
    }
    
    function handleMenuInteraction(event) {
        const target = event.target;
        let dropdown = null;
        
        if (target.matches("a.nav-link span")) {
            dropdown = target.parentElement.nextElementSibling;
        } else if (target.matches("a.nav-link")) {
            dropdown = target.nextElementSibling;
        }
        
        if (!dropdown) return;
        
        if (!isElementInViewport(dropdown)) {
            dropdown.classList.add("dropdown-custom-right");
            if (target.matches("a.nav-link span")) {
                target.parentElement.parentElement.parentElement.parentElement.classList.add("dropdown-custom-right");
            } else {
                target.parentElement.parentElement.parentElement.classList.add("dropdown-custom-right");
            }
            
            // Apply to all child dropdowns
            const childDropdowns = dropdown.querySelectorAll(".menu-dropdown");
            childDropdowns.forEach(child => {
                child.classList.add("dropdown-custom-right");
            });
        } else if (window.innerWidth >= 1848) {
            // Remove all dropdown-custom-right classes if not needed
            const customDropdowns = document.getElementsByClassName("dropdown-custom-right");
            while (customDropdowns.length > 0) {
                customDropdowns[0].classList.remove("dropdown-custom-right");
            }
        }
    }
    
    function isElementInViewport(el) {
        if (!el) return false;
        
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    function toggleMenu() {
        const width = document.documentElement.clientWidth;
        const layout = document.documentElement.getAttribute("data-layout");
        
        if (layout === "horizontal") {
            document.body.classList.toggle("menu");
        } else if (layout === "vertical") {
            handleVerticalLayoutToggle(width);
        } else if (layout === "semibox") {
            handleSemiboxLayoutToggle(width);
        } else if (layout === "twocolumn") {
            document.body.classList.toggle("twocolumn-panel");
        }
        
        document.querySelector(".hamburger-icon")?.classList.toggle("open");
    }
    
    function handleVerticalLayoutToggle(width) {
        if (width > 767 && width <= 1024) {
            document.body.classList.remove("vertical-sidebar-enable");
            const sidebarSize = document.documentElement.getAttribute("data-sidebar-size");
            document.documentElement.setAttribute("data-sidebar-size", sidebarSize === "sm" ? "" : "sm");
        } else if (width > 1024) {
            document.body.classList.remove("vertical-sidebar-enable");
            const sidebarSize = document.documentElement.getAttribute("data-sidebar-size");
            document.documentElement.setAttribute("data-sidebar-size", sidebarSize === "lg" ? "sm" : "lg");
        } else {
            document.body.classList.add("vertical-sidebar-enable");
            document.documentElement.setAttribute("data-sidebar-size", "lg");
        }
    }
    
    function handleSemiboxLayoutToggle(width) {
        if (width > 767) {
            const visibility = document.documentElement.getAttribute("data-sidebar-visibility");
            if (visibility === "show") {
                const sidebarSize = document.documentElement.getAttribute("data-sidebar-size");
                document.documentElement.setAttribute("data-sidebar-size", sidebarSize === "lg" ? "sm" : "lg");
            } else {
                document.getElementById("sidebar-visibility-show")?.click();
                document.documentElement.setAttribute("data-sidebar-size", 
                    document.documentElement.getAttribute("data-sidebar-size"));
            }
        } else {
            document.body.classList.add("vertical-sidebar-enable");
            document.documentElement.setAttribute("data-sidebar-size", "lg");
        }
    }
    
    function resetLayout(layout) {
        if (layout !== "twocolumn") {
            document.getElementById("two-column-menu").innerHTML = "";
            if (document.querySelector(".navbar-menu")) {
                document.querySelector(".navbar-menu").innerHTML = navbarMenuContent;
            }
            document.getElementById("scrollbar").setAttribute("data-simplebar", "");
            document.getElementById("navbar-nav").setAttribute("data-simplebar", "");
            document.getElementById("scrollbar").classList.add("h-100");
        } else {
            document.getElementById("scrollbar").removeAttribute("data-simplebar");
            document.getElementById("scrollbar").classList.remove("h-100");
        }
        
        if (layout === "horizontal") {
            setupHorizontalLayout();
        }
    }
    
    function setupHorizontalLayout() {
        document.getElementById("two-column-menu").innerHTML = "";
        if (document.querySelector(".navbar-menu")) {
            document.querySelector(".navbar-menu").innerHTML = navbarMenuContent;
        }
        document.getElementById("scrollbar").removeAttribute("data-simplebar");
        document.getElementById("navbar-nav").removeAttribute("data-simplebar");
        document.getElementById("scrollbar").classList.remove("h-100");
        
        createHorizontalMenu();
    }
    
    function createHorizontalMenu() {
        const navItems = document.querySelectorAll("ul.navbar-nav > li.nav-item");
        if (!navItems || navItems.length <= MENU_ITEM_LIMIT) return;
        
        let extraItems = "";
        let separatorItem = null;
        
        Array.from(navItems).forEach((item, index) => {
            if (index + 1 === MENU_ITEM_LIMIT) {
                separatorItem = item;
            } else if (index + 1 > MENU_ITEM_LIMIT) {
                extraItems += item.outerHTML;
                item.remove();
            }
        });
        
        if (separatorItem && extraItems) {
            separatorItem.insertAdjacentHTML("afterend", `
                <li class="nav-item">
                    <a class="nav-link" href="#sidebarMore" data-bs-toggle="collapse" role="button" 
                       aria-expanded="false" aria-controls="sidebarMore">
                        <i class="ri-briefcase-2-line"></i> 
                        <span data-key="t-more">More</span>
                    </a>
                    <div class="collapse menu-dropdown" id="sidebarMore">
                        <ul class="nav nav-sm flex-column">${extraItems}</ul>
                    </div>
                </li>
            `);
        }
    }
    
    // Public API
    return {
        init: function() {
            initLanguage();
            initMenu();
            handleResponsiveLayout();
            
            // Set up event listeners
            window.addEventListener("resize", handleResponsiveLayout);
            document.getElementById("topnav-hamburger-icon")?.addEventListener("click", toggleMenu);
            
            // Initialize other components
            this.initScrollHandler();
            this.initBackToTop();
        },
        
        initScrollHandler: function() {
            window.addEventListener("scroll", function() {
                const topbar = document.getElementById("page-topbar");
                if (!topbar) return;
                
                if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
                    topbar.classList.add("topbar-shadow");
                } else {
                    topbar.classList.remove("topbar-shadow");
                }
            });
        },
        
        initBackToTop: function() {
            const backToTopBtn = document.getElementById("back-to-top");
            if (!backToTopBtn) return;
            
            window.onscroll = function() {
                if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
                    backToTopBtn.style.display = "block";
                } else {
                    backToTopBtn.style.display = "none";
                }
            };
            
            backToTopBtn.addEventListener("click", function() {
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
            });
        },
        
        setLanguage: setLanguage,
        toggleMenu: toggleMenu
    };
})();

// Initialize the application when DOM is ready
document.addEventListener("DOMContentLoaded", function() {
    App.init();
});

// Language and direction switching
document.addEventListener('DOMContentLoaded', function() {
    const languageSwitchers = document.querySelectorAll('.language');
    const htmlElement = document.documentElement;
    
    languageSwitchers.forEach(switcher => {
        switcher.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            
            // Update language
            setLanguage(lang);
            
            // Update direction based on language
            if (lang === 'ar') {
                htmlElement.setAttribute('dir', 'rtl');
                htmlElement.classList.add('rtl');
                htmlElement.classList.remove('ltr');
            } else {
                htmlElement.setAttribute('dir', 'ltr');
                htmlElement.classList.add('ltr');
                htmlElement.classList.remove('rtl');
            }
            
            // Store direction preference
            localStorage.setItem('direction', lang === 'ar' ? 'rtl' : 'ltr');
        });
    });
    
    // Apply stored direction on page load
    const storedDirection = localStorage.getItem('direction') || 'ltr';
    if (storedDirection === 'rtl') {
        htmlElement.setAttribute('dir', 'rtl');
        htmlElement.classList.add('rtl');
        htmlElement.classList.remove('ltr');
    } else {
        htmlElement.setAttribute('dir', 'ltr');
        htmlElement.classList.add('ltr');
        htmlElement.classList.remove('rtl');
    }
});

// Initialize on window load
window.addEventListener("load", function() {
    // Additional initialization after all resources are loaded
});

