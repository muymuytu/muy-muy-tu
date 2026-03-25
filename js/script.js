// Script para filtros del catálogo
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover clase active de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Agregar clase active al botón clickeado
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            productCards.forEach(card => {
                if (filterValue === 'all') {
                    card.classList.remove('hidden');
                    setTimeout(() => {
                        card.style.display = 'block';
                    }, 10);
                } else {
                    const category = card.getAttribute('data-category');
                    if (category === filterValue) {
                        card.classList.remove('hidden');
                        setTimeout(() => {
                            card.style.display = 'block';
                        }, 10);
                    } else {
                        card.classList.add('hidden');
                    }
                }
            });
        });
    });
});

