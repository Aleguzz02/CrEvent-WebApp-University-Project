import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { CreateLocationRequest } from '../../services/admin.service';

@Component({
  selector: 'app-add-location-modal',
  templateUrl: './add-location-modal.component.html',
  styleUrls: ['./add-location-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons]
})
export class AddLocationModalComponent {
  private modalCtrl = inject(ModalController);
  today = new Date().toISOString().slice(0, 10);

  location: CreateLocationRequest = {
    nome: '',
    indirizzo: '',
    citta: '',
    descrizione: '',
    capienza: null,
    costo: null,
    dataInizio: '',
    dataFine: '',
    urlImg: '',
    linkSito: '',
    lat: null,
    lng: null
  };

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  get dateRangeInvalid(): boolean {
    return !!this.location.dataInizio
      && !!this.location.dataFine
      && this.location.dataFine < this.location.dataInizio;
  }

  save(form: NgForm) {
    if (form.invalid || this.dateRangeInvalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.modalCtrl.dismiss(this.location, 'confirm');
  }
}
