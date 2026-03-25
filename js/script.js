/**
 * Catálogo de Productos - Arquitectura Limpia
 * Principios SOLID aplicados
 */

// ==================== DOMAIN LAYER ====================

/**
 * Value Object - Representa una categoría de filtro
 */
class FilterCategory {
    constructor(value) {
        if (!value || typeof value !== 'string') {
            throw new Error('Filter category must be a non-empty string');
        }
        this._value = value.toLowerCase();
    }

    get value() {
        return this._value;
    }

    isAll() {
        return this._value === 'all';
    }

    matches(category) {
        return this.isAll() || this._value === category.toLowerCase();
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
    }

    get category() {
        return this._category;
    }

    get element() {
        return this._element;
    }

    matchesFilter(filterCategory) {
        return filterCategory.matches(this._category);
    }

    show() {
        this._element.classList.remove('hidden');
        this._element.style.display = 'block';
    }

    hide() {
        this._element.classList.add('hidden');
    }
}

// ==================== APPLICATION LAYER ====================

/**
 * Use Case - Filtrar productos por categoría
 * Single Responsibility: Solo se encarga de la lógica de filtrado
 */
class FilterProductsUseCase {
    constructor(productRepository) {
        this._productRepository = productRepository;
    }

    execute(filterCategory) {
        const products = this._productRepository.getAll();

        products.forEach(product => {
            if (product.matchesFilter(filterCategory)) {
                product.show();
            } else {
                product.hide();
            }
        });
    }
}

/**
 * Use Case - Gestionar estado activo de filtros
 * Single Responsibility: Solo gestiona el estado visual de los botones
 */
class ManageFilterStateUseCase {
    execute(buttons, activeButton) {
        buttons.forEach(button => button.classList.remove('active'));
        activeButton.classList.add('active');
    }
}

// ==================== INFRASTRUCTURE LAYER ====================

/**
 * Repository - Gestiona la colección de productos
 * Single Responsibility: Encapsula el acceso a los productos del DOM
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
 * Repository - Gestiona la colección de botones de filtro
 */
class FilterButtonRepository {
    constructor(selector = '.filter-btn') {
        this._selector = selector;
    }

    getAll() {
        return Array.from(document.querySelectorAll(this._selector));
    }
}

// ==================== PRESENTATION LAYER ====================

/**
 * Controller - Maneja la interacción del usuario con los filtros
 * Dependency Inversion: Depende de abstracciones (use cases) no de implementaciones
 */
class FilterController {
    constructor(
        filterProductsUseCase,
        manageFilterStateUseCase,
        buttonRepository
    ) {
        this._filterProductsUseCase = filterProductsUseCase;
        this._manageFilterStateUseCase = manageFilterStateUseCase;
        this._buttonRepository = buttonRepository;
    }

    initialize() {
        const buttons = this._buttonRepository.getAll();

        buttons.forEach(button => {
            button.addEventListener('click', (event) => {
                this._handleFilterClick(event.currentTarget, buttons);
            });
        });
    }

    _handleFilterClick(clickedButton, allButtons) {
        try {
            const filterValue = clickedButton.dataset.filter;
            const filterCategory = new FilterCategory(filterValue);

            this._manageFilterStateUseCase.execute(allButtons, clickedButton);
            this._filterProductsUseCase.execute(filterCategory);
        } catch (error) {
            console.error('Error filtering products:', error);
        }
    }
}

/**
 * Application Bootstrap - Dependency Injection Container
 * Open/Closed Principle: Abierto para extensión, cerrado para modificación
 */
class CatalogApplication {
    static initialize() {
        // Dependency Injection - Inyección de dependencias
        const productRepository = new ProductRepository();
        const buttonRepository = new FilterButtonRepository();

        const filterProductsUseCase = new FilterProductsUseCase(productRepository);
        const manageFilterStateUseCase = new ManageFilterStateUseCase();

        const filterController = new FilterController(
            filterProductsUseCase,
            manageFilterStateUseCase,
            buttonRepository
        );

        filterController.initialize();
    }
}

// ==================== ENTRY POINT ====================

document.addEventListener('DOMContentLoaded', () => {
    CatalogApplication.initialize();
});

