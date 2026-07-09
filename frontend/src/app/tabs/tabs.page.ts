import { Component, EnvironmentInjector, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common'; // ← importa AsyncPipe
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  calendar, 
  search, 
  person,
  people,
  business,
  personCircle
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ],
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);
  private authService = inject(AuthService);

  isAdmin$ = this.authService.isAdmin$;

  constructor() {
    addIcons({ calendar, search, person, people, business, personCircle });
  }
}