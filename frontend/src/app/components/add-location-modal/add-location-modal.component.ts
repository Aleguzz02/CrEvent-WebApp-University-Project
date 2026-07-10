import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
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
  IonSpinner,
  ModalController
} from '@ionic/angular/standalone';
import { CreateLocationRequest } from '../../services/admin.service';
import { UploadService } from '../../services/upload.service';
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
    IonImg,
    IonSpinner
  ]
})
export class AddLocationModalComponent implements OnInit, OnDestroy {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  private uploadService = inject(UploadService);
  private toastService = inject(ToastService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  today = new Date().toISOString().slice(0, 10);
  locationForm!: FormGroup;
  private cityPattern = /^[\p{L}\s'-]+$/u;

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  imageUploaded = false;
  private isConfirmed = false;
  private isDestroyed = false;

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
      urlImg: ['', Validators.required],
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

  ngOnDestroy() {
    this.isDestroyed = true;
    if (!this.isConfirmed) {
      this.deleteUploadedImage();
    }
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
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error("L'immagine non puo superare 5MB");
      input.value = '';
      return;
    }

    this.deleteUploadedImage();
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    this.uploadImage();
  }

  private uploadImage() {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadService.uploadImage(this.selectedFile, 'location').subscribe({
      next: (response) => {
        this.isUploading = false;

        if (this.isDestroyed) {
          if (response.success && response.data?.url) {
            this.removeImageFromServer(response.data.url);
          }
          return;
        }

        if (!response.success || !response.data) {
          this.toastService.error(response.message || 'Errore durante il caricamento');
          this.clearImageSelection();
          return;
        }

        this.locationForm.patchValue({ urlImg: response.data.url });
        this.imageUploaded = true;
        this.toastService.success('Immagine caricata con successo');
      },
      error: (err) => {
        this.isUploading = false;
        if (this.isDestroyed) return;

        this.toastService.error(err.error?.message || 'Errore durante il caricamento');
        this.clearImageSelection();
      }
    });
  }

  resetFileInput() {
    this.deleteUploadedImage();
    this.clearImageSelection();
  }

  private clearImageSelection() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    this.previewUrl = null;
    this.selectedFile = null;
    this.imageUploaded = false;
    this.locationForm.patchValue({ urlImg: '' });
  }

  private deleteUploadedImage() {
    const url = this.locationForm?.get('urlImg')?.value;
    if (!this.imageUploaded || !url) return;

    this.imageUploaded = false;
    this.locationForm.patchValue({ urlImg: '' });
    this.removeImageFromServer(url);
  }

  private removeImageFromServer(url: string) {
    this.uploadService.deleteImage(url).subscribe({
      error: (err) => console.error('Errore durante la cancellazione dell\'immagine:', err)
    });
  }

  save() {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    if (!this.imageUploaded) {
      this.toastService.error("Carica un'immagine prima di salvare");
      return;
    }

    const result: CreateLocationRequest = this.locationForm.value;

    this.isConfirmed = true;
    this.modalCtrl.dismiss(result, 'confirm');
  }
}
