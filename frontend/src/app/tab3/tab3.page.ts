import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef  } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
  IonCard, IonIcon, IonCardContent, IonAvatar, IonLabel, IonItem,
  IonList, IonSkeletonText, IonFabButton, IonRefresher, IonRefresherContent
} from '@ionic/angular/standalone';
import { ModalController, AlertController, ToastController, LoadingController, ActionSheetController } from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { UserProfile } from '../interfaces/profile.interface';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { SignupModalComponent } from '../components/signup-modal/signup-modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { camera, call, pencil, lockClosed, chevronForward, trash, images, close, logIn, personAdd } from 'ionicons/icons';
import { EditPhoneModalComponent } from '../components/edit-phone-modal/edit-phone-modal.component';
import { ChangePasswordModalComponent } from '../components/change-password-modal/change-password-modal.component';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
    IonCard, IonIcon, IonCardContent, IonAvatar, IonLabel, IonItem,
    IonList, IonSkeletonText, IonFabButton, IonRefresher, IonRefresherContent,
    CommonModule, FormsModule
  ],
  standalone: true
})
export class Tab3Page implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private actionSheetCtrl = inject(ActionSheetController);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  isAuthenticated = false;
  profile: UserProfile | null = null;
  loading = false;

  private destroy$ = new Subject<void>();

  constructor() {
    addIcons({ camera, call, pencil, lockClosed, chevronForward, trash, images, close, logIn, personAdd });
  }

  ngOnInit(): void {
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isAuthenticated = status;
        if (status) {
          this.loadProfile();
        } else {
          this.profileService.resetProfile();
          this.profile = null;
        }
      });

    this.profileService.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.profile = profile;
      });

    this.profileService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.loading = loading;
      });

    if (!this.isAuthenticated) {
      this.openLoginModal();
    }
  }

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

  async openLoginModal() {
    const modal = await this.modalCtrl.create({
      component: LoginModalComponent,
    });
    await modal.present();
  }

  async openSignupModal() {
    const modal = await this.modalCtrl.create({
      component: SignupModalComponent,
    });
    await modal.present();
  }

  logout(): void {
    this.authService.logout();
    this.profileService.resetProfile();
  }


  async openEditPhoneModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: EditPhoneModalComponent,
      cssClass: 'profile-phone-modal',
      componentProps: {
        phone: this.profile?.telefono || ''
      }
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'save' && data) {
      await this.savePhone(data);
    } else if (role === 'error' && data?.error) {
      this.showToast(data.error, 'danger');
    }
  }

  async savePhone(newPhone: string): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Aggiornamento in corso...'
    });
    await loading.present();

    this.profileService.updatePhone(newPhone).subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.showToast('Telefono aggiornato con successo', 'success');
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

  async openPasswordModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ChangePasswordModalComponent,
      cssClass: 'profile-password-modal',
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'save' && data) {
      await this.savePassword(data.currentPassword, data.newPassword);
    } else if (role === 'error' && data?.error) {
      this.showToast(data.error, 'danger');
    }
  }

  async savePassword(currentPassword: string, newPassword: string): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: 'Aggiornamento in corso...'
    });
    await loading.present();

    this.profileService.updatePassword(currentPassword, newPassword).subscribe({
      next: (response) => {
        loading.dismiss();
        if (response.success) {
          this.showToast('Password aggiornata con successo', 'success');
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

  async openPhotoActionSheet(): Promise<void> {
    const buttons: any[] = [
      {
        text: 'Scegli dalla galleria',
        icon: 'images',
        handler: () => this.takePhoto('gallery')
      }
    ];

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

  async takePhoto(source: 'camera' | 'gallery'): Promise<void> {
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
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
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

  async startDeleteAccount(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Conferma identità',
      cssClass: 'delete-account-alert',
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
              return false;
            }
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async confirmDeleteAccount(password: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      cssClass: ['delete-account-alert', 'delete-account-alert-danger'],
      header: 'Eliminazione definitiva',
      message: 'Questa operazione è irreversibile. Tutti i tuoi dati verranno cancellati permanentemente.',
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
          this.authService.logout();
          this.profileService.resetProfile();
          this.router.navigate(['/tabs/tab2']);
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

  getInitials(): string {
    if (!this.profile) return '?';
    const nome = this.profile.nome || '';
    const cognome = this.profile.cognome || '';
    return (nome.charAt(0) + cognome.charAt(0)).toUpperCase() || '?';
  }

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
