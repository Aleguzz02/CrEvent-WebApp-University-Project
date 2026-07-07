import { Component, inject, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonText } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { ModalController } from '@ionic/angular/standalone';
import { SignupFormComponent } from '../signup-form/signup-form.component';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-signup-modal',
  templateUrl: './signup-modal.component.html',
  styleUrls: ['./signup-modal.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonText, SignupFormComponent],
  standalone: true,
})
export class SignupModalComponent  implements OnInit {

  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private toastService = inject(ToastService);

  constructor() { }

  ngOnInit() {}

  async closeSignupModal() {
    try {
      await this.modalCtrl.dismiss(null, "confirm");
    } catch (e) {
      console.warn("Modal già chiuso");
    }
  }


  handleFormSubmit(formData: any) {
    if (formData) {
      // Registrazione
      this.authService.signup(formData).subscribe({
        next: (signupRes) => {
          console.log('Risposta server:', signupRes);
          
          if(signupRes?.emailError){
            this.toastService.warning(signupRes.message);
          }
          // Login immediato dopo registrazione
          this.authService.login(formData).subscribe({
            next: (loginRes) => {
              console.log('Accesso', loginRes);
              // Chiudi modal
              this.modalCtrl.dismiss(formData, 'confirm');
            },
            error: (loginErr) => {
              console.error('Errore accesso dopo registrazione:', loginErr);
              this.showErrorToast('Login automatico fallito, riprova manualmente');
            }
          })
        },
        error: (signupErr) => {
          console.error('Errore:', signupErr);
          const errorMessage = signupErr.error?.message || signupErr.message || 'Errore';
          this.toastService.error(errorMessage);
        }
      });
    }
  }

  async openLoginModal() {
    await this.closeSignupModal();

    const modal = await this.modalCtrl.create({
      component: LoginModalComponent,
    });
      await modal.present();
  }

}
