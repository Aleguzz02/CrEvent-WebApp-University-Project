import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonButton, IonIcon, 
  IonCard, IonCardContent, IonButtons
} from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { addIcons } from 'ionicons';
import { EventCardComponent } from '../components/event-card/event-card.component';
import { addOutline } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { SignupModalComponent } from '../components/signup-modal/signup-modal.component';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, EventCardComponent, IonFab, IonButton, 
    IonIcon, IonCard, IonCardContent, IonButtons
  ],
})
export class Tab1Page implements OnInit, OnDestroy {

  // Servizi
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);

  // Variabili
  isAuthenticated = false;
  private destroy$ = new Subject<void>();
  
  eventiUtente: any[] = [];
  
  constructor() {
    addIcons({ addOutline });
  }

  ngOnInit(){
    this.authService.isAuthenticated$
    .pipe(takeUntil(this.destroy$))
    .subscribe(status => {
      this.isAuthenticated = status;
    })

    if (!this.isAuthenticated) {
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

  creaNuovoEvento(){}

  ngOnDestroy(): void {
    this.destroy$.next();       // Emette il valore che attiva takeUntil
    this.destroy$.complete();   // Elimina il subject destroy$
  }
  
}
