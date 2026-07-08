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
  private modalCtrl = inject(ModalController);
  private toastService = inject(ToastService);

  // Variabili
  isAuthenticated = false;
  isAdmin = false;
  private destroy$ = new Subject<void>();
  
  userEvents: any[] = [];
  isLoading: boolean = false;

  
  constructor(private router: Router) {
    addIcons({ addOutline });
  }

  ngOnInit(){
    this.authService.isAuthenticated$
    .pipe(takeUntil(this.destroy$))
    .subscribe(status => {
      this.isAuthenticated = status;
    })
  }

  ionViewWillEnter() {
    if (this.isAuthenticated) {
      this.loadEvents();
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
  }

  async creaNuovoEvento(){
    const modal = await this.modalCtrl.create({
        component: EventDataModalComponent,
        cssClass: 'create-modals'
      });

      await modal.present();

      const result = await modal.onDidDismiss<{
        nome: string;
        capienza: number;
      }>();

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
    this.destroy$.next();       // Emette il valore che attiva takeUntil
    this.destroy$.complete();   // Elimina il subject destroy$
  }

  loadEvents(){
    this.isLoading = true;
    
    this.eventService.getUserEvents().subscribe({
      next: (response) => {
        this.isLoading = false;
        if(!response.success){
          this.toastService.error(response.message);
          return; 
        }
        this.userEvents = response.data;
      },
      error: (err) => { 
        this.isLoading = false;
        console.error(err);
        this.toastService.error(err.message);
      },
    });
  }
}
