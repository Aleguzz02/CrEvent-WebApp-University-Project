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
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  IonSpinner,
  IonImg,
  IonIcon,
  IonLabel,
  ModalController
} from '@ionic/angular/standalone';
import { CreateStaffRequest } from '../../services/admin.service';
import { UploadService } from '../../services/upload.service';
import { ToastService } from '../../services/toast.service';
import { addIcons } from 'ionicons';
import { cloudUpload, close, checkmarkCircle } from 'ionicons/icons';

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
    IonTextarea,
    IonSpinner,
    IonImg,
    IonIcon,
    IonLabel
  ]
})
export class AddStaffModalComponent implements OnInit, OnDestroy   {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);
  private uploadService = inject(UploadService);
  private toastService = inject(ToastService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  today = new Date().toISOString().slice(0, 10);
  staffForm!: FormGroup;
  private namePattern = /^[a-zA-ZÀÈÉÌÒÙàèéìòù\s'’’-]+$/;

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
      costo: [null, [Validators.required, Validators.min(0.01)]],
      descrizione: ['', [Validators.required, Validators.maxLength(2000)]],
      urlImg: ['', [Validators.required]], // Ora è il path restituito dal server
      linkSito: ['', Validators.pattern(/^https?:\/\/.+$/)],
      genereMusicale: ['', Validators.maxLength(100)],
      genereFotografico: ['', Validators.maxLength(100)],
      mansione: ['', Validators.maxLength(100)],
      dataInizio: ['', [Validators.required, this.validateNotPast.bind(this)]],
      dataFine: ['', [Validators.required, this.validateDateRange.bind(this)]],
      accountEmail: ['', [Validators.required, Validators.email]]
    });

    this.staffForm.get('dataInizio')?.valueChanges.subscribe(() => {
      this.staffForm.get('dataFine')?.updateValueAndValidity();
    });
  }

    ngOnDestroy() {
    if (this.imageUploaded && !this.isConfirmed) {
      const url = this.staffForm.get('urlImg')?.value;
      if (url) {
        this.uploadService.deleteImage(url).subscribe({
          next: () => console.log('File cancellato (chiusura involontaria)'),
          error: (err) => console.error('Errore cancellazione file:', err)
        });
      }
    }
  }

  // Validatori esistenti (validateNotPast, validateDateRange)
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
    if (!this.staffForm) return null;
    const dataInizio = this.staffForm.get('dataInizio')?.value;
    const dataFine = control.value;
    if (dataInizio && dataFine && dataFine < dataInizio) {
      return { dateRangeInvalid: true };
    }
    return null;
  }

  cancel() {
    const url = this.staffForm.get('urlImg')?.value;
    if (this.imageUploaded && url) {
      this.uploadService.deleteImage(url).subscribe({
        next: () => console.log('File cancellato'),
        error: (err) => console.error('Errore cancellazione file:', err)
      });
    }
    this.modalCtrl.dismiss(null, 'cancel');
  }

  // --- Upload ---

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;
      this.imageUploaded = false;

      // Genera preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Carica immediatamente
      this.uploadImage();
    }
  }

  uploadImage() {
    if (!this.selectedFile) return;

    this.isUploading = true;

    this.uploadService.uploadImage(this.selectedFile, 'staff').subscribe({
      next: (response) => {
        this.isUploading = false;
        if (response.success && response.data) {
          this.staffForm.patchValue({ urlImg: response.data.url });
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

    save() {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    if (!this.imageUploaded) {
      this.toastService.error('Carica un\'immagine prima di salvare');
      return;
    }

    this.isConfirmed = true;
    this.modalCtrl.dismiss(this.staffForm.value, 'confirm');
  }

  // Resetta il selettore file
  resetFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.previewUrl = null;
    this.selectedFile = null;
    this.imageUploaded = false;
    this.staffForm.patchValue({ urlImg: '' });
  }
}