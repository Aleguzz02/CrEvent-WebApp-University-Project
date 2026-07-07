import { Component, inject, OnInit} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonText,
  ToastController
 } from '@ionic/angular/standalone';
import { LoginFormComponent } from '../login-form/login-form.component';
import { AuthService } from '../../services/auth.service';
import { ModalController } from '@ionic/angular/standalone';
import { SignupModalComponent } from '../signup-modal/signup-modal.component';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, LoginFormComponent, IonText],
  standalone: true,
})
export class LoginModalComponent  implements OnInit {

  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);
  private toastCtrl = inject(ToastController);

  constructor() { }

  ngOnInit() {}

  async closeLoginModal() {
    try {
      await this.modalCtrl.dismiss(null, "confirm");
    } catch (e) {
      console.warn("Modal already dismissed");
    }
  }

  async showErrorToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 4000,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  handleFormSubmit(formData: any) {
    this.authService.login(formData).subscribe({
      next: (res) => {
        console.log('Risposta server:', res);
        this.closeLoginModal();
        this.modalCtrl.dismiss(formData, 'confirm');
      },
      error: (err) => {
        const errorMessage = err.message || 'Errore';
        this.showErrorToast(errorMessage);
      }
    });
  }

  async openSignupModal() {
    // Chiudi il modal di login
    await this.closeLoginModal();

    const modal = await this.modalCtrl.create({
      component: SignupModalComponent,
    });
      await modal.present();
    }

}
