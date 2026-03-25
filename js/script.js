/**
 * Catálogo de Productos - Arquitectura Limpia con Navegación Jerárquica
 * Principios SOLID aplicados
 */

// ==================== DOMAIN LAYER ====================

/**
 * Value Object - Representa una categoría principal
 */
class Category {
    constructor(value) {
        if (!value || typeof value !== 'string') {
            throw new Error('Category must be a non-empty string');
        }
        this._value = value.toLowerCase();
    }

    get value() {
        return this._value;
    }

    hasSubcategories() {
        return this._value === 'dorado';
    }

    matches(categoryValue) {
        return this._value === categoryValue.toLowerCase();
    }
}

/**
 * Value Object - Representa una subcategoría
 */
class Subcategory {
    constructor(value) {
        if (!value || typeof value !== 'string') {
            throw new Error('Subcategory must be a non-empty string');
        }
        this._value = value.toLowerCase();
    }

    get value() {
        return this._value;
    }

    matches(subcategoryValue) {
        return this._value === subcategoryValue.toLowerCase();
    }
}

/**
 * Entity - Representa un producto del catálogo
 */
class Product {
    constructor(element) {
        if (!(element instanceof HTMLElement)) {
            throw new Error('Product must be initialized with an HTMLElement');
        }
        this._element = element;
        this._category = element.dataset.category || '';
        this._subcategory = element.dataset.subcategory || '';
    }

    get category() {
        return this._category;
    }

    get subcategory() {
        return this._subcategory;
    }

    matchesFilter(category, subcategory = null) {
        const categoryMatches = category.matches(this._category);

        if (subcategory) {
            return categoryMatches && subcategory.matches(this._subcategory);
        }

        return categoryMatches;
    }

    show() {
        this._element.classList.remove('hidden');
        this._element.style.display = 'block';
    }

    hide() {
        this._element.classList.add('hidden');
        this._element.style.display = 'none';
    }
}

// ==================== APPLICATION LAYER ====================

/**
 * Use Case - Mostrar submenú para categorías con subcategorías
 */
class ShowSubmenuUseCase {
    constructor(submenuRepository) {
        this._submenuRepository = submenuRepository;
    }

    execute(category) {
        const allSubmenus = this._submenuRepository.getAll();

        // Ocultar todos los submenús
        allSubmenus.forEach(submenu => submenu.hide());

        // Mostrar submenú si la categoría tiene subcategorías
        if (category.hasSubcategories()) {
            const submenu = this._submenuRepository.getByCategory(category.value);
            if (submenu) {
                submenu.show();
            }
        }
    }
}

/**
 * Use Case - Filtrar productos por categoría y subcategoría
 */
class FilterProductsUseCase {
    constructor(productRepository) {
        this._productRepository = productRepository;
    }

    execute(category, subcategory = null) {
        const products = this._productRepository.getAll();

        products.forEach(product => {
            if (product.matchesFilter(category, subcategory)) {
                product.show();
            } else {
                product.hide();
            }
        });
    }
}

/**
 * Use Case - Gestionar estado activo de botones
 */
class ManageButtonStateUseCase {
    execute(buttons, activeButton, scope = 'main') {
        const relevantButtons = scope === 'sub'
            ? buttons.filter(btn => btn.classList.contains('filter-btn--sub'))
            : buttons.filter(btn => !btn.classList.contains('filter-btn--sub'));

        relevantButtons.forEach(button => button.classList.remove('active'));
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
}

/**
 * Use Case - Ocultar todos los productos
 */
class HideAllProductsUseCase {
    constructor(productRepository) {
        this._productRepository = productRepository;
    }

    execute() {
        const products = this._productRepository.getAll();
        products.forEach(product => product.hide());
    }
}

// ==================== INFRASTRUCTURE LAYER ====================

/**
 * Repository - Gestiona la colección de productos
 */
class ProductRepository {
    constructor(selector = '.product-card') {
        this._selector = selector;
        this._products = null;
    }

    getAll() {
        if (!this._products) {
            this._loadProducts();
        }
        return this._products;
    }

    _loadProducts() {
        const elements = document.querySelectorAll(this._selector);
        this._products = Array.from(elements).map(element => new Product(element));
    }

    refresh() {
        this._products = null;
        return this.getAll();
    }
}

/**
 * Repository - Gestiona botones de filtro principales
 */
class FilterButtonRepository {
    constructor(selector = '.filter-btn') {
        this._selector = selector;
    }

    getAll() {
        return Array.from(document.querySelectorAll(this._selector));
    }

    getMainButtons() {
        return this.getAll().filter(btn => !btn.classList.contains('filter-btn--sub'));
    }

    getSubButtons() {
        return this.getAll().filter(btn => btn.classList.contains('filter-btn--sub'));
    }
}

/**
 * Repository - Gestiona submenús
 */
class SubmenuRepository {
    constructor(selector = '.submenu') {
        this._selector = selector;
    }

    getAll() {
        const elements = document.querySelectorAll(this._selector);
        return Array.from(elements).map(el => ({
            element: el,
            category: el.id.replace('submenu-', ''),
            show: () => el.classList.remove('submenu--hidden'),
            hide: () => el.classList.add('submenu--hidden')
        }));
    }

    getByCategory(categoryValue) {
        const submenus = this.getAll();
        return submenus.find(submenu => submenu.category === categoryValue);
    }
}

// ==================== PRESENTATION LAYER ====================

/**
 * Controller - Maneja navegación jerárquica
 */
class HierarchicalNavigationController {
    constructor(
        showSubmenuUseCase,
        filterProductsUseCase,
        hideAllProductsUseCase,
        manageButtonStateUseCase,
        buttonRepository,
        submenuRepository
    ) {
        this._showSubmenuUseCase = showSubmenuUseCase;
        this._filterProductsUseCase = filterProductsUseCase;
        this._hideAllProductsUseCase = hideAllProductsUseCase;
        this._manageButtonStateUseCase = manageButtonStateUseCase;
        this._buttonRepository = buttonRepository;
        this._submenuRepository = submenuRepository;
        this._currentCategory = null;
    }

    initialize() {
        this._attachMainCategoryListeners();
        this._attachSubcategoryListeners();
        this._hideAllProductsUseCase.execute(); // Ocultar todos al inicio
    }

    _attachMainCategoryListeners() {
        const mainButtons = this._buttonRepository.getMainButtons();

        mainButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                this._handleMainCategoryClick(event.currentTarget, mainButtons);
            });
        });
    }

    _attachSubcategoryListeners() {
        const subButtons = this._buttonRepository.getSubButtons();

        subButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                this._handleSubcategoryClick(event.currentTarget, subButtons);
            });
        });
    }

    _handleMainCategoryClick(clickedButton, allButtons) {
        try {
            const categoryValue = clickedButton.dataset.filter;
            const category = new Category(categoryValue);

            this._currentCategory = category;
            this._manageButtonStateUseCase.execute(allButtons, clickedButton, 'main');

            if (category.hasSubcategories()) {
                // Mostrar submenú y ocultar productos
                this._showSubmenuUseCase.execute(category);
                this._hideAllProductsUseCase.execute();

                // Limpiar estado de botones de subcategoría
                const subButtons = this._buttonRepository.getSubButtons();
                this._manageButtonStateUseCase.execute(subButtons, null, 'sub');
            } else {
                // Ocultar todos los submenús
                const allSubmenus = this._submenuRepository.getAll();
                allSubmenus.forEach(submenu => submenu.hide());

                // Mostrar productos de esta categoría
                this._filterProductsUseCase.execute(category);
            }
        } catch (error) {
            console.error('Error handling main category click:', error);
        }
    }

    _handleSubcategoryClick(clickedButton, allButtons) {
        try {
            const categoryValue = clickedButton.dataset.category;
            const subcategoryValue = clickedButton.dataset.subcategory;

            const category = new Category(categoryValue);
            const subcategory = new Subcategory(subcategoryValue);

            this._manageButtonStateUseCase.execute(allButtons, clickedButton, 'sub');
            this._filterProductsUseCase.execute(category, subcategory);
        } catch (error) {
            console.error('Error handling subcategory click:', error);
        }
    }
}

/**
 * Application Bootstrap - Dependency Injection Container
 */
class CatalogApplication {
    static initialize() {
        // Repositories
        const productRepository = new ProductRepository();
        const buttonRepository = new FilterButtonRepository();
        const submenuRepository = new SubmenuRepository();

        // Use Cases
        const showSubmenuUseCase = new ShowSubmenuUseCase(submenuRepository);
        const filterProductsUseCase = new FilterProductsUseCase(productRepository);
        const hideAllProductsUseCase = new HideAllProductsUseCase(productRepository);
        const manageButtonStateUseCase = new ManageButtonStateUseCase();

        // Controller
        const navigationController = new HierarchicalNavigationController(
            showSubmenuUseCase,
            filterProductsUseCase,
            hideAllProductsUseCase,
            manageButtonStateUseCase,
            buttonRepository,
            submenuRepository
        );

        navigationController.initialize();
    }
}

// ==================== LIGHTBOX LAYER ====================

/**
 * Entity - Representa el lightbox del DOM
 * Single Responsibility: Solo gestiona mostrar/ocultar el lightbox
 */
class Lightbox {
    constructor(lightboxElement, imageElement) {
        this._lightbox = lightboxElement;
        this._image = imageElement;
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

/**
 * Controller - Maneja interacciones del lightbox
 * Dependency Inversion: depende de la abstracción Lightbox, no del DOM directamente
 */
class LightboxController {
    constructor(lightbox) {
        this._lightbox = lightbox;
    }

    initialize() {
        this._attachImageListeners();
        this._attachCloseListeners();
    }

    _attachImageListeners() {
        document.addEventListener('click', (event) => {
            const img = event.target.closest('.product-card img');
            if (img) {
                this._lightbox.open(img.src, img.alt);
            }
        });
    }

    _attachCloseListeners() {
        document.getElementById('lightbox-close')
            .addEventListener('click', () => this._lightbox.close());

        document.getElementById('lightbox')
            .addEventListener('click', (event) => {
                if (event.target === event.currentTarget) {
                    this._lightbox.close();
                }
            });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this._lightbox.close();
            }
        });
    }
}

/**
 * Bootstrap del Lightbox
 */
class LightboxApplication {
    static initialize() {
        const lightboxEl = document.getElementById('lightbox');
        const imageEl = document.getElementById('lightbox-image');

        const lightbox = new Lightbox(lightboxEl, imageEl);
        const controller = new LightboxController(lightbox);
        controller.initialize();
    }
}

// ==================== ENTRY POINT ====================

document.addEventListener('DOMContentLoaded', () => {
    CatalogApplication.initialize();
    LightboxApplication.initialize();
});

