import { Component, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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
  IonSpinner,
  IonImg,
  IonIcon,
  IonLabel,
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
    IonSpinner,
    IonIcon,
    IonLabel,
    IonImg
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
  private cityPattern = /^[a-zA-ZÀÈÉÌÒÙàèéìòù\s'’’-]+$/;

  // Stato upload
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isUploading = false;
  imageUploaded = false;
  isConfirmed = false;

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
      urlImg: ['', [Validators.required]],
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
    // Se l'immagine è stata caricata ma non è stata confermata (salvata), cancella il file
    if (this.imageUploaded && !this.isConfirmed) {
      const url = this.locationForm.get('urlImg')?.value;
      if (url) {
        this.uploadService.deleteImage(url).subscribe({
          next: () => console.log('File cancellato (chiusura involontaria)'),
          error: (err) => console.error('Errore cancellazione file:', err)
        });
      }
    }
  }

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
    const url = this.locationForm.get('urlImg')?.value;
    if (this.imageUploaded && url) {
      this.uploadService.deleteImage(url).subscribe({
        next: () => console.log('File cancellato'),
        error: (err) => console.error('Errore cancellazione file:', err)
      });
    }
    this.modalCtrl.dismiss(null, 'cancel');
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      this.imageUploaded = false;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

      this.uploadImage();
    }
  }

  uploadImage() {
    if (!this.selectedFile) return;

    this.isUploading = true;

    this.uploadService.uploadImage(this.selectedFile, 'location').subscribe({
      next: (response) => {
        this.isUploading = false;
        if (response.success && response.data) {
          this.locationForm.patchValue({ urlImg: response.data.url });
          this.imageUploaded = true;
          this.toastService.success('Immagine caricata con successo');
        } else {
          this.toastService.error(response.message || 'Errore durante il caricamento');
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.toastService.error(err.error?.message || 'Errore durante il caricamento');
        this.previewUrl = null;
        this.selectedFile = null;
      }
    });
  }

  resetFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.previewUrl = null;
    this.selectedFile = null;
    this.imageUploaded = false;
    this.locationForm.patchValue({ urlImg: '' });
  }

    save() {
    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();
      return;
    }

    if (!this.imageUploaded) {
      this.toastService.error('Carica un\'immagine prima di salvare');
      return;
    }

    this.isConfirmed = true;
    this.modalCtrl.dismiss(this.locationForm.value, 'confirm');
  }
}