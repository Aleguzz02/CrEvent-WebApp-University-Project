import { Component, OnInit, inject} from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonCard, IonAvatar, IonIcon,
  IonItem, IonLabel, IonList, IonCardContent, IonBadge, IonNote
 } from '@ionic/angular/standalone';
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
export class Tab3Page implements OnInit{

  // Servizi
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);

  isAuthenticated = false;
  private modalPresented = false;

  constructor() {}

  ngOnInit(){
    this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
    })

    if (!this.isAuthenticated) {
      this.modalPresented = true;
      this.openLoginModal();
    } else {
      this.modalPresented = false;
    }
  }

  async openLoginModal() {
    const modal = await this.modalCtrl.create({
      component: LoginModalComponent,
      backdropDismiss: false,
      showBackdrop: true
    });
    await modal.present();
  }

  async openSignupModal() {
    const modal = await this.modalCtrl.create({
      component: SignupModalComponent,
      backdropDismiss: false,
    });
    await modal.present();
  }

  logout() {
    this.authService.logout();
  }

}
