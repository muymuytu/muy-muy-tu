/**
 * Catálogo de Productos - Arquitectura Limpia
 * Principios SOLID aplicados
 * El submenú se muestra/oculta por CSS (hover) — JS solo gestiona filtrado de productos
 */

// ==================== DOMAIN LAYER ====================

class Category {
    constructor(value) {
        if (!value || typeof value !== 'string') throw new Error('Category must be a non-empty string');
        this._value = value.toLowerCase();
    }
    get value() { return this._value; }
    matches(categoryValue) { return this._value === categoryValue.toLowerCase(); }
}

class Subcategory {
    constructor(value) {
        if (!value || typeof value !== 'string') throw new Error('Subcategory must be a non-empty string');
        this._value = value.toLowerCase();
    }
    get value() { return this._value; }
    matches(subcategoryValue) { return this._value === subcategoryValue.toLowerCase(); }
}

class Product {
    constructor(element) {
        if (!(element instanceof HTMLElement)) throw new Error('Product must be an HTMLElement');
        this._element = element;
        this._category = element.dataset.category || '';
        this._subcategory = element.dataset.subcategory || '';
    }
    matchesFilter(category, subcategory = null) {
        const categoryMatches = category.matches(this._category);
        return subcategory ? categoryMatches && subcategory.matches(this._subcategory) : categoryMatches;
    }
    show() {
        this._element.classList.remove('hidden');
        this._element.style.display = 'block';
        // Resetear animación
        this._element.classList.remove('visible');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this._element.classList.add('visible');
            });
        });
    }
    hide() {
        this._element.classList.remove('hidden', 'visible');
        this._element.style.display = 'none';
    }
}

// ==================== APPLICATION LAYER ====================

class FilterProductsUseCase {
    constructor(productRepository) { this._productRepository = productRepository; }
    execute(category, subcategory = null) {
        this._productRepository.getAll().forEach(product => {
            product.matchesFilter(category, subcategory) ? product.show() : product.hide();
        });
    }
}

class HideAllProductsUseCase {
    constructor(productRepository) { this._productRepository = productRepository; }
    execute() { this._productRepository.getAll().forEach(p => p.hide()); }
}

class ManageButtonStateUseCase {
    execute(buttons, activeButton) {
        buttons.forEach(btn => btn.classList.remove('active'));
        if (activeButton) activeButton.classList.add('active');
    }
}

// ==================== INFRASTRUCTURE LAYER ====================

class ProductRepository {
    constructor(selector = '.product-card') {
        this._selector = selector;
        this._products = null;
    }
    getAll() {
        if (!this._products) {
            this._products = Array.from(document.querySelectorAll(this._selector))
                .map(el => new Product(el));
        }
        return this._products;
    }
}

class ButtonRepository {
    getMainButtons() { return Array.from(document.querySelectorAll('.side-menu__btn')); }
    getSubButtons()  { return Array.from(document.querySelectorAll('.filter-btn--sub')); }
}

// ==================== PRESENTATION LAYER ====================

class CatalogController {
    constructor(filterProductsUseCase, hideAllProductsUseCase, manageButtonStateUseCase, buttonRepository) {
        this._filter    = filterProductsUseCase;
        this._hideAll   = hideAllProductsUseCase;
        this._btnState  = manageButtonStateUseCase;
        this._buttons   = buttonRepository;
    }

    initialize() {
        this._hideAll.execute();
        this._attachMainButtons();
        this._attachSubButtons();
    }

    _attachMainButtons() {
        const mainBtns = this._buttons.getMainButtons();
        mainBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Toggle: si ya está activo, deseleccionar y ocultar
                if (btn.classList.contains('active')) {
                    this._btnState.execute(mainBtns, null);
                    this._btnState.execute(this._buttons.getSubButtons(), null);
                    this._hideAll.execute();
                    return;
                }

                const category = new Category(btn.dataset.filter);
                this._btnState.execute(mainBtns, btn);

                const hasSubmenu = btn.closest('.side-menu__item--has-submenu');
                if (!hasSubmenu) {
                    this._btnState.execute(this._buttons.getSubButtons(), null);
                    this._filter.execute(category);
                } else {
                    this._hideAll.execute();
                    this._btnState.execute(this._buttons.getSubButtons(), null);
                }
            });
        });
    }

    _attachSubButtons() {
        const subBtns = this._buttons.getSubButtons();
        subBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Toggle: si ya está activo, deseleccionar y ocultar
                if (btn.classList.contains('active')) {
                    this._btnState.execute(subBtns, null);
                    this._hideAll.execute();
                    return;
                }

                const category    = new Category(btn.dataset.category);
                const subcategory = new Subcategory(btn.dataset.subcategory);
                this._btnState.execute(subBtns, btn);
                this._filter.execute(category, subcategory);
            });
        });
    }
}

// ==================== LIGHTBOX LAYER ====================

class Lightbox {
    constructor(lightboxEl, imageEl) {
        this._lightbox = lightboxEl;
        this._image    = imageEl;
    }
    open(src, alt) {
        this._image.src = src;
        this._image.alt = alt;
        this._lightbox.classList.remove('lightbox--hidden');
        document.body.style.overflow = 'hidden';
    }
    close() {
        this._lightbox.classList.add('lightbox--hidden');
        this._image.src = '';
        document.body.style.overflow = '';
    }
}

class LightboxController {
    constructor(lightbox) { this._lightbox = lightbox; }
    initialize() {
        document.addEventListener('click', e => {
            if (e.target.closest('.product-card img')) {
                const img = e.target.closest('.product-card img');
                this._lightbox.open(img.src, img.alt);
            }
        });
        document.getElementById('lightbox-close')
            .addEventListener('click', () => this._lightbox.close());
        document.getElementById('lightbox')
            .addEventListener('click', e => { if (e.target === e.currentTarget) this._lightbox.close(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') this._lightbox.close(); });
    }
}

// ==================== BOOTSTRAP ====================

document.addEventListener('DOMContentLoaded', () => {
    const productRepo = new ProductRepository();
    const buttonRepo  = new ButtonRepository();

    const controller = new CatalogController(
        new FilterProductsUseCase(productRepo),
        new HideAllProductsUseCase(productRepo),
        new ManageButtonStateUseCase(),
        buttonRepo
    );
    controller.initialize();

    const lightbox = new Lightbox(
        document.getElementById('lightbox'),
        document.getElementById('lightbox-image')
    );
    new LightboxController(lightbox).initialize();
});

