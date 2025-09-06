/**
 * ENCONTRE AQUI - Sistema de Validações
 * Validações completas para formulários e campos
 */

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.errors = {};
        this.rules = {};
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.setupRealTimeValidation();
    }

    /**
     * Adicionar regras de validação
     */
    addRule(fieldName, rules) {
        this.rules[fieldName] = rules;
    }

    /**
     * Validação em tempo real
     */
    setupRealTimeValidation() {
        Object.keys(this.rules).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                // Validate on blur
                field.addEventListener('blur', () => this.validateField(fieldName));
                
                // Clear error on input
                field.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });
    }

    /**
     * Validação de campo individual
     */
    validateField(fieldName) {
        const field = document.getElementById(fieldName);
        const rules = this.rules[fieldName];
        
        if (!field || !rules) return true;
        
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (rules.required && !value) {
            isValid = false;
            errorMessage = rules.required.message || 'Este campo é obrigatório';
        }
        
        // Email validation
        if (rules.email && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = rules.email.message || 'Email inválido';
        }
        
        // Phone validation
        if (rules.phone && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = rules.phone.message || 'Telefone inválido';
        }
        
        // CPF validation
        if (rules.cpf && value && !this.isValidCPF(value)) {
            isValid = false;
            errorMessage = rules.cpf.message || 'CPF inválido';
        }
        
        // CNPJ validation
        if (rules.cnpj && value && !this.isValidCNPJ(value)) {
            isValid = false;
            errorMessage = rules.cnpj.message || 'CNPJ inválido';
        }
        
        // Min length validation
        if (rules.minLength && value && value.length < rules.minLength.value) {
            isValid = false;
            errorMessage = rules.minLength.message || `Mínimo ${rules.minLength.value} caracteres`;
        }
        
        // Max length validation
        if (rules.maxLength && value && value.length > rules.maxLength.value) {
            isValid = false;
            errorMessage = rules.maxLength.message || `Máximo ${rules.maxLength.value} caracteres`;
        }
        
        // Pattern validation
        if (rules.pattern && value && !rules.pattern.value.test(value)) {
            isValid = false;
            errorMessage = rules.pattern.message || 'Formato inválido';
        }
        
        // Custom validation
        if (rules.custom && value) {
            const result = rules.custom.validator(value);
            if (!result.valid) {
                isValid = false;
                errorMessage = result.message || 'Valor inválido';
            }
        }
        
        // Display error
        if (!isValid) {
            this.showFieldError(fieldName, errorMessage);
        } else {
            this.clearFieldError(fieldName);
        }
        
        return isValid;
    }

    /**
     * Validação do formulário completo
     */
    validateForm() {
        let isValid = true;
        this.errors = {};
        
        Object.keys(this.rules).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        // Custom form validation
        if (this.customValidation) {
            const customResult = this.customValidation();
            if (!customResult.valid) {
                isValid = false;
                this.showFormError(customResult.message);
            }
        }
        
        return isValid;
    }

    /**
     * Manipulador de submit
     */
    handleSubmit(e) {
        e.preventDefault();
        
        if (this.validateForm()) {
            this.onSuccess();
        } else {
            this.onError();
        }
    }

    /**
     * Validadores específicos
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    isValidPhone(phone) {
        // Remove all non-digits
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Brazilian phone validation
        return cleanPhone.length >= 10 && cleanPhone.length <= 11;
    }

    isValidCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
            return false;
        }
        
        // Validate first digit
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let firstDigit = 11 - (sum % 11);
        if (firstDigit > 9) firstDigit = 0;
        
        if (parseInt(cpf.charAt(9)) !== firstDigit) {
            return false;
        }
        
        // Validate second digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        let secondDigit = 11 - (sum % 11);
        if (secondDigit > 9) secondDigit = 0;
        
        return parseInt(cpf.charAt(10)) === secondDigit;
    }

    isValidCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]+/g, '');
        
        if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
            return false;
        }
        
        // Validate first digit
        let sum = 0;
        let weight = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cnpj.charAt(i)) * weight[i];
        }
        
        let firstDigit = 11 - (sum % 11);
        if (firstDigit > 9) firstDigit = 0;
        
        if (parseInt(cnpj.charAt(12)) !== firstDigit) {
            return false;
        }
        
        // Validate second digit
        weight = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        sum = 0;
        
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cnpj.charAt(i)) * weight[i];
        }
        
        let secondDigit = 11 - (sum % 11);
        if (secondDigit > 9) secondDigit = 0;
        
        return parseInt(cnpj.charAt(13)) === secondDigit;
    }

    /**
     * Máscaras de input
     */
    applyMask(fieldName, mask) {
        const field = document.getElementById(fieldName);
        if (!field) return;
        
        field.addEventListener('input', function(e) {
            let value = e.target.value;
            let maskedValue = '';
            
            let valueIndex = 0;
            let maskIndex = 0;
            
            while (valueIndex < value.length && maskIndex < mask.length) {
                if (mask[maskIndex] === '9' && /\d/.test(value[valueIndex])) {
                    maskedValue += value[valueIndex];
                    valueIndex++;
                    maskIndex++;
                } else if (mask[maskIndex] === 'A' && /[a-zA-Z]/.test(value[valueIndex])) {
                    maskedValue += value[valueIndex];
                    valueIndex++;
                    maskIndex++;
                } else if (mask[maskIndex] === '*') {
                    maskedValue += value[valueIndex];
                    valueIndex++;
                    maskIndex++;
                } else {
                    maskedValue += mask[maskIndex];
                    maskIndex++;
                    if (value[valueIndex] === mask[maskIndex - 1]) {
                        valueIndex++;
                    }
                }
            }
            
            e.target.value = maskedValue;
        });
    }

    /**
     * Exibição de erros
     */
    showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        
        if (field) {
            field.classList.add('is-invalid');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        this.errors[fieldName] = message;
    }

    clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        const errorElement = document.getElementById(fieldName + 'Error');
        
        if (field) {
            field.classList.remove('is-invalid');
        }
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        
        delete this.errors[fieldName];
    }

    showFormError(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger alert-dismissible fade show';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const form = this.form;
        if (form) {
            form.insertBefore(alert, form.firstChild);
        }
    }

    /**
     * Callbacks
     */
    onSuccess() {
        // Override in implementation
    }

    onError() {
        // Override in implementation
    }
}

/**
 * Validadores específicos para o sistema Encontre Aqui
 */
const EncontreAquiValidators = {
    // Login form
    login: {
        email: {
            required: { message: 'Email é obrigatório' },
            email: { message: 'Email inválido' }
        },
        password: {
            required: { message: 'Senha é obrigatória' },
            minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' }
        }
    },
    
    // Registration form
    register: {
        name: {
            required: { message: 'Nome é obrigatório' },
            minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
            maxLength: { value: 50, message: 'Nome deve ter no máximo 50 caracteres' }
        },
        email: {
            required: { message: 'Email é obrigatório' },
            email: { message: 'Email inválido' }
        },
        phone: {
            required: { message: 'Telefone é obrigatório' },
            phone: { message: 'Telefone inválido' }
        },
        password: {
            required: { message: 'Senha é obrigatória' },
            minLength: { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' },
            custom: {
                validator: (value) => {
                    const hasUpperCase = /[A-Z]/.test(value);
                    const hasLowerCase = /[a-z]/.test(value);
                    const hasNumbers = /\d/.test(value);
                    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
                    
                    return {
                        valid: hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
                        message: 'Senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais'
                    };
                }
            }
        },
        confirmPassword: {
            required: { message: 'Confirmação de senha é obrigatória' },
            custom: {
                validator: (value) => {
                    const password = document.getElementById('password').value;
                    return {
                        valid: value === password,
                        message: 'As senhas não coincidem'
                    };
                }
            }
        }
    },
    
    // Restaurant registration
    restaurant: {
        name: {
            required: { message: 'Nome do estabelecimento é obrigatório' },
            minLength: { value: 3, message: 'Nome deve ter pelo menos 3 caracteres' },
            maxLength: { value: 100, message: 'Nome deve ter no máximo 100 caracteres' }
        },
        description: {
            required: { message: 'Descrição é obrigatória' },
            minLength: { value: 10, message: 'Descrição deve ter pelo menos 10 caracteres' },
            maxLength: { value: 500, message: 'Descrição deve ter no máximo 500 caracteres' }
        },
        phone: {
            required: { message: 'Telefone é obrigatório' },
            phone: { message: 'Telefone inválido' }
        },
        address: {
            required: { message: 'Endereço é obrigatório' },
            minLength: { value: 10, message: 'Endereço deve ter pelo menos 10 caracteres' }
        },
        category: {
            required: { message: 'Categoria é obrigatória' }
        },
        priceRange: {
            required: { message: 'Faixa de preço é obrigatória' }
        }
    },
    
    // Review form
    review: {
        rating: {
            required: { message: 'Avaliação é obrigatória' },
            custom: {
                validator: (value) => ({
                    valid: value >= 1 && value <= 5,
                    message: 'Avaliação deve ser entre 1 e 5 estrelas'
                })
            }
        },
        comment: {
            required: { message: 'Comentário é obrigatório' },
            minLength: { value: 10, message: 'Comentário deve ter pelo menos 10 caracteres' },
            maxLength: { value: 500, message: 'Comentário deve ter no máximo 500 caracteres' }
        }
    }
};

/**
 * Máscaras de input
 */
const InputMasks = {
    phone: (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    },
    
    cpf: (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    },
    
    cnpj: (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    },
    
    cep: (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2');
    },
    
    currency: (value) => {
        value = value.replace(/\D/g, '');
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value / 100);
    }
};

/**
 * Inicialização dos validadores
 */
document.addEventListener('DOMContentLoaded', function() {
    // Apply masks
    const maskedInputs = document.querySelectorAll('[data-mask]');
    maskedInputs.forEach(input => {
        const mask = input.dataset.mask;
        if (InputMasks[mask]) {
            input.addEventListener('input', (e) => {
                e.target.value = InputMasks[mask](e.target.value);
            });
        }
    });
    
    // Initialize form validators
    const forms = document.querySelectorAll('form[data-validator]');
    forms.forEach(form => {
        const validatorType = form.dataset.validator;
        if (EncontreAquiValidators[validatorType]) {
            const validator = new FormValidator(form.id);
            
            Object.keys(EncontreAquiValidators[validatorType]).forEach(field => {
                validator.addRule(field, EncontreAquiValidators[validatorType][field]);
            });
            
            validator.onSuccess = () => {
                // Form is valid, proceed with submission
                console.log('Form is valid');
            };
            
            validator.onError = () => {
                // Form has errors
                console.log('Form has errors');
            };
        }
    });
});

// Export for global use
window.FormValidator = FormValidator;
window.EncontreAquiValidators = EncontreAquiValidators;
window.InputMasks = InputMasks;