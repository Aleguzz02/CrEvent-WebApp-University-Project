import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  @ViewChild(LoginFormComponent) loginFormComp!: LoginFormComponent;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  loginCancel() {
    this.loginModal.dismiss(null, 'cancel');
  }

  loginConfirm() {
    const loginFormData = this.loginFormComp.onSubmit();
    if (loginFormData) {
      this.authService.login(loginFormData).subscribe({
        next: (res) => {
          // salva token e mail nel localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('userEmail', res.userEmail);
          localStorage.setItem('userNome', res.userNome);

          // chiude il modal e va su Tab2
          this.loginModal.dismiss(loginFormData, 'confirm');
          this.router.navigate(['/tabs']);
        },
        error: (err) => console.log('Error: ', err)
      })
    }
  }

  signupCancel() {
    this.signupModal.dismiss(null, 'cancel');
  }

  signupConfirm() {
  const signupFormData = this.signupFormComp.onSubmit();
  if (signupFormData) {
    this.authService.signup(signupFormData).subscribe({
      next: (res) => console.log('Server response:', res),
      error: (err) => console.error('Error:', err)
    });
    this.signupModal.dismiss(signupFormData, 'confirm');
  }
  }

  private authService = inject(AuthService);

}
