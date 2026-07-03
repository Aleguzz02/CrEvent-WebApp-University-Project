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
      console.warn("Modal already dismissed");
    }
  }


  handleFormSubmit(formData: any) {
    if (formData) {
      this.authService.signup(formData).subscribe({
        next: (response) => {
          if(response?.emailError){
            this.toastService.warning(response.message);
          }
          console.log('Server response:', response);
          this.modalCtrl.dismiss(formData, 'confirm')
        },
        error: (err) => console.error('Error:', err)
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
