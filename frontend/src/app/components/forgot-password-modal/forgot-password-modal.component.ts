import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonInput,
  IonText,
  IonSpinner,
  ModalController
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Subject, takeUntil } from 'rxjs';

type Step = 'email' | 'otp' | 'reset';

@Component({
  selector: 'app-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonItem,
    IonInput,
    IonText,
    IonSpinner
  ]
})
export class ForgotPasswordModalComponent implements OnInit, OnDestroy {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  currentStep: Step = 'email';
  email = '';
  isLoading = false;

  emailForm!: FormGroup;
  otpForm!: FormGroup;
  resetForm!: FormGroup;

  ngOnInit() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordsMatch.bind(this)
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  // Step 1: Invia email per OTP
  requestOtp() {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.email = this.emailForm.get('email')?.value;

    this.authService.requestOtp({ email: this.email })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastService.success('OTP inviato alla tua email');
            this.currentStep = 'otp';
          } else {
            this.toastService.error(response.message || 'Errore durante l\'invio OTP');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.error(err.error?.message || 'Errore durante l\'invio OTP');
        }
      });
  }

  // Step 2: Verifica OTP
  verifyOtp() {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const otp = this.otpForm.get('otp')?.value;

    this.authService.verifyOtp({ email: this.email, otp })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastService.success('OTP verificato');
            this.currentStep = 'reset';
          } else {
            this.toastService.error(response.message || 'OTP non valido');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.error(err.error?.message || 'Errore durante la verifica OTP');
        }
      });
  }

  // Step 3: Reset password
  resetPassword() {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const { newPassword, confirmPassword } = this.resetForm.value;
    const otp = this.otpForm.get('otp')?.value;

    this.authService.resetPassword({
      email: this.email,
      otp,
      newPassword,
      confirmPassword
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.toastService.success('Password aggiornata con successo! Ora puoi accedere.');
            this.modalCtrl.dismiss(null, 'confirm');
          } else {
            this.toastService.error(response.message || 'Errore durante il reset della password');
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.toastService.error(err.error?.message || 'Errore durante il reset della password');
        }
      });
  }

  // Navigazione tra step (back)
  goToStep(step: Step) {
    this.currentStep = step;
  }
}