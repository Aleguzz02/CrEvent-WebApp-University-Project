import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, 
  IonCard, IonIcon, IonCardContent, IonAvatar, IonLabel, IonItem, 
  IonList, IonSkeletonText, IonAlert, IonToast, IonLoading, IonFab,
  IonFabButton, IonActionSheet, IonModal, IonInput, IonItemDivider,
  IonText, IonNote, IonBadge, IonSpinner, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { ModalController, AlertController, ToastController, LoadingController, ActionSheetController } from '@ionic/angular';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { UserProfile } from '../interfaces/profile.interface';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { SignupModalComponent } from '../components/signup-modal/signup-modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
    IonCard, IonIcon, IonCardContent, IonAvatar, IonLabel, IonItem,
    IonList, IonSkeletonText, IonAlert, IonToast, IonLoading, IonFab,
    IonFabButton, IonActionSheet, IonModal, IonInput, IonItemDivider,
    IonText, IonNote, IonBadge, IonSpinner, IonRefresher, IonRefresherContent,
    CommonModule, FormsModule
  ],
  standalone: true
})
export class Tab3Page implements OnInit, OnDestroy {

  // Servizi
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private actionSheetCtrl = inject(ActionSheetController);

  // Variabili pubbliche
  isAuthenticated = false;
  profile: UserProfile | null = null;
  loading = false;

  // Variabili per il modal del telefono
  showPhoneModal = false;
  editPhoneValue = '';

  // Variabili per il modal della password
  showPasswordModal = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Variabili per i toast/alert
  toastMessage = '';
  toastColor = '';

  // Gestione unsubscribe
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    // Sottoscrizione allo stato di autenticazione
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isAuthenticated = status;
        if (status) {
          // Se autenticato, carica il profilo
          this.loadProfile();
        } else {
          // Se non autenticato, resetta il profilo
          this.profileService.resetProfile();
          this.profile = null;
        }
      });

    // Sottoscrizione ai dati del profilo
    this.profileService.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.profile = profile;
      });

    // Sottoscrizione allo stato di caricamento
    this.profileService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });

    // Se non autenticato all'avvio, apri il login
    if (!this.isAuthenticated) {
      this.openLoginModal();
    }
  }

  /**
   * Carica il profilo con pull-to-refresh
   */
  loadProfile(event?: any): void {
    this.profileService.loadProfile().subscribe({
      next: (response) => {
        if (event) {
          event.target.complete();
        }
        if (!response.success) {
          this.showToast('Errore nel caricamento del profilo', 'danger');
        }
      },
      error: (error) => {
        if (event) {
          event.target.complete();
        }
        this.showToast('Errore di connessione', 'danger');
        console.error('Errore loadProfile:', error);
      }
    });
  }

  /**
   * Apre il modal di login
   */
  async openLoginModal() {
    const modal = await this.modalCtrl.create({
      component: LoginModalComponent,
    });
    await modal.present();
  }

  /**
   * Apre il modal di signup
   */
  async openSignupModal() {
    const modal = await this.modalCtrl.create({
      component: SignupModalComponent,
    });
    await modal.present();
  }

  /**
   * Logout
   */
  logout(): void {
    this.authService.logout();
    this.profileService.resetProfile();
  }

  // ==================== FUNZIONI PER IL TELEFONO ====================

  /**
   * Apre il modal per modificare il telefono
   */
  openEditPhoneModal(): void {
    this.editPhoneValue = this.profile?.telefono || '';
    this.showPhoneModal = true;
  }

  /**
   * Salva il nuovo telefono
   */
  async savePhone(): Promise<void> {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(this.editPhoneValue)) {
      this.showToast('Il telefono deve contenere esattamente 10 cifre', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Aggiornamento in corso...'
    });
    await loading.present();

    this.profileService.updatePhone(this.editPhoneValue).subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.showToast('Telefono aggiornato con successo', 'success');
          this.showPhoneModal = false;
        } else {
          this.showToast(response.error || 'Errore durante l\'aggiornamento', 'danger');
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showToast('Errore di connessione', 'danger');
        console.error('Errore updatePhone:', error);
      }
    });
  }

  // ==================== FUNZIONI PER LA PASSWORD ====================

  /**
   * Apre il modal per cambiare password
   */
  openPasswordModal(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.showPasswordModal = true;
  }

  /**
   * Salva la nuova password
   */
  async savePassword(): Promise<void> {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.newPassword)) {
      this.showToast('La password deve avere almeno 8 caratteri, 1 maiuscola, 1 minuscola e 1 numero', 'danger');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showToast('Le password non coincidono', 'danger');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Aggiornamento in corso...'
    });
    await loading.present();

    this.profileService.updatePassword(this.currentPassword, this.newPassword).subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.showToast('Password aggiornata con successo', 'success');
          this.showPasswordModal = false;
        } else {
          this.showToast(response.error || 'Errore durante l\'aggiornamento', 'danger');
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showToast('Errore di connessione', 'danger');
        console.error('Errore updatePassword:', error);
      }
    });
  }

  // ==================== FUNZIONI PER LA FOTO PROFILO ====================

  /**
   * Apre l'action sheet per gestire la foto
   */
  async openPhotoActionSheet(): Promise<void> {
    const buttons: any[] = [
      {
        text: 'Scatta una foto',
        icon: 'camera',
        handler: () => this.takePhoto('camera')
      },
      {
        text: 'Scegli dalla galleria',
        icon: 'images',
        handler: () => this.takePhoto('gallery')
      }
    ];

    // Se esiste già una foto, aggiungi il pulsante per rimuoverla
    if (this.profile?.urlFotoProfilo) {
      buttons.push({
        text: 'Rimuovi foto',
        icon: 'trash',
        role: 'destructive',
        handler: () => this.confirmDeletePicture()
      });
    }

    buttons.push({
      text: 'Annulla',
      icon: 'close',
      role: 'cancel'
    });

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Foto profilo',
      buttons: buttons
    });

    await actionSheet.present();
  }

  /**
   * Prende una foto dalla fotocamera o galleria
   */
  async takePhoto(source: 'camera' | 'gallery'): Promise<void> {
    // Per ora usiamo l'input file (poi integro Capacitor Camera)
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    if (source === 'camera') {
        input.setAttribute('capture', 'environment');
    }

    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        await this.uploadPhoto(file);
      }
    };

    input.click();
  }

  /**
   * Carica la foto sul server
   */
  async uploadPhoto(file: File): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Caricamento in corso...'
    });
    await loading.present();

    this.profileService.uploadPicture(file).subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.showToast('Foto aggiornata con successo', 'success');
        } else {
          this.showToast(response.error || 'Errore durante il caricamento', 'danger');
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showToast('Errore di connessione', 'danger');
        console.error('Errore uploadPicture:', error);
      }
    });
  }

  /**
   * Conferma la rimozione della foto
   */
  async confirmDeletePicture(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Rimuovi foto',
      message: 'Sei sicuro di voler rimuovere la foto profilo?',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Rimuovi',
          role: 'destructive',
          handler: () => this.deletePicture()
        }
      ]
    });
    await alert.present();
  }

  /**
   * Rimuove la foto dal server
   */
  async deletePicture(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Rimozione in corso...'
    });
    await loading.present();

    this.profileService.deletePicture().subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.showToast('Foto rimossa con successo', 'success');
        } else {
          this.showToast(response.error || 'Errore durante la rimozione', 'danger');
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showToast('Errore di connessione', 'danger');
        console.error('Errore deletePicture:', error);
      }
    });
  }

  // ==================== FUNZIONI PER ELIMINARE L'ACCOUNT ====================

  /**
   * Avvia il flusso di eliminazione account (primo step: chiede la password)
   */
  async startDeleteAccount(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Conferma identità',
      message: 'Inserisci la tua password per procedere con l\'eliminazione dell\'account.',
      inputs: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Password',
          attributes: {
            autocomplete: 'current-password'
          }
        }
      ],
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Continua',
          handler: (data) => {
            if (data.password) {
              this.confirmDeleteAccount(data.password);
            } else {
              this.showToast('Inserisci la password', 'warning');
              return false; // Mantiene l'alert aperto
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Secondo step: conferma finale dell'eliminazione
   */
  async confirmDeleteAccount(password: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: '⚠️ Eliminazione definitiva',
      message: 'Questa operazione è irreversibile. <br><br> <strong>Tutti i tuoi dati verranno cancellati permanentemente.</strong>',
      buttons: [
        {
          text: 'Annulla',
          role: 'cancel'
        },
        {
          text: 'Elimina account',
          role: 'destructive',
          handler: () => this.executeDeleteAccount(password)
        }
      ]
    });
    await alert.present();
  }

  /**
   * Esecuzione finale dell'eliminazione
   */
  async executeDeleteAccount(password: string): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminazione in corso...'
    });
    await loading.present();

    this.profileService.deleteAccount(password).subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.showToast('Account eliminato con successo', 'success');
          // Logout e reset
          this.authService.logout();
          this.profileService.resetProfile();
        } else {
          this.showToast(response.error || 'Errore durante l\'eliminazione', 'danger');
        }
      },
      error: (error) => {
        loading.dismiss();
        this.showToast('Errore di connessione', 'danger');
        console.error('Errore deleteAccount:', error);
      }
    });
  }

  // ==================== UTILITY ====================

  /**
   * Mostra un toast
   */
  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color,
      buttons: [
        {
          text: 'Chiudi',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Ottiene le iniziali per l'avatar fallback
   */
  getInitials(): string {
    if (!this.profile) return '?';
    const nome = this.profile.nome || '';
    const cognome = this.profile.cognome || '';
    return (nome.charAt(0) + cognome.charAt(0)).toUpperCase() || '?';
  }

  /**
   * Formatta la data di nascita
   */
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}