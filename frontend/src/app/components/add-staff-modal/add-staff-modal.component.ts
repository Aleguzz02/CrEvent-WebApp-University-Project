import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { CreateStaffRequest } from '../../services/admin.service';

@Component({
  selector: 'app-add-staff-modal',
  templateUrl: './add-staff-modal.component.html',
  styleUrls: ['./add-staff-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons]
})
export class AddStaffModalComponent {
  private modalCtrl = inject(ModalController);
  today = new Date().toISOString().slice(0, 10);

  staff: CreateStaffRequest = {
    nome: '',
    cognome: '',
    tipo: 'catering',
    costo: null,
    descrizione: '',
    linkSito: '',
    genereMusicale: '',
    genereFotografico: '',
    mansione: '',
    dataInizio: '',
    dataFine: '',
    urlImg: '',
    accountEmail: ''
  };

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  get dateRangeInvalid(): boolean {
    return !!this.staff.dataInizio
      && !!this.staff.dataFine
      && this.staff.dataFine < this.staff.dataInizio;
  }

  save(form: NgForm) {
    if (form.invalid || this.dateRangeInvalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.modalCtrl.dismiss(this.staff, 'confirm');
  }
}
