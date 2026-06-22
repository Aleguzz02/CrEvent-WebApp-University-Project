import { Component, inject, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonModal } from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { ModalController } from '@ionic/angular/standalone';
import { SignupFormComponent } from '../signup-form/signup-form.component';

@Component({
  selector: 'app-signup-modal',
  templateUrl: './signup-modal.component.html',
  styleUrls: ['./signup-modal.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonModal, SignupFormComponent],
  standalone: true,
})
export class SignupModalComponent  implements OnInit {

  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);

  constructor() { }

  ngOnInit() {}

  closeSignupModal() {
    this.modalCtrl.dismiss(null, "confirm");
  }

  handleFormSubmit(formData: any) {
    if (formData) {
      this.authService.signup(formData).subscribe({
        next: (res) => console.log('Server response:', res),
        error: (err) => console.error('Error:', err)
      });
      this.modalCtrl.dismiss(formData, 'confirm');
    }
  }

}
