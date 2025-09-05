import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize form
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
    
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }
  
  ngOnInit(): void {}
  
  // Custom validator to check if passwords match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      form.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }
  
  onSubmit(): void {
    // Stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    this.error = null;
    
    const { username, email, password } = this.registerForm.value;
    
    this.authService.register(username, email, password).subscribe(
      response => {
        this.isSubmitting = false;
        
        // Navigate to profile selection
        this.router.navigate(['/profile']);
      },
      error => {
        this.isSubmitting = false;
        
        if (error.status === 409) {
          this.error = 'Este email ou nome de usuário já está em uso. Por favor, tente outro.';
        } else {
          this.error = 'Ocorreu um erro ao criar sua conta. Por favor, tente novamente mais tarde.';
        }
        
        console.error('Registration error:', error);
      }
    );
  }
}