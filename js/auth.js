/**
 * ENCONTRE AQUI - JavaScript de Autenticação
 * Sistema completo de login, registro e recuperação de senha
 */

// Estado de autenticação
const authState = {
    isLoggedIn: false,
    user: null,
    token: localStorage.getItem('authToken') || null
};

// Configurações
const AUTH_CONFIG = {
    API_BASE_URL: '/api/auth',
    TOKEN_KEY: 'authToken',
    USER_KEY: 'authUser'
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

function initializeAuth() {
    checkAuthStatus();
    initializeForms();
    initializePasswordStrength();
    initializeVerificationCode();
    initializeSocialLogin();
}

/**
 * Verificação de status de autenticação
 */
function checkAuthStatus() {
    const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    const user = localStorage.getItem(AUTH_CONFIG.USER_KEY);
    
    if (token && user) {
        authState.isLoggedIn = true;
        authState.user = JSON.parse(user);
        authState.token = token;
        
        // Redirect if on auth page
        if (window.location.pathname.includes('login') || 
            window.location.pathname.includes('cadastro')) {
            window.location.href = '/';
        }
    }
}

/**
 * Inicialização dos formulários
 */
function initializeForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Forgot password form
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Reset password form
    const resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener('submit', handleResetPassword);
    }
    
    // Verification form
    const verificationForm = document.getElementById('verificationForm');
    if (verificationForm) {
        verificationForm.addEventListener('submit', handleVerification);
    }
}

/**
 * Sistema de Login
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    const remember = form.querySelector('#rememberMe')?.checked || false;
    
    // Validation
    if (!validateEmail(email)) {
        showFieldError('email', 'Por favor, insira um email válido');
        return;
    }
    
    if (!validatePassword(password)) {
        showFieldError('password', 'A senha deve ter pelo menos 6 caracteres');
        return;
    }
    
    try {
        showLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock successful login
        const response = {
            success: true,
            token: 'mock_jwt_token_' + Date.now(),
            user: {
                id: 1,
                email: email,
                name: 'João Silva',
                role: 'user'
            }
        };
        
        if (response.success) {
            // Store credentials
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.token);
            localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.user));
            
            // Update state
            authState.isLoggedIn = true;
            authState.user = response.user;
            authState.token = response.token;
            
            // Redirect
            window.location.href = '/';
        } else {
            throw new Error('Credenciais inválidas');
        }
        
    } catch (error) {
        showFormError('Erro ao fazer login: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Sistema de Registro
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        terms: formData.get('terms')
    };
    
    // Validation
    if (!validateRegistration(userData)) {
        return;
    }
    
    try {
        showLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock successful registration
        const response = {
            success: true,
            message: 'Registro realizado com sucesso!'
        };
        
        if (response.success) {
            // Send verification email
            sendVerificationEmail(userData.email);
            
            // Redirect to verification
            window.location.href = '/verificacao.html?email=' + encodeURIComponent(userData.email);
        }
        
    } catch (error) {
        showFormError('Erro ao registrar: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Recuperação de Senha
 */
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('#email').value;
    
    if (!validateEmail(email)) {
        showFieldError('email', 'Por favor, insira um email válido');
        return;
    }
    
    try {
        showLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock successful forgot password
        showSuccessMessage('Email de recuperação enviado! Verifique sua caixa de entrada.');
        
        // Redirect after 3 seconds
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 3000);
        
    } catch (error) {
        showFormError('Erro ao enviar email: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Reset de Senha
 */
async function handleResetPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const token = getQueryParam('token');
    const password = form.querySelector('#password').value;
    const confirmPassword = form.querySelector('#confirmPassword').value;
    
    if (!validatePasswordReset(password, confirmPassword)) {
        return;
    }
    
    try {
        showLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showSuccessMessage('Senha redefinida com sucesso!');
        
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 3000);
        
    } catch (error) {
        showFormError('Erro ao redefinir senha: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Verificação de Email
 */
async function handleVerification(e) {
    e.preventDefault();
    
    const form = e.target;
    const code = Array.from(form.querySelectorAll('.verification-input'))
        .map(input => input.value)
        .join('');
    
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
        showFormError('Por favor, insira um código válido de 6 dígitos');
        return;
    }
    
    try {
        showLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        showSuccessMessage('Email verificado com sucesso!');
        
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 3000);
        
    } catch (error) {
        showFormError('Código inválido ou expirado');
    } finally {
        showLoading(false);
    }
}

/**
 * Sistema de Força da Senha
 */
function initializePasswordStrength() {
    const passwordInputs = document.querySelectorAll('#password, #confirmPassword');
    
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrengthIndicator(strength);
        });
    });
}

function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    return strength;
}

function updatePasswordStrengthIndicator(strength) {
    const indicator = document.querySelector('.password-strength');
    if (!indicator) return;
    
    indicator.className = 'password-strength';
    
    if (strength <= 1) {
        indicator.classList.add('strength-weak');
    } else if (strength <= 3) {
        indicator.classList.add('strength-medium');
    } else {
        indicator.classList.add('strength-strong');
    }
}

/**
 * Código de Verificação
 */
function initializeVerificationCode() {
    const verificationInputs = document.querySelectorAll('.verification-input');
    
    verificationInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            if (e.target.value.length === 1) {
                if (index < verificationInputs.length - 1) {
                    verificationInputs[index + 1].focus();
                }
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && e.target.value === '') {
                if (index > 0) {
                    verificationInputs[index - 1].focus();
                }
            }
        });
    });
}

/**
 * Login Social
 */
function initializeSocialLogin() {
    const socialButtons = document.querySelectorAll('.social-login-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.dataset.provider;
            handleSocialLogin(provider);
        });
    });
}

async function handleSocialLogin(provider) {
    try {
        showLoading(true);
        
        // Simulate OAuth flow
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock successful social login
        const response = {
            success: true,
            token: 'social_jwt_token_' + Date.now(),
            user: {
                id: 1,
                email: 'user@example.com',
                name: 'Social User',
                role: 'user'
            }
        };
        
        if (response.success) {
            localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, response.token);
            localStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(response.user));
            
            window.location.href = '/';
        }
        
    } catch (error) {
        showFormError('Erro no login social: ' + error.message);
    } finally {
        showLoading(false);
    }
}

/**
 * Logout
 */
function logout() {
    localStorage.removeItem(AUTH_CONFIG.TOKEN_KEY);
    localStorage.removeItem(AUTH_CONFIG.USER_KEY);
    
    authState.isLoggedIn = false;
    authState.user = null;
    authState.token = null;
    
    window.location.href = '/login.html';
}

/**
 * Validações
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function validateRegistration(data) {
    let isValid = true;
    
    // Name validation
    if (!data.name || data.name.trim().length < 2) {
        showFieldError('name', 'Nome deve ter pelo menos 2 caracteres');
        isValid = false;
    }
    
    // Email validation
    if (!validateEmail(data.email)) {
        showFieldError('email', 'Por favor, insira um email válido');
        isValid = false;
    }
    
    // Phone validation
    if (!data.phone || data.phone.length < 10) {
        showFieldError('phone', 'Telefone inválido');
        isValid = false;
    }
    
    // Password validation
    if (!validatePassword(data.password)) {
        showFieldError('password', 'Senha deve ter pelo menos 6 caracteres');
        isValid = false;
    }
    
    // Password match validation
    if (data.password !== data.confirmPassword) {
        showFieldError('confirmPassword', 'As senhas não coincidem');
        isValid = false;
    }
    
    // Terms validation
    if (!data.terms) {
        showFieldError('terms', 'Você deve aceitar os termos e condições');
        isValid = false;
    }
    
    return isValid;
}

function validatePasswordReset(password, confirmPassword) {
    let isValid = true;
    
    if (!validatePassword(password)) {
        showFieldError('password', 'Senha deve ter pelo menos 6 caracteres');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'As senhas não coincidem');
        isValid = false;
    }
    
    return isValid;
}

/**
 * Utilitários
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function sendVerificationEmail(email) {
    // Simulate email sending
    console.log('Sending verification email to:', email);
}

function showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(fieldName + 'Error');
    
    if (field) {
        field.classList.add('is-invalid');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function showFormError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.querySelector('form');
    if (form) {
        form.insertBefore(alert, form.firstChild);
    }
}

function showSuccessMessage(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const form = document.querySelector('form');
    if (form) {
        form.insertBefore(alert, form.firstChild);
    }
}

function showLoading(show) {
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        if (show) {
            button.disabled = true;
            button.innerHTML = '<span class="loading"></span> Aguarde...';
        } else {
            button.disabled = false;
            button.innerHTML = button.dataset.originalText || 'Entrar';
        }
    });
}

// Store original button text
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        button.dataset.originalText = button.innerHTML;
    });
});

// Export functions
window.logout = logout;