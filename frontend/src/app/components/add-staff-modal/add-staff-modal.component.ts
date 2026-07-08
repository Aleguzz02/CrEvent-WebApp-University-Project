import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar, ModalController, IonInput, IonItem, IonSelect, IonSelectOption, IonText, IonTextarea } from '@ionic/angular/standalone';
import { CreateStaffRequest } from '../../services/admin.service';

@Component({
  selector: 'app-add-staff-modal',
  templateUrl: './add-staff-modal.component.html',
  styleUrls: ['./add-staff-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTextarea
  ]
})
export class AddStaffModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  
  today = new Date().toISOString().slice(0, 10);
  staffForm!: FormGroup;

  // Pattern per nome e cognome (esplicito per evitare problemi con À-ÿ)
  private namePattern = /^[a-zA-ZÀÈÉÌÒÙàèéìòù\s'’’-]+$/;

  ngOnInit() {
    this.staffForm = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.pattern(this.namePattern),
        Validators.maxLength(80)
      ]],
      cognome: ['', [
        Validators.required,
        Validators.pattern(this.namePattern),
        Validators.maxLength(80)
      ]],
      tipo: ['catering', Validators.required],
      costo: [null, [
        Validators.required,
        Validators.min(0.01)
      ]],
      descrizione: ['', [
        Validators.required,
        Validators.maxLength(2000)
      ]],
      urlImg: ['', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+$/)
      ]],
      linkSito: ['', Validators.pattern(/^https?:\/\/.+$/)],
      genereMusicale: ['', Validators.maxLength(100)],
      genereFotografico: ['', Validators.maxLength(100)],
      mansione: ['', Validators.maxLength(100)],
      dataInizio: ['', [
        Validators.required,
        this.validateNotPast.bind(this)
      ]],
      dataFine: ['', [
        Validators.required,
        this.validateDateRange.bind(this)
      ]],
      accountEmail: ['', [
        Validators.required,
        Validators.email
      ]]
    });

    // Aggiorna la validazione di dataFine quando cambia dataInizio
    this.staffForm.get('dataInizio')?.valueChanges.subscribe(() => {
      this.staffForm.get('dataFine')?.updateValueAndValidity();
    });
  }

  // Validatore: dataInizio non deve essere nel passato
  validateNotPast(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(control.value);
    inputDate.setHours(0, 0, 0, 0);
    
    if (inputDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  // Validatore cross-field: dataFine >= dataInizio
  validateDateRange(control: AbstractControl): ValidationErrors | null {
    if (!this.staffForm) return null;
    
    const dataInizio = this.staffForm.get('dataInizio')?.value;
    const dataFine = control.value;
    
    if (dataInizio && dataFine && dataFine < dataInizio) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  save() {
    if (this.staffForm.valid) {
      this.modalCtrl.dismiss(this.staffForm.value, 'confirm');
    } else {
      this.staffForm.markAllAsTouched();
    }
  }
}