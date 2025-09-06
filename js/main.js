/**
 * ENCONTRE AQUI - JavaScript Principal
 * Sistema completo de busca e descoberta de estabelecimentos
 */

// Configurações globais
const CONFIG = {
    API_BASE_URL: '/api',
    ITEMS_PER_PAGE: 12,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300
};

// Estado global da aplicação
const state = {
    currentPage: 1,
    filters: {
        category: '',
        location: '',
        rating: '',
        price: ''
    },
    searchQuery: '',
    savedSpaces: JSON.parse(localStorage.getItem('savedSpaces')) || [],
    userLocation: null
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    initializeNavbar();
    initializeCards();
    initializeSearch();
    initializeFilters();
    initializeModals();
    initializeAnimations();
    initializeLocation();
    loadInitialData();
}

/**
 * Navbar e Menu Hamburguer
 */
function initializeNavbar() {
    const navbar = document.querySelector('.navbar');
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Menu hamburguer animation
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            this.classList.toggle('active');
            if (navbarCollapse) {
                navbarCollapse.classList.toggle('show');
            }
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navbar.contains(e.target) && navbarCollapse.classList.contains('show')) {
            navbarCollapse.classList.remove('show');
            navbarToggler.classList.remove('active');
        }
    });
}

/**
 * Cards 3D e Interações
 */
function initializeCards() {
    const cards = document.querySelectorAll('.card-3d');
    
    cards.forEach(card => {
        // 3D hover effect
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
        
        // Touch events for mobile
        card.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        });
        
        card.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        });
    });
}

/**
 * Sistema de Busca
 */
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    
    if (searchInput) {
        // Debounced search
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                state.searchQuery = this.value.trim();
                performSearch();
            }, CONFIG.DEBOUNCE_DELAY);
        });
        
        // Search on enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                state.searchQuery = this.value.trim();
                performSearch();
            }
        });
    }
    
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
}

function performSearch() {
    const query = state.searchQuery.toLowerCase();
    const cards = document.querySelectorAll('.card-3d');
    
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const description = card.querySelector('.card-text').textContent.toLowerCase();
        const location = card.dataset.location ? card.dataset.location.toLowerCase() : '';
        
        if (title.includes(query) || description.includes(query) || location.includes(query)) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });
    
    updateResultsCount();
}

/**
 * Filtros Interativos
 */
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    
    // Category filters
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.dataset.filter;
            const type = this.dataset.type;
            
            // Update active state
            document.querySelectorAll(`[data-type="${type}"]`).forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // Apply filter
            state.filters[type] = filter;
            applyFilters();
        });
    });
    
    // Dropdown filters
    filterDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', function() {
            const type = this.dataset.type;
            state.filters[type] = this.value;
            applyFilters();
        });
    });
}

function applyFilters() {
    const cards = document.querySelectorAll('.card-3d');
    
    cards.forEach(card => {
        let visible = true;
        
        // Check category
        if (state.filters.category && card.dataset.category !== state.filters.category) {
            visible = false;
        }
        
        // Check location
        if (state.filters.location && !card.dataset.location.includes(state.filters.location)) {
            visible = false;
        }
        
        // Check rating
        if (state.filters.rating && parseFloat(card.dataset.rating) < parseFloat(state.filters.rating)) {
            visible = false;
        }
        
        // Apply visibility
        if (visible) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });
    
    updateResultsCount();
}

/**
 * Modais e Dialogs
 */
function initializeModals() {
    // Bootstrap modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('shown.bs.modal', function() {
            // Focus first input
            const firstInput = this.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        });
    });
    
    // Custom modal triggers
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-bs-toggle="modal"]')) {
            const target = e.target.dataset.bsTarget;
            const modal = new bootstrap.Modal(document.querySelector(target));
            modal.show();
        }
    });
}

/**
 * Animações e Efeitos Visuais
 */
function initializeAnimations() {
    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
    
    // Counter animations
    animateCounters();
}

function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        const increment = target / 100;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 20);
    });
}

/**
 * Geolocalização
 */
function initializeLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                state.userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                calculateDistances();
            },
            error => {
                console.warn('Geolocation error:', error);
            }
        );
    }
}

