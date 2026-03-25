# Arquitectura del Proyecto muy-muy-tu

## 📐 Principios Aplicados

### SOLID Principles

#### 1. **Single Responsibility Principle (SRP)**
- Cada clase tiene una única responsabilidad:
  - `FilterCategory`: Maneja la lógica de categoría de filtro
  - `Product`: Representa un producto individual
  - `FilterProductsUseCase`: Solo filtra productos
  - `ManageFilterStateUseCase`: Solo gestiona estado UI de botones
  - `ProductRepository`: Solo gestiona acceso a productos del DOM
  - `FilterController`: Solo coordina interacciones del usuario

#### 2. **Open/Closed Principle (OCP)**
- El código está abierto para extensión, cerrado para modificación
- Nuevos tipos de productos o filtros pueden agregarse sin modificar código existente
- `CatalogApplication` usa inyección de dependencias para facilitar extensiones

#### 3. **Liskov Substitution Principle (LSP)**
- Las abstracciones pueden ser reemplazadas por sus implementaciones
- Los repositorios pueden intercambiarse sin afectar la lógica de negocio

#### 4. **Interface Segregation Principle (ISP)**
- Las clases solo exponen métodos que son necesarios
- No hay interfaces infladas o métodos innecesarios

#### 5. **Dependency Inversion Principle (DIP)**
- Las capas superiores dependen de abstracciones, no de implementaciones concretas
- `FilterController` depende de casos de uso, no de implementaciones del DOM
- La inyección de dependencias se realiza en `CatalogApplication`

---

## 🏗️ Arquitectura en Capas (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (Controllers - UI Interaction)                              │
│  - FilterController                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓ depends on
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  (Use Cases - Business Logic)                                │
│  - FilterProductsUseCase                                     │
│  - ManageFilterStateUseCase                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ depends on
┌─────────────────────────────────────────────────────────────┐
│                      DOMAIN LAYER                            │
│  (Entities & Value Objects - Core Business)                  │
│  - Product (Entity)                                          │
│  - FilterCategory (Value Object)                             │
└─────────────────────────────────────────────────────────────┘
                            ↑ used by
┌─────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│  (External Concerns - Data Access)                           │
│  - ProductRepository                                         │
│  - FilterButtonRepository                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Proyecto

```
muy-muy-tu/
├── index.html              # Vista principal (Semantic HTML5 + ARIA)
├── css/
│   └── style.css          # Estilos modulares (BEM + CSS Variables)
├── js/
│   └── script.js          # Lógica de negocio (Clean Architecture + SOLID)
├── images/
│   ├── dorado/
│   │   ├── grandes/
│   │   ├── pequeños/
│   │   └── tuerca/
│   ├── plateado/
│   ├── collares/
│   └── anillos/
├── README.md              # Documentación del usuario
└── ARCHITECTURE.md        # Documentación técnica (este archivo)
```

---

## 🎨 CSS - Metodología BEM

### Bloques (Blocks)
- `.header`, `.nav`, `.product-card`, `.footer`

### Elementos (Elements)
- `.header__title`, `.header__subtitle`
- `.product-card__image`, `.product-card__info`, `.product-card__title`

### Modificadores (Modifiers)
- `.filter-btn--active`, `.product-card--hidden`

### Design Tokens (CSS Custom Properties)
Todas las variables están centralizadas en `:root` para facilitar:
- Mantenimiento
- Theming
- Consistencia
- Escalabilidad

---

## 🔄 Flujo de Datos

```
Usuario hace clic en botón
        ↓
FilterController.handleFilterClick()
        ↓
ManageFilterStateUseCase.execute() → Actualiza UI de botones
        ↓
FilterProductsUseCase.execute() → Filtra productos
        ↓
ProductRepository.getAll() → Obtiene productos
        ↓
Product.matchesFilter() → Verifica cada producto
        ↓
Product.show() / Product.hide() → Actualiza DOM
```

---

## ✅ Mejores Prácticas Implementadas

### JavaScript
- ✅ Separación de capas (Domain, Application, Infrastructure, Presentation)
- ✅ Inyección de dependencias
- ✅ Inmutabilidad en Value Objects
- ✅ Encapsulación con propiedades privadas (`_variable`)
- ✅ Error handling con try-catch
- ✅ Comentarios descriptivos y documentación
- ✅ Nombres descriptivos y claros

### CSS
- ✅ Metodología BEM para nomenclatura
- ✅ CSS Custom Properties (Variables CSS)
- ✅ Mobile First approach
- ✅ Grid y Flexbox para layouts modernos
- ✅ Separación de concerns (tokens, componentes, utilities)
- ✅ Sistema de espaciado consistente (8px grid)
- ✅ Tipografía escalable
- ✅ Accesibilidad (focus states, contrast)

### HTML
- ✅ HTML5 semántico (`header`, `nav`, `main`, `article`, `figure`, `footer`)
- ✅ ARIA labels para accesibilidad
- ✅ Atributos `role` apropiados
- ✅ Meta tags para SEO
- ✅ Lazy loading de imágenes
- ✅ Atributos width/height para evitar layout shift
- ✅ Script con `defer` para optimización de carga

---

## 🔮 Extensibilidad Futura

### Fácil de Extender
1. **Agregar nuevo tipo de filtro**: Solo agregar botón en HTML y producto con `data-category`
2. **Agregar ordenamiento**: Crear `SortProductsUseCase`
3. **Agregar búsqueda**: Crear `SearchProductsUseCase`
4. **Agregar carrito**: Crear `CartManager` y `AddToCartUseCase`
5. **Agregar persistencia**: Crear `LocalStorageRepository` o `ApiRepository`

### Testeable
- Cada clase puede testearse de forma aislada
- Las dependencias pueden mockearse fácilmente
- La separación de capas facilita unit testing

---

## 🚀 Comandos Git

```bash
# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "refactor: aplicar arquitectura limpia y principios SOLID"

# Push a repositorio remoto
git push
```

---

## 📚 Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [BEM Methodology](http://getbem.com/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [ARIA - Accessibility](https://www.w3.org/WAI/ARIA/apg/)

---

**Autor**: muy-muy-tu  
**Fecha**: 2026  
**Versión**: 2.0.0

