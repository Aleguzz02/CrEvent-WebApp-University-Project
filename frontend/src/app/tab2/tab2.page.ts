import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonButton, IonCard, IonCardHeader, 
  IonCardTitle, IonList, IonSegment, IonSegmentButton, IonItemDivider, IonButtons, IonModal } from '@ionic/angular/standalone';
import { CardCreventComponent } from '../components/card-crevent/card-crevent.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { SignupModalComponent } from '../components/signup-modal/signup-modal.component';
import { ModalController } from '@ionic/angular/standalone';
import { BrowseService } from '../services/browse.service';
import { ToastService } from '../services/toast.service';
import { LocationResource } from '../interfaces/location.interface';
import { StaffResource } from '../interfaces/staff.interface';




import { AdminService, CreateLocationRequest, CreateStaffRequest } from '../services/admin.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CardCreventComponent, IonLabel, CommonModule, 
    FormsModule, IonCard, IonCardHeader, IonCardTitle, IonButton, IonList, IonSegmentButton, IonSegment, IonItemDivider, IonButtons],
  standalone: true
})
export class Tab2Page implements OnInit, OnDestroy {

  // Servizi
  private toast = inject(ToastService);
  private browseService = inject(BrowseService);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private modalCtrl = inject(ModalController);
  private destroy$ = new Subject<void>();

  sezione: 'iniziale' | 'location' | 'staff' = 'iniziale';

  isAuthenticated = false;
  isAdmin = false;
  showLocationForm = false;
  showStaffForm = false;
  isSaving = false;

  listaLocation: LocationResource[] = [];  
  listaStaff: StaffResource[] = [];

  dj: StaffResource[] = [];
  catering: StaffResource[] = [];
  fotografo: StaffResource[] = [];
  altro: StaffResource[] = [];


  newLocation: CreateLocationRequest = this.getEmptyLocationForm();
  newStaff: CreateStaffRequest = this.getEmptyStaffForm();

  constructor() {}

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
        this.showLocationForm = false;
        this.showStaffForm = false;
      }
    });
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
    this.showLocationForm = false;
    this.showStaffForm = false;
  }

  selezionaSezione(sezione: 'location' | 'staff') {
    this.sezione = sezione;
    this.showLocationForm = false;
    this.showStaffForm = false;
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

  toggleLocationForm() {
    this.showLocationForm = !this.showLocationForm;
    this.showStaffForm = false;
  }

  toggleStaffForm() {
    this.showStaffForm = !this.showStaffForm;
    this.showLocationForm = false;
  }

  createLocation() {
    this.isSaving = true;

    this.adminService.createLocation(this.newLocation).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (!response.success) {
          this.toast.error(response.message || 'Errore durante la creazione della location');
          return;
        }

        this.toast.success('Location creata');
        this.newLocation = this.getEmptyLocationForm();
        this.showLocationForm = false;
        this.loadData();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.toast.error(err.error?.message || err.message || 'Errore durante la creazione della location');
      }
    });
  }

  deleteLocation(location: any) {
    const confirmed = confirm(`Eliminare la location "${location.nome}"?`);
    if (!confirmed) {
      return;
    }

    this.adminService.deleteLocation(location.id).subscribe({
      next: (response) => {
        if (!response.success) {
          this.toast.error(response.message || "Errore durante l'eliminazione della location");
          return;
        }

        this.toast.success('Location eliminata');
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.message || err.message || "Errore durante l'eliminazione della location");
      }
    });
  }

  createStaff() {
    this.isSaving = true;

    this.adminService.createStaff(this.newStaff).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (!response.success) {
          this.toast.error(response.message || 'Errore durante la creazione dello staff');
          return;
        }

        this.toast.success('Staff creato');
        this.newStaff = this.getEmptyStaffForm();
        this.showStaffForm = false;
        this.loadData();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.toast.error(err.error?.message || err.message || 'Errore durante la creazione dello staff');
      }
    });
  }

  deleteStaff(staff: any) {
    const confirmed = confirm(`Eliminare lo staff "${staff.nome} ${staff.cognome || ''}"?`);
    if (!confirmed) {
      return;
    }

    this.adminService.deleteStaff(staff.id).subscribe({
      next: (response) => {
        if (!response.success) {
          this.toast.error(response.message || "Errore durante l'eliminazione dello staff");
          return;
        }

        this.toast.success('Staff eliminato');
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.message || err.message || "Errore durante l'eliminazione dello staff");
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getEmptyLocationForm(): CreateLocationRequest {
    return {
      nome: '',
      indirizzo: '',
      citta: '',
      descrizione: '',
      capienza: null,
      costo: null,
      dataInizio: '',
      dataFine: '',
      urlImg: '',
      linkSito: '',
      lat: null,
      lng: null
    };
  }

  private getEmptyStaffForm(): CreateStaffRequest {
    return {
      nome: '',
      cognome: '',
      tipo: 'catering',
      costo: null,
      descrizione: '',
      linkSito: '',
      genereMusicale: '',
      genereFotografico: '',
      mansione: '',
      dataInizio: '',
      dataFine: '',
      urlImg: '',
      accountEmail: '',
      accountPassword: '',
      accountTelefono: '',
      accountDataNascita: ''
    };
  }
}
