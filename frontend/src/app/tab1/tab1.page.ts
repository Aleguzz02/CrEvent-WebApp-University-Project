import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonButton, IonIcon, 
  IonCard, IonCardContent, IonButtons, IonCardTitle, IonCardHeader, AlertController 
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { EventCardComponent } from '../components/event-card/event-card.component';
import { StaffEventInfoCardComponent } from '../components/staff-event-info-card/staff-event-info-card.component';
import { addOutline, calendarOutline, logIn, peopleOutline, personAdd } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { SignupModalComponent } from '../components/signup-modal/signup-modal.component';
import { ModalController } from '@ionic/angular/standalone';
import { EventService } from '../services/event.service';
import { ToastService } from '../services/toast.service';
import { EventDataModalComponent } from '../components/event-data-modal/event-data-modal.component';
import { Evento, EventDraft } from '../interfaces/event.interface';
import { AdminEvent, AdminService, AdminUser } from '../services/admin.service';
import { StaffEventInfo } from '../interfaces/event.interface';
type AdminView = 'home' | 'users' | 'events';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, EventCardComponent, IonFab, IonButton, 
    IonIcon, IonCard, IonCardContent, IonButtons, IonCardTitle, IonCardHeader,
    StaffEventInfoCardComponent
  ],
})
export class Tab1Page implements OnInit, OnDestroy {

  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private modalCtrl = inject(ModalController);
  private toastService = inject(ToastService);
  private alertCtrl = inject(AlertController);

  isAuthenticated = false;
  isAdmin = false;
  isStaff = false;
  private destroy$ = new Subject<void>();
  
  userEvents: Evento[] = [];
  adminUsers: AdminUser[] = [];
  adminEvents: AdminEvent[] = [];
  adminView: AdminView = 'home';
  isLoading: boolean = false;
  staffEvents: StaffEventInfo[] = [];

  
  constructor(private router: Router) {
    addIcons({ addOutline, calendarOutline, logIn, peopleOutline, personAdd });
  }

  ngOnInit(){
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.isAuthenticated = status;

        if (!status) {
          this.userEvents = [];
          this.isStaff = false;
        }
      });

    this.authService.isAdmin$
    .pipe(takeUntil(this.destroy$))
    .subscribe(status => {
      this.isAdmin = status;
      if (!status) {
        this.adminView = 'home';
        this.adminUsers = [];
        this.adminEvents = [];
      }
    });

    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isStaff = user?.tipoUtente === 2 && (!!user.idStaff || !!user.idLocation);

        if (!user || user.tipoUtente !== 0) {
          this.userEvents = [];
          return;
        }

        this.loadEvents();
      });
    this.eventService.eventsChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadEvents());

    if (!this.isAuthenticated) {
      this.openLoginModal();
    }
  }

  ionViewWillEnter() {
    if (this.isAuthenticated) {
      if (!this.isAdmin && !this.isStaff) {
        this.loadEvents();
      } 
    }
  }

  async openLoginModal() {
    const modal = await this.modalCtrl.create({
      component: LoginModalComponent,
      cssClass: ['auth-modal', 'auth-login-modal'],
    });
    await modal.present();
  }

  async openSignupModal() {
    const modal = await this.modalCtrl.create({
      component: SignupModalComponent,
      cssClass: ['auth-modal', 'auth-signup-modal'],
    });
    await modal.present();
  }

  logout() {
    this.authService.logout();
    this.userEvents = [];
    this.adminView = 'home';
    this.adminUsers = [];
    this.adminEvents = [];
  }

  async creaNuovoEvento(){
    if (this.isStaff) {
      this.toastService.warning('Gli account staff/location non possono prenotare eventi');
      return;
    }

    const modal = await this.modalCtrl.create({
        component: EventDataModalComponent,
        cssClass: 'create-modals'
      });

      await modal.present();

      const result = await modal.onDidDismiss<EventDraft>();

      if (result.role !== 'confirm' || !result.data) {
        return;
      }

      this.router.navigate(['/create-event'], {
        state: {
          eventDraft: result.data
        }
      });  
    }

  ngOnDestroy(): void {
    this.destroy$.next();      
    this.destroy$.complete();
  }

  loadEvents(){
    this.isLoading = true;
    
    this.eventService.getUserEvents().subscribe({
      next: (response) => {
        this.isLoading = false;
        if(!response.success){
          this.toastService.error(response.message ?? 'Errore durante il caricamento');
          return; 
        }
        this.userEvents = response.data ?? [];
      },
      error: (err) => { 
        this.isLoading = false;
        console.error(err);
        this.toastService.error(err.message);
      },
    });
  }

  showAdminHome() {
    this.adminView = 'home';
  }

  showAdminUsers() {
    this.adminView = 'users';
    this.loadAdminUsers();
  }

  showAdminEvents() {
    this.adminView = 'events';
    this.loadAdminEvents();
  }

  loadAdminUsers() {
    this.isLoading = true;

    this.adminService.getUsers().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (!response.success || !response.data) {
          this.toastService.error(response.message || 'Errore nel recupero degli utenti');
          return;
        }
        this.adminUsers = response.data;
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.toastService.error(err.error?.message || err.message || 'Errore nel recupero degli utenti');
      }
    });
  }

  deleteAdminUser(user: AdminUser) {
  if (user.tipoUtente === 1) {
    this.toastService.warning('Non puoi eliminare un amministratore');
    return;
  }

  if (user.tipoUtente === 2) {
    this.alertCtrl.create({
      header: 'Conferma eliminazione staff',
      message: `Stai per eliminare lo staff "${user.nome} ${user.cognome}". Sei sicuro?`,
      cssClass: 'admin-delete-alert',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          cssClass: 'danger',
          handler: () => {
            this.proceedDeleteUser(user);
          }
        }
      ]
    }).then(alert => alert.present());
    return;
  }

  this.adminService.getUserEventsCount(user.email).subscribe({
    next: (countResponse) => {
      const count = countResponse.success ? countResponse.data?.count ?? 0 : 0;
      const eventiText = count === 1 ? 'evento attivo' : 'eventi attivi';
      const message = `L'utente selezionato ha ${count} ${eventiText}. Se lo elimini, verranno cancellati tutti i suoi eventi. Confermi?`;

      this.alertCtrl.create({
        header: 'Conferma eliminazione utente',
        message: message,
        cssClass: 'admin-delete-alert',
        buttons: [
          { text: 'Annulla', role: 'cancel' },
          {
            text: 'Elimina',
            cssClass: 'danger',
            handler: () => {
              this.proceedDeleteUser(user);
            }
          }
        ]
      }).then(alert => alert.present());
    },
    error: (err) => {
      console.error('Errore nel conteggio eventi', err);
      this.alertCtrl.create({
        header: 'Attenzione',
        message: "Impossibile recuperare il conteggio degli eventi. Eliminare comunque l'utente? Verranno cancellati tutti i suoi eventi.",
        cssClass: 'admin-delete-alert',
        buttons: [
          { text: 'Annulla', role: 'cancel' },
          {
            text: 'Elimina',
            cssClass: 'danger',
            handler: () => {
              this.proceedDeleteUser(user);
            }
          }
        ]
      }).then(alert => alert.present());
    }
  });
}

private proceedDeleteUser(user: AdminUser) {
  this.adminService.deleteUser(user.email).subscribe({
    next: (response) => {
      if (!response.success) {
        this.toastService.error(response.message || "Errore durante l'eliminazione");
        return;
      }
      this.adminUsers = this.adminUsers.filter(item => item.email !== user.email);
      this.toastService.success('Utente eliminato');
    },
    error: (err) => {
      console.error(err);
      this.toastService.error(err.error?.message || err.message || "Errore durante l'eliminazione");
    }
  });
}

  loadAdminEvents() {
    this.isLoading = true;

    this.adminService.getEvents().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (!response.success || !response.data) {
          this.toastService.error(response.message || 'Errore nel recupero degli eventi');
          return;
        }
        this.adminEvents = response.data;
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.toastService.error(err.error?.message || err.message || 'Errore nel recupero degli eventi');
      }
    });
  }

  deleteAdminEvent(event: AdminEvent) {
    this.alertCtrl.create({
      header: 'Conferma eliminazione evento',
      message: `Eliminare l'evento "${event.nome}"?`,
      cssClass: 'admin-delete-alert',
      buttons: [
        { text: 'Annulla', role: 'cancel' },
        {
          text: 'Elimina',
          cssClass: 'danger',
          handler: () => {
            this.adminService.deleteEvent(event.id).subscribe({
              next: (response) => {
                if (!response.success) {
                  this.toastService.error(response.message || "Errore durante l'eliminazione dell'evento");
                  return;
                }
                this.adminEvents = this.adminEvents.filter(item => item.id !== event.id);
                this.toastService.success('Evento eliminato');
              },
              error: (err) => {
                console.error(err);
                this.toastService.error(err.error?.message || err.message || "Errore durante l'eliminazione dell'evento");
              }
            });
          }
        }
      ]
    }).then(alert => alert.present());
  }
}
