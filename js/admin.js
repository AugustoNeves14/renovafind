/**
 * ENCONTRE AQUI - JavaScript Super Admin
 * Sistema completo de administração
 */

class AdminSystem {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filters = {};
        this.data = [];
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupSidebar();
        this.setupNavigation();
        this.setupDataTables();
        this.setupFilters();
        this.setupCharts();
        this.setupModals();
        this.loadInitialData();
    }

    /**
     * Sidebar e navegação
     */
    setupSidebar() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.admin-sidebar');
        const mainContent = document.querySelector('.admin-main');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            });
        }
        
        // Menu items
        const menuItems = document.querySelectorAll('.sidebar-nav .nav-link');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.dataset.target;
                this.navigateToSection(target);
            });
        });
    }

    setupNavigation() {
        // Handle navigation based on URL
        const currentPath = window.location.pathname;
        this.highlightActiveMenu(currentPath);
    }

    highlightActiveMenu(path) {
        const menuItems = document.querySelectorAll('.sidebar-nav .nav-link');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.href && item.href.includes(path)) {
                item.classList.add('active');
            }
        });
    }

    navigateToSection(section) {
        // Update URL without reload
        window.history.pushState({}, '', `/super-admin/${section}`);
        this.loadSectionContent(section);
    }

    /**
     * Carregamento de dados
     */
    async loadInitialData() {
        try {
            this.showLoading(true);
            
            // Load dashboard data
            await this.loadDashboardData();
            
            // Load lists
            await Promise.all([
                this.loadProvinces(),
                this.loadMunicipalities(),
                this.loadCategories(),
                this.loadSpaces(),
                this.loadOwners()
            ]);
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showError('Erro ao carregar dados');
        } finally {
            this.showLoading(false);
        }
    }

    async loadDashboardData() {
        // Mock dashboard data
        const dashboardData = {
            totalSpaces: 1250,
            activeSpaces: 1180,
            inactiveSpaces: 70,
            totalOwners: 450,
            activeOwners: 420,
            totalReviews: 8900,
            averageRating: 4.6,
            monthlyGrowth: 15.3,
            dailyVisits: 2500
        };
        
        this.updateDashboardCards(dashboardData);
        this.updateCharts(dashboardData);
    }

    updateDashboardCards(data) {
        const cards = {
            totalSpaces: document.getElementById('totalSpaces'),
            activeSpaces: document.getElementById('activeSpaces'),
            totalOwners: document.getElementById('totalOwners'),
            totalReviews: document.getElementById('totalReviews'),
            averageRating: document.getElementById('averageRating'),
            dailyVisits: document.getElementById('dailyVisits')
        };
        
        Object.keys(cards).forEach(key => {
            if (cards[key]) {
                const counter = cards[key].querySelector('.counter');
                if (counter) {
                    this.animateCounter(counter, data[key]);
                }
            }
        });
    }

    animateCounter(element, targetValue) {
        let current = 0;
        const increment = targetValue / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                element.textContent = targetValue.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
        }, 20);
    }

    /**
     * Tabelas de dados
     */
    setupDataTables() {
        // Initialize DataTables
        const tables = document.querySelectorAll('.admin-table');
        tables.forEach(table => {
            this.initializeTable(table);
        });
    }

    initializeTable(table) {
        const tableBody = table.querySelector('tbody');
        if (!tableBody) return;
        
        // Add sorting functionality
        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.sort;
                const direction = header.dataset.direction === 'asc' ? 'desc' : 'asc';
                this.sortTable(table, column, direction);
                
                // Update header
                headers.forEach(h => h.classList.remove('sort-asc', 'sort-desc'));
                header.classList.add(direction === 'asc' ? 'sort-asc' : 'sort-desc');
                header.dataset.direction = direction;
            });
        });
    }

    sortTable(table, column, direction) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aValue = a.querySelector(`[data-${column}]`).dataset[column];
            const bValue = b.querySelector(`[data-${column}]`).dataset[column];
            
            let comparison = 0;
            if (aValue > bValue) {
                comparison = 1;
            } else if (aValue < bValue) {
                comparison = -1;
            }
            
            return direction === 'desc' ? comparison * -1 : comparison;
        });
        
        rows.forEach(row => tbody.appendChild(row));
    }

    /**
     * Sistema de filtros
     */
    setupFilters() {
        const filterInputs = document.querySelectorAll('.filter-input');
        filterInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.debounce(this.applyFilters.bind(this), 300)(e.target.value);
            });
        });
        
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                this.applyFilters();
            });
        });
    }

    applyFilters() {
        const filters = {};
        
        // Get all filter values
        document.querySelectorAll('.filter-input').forEach(input => {
            if (input.value) {
                filters[input.name] = input.value;
            }
        });
        
        document.querySelectorAll('.filter-select').forEach(select => {
            if (select.value) {
                filters[select.name] = select.value;
            }
        });
        
        this.filters = filters;
        this.filterData();
    }

    filterData() {
        let filteredData = [...this.data];
        
        Object.keys(this.filters).forEach(key => {
            const value = this.filters[key];
            if (value) {
                filteredData = filteredData.filter(item => 
                    item[key] && item[key].toString().toLowerCase().includes(value.toLowerCase())
                );
            }
        });
        
        this.renderData(filteredData);
    }

    /**
     * Renderização de dados
     */
    renderData(data) {
        const tableBody = document.querySelector('.admin-table tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        data.forEach(item => {
            const row = this.createTableRow(item);
            tableBody.appendChild(row);
        });
        
        this.updatePagination(data.length);
    }

    createTableRow(item) {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        
        // Common columns
        row.innerHTML = `
            <td>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${item.id}">
                </div>
            </td>
            <td data-id="${item.id}">${item.id}</td>
            <td data-name="${item.name}">${item.name}</td>
            <td data-email="${item.email}">${item.email}</td>
            <td data-status="${item.status}">
                <span class="status-badge status-${item.status}">${item.status}</span>
            </td>
            <td data-date="${item.createdAt}">${this.formatDate(item.createdAt)}</td>
            <td>
                <div class="admin-actions">
                    <button class="btn btn-sm btn-primary" onclick="admin.editItem(${item.id})">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteItem(${item.id})">
                        <i class="material-icons">delete</i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="admin.viewDetails(${item.id})">
                        <i class="material-icons">visibility</i>
                    </button>
                </div>
            </td>
        `;
        
        return row;
    }

    /**
     * CRUD Operations
     */
    async createItem(type, data) {
        try {
            this.showLoading(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Mock creation
            const newItem = {
                id: Date.now(),
                ...data,
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            
            this.data.push(newItem);
            this.renderData(this.data);
            
            this.showSuccess(`${type} criado com sucesso!`);
            
        } catch (error) {
            this.showError(`Erro ao criar ${type}: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    async editItem(id) {
        const item = this.data.find(i => i.id === id);
        if (!item) return;
        
        // Open edit modal
        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
        
        // Populate form
        this.populateEditForm(item);
    }

    async updateItem(type, id, data) {
        try {
            this.showLoading(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const index = this.data.findIndex(i => i.id === id);
            if (index !== -1) {
                this.data[index] = { ...this.data[index], ...data };
                this.renderData(this.data);
                this.showSuccess(`${type} atualizado com sucesso!`);
            }
            
        } catch (error) {
            this.showError(`Erro ao atualizar ${type}: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    async deleteItem(id) {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;
        
        try {
            this.showLoading(true);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.data = this.data.filter(i => i.id !== id);
            this.renderData(this.data);
            
            this.showSuccess('Item excluído com sucesso!');
            
        } catch (error) {
            this.showError('Erro ao excluir item: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Gráficos e visualizações
     */
    setupCharts() {
        // Initialize Chart.js
        this.createCharts();
    }

    createCharts() {
        // Growth chart
        const growthCtx = document.getElementById('growthChart');
        if (growthCtx) {
            new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                    datasets: [{
                        label: 'Novos estabelecimentos',
                        data: [12, 19, 15, 25, 22, 30],
                        borderColor: '#F52F57',
                        backgroundColor: 'rgba(245, 47, 87, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Categories chart
        const categoriesCtx = document.getElementById('categoriesChart');
        if (categoriesCtx) {
            new Chart(categoriesCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Restaurantes', 'Lanchonetes', 'Bares', 'Cafés'],
                    datasets: [{
                        data: [450, 320, 280, 200],
                        backgroundColor: ['#F52F57', '#667eea', '#764ba2', '#f093fb']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    /**
     * Utilitários
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showLoading(show) {
        const loader = document.getElementById('adminLoading');
        if (loader) {
            loader.style.display = show ? 'block' : 'none';
        }
    }

    showError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.admin-main');
        if (container) {
            container.insertBefore(alert, container.firstChild);
        }
        
        setTimeout(() => alert.remove(), 5000);
    }

    showSuccess(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.admin-main');
        if (container) {
            container.insertBefore(alert, container.firstChild);
        }
        
        setTimeout(() => alert.remove(), 5000);
    }

    /**
     * Carregamento de listas específicas
     */
    async loadProvinces() {
        // Mock data - replace with API call
        const provinces = [
            { id: 1, name: 'São Paulo', code: 'SP' },
            { id: 2, name: 'Rio de Janeiro', code: 'RJ' },
            { id: 3, name: 'Minas Gerais', code: 'MG' }
        ];
        
        this.renderProvinces(provinces);
    }

    async loadMunicipalities() {
        // Mock data - replace with API call
        const municipalities = [
            { id: 1, name: 'São Paulo', province: 'SP' },
            { id: 2, name: 'Rio de Janeiro', province: 'RJ' },
            { id: 3, name: 'Belo Horizonte', province: 'MG' }
        ];
        
        this.renderMunicipalities(municipalities);
    }

    async loadCategories() {
        // Mock data - replace with API call
        const categories = [
            { id: 1, name: 'Restaurantes', description: 'Estabelecimentos de alimentação completa' },
            { id: 2, name: 'Lanchonetes', description: 'Estabelecimentos de lanches rápidos' },
            { id: 3, name: 'Bares', description: 'Estabelecimentos de bebidas e petiscos' }
        ];
        
        this.renderCategories(categories);
    }

    async loadSpaces() {
        // Mock data - replace with API call
        const spaces = [
            {
                id: 1,
                name: 'Restaurante Sabor Brasileiro',
                email: 'contato@saborbrasileiro.com',
                status: 'active',
                createdAt: '2024-01-15'
            },
            {
                id: 2,
                name: 'Lanchonete Doce Sabor',
                email: 'contato@docesabor.com',
                status: 'active',
                createdAt: '2024-01-20'
            }
        ];
        
        this.data = spaces;
        this.renderData(spaces);
    }

    async loadOwners() {
        // Mock data - replace with API call
        const owners = [
            { id: 1, name: 'João Silva', email: 'joao@example.com', status: 'active' },
            { id: 2, name: 'Maria Santos', email: 'maria@example.com', status: 'suspended' }
        ];
        
        this.renderOwners(owners);
    }

    renderProvinces(provinces) {
        const container = document.getElementById('provincesList');
        if (!container) return;
        
        container.innerHTML = '';
        provinces.forEach(province => {
            const item = this.createProvinceItem(province);
            container.appendChild(item);
        });
    }

    renderMunicipalities(municipalities) {
        const container = document.getElementById('municipalitiesList');
        if (!container) return;
        
        container.innerHTML = '';
        municipalities.forEach(municipality => {
            const item = this.createMunicipalityItem(municipality);
            container.appendChild(item);
        });
    }

    renderCategories(categories) {
        const container = document.getElementById('categoriesList');
        if (!container) return;
        
        container.innerHTML = '';
        categories.forEach(category => {
            const item = this.createCategoryItem(category);
            container.appendChild(item);
        });
    }

    renderOwners(owners) {
        const container = document.getElementById('ownersList');
        if (!container) return;
        
        container.innerHTML = '';
        owners.forEach(owner => {
            const item = this.createOwnerItem(owner);
            container.appendChild(item);
        });
    }

    createProvinceItem(province) {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>${province.name}</h6>
                    <small class="text-muted">${province.code}</small>
                </div>
                <div class="admin-actions">
                    <button class="btn btn-sm btn-primary" onclick="admin.editProvince(${province.id})">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteProvince(${province.id})">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </div>
        `;
        return div;
    }

    createMunicipalityItem(municipality) {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>${municipality.name}</h6>
                    <small class="text-muted">${municipality.province}</small>
                </div>
                <div class="admin-actions">
                    <button class="btn btn-sm btn-primary" onclick="admin.editMunicipality(${municipality.id})">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteMunicipality(${municipality.id})">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </div>
        `;
        return div;
    }

    createCategoryItem(category) {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>${category.name}</h6>
                    <small class="text-muted">${category.description}</small>
                </div>
                <div class="admin-actions">
                    <button class="btn btn-sm btn-primary" onclick="admin.editCategory(${category.id})">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="admin.deleteCategory(${category.id})">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </div>
        `;
        return div;
    }

    createOwnerItem(owner) {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>${owner.name}</h6>
                    <small class="text-muted">${owner.email}</small>
                </div>
                <div class="admin-actions">
                    <button class="btn btn-sm btn-${owner.status === 'active' ? 'warning' : 'success'}" 
                            onclick="admin.toggleOwnerStatus(${owner.id})">
                        <i class="material-icons">${owner.status === 'active' ? 'block' : 'check'}</i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="admin.viewOwnerDetails(${owner.id})">
                        <i class="material-icons">visibility</i>
                    </button>
                </div>
            </div>
        `;
        return div;
    }
}

// Initialize admin system
document.addEventListener('DOMContentLoaded', function() {
    window.admin = new AdminSystem();
});