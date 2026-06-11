import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonModal, IonButtons } from '@ionic/angular/standalone';
import { LoginFormComponent } from './login-form/login-form.component';
import { SignupFormComponent } from './signup-form/signup-form.component';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-pag1',
  templateUrl: './pag1.page.html',
  styleUrls: ['./pag1.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonModal, IonButtons,
    SignupFormComponent, LoginFormComponent]
})
export class Pag1Page implements OnInit {

  @ViewChild('loginModal') loginModal!: IonModal;
  @ViewChild('signupModal') signupModal!: IonModal;
  @ViewChild(SignupFormComponent) signupFormComp!: SignupFormComponent;

  constructor() { }

  ngOnInit() {
  }

  loginCancel() {
    this.loginModal.dismiss(null, 'cancel');
  }

  loginConfirm() {
    this.loginModal.dismiss(null, 'confirm');
  }

  signupCancel() {
    this.signupModal.dismiss(null, 'cancel');
  }

  signupConfirm() {
  const formData = this.signupFormComp.onSubmit();
  if (formData) {
    this.authService.signup(formData).subscribe({
      next: (res) => console.log('Server response:', res),
      error: (err) => console.error('Error:', err)
    });
    this.signupModal.dismiss(formData, 'confirm');
  }
  }

  private authService = inject(AuthService);

}
