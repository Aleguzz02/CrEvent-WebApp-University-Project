import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonButton, IonCard, IonCardHeader, 
  IonCardTitle, IonList, IonSegment, IonSegmentButton, IonItemDivider, IonButtons, IonModal } from '@ionic/angular/standalone';
import { CardCreventComponent } from '../components/card-crevent/card-crevent.component';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../components/login-form/login-form.component';
import { SignupFormComponent } from '../components/signup-form/signup-form.component';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CardCreventComponent, IonLabel, CommonModule, 
    IonCard, IonCardHeader, IonCardTitle, IonButton, IonList, IonSegmentButton, IonSegment, IonItemDivider,
    HttpClientModule, IonButtons, IonModal, SignupFormComponent, LoginFormComponent],
  standalone: true
})
export class Tab2Page implements OnInit {

  @ViewChild('loginModal') loginModal!: IonModal;
  @ViewChild('signupModal') signupModal!: IonModal;
  @ViewChild(SignupFormComponent) signupFormComp!: SignupFormComponent;
  @ViewChild(LoginFormComponent) loginFormComp!: LoginFormComponent;

  sezione: 'iniziale' | 'location' | 'staff' = 'iniziale';

  isAuthenticated = false;

  listaLocation: any[] = [];
  listaStaff: any[] = [];

  dj: any[] = [];
  catering: any[] = [];
  fotografo: any[] = [];
  altro: any[] = [];

  private authService = inject(AuthService);

  constructor(private http: HttpClient) {}

  ngOnInit(){
    this.caricaDati();
    this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
    })
  }

  loginCancel() {
    this.loginModal.dismiss(null, 'cancel');
  }

  loginConfirm() {
    const loginFormData = this.loginFormComp.onSubmit();
    if (loginFormData) {
      this.authService.login(loginFormData).subscribe({
        next: (res) => {
          // salva token e mail nel localStorage
          localStorage.setItem('token', res.token);
          localStorage.setItem('userEmail', res.userEmail);
          localStorage.setItem('userNome', res.userNome);

          // chiude il modal
          this.loginModal.dismiss(loginFormData, 'confirm');
        },
        error: (err) => console.log('Error: ', err)
      })
    }
  }

  signupCancel() {
    this.signupModal.dismiss(null, 'cancel');
  }

  signupConfirm() {
    const signupFormData = this.signupFormComp.onSubmit();
    if (signupFormData) {
      this.authService.signup(signupFormData).subscribe({
        next: (res) => console.log('Server response:', res),
        error: (err) => console.error('Error:', err)
      });
      this.signupModal.dismiss(signupFormData, 'confirm');
    }
  }

  logout() {
    this.authService.logout();
  }

  selezionaSezione(sezione: 'location' | 'staff') {
    this.sezione = sezione;
  }

  caricaDatiFinti() {
    this.listaLocation = [
      { id: 1, nome: 'Villa Zuccarello', indirizzo: 'Via Villagrazia 103', citta: 'Palermo', costo: 2500, capienza: 200, url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600' },
      { id: 2, nome: 'Villa Infinito', indirizzo: 'Viale Regione Siciliana 6985', citta: 'Palermo', costo: 2000, capienza: 150, url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600' }
    ];
    this.listaStaff = [
      { id: 1, nome: 'Galati', cognome: 'Catering', tipo: 'catering', costo: 80, url: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600' },
      { id: 2, nome: 'Natale', cognome: 'Chef Catering', tipo: 'catering', costo: 95, url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=600' },
      { id: 10, nome: 'Prestigio', cognome: 'Ricevimenti', tipo: 'catering', costo: 110, url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600' },
      { id: 11, nome: 'Gourmet', cognome: 'Banquet', tipo: 'catering', costo: 75, url: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?q=80&w=600' },
      { id: 12, nome: 'Sicilia', cognome: 'Bedda Catering', tipo: 'catering', costo: 65, url: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?q=80&w=600' },
      { id: 13, nome: 'Luxury', cognome: 'Food Experience', tipo: 'catering', costo: 130, url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600' },
      { id: 14, nome: 'Bio', cognome: 'Event Catering', tipo: 'catering', costo: 85, url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600' },
      { id: 1, nome: 'Galati', cognome: 'Catering', tipo: 'catering', costo: 80, url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600'  },
      { id: 2, nome: 'Natale', cognome: 'Chef Catering', tipo: 'catering', costo: 95, url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600'  },
      { id: 3, nome: 'Riccardo', cognome: 'Ferrarese', tipo: 'intrattenimento', costo: 500, genereMusicale: 'Commerciale', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600'  },
      { id: 5, nome: 'Tiberio', cognome: 'Cantafia', tipo: 'fotografo', costo: 1200, url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600'  },
      { id: 7, nome: 'Emanuele', cognome: 'D\'Angeli', tipo: 'altro', costo: 600, mansione: 'Illusionista', url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600'  }];
  }

  filtraDati() {
    this.dj = this.listaStaff.filter(staff => staff.tipo === 'intrattenimento');
    this.catering = this.listaStaff.filter(staff => staff.tipo === 'catering');
    this.fotografo = this.listaStaff.filter(staff => staff.tipo === 'fotografo');
    this.altro = this.listaStaff.filter(staff => staff.tipo === 'altro');
  }

  caricaDati(){
    this.http.get<any>('http://localhost:3000/api/browse').subscribe({
      next: (risposta) => {
        if(risposta.success) {
          this.listaLocation = risposta.data.location;
          this.listaStaff = risposta.data.staff;
          this.filtraDati();
        }
      },
      error: (err) => {
        console.error("Impossibile connettersi al backend:", err);
        this.caricaDatiFinti();
        this.filtraDati();
      }
    });
  }
}
