import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,
  AbstractControl, ValidationErrors
 } from '@angular/forms';
import { IonItem, IonInput, IonList } from '@ionic/angular/standalone';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [IonItem, IonInput, IonList, ReactiveFormsModule],
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
})
export class SignupFormComponent  implements OnInit {
  signupForm: FormGroup;

  @Output() formSubmit = new EventEmitter<any>();

  // Validatore personalizzato per la data di nascita
  validateBirthDate(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
  
    const birthDate = new Date(control.value);
    const today = new Date();
  
    // Controllo data futura
    if (birthDate > today) {
      return { futureDate: true };
    }
  
    // Controllo età minima 18 anni
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    if (age < 18) {
      return { underage: true };
    }
  
    return null;
  }

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      ]],
      cognome: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      ]],
      dataNascita: ['', [
        Validators.required,
        this.validateBirthDate.bind(this)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]],
      confermaPassword: ['', [
        Validators.required,
        this.comparePasswords.bind(this)
      ]]
    });
  }

  comparePasswords(control: AbstractControl): ValidationErrors | null {
    if (!this.signupForm) return null;
    const password = this.signupForm.get('password')?.value;
    const confirmPassword = control.value;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  ngOnInit() {}

  submitForm() {
    if (this.signupForm.valid) {
      this.formSubmit.emit(this.signupForm.value);
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  resetForm() {
    this.signupForm.reset();
  }

}
