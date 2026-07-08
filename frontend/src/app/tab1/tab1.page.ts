import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonButton, IonIcon, 
  IonCard, IonCardContent, IonButtons, IonCardTitle, IonCardHeader
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { EventCardComponent } from '../components/event-card/event-card.component';
import { addOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { SignupModalComponent } from '../components/signup-modal/signup-modal.component';
import { ModalController } from '@ionic/angular/standalone';
import { EventService } from '../services/event.service';
import { ToastService } from '../services/toast.service';
import { EventDataModalComponent } from '../components/event-data-modal/event-data-modal.component';
import { Evento, EventDraft } from '../interfaces/event.interface';
import { AdminEvent, AdminService, AdminUser } from '../services/admin.service';

type AdminView = 'home' | 'users' | 'events';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, EventCardComponent, IonFab, IonButton, 
    IonIcon, IonCard, IonCardContent, IonButtons, IonCardTitle, IonCardHeader
  ],
})
export class Tab1Page implements OnInit, OnDestroy {

  // Servizi
  private eventService = inject(EventService);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private modalCtrl = inject(ModalController);
  private toastService = inject(ToastService);

  // Variabili
  isAuthenticated = false;
  isAdmin = false;
  private destroy$ = new Subject<void>();
  
  userEvents: Evento[] = [];
  adminUsers: AdminUser[] = [];
  adminEvents: AdminEvent[] = [];
  adminView: AdminView = 'home';
  isLoading: boolean = false;

  
  constructor(private router: Router) {
    addIcons({ addOutline });
  }

  ngOnInit(){
    this.authService.isAuthenticated$
    .pipe(takeUntil(this.destroy$))
    .subscribe(status => {
      this.isAuthenticated = status;
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
  }

  ionViewWillEnter() {
    if (this.isAuthenticated) {
      if (!this.isAdmin) {
        this.loadEvents();
      }
    } else {
      this.openLoginModal();
    }
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

  logout() {
    this.authService.logout();
    this.userEvents = [];
    this.adminView = 'home';
    this.adminUsers = [];
    this.adminEvents = [];
  }

  async creaNuovoEvento(){
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
      next: (risposta) => {
        this.isLoading = false;
        if(!risposta.success){
          this.toastService.error(risposta.message ?? 'Errore durante il caricamento');
          return; 
        }
        this.userEvents = risposta.data ?? [];
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

    const confirmed = confirm(`Eliminare l'utente ${user.email}?`);
    if (!confirmed) {
      return;
    }

    this.adminService.deleteUser(user.email).subscribe({
      next: (response) => {
        if (!response.success) {
          this.toastService.error(response.message || "Errore durante l'eliminazione dell'utente");
          return;
        }
        this.adminUsers = this.adminUsers.filter(item => item.email !== user.email);
        this.toastService.success('Utente eliminato');
      },
      error: (err) => {
        console.error(err);
        this.toastService.error(err.error?.message || err.message || "Errore durante l'eliminazione dell'utente");
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
    const confirmed = confirm(`Eliminare l'evento "${event.nome}"?`);
    if (!confirmed) {
      return;
    }

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
