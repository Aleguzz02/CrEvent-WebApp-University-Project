import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, 
  IonContent, IonItem, IonLabel, IonInput, IonNote 
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
    IonNote
  ]
})
export class EditPhoneModalComponent implements OnInit {
  // Dato ricevuto dalla pagina chiamante
  phone: string = '';

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {}


  // Chiudi il modal senza salvare
  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }


  // Salva e chiudi restituendo il nuovo telefono
  save() {
    // Validazione base (esattamente 10 cifre)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(this.phone)) {
      // Mostra errore
      this.modalCtrl.dismiss({ error: 'Il telefono deve contenere esattamente 10 cifre' }, 'error');
      return;
    }
    this.modalCtrl.dismiss(this.phone, 'save');
  }
}