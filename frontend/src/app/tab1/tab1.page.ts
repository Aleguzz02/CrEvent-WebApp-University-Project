import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonFab, IonButton, IonIcon, 
  IonCard, IonCardContent, IonButtons
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
  
  eventiUtente: any[] = [
    {
      id: 1,
      nome: 'Matrimonio Rossi-Verdi',
      data: '2026-09-15',
      invitati: 150,
      svolto: 0,
      url: '/resource/locImg/villaZuccarello.jpg'
    },
    {
      id: 2,
      nome: 'Compleanno di Laura',
      data: '2026-07-22',
      invitati: 45,
      svolto: 0,
      url: '/resource/locImg/villaInfinito.jpg'
    },
    {
      id: 3,
      nome: 'Festa di Laurea Marco',
      data: '2026-06-05',
      invitati: 80,
      svolto: 1,
      url: '/resource/locImg/baglioCulluzia.jpg'
    },
    {
      id: 4,
      nome: 'Cena Aziendale TechLab',
      data: '2026-12-18',
      invitati: 120,
      svolto: 0,
      url: ''
    }
  ];

  ordinaEventi() {
    this.eventiUtente.sort((a, b) => {
      if (a.svolto !== b.svolto) {
        return a.svolto - b.svolto;
      }

      const dataA = new Date(a.data).getTime();
      const dataB = new Date(b.data).getTime();

      if (a.svolto === 0) {
        return dataA - dataB;
      }

      return dataB - dataA;
    });
  }
  
  constructor(private router: Router) {
    addIcons({ addOutline });
  }

  ngOnInit(){
    this.ordinaEventi();

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

  creaNuovoEvento(){
    this.router.navigate(['/create-event']);  
  }

  ngOnDestroy(): void {
    this.destroy$.next();       // Emette il valore che attiva takeUntil
    this.destroy$.complete();   // Elimina il subject destroy$
  }
  
}
