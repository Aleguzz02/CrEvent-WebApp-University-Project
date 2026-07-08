import { Component, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonButton, IonCard, IonCardHeader, 
  IonCardTitle, IonList, IonSegment, IonSegmentButton, IonItemDivider, IonButtons, IonModal } from '@ionic/angular/standalone';
import { CardCreventComponent } from '../components/card-crevent/card-crevent.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { SignupModalComponent } from '../components/signup-modal/signup-modal.component';
import { ModalController } from '@ionic/angular/standalone';
import { BrowseService } from '../services/browse.service';
import { ToastService } from '../services/toast.service';
import { LocationResource } from '../interfaces/location.interface';
import { StaffResource } from '../interfaces/staff.interface';





@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CardCreventComponent, IonLabel, CommonModule, 
    IonCard, IonCardHeader, IonCardTitle, IonButton, IonList, IonSegmentButton, IonSegment, IonItemDivider, IonButtons],
  standalone: true
})
export class Tab2Page implements OnInit {

  // Servizi
  private toast = inject(ToastService);
  private browseService = inject(BrowseService);
  private authService = inject(AuthService);
  private modalCtrl = inject(ModalController);

  sezione: 'iniziale' | 'location' | 'staff' = 'iniziale';

  isAuthenticated = false;

  listaLocation: LocationResource[] = [];  
  listaStaff: StaffResource[] = [];

  dj: StaffResource[] = [];
  catering: StaffResource[] = [];
  fotografo: StaffResource[] = [];
  altro: StaffResource[] = [];


  constructor() {}

  ngOnInit(){
    this.authService.isAuthenticated$.subscribe(status => {
      this.isAuthenticated = status;
    })
  }
  ionViewWillEnter(){
    this.loadData();
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

  selezionaSezione(sezione: 'location' | 'staff') {
    this.sezione = sezione;
  }

  caricaDatiFinti() {}

  filterData() {
    this.dj = this.listaStaff.filter(staff => staff.tipo === 'intrattenimento');
    this.catering = this.listaStaff.filter(staff => staff.tipo === 'catering');
    this.fotografo = this.listaStaff.filter(staff => staff.tipo === 'fotografo');
    this.altro = this.listaStaff.filter(staff => staff.tipo === 'altro');
  }

  loadData(){
    this.browseService.getBrowseData().subscribe({
      next: (risposta) => {
        if(risposta.success) {
          this.listaLocation = risposta.data?.location ?? [];
          this.listaStaff = risposta.data?.staff ?? [];
          this.filterData();
        }
      },
      error: (err) => {
        console.error("Impossibile connettersi al backend:", err);
        this.toast.error("Errore durante la ricezione degli elementi")
      }
    });
  }
}
