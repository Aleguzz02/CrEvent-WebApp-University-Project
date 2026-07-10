import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonInput,
  IonText,
  IonTextarea,
  IonImg,
  IonIcon,
  IonLabel,
  ModalController
} from '@ionic/angular/standalone';
import { CreateLocationRequest } from '../../services/admin.service';
import { ToastService } from '../../services/toast.service';
import { addIcons } from 'ionicons';
import { cloudUpload, close, checkmarkCircle } from 'ionicons/icons';

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
    IonTextarea,
    IonIcon,
    IonLabel,
    IonImg
  ]
})
export class AddLocationModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  today = new Date().toISOString().slice(0, 10);
  locationForm!: FormGroup;
  private cityPattern = /^[\p{L}\s'-]+$/u;

  selectedFile: File | null = null;
  previewUrl: string | null = null;

  constructor() {
    addIcons({ cloudUpload, close, checkmarkCircle });
  }

  ngOnInit() {
    this.locationForm = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      indirizzo: ['', [Validators.required, Validators.maxLength(150)]],
      citta: ['', [Validators.required, Validators.pattern(this.cityPattern), Validators.maxLength(80)]],
      descrizione: ['', [Validators.required, Validators.maxLength(2000)]],
      capienza: [null, [Validators.required, Validators.min(1), Validators.max(100000)]],
      costo: [null, [Validators.required, Validators.min(0.01)]],
      linkSito: ['', Validators.pattern(/^https?:\/\/.+$/)],
      lat: [null, [Validators.min(-90), Validators.max(90)]],
      lng: [null, [Validators.min(-180), Validators.max(180)]],
      dataInizio: ['', [Validators.required, this.validateNotPast.bind(this)]],
      dataFine: ['', [Validators.required, this.validateDateRange.bind(this)]],
      accountEmail: ['', [Validators.required, Validators.email]],
      gestoreNome: ['', [Validators.maxLength(80)]],
      gestoreCognome: ['', [Validators.maxLength(80)]]
    });

    this.locationForm.get('dataInizio')?.valueChanges.subscribe(() => {
      this.locationForm.get('dataFine')?.updateValueAndValidity();
    });
  }

  validateNotPast(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inputDate = new Date(control.value);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate < today ? { pastDate: true } : null;
  }

  validateDateRange(control: AbstractControl): ValidationErrors | null {
    if (!this.locationForm) return null;

    const dataInizio = this.locationForm.get('dataInizio')?.value;
    const dataFine = control.value;

    return dataInizio && dataFine && dataFine < dataInizio
      ? { dateRangeInvalid: true }
      : null;
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastService.error('Seleziona un file immagine valido');
      this.resetFileInput();
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error("L'immagine non puo superare 5MB");
      this.resetFileInput();
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  resetFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    this.previewUrl = null;
    this.selectedFile = null;
  }

  save() {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.toastService.error("Seleziona un'immagine prima di salvare");
      return;
    }

    const result: CreateLocationRequest = {
      ...this.locationForm.value,
      image: this.selectedFile
    };

    this.modalCtrl.dismiss(result, 'confirm');
  }
}
