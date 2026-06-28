import { Component, OnInit, OnDestroy, inject} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonCard, IonAvatar, IonIcon,
  IonItem, IonLabel, IonList, IonCardContent, IonBadge, IonNote
 } from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { SignupModalComponent } from '../components/signup-modal/signup-modal.component';
import { ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonCard, IonCardContent, IonAvatar,
     IonIcon, IonItem, IonLabel, IonList, IonBadge, IonNote],
  standalone: true
})
export class Tab3Page implements OnInit, OnDestroy {

  // Servizi
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);

  // Variabili
  isAuthenticated = false;
  private destroy$ = new Subject<void>();

  constructor() {}

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

  ngOnDestroy(): void {
    this.destroy$.next();       // Emette il valore che attiva takeUntil
    this.destroy$.complete();   // Elimina il subject destroy$
  }

}