function calculateDistances() {
    if (!state.userLocation) return;
    
    const cards = document.querySelectorAll('.card-3d');
    cards.forEach(card => {
        const location = card.dataset.location;
        if (location) {
            const distance = calculateDistance(state.userLocation, parseLocation(location));
            const distanceElement = card.querySelector('.distance');
            if (distanceElement) {
                distanceElement.textContent = `${distance} km`;
            }
        }
    });
}

function parseLocation(locationString) {
    // Parse location string to lat/lng
    // This is a placeholder - implement based on your data format
    return { lat: 0, lng: 0 };
}

function calculateDistance(loc1, loc2) {
    // Haversine formula
    const R = 6371;
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

/**
 * Carregamento de Dados
 */
async function loadInitialData() {
    try {
        showLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Load initial spaces
        loadSpaces();
        
        // Load saved spaces
        loadSavedSpaces();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
        showLoading(false);
    }
}

function loadSpaces() {
    const container = document.getElementById('spacesContainer');
    if (!container) return;
    
    // Clear existing
    container.innerHTML = '';
    
    // Load spaces (mock data - replace with API call)
    const spaces = generateMockSpaces();
    
    spaces.forEach(space => {
        const card = createSpaceCard(space);
        container.appendChild(card);
    });
}

function generateMockSpaces() {
    return [
        {
            id: 1,
            name: 'Restaurante Sabor Brasileiro',
            category: 'restaurante',
            image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
            description: 'Autêntica culinária brasileira em ambiente acolhedor',
            rating: 4.8,
            location: 'Centro, São Paulo',
            price: '$$$',
            tags: ['Patrocinado', 'Tendência'],
            isSaved: false
        },
        {
            id: 2,
            name: 'Lanchonete Doce Sabor',
            category: 'lanchonete',
            image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
            description: 'Os melhores lanches e sobremesas da cidade',
            rating: 4.5,
            location: 'Jardins, São Paulo',
            price: '$$',
            tags: ['Promoção'],
            isSaved: true
        }
    ];
}

function createSpaceCard(space) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 fade-in';
    card.innerHTML = `
        <div class="card-3d" data-id="${space.id}" data-category="${space.category}" 
             data-rating="${space.rating}" data-location="${space.location}">
            <img src="${space.image}" class="card-img-top" alt="${space.name}">
            ${space.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            <div class="card-body">
                <h5 class="card-title">${space.name}</h5>
                <p class="card-text">${space.description}</p>
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="rating">
                        ${generateStars(space.rating)}
                    </span>
                    <span class="distance">2.5 km</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="price">${space.price}</span>
                    <button class="btn-save" onclick="toggleSave(${space.id})">
                        <i class="material-icons">${space.isSaved ? 'favorite' : 'favorite_border'}</i>
                    </button>
                </div>
                <button class="btn btn-custom mt-3 w-100" onclick="viewDetails(${space.id})">
                    Ver Detalhes
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="material-icons">star</i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="material-icons">star_half</i>';
    }
    
    return stars;
}

/**
 * Utilitários
 */
function toggleSave(spaceId) {
    const index = state.savedSpaces.indexOf(spaceId);
    
    if (index > -1) {
        state.savedSpaces.splice(index, 1);
    } else {
        state.savedSpaces.push(spaceId);
    }
    
    localStorage.setItem('savedSpaces', JSON.stringify(state.savedSpaces));
    
    // Update UI
    const button = document.querySelector(`[onclick="toggleSave(${spaceId})"]`);
    if (button) {
        const icon = button.querySelector('i');
        icon.textContent = index > -1 ? 'favorite_border' : 'favorite';
    }
    
    showToast(index > -1 ? 'Removido dos salvos' : 'Adicionado aos salvos');
}

function viewDetails(spaceId) {
    // Navigate to details page
    window.location.href = `detalhes-restaurante.html?id=${spaceId}`;
}

function updateResultsCount() {
    const visibleCards = document.querySelectorAll('.card-3d[style="display: block"]');
    const countElement = document.getElementById('resultsCount');
    
    if (countElement) {
        countElement.textContent = `${visibleCards.length} resultado${visibleCards.length !== 1 ? 's' : ''}`;
    }
}

function showLoading(show) {
    const loader = document.getElementById('loadingSpinner');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.insertBefore(alert, document.body.firstChild);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
        <div class="toast-header">
            <strong class="me-auto">Encontre Aqui</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Export functions for global use
window.toggleSave = toggleSave;
window.viewDetails = viewDetails;