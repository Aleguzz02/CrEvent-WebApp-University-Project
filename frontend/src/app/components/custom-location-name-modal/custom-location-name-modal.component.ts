import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  ModalController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-custom-location-name-modal',
  templateUrl: './custom-location-name-modal.component.html',
  styleUrls: ['./custom-location-name-modal.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonItem,
    IonLabel,
    IonInput
  ]
})
export class CustomLocationNameModalComponent {
  nomeLocation: string = '';

  constructor(private modalController: ModalController) {}

  back() {
    this.modalController.dismiss();
  }

  confirm() {
    const nomePulito = this.nomeLocation.trim();

    if (!nomePulito) {
      return;
    }

    this.modalController.dismiss({
      nome: nomePulito
    });
  }
}