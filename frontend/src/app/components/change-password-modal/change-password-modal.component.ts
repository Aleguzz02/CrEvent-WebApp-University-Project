import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton,
  IonContent, IonItem, IonLabel, IonInput, IonNote, IonText
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
    IonNote,
    IonText
  ]
})
export class ChangePasswordModalComponent implements OnInit {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  submitted = false;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  get validNewPassword(): boolean {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(this.newPassword);
  }

  get passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword;
  }

  get validForm(): boolean {
    return this.currentPassword.length > 0
      && this.validNewPassword
      && this.confirmPassword.length > 0
      && this.passwordsMatch;
  }

  save() {
    this.submitted = true;

    if (!this.validForm) {
      return;
    }

    this.modalCtrl.dismiss(
      {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword
      },
      'save'
    );
  }
}
