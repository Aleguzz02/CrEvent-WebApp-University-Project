import { Component, inject, OnInit} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonText } from '@ionic/angular/standalone';
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

  // Oggetto utilizzato da handleFormSubmit() per mostrare errori
  errorState = {
    show: false,
    message: ''
  }

  constructor() { }

  ngOnInit() {}

  async closeLoginModal() {
    try {
      await this.modalCtrl.dismiss(null, "confirm");
    } catch (e) {
      console.warn("Modal already dismissed");
    }
    
  }

  handleFormSubmit(formData: any) {
    this.authService.login(formData).subscribe({
      next: (res) => {
        this.closeLoginModal();
        this.modalCtrl.dismiss(formData, 'confirm');
      },
      error: (err) => {
        this.errorState.show = true;  
        this.errorState.message = err.error?.message;     // Intercetta il messaggio di errore corretto dal backend
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
