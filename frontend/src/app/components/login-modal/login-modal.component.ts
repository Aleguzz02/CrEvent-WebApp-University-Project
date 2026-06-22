import { Component, inject, OnInit} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonModal } from '@ionic/angular/standalone';
import { LoginFormComponent } from '../login-form/login-form.component';
import { AuthService } from '../../services/auth.service';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonModal, LoginFormComponent],
  standalone: true,
})
export class LoginModalComponent  implements OnInit {

  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);

  constructor() { }

  ngOnInit() {}

  closeLoginModal() {
    this.modalCtrl.dismiss(null, "confirm");
  }

  handleFormSubmit(formData: any) {
    this.authService.login(formData).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userEmail', res.userEmail);
        this.modalCtrl.dismiss(formData, 'confirm');
      },
      error: (err) => {
        alert('Credenziali non valide.');
      }
    });
  }

}
