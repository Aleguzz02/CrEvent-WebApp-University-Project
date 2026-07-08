import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { 
  IonButton, 
  IonButtons, 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar, 
  ModalController,
  IonItem,
  IonInput,
  IonText,
  IonTextarea
} from '@ionic/angular/standalone';
import { CreateLocationRequest } from '../../services/admin.service';

@Component({
  selector: 'app-add-location-modal',
  templateUrl: './add-location-modal.component.html',
  styleUrls: ['./add-location-modal.component.scss'],
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
    IonText,
    IonTextarea
  ]
})
export class AddLocationModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  
  today = new Date().toISOString().slice(0, 10);
  locationForm!: FormGroup;

  // Pattern per città (come per nome/cognome)
  private cityPattern = /^[a-zA-ZÀÈÉÌÒÙàèéìòù\s'’’-]+$/;

  ngOnInit() {
    this.locationForm = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.maxLength(100)
      ]],
      indirizzo: ['', [
        Validators.required,
        Validators.maxLength(150)
      ]],
      citta: ['', [
        Validators.required,
        Validators.pattern(this.cityPattern),
        Validators.maxLength(80)
      ]],
      descrizione: ['', [
        Validators.required,
        Validators.maxLength(2000)
      ]],
      capienza: [null, [
        Validators.required,
        Validators.min(1),
        Validators.max(100000)
      ]],
      costo: [null, [
        Validators.required,
        Validators.min(0.01)
      ]],
      urlImg: ['', [
        Validators.required,
        Validators.pattern(/^https?:\/\/.+$/)
      ]],
      linkSito: ['', Validators.pattern(/^https?:\/\/.+$/)],
      lat: [null, [
        Validators.min(-90),
        Validators.max(90)
      ]],
      lng: [null, [
        Validators.min(-180),
        Validators.max(180)
      ]],
      dataInizio: ['', [
        Validators.required,
        this.validateNotPast.bind(this)
      ]],
      dataFine: ['', [
        Validators.required,
        this.validateDateRange.bind(this)
      ]]
    });

    // Aggiorna la validazione di dataFine quando cambia dataInizio
    this.locationForm.get('dataInizio')?.valueChanges.subscribe(() => {
      this.locationForm.get('dataFine')?.updateValueAndValidity();
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
    if (!this.locationForm) return null;
    
    const dataInizio = this.locationForm.get('dataInizio')?.value;
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
    if (this.locationForm.valid) {
      this.modalCtrl.dismiss(this.locationForm.value, 'confirm');
    } else {
      this.locationForm.markAllAsTouched();
    }
  }
}