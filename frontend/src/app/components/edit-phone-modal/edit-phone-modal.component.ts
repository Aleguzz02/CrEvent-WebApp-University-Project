import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonItem, IonLabel, IonInput, IonNote, IonText
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-edit-phone-modal',
  templateUrl: './edit-phone-modal.component.html',
  styleUrls: ['./edit-phone-modal.component.scss'],
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
export class EditPhoneModalComponent implements OnInit {
  @Input()
  phone: string = '';

  submitted = false;

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}


  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  get cleanPhone(): string {
    return this.phone.replace(/\D/g, '').slice(0, 10);
  }

  get validPhone(): boolean {
    return /^[0-9]{10}$/.test(this.cleanPhone);
  }

  formatPhone(event: any) {
    this.phone = String(event.detail?.value ?? '').replace(/\D/g, '').slice(0, 10);
  }

  save() {
    this.submitted = true;

    if (!this.validPhone) {
      return;
    }

    this.modalCtrl.dismiss(this.cleanPhone, 'save');
  }
}
