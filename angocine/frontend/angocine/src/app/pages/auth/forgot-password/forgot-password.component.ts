import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  success: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize form
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
    
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }
  
  ngOnInit(): void {}
  
  onSubmit(): void {
    // Stop here if form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    
    this.isSubmitting = true;
    this.error = null;
    this.success = null;
    
    const { email } = this.forgotPasswordForm.value;
    
    this.authService.forgotPassword(email).subscribe(
      response => {
        this.isSubmitting = false;
        this.success = 'Enviamos um email com instruções para redefinir sua senha. Por favor, verifique sua caixa de entrada.';
      },
      error => {
        this.isSubmitting = false;
        
        if (error.status === 404) {
          this.error = 'Email não encontrado. Por favor, verifique se o email está correto.';
        } else {
          this.error = 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.';
        }
        
        console.error('Forgot password error:', error);
      }
    );
  }
}