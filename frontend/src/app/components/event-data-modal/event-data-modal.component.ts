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
  IonText,
  ModalController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-event-data-modal',
  templateUrl: './event-data-modal.component.html',
  styleUrls: ['./event-data-modal.component.scss'],
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
    IonInput,
    IonText
  ]
})
export class EventDataModalComponent {
  eventName: string = '';
  capacity: number | null = null;

  constructor(private modalController: ModalController) {}

  get name(): string {
    return this.eventName.trim();
  }

  get validName(): boolean {
    return this.name.length > 0;
  }

  get validCapacity(): boolean {
    const valore = Number(this.capacity);
    return this.capacity !== null && Number.isFinite(valore) && valore >= 0;
  }

  get validForm(): boolean {
    return this.validName && this.validCapacity;
  }

  back() {
    this.modalController.dismiss();
  }

  confirm() {
    if (!this.validForm) {
      return;
    }

    this.modalController.dismiss({
      name: this.name,
      capacity: Number(this.capacity)
    }, 'confirm');
  }
}