import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonInput, IonNote
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-change-password-modal',
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonNote
  ]
})
export class ChangePasswordModalComponent implements OnInit {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save() {
    // Validazione nuova password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.newPassword)) {
      this.modalCtrl.dismiss(
        { error: 'La password deve avere almeno 8 caratteri, 1 maiuscola, 1 minuscola e 1 numero' },
        'error'
      );
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.modalCtrl.dismiss(
        { error: 'Le password non coincidono' },
        'error'
      );
      return;
    }

    // Restituisci i dati alla pagina chiamante
    this.modalCtrl.dismiss(
      {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword
      },
      'save'
    );
  }
}