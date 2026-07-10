import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonButton, IonCard, IonCardHeader, 
  IonCardTitle, IonList, IonSegment, IonSegmentButton, IonItemDivider, IonButtons, IonModal, IonSearchbar } from '@ionic/angular/standalone';
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
import { AdminService, CreateLocationRequest, CreateStaffRequest } from '../services/admin.service';
import { Subject, takeUntil } from 'rxjs';
import { UploadService } from '../services/upload.service';
import { AddLocationModalComponent } from '../components/add-location-modal/add-location-modal.component';
import { AddStaffModalComponent } from '../components/add-staff-modal/add-staff-modal.component';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CardCreventComponent, IonLabel, CommonModule, 
    IonCard, IonCardHeader, IonCardTitle, IonButton, IonList, IonSegmentButton, IonSegment, IonItemDivider, IonButtons,
    IonSearchbar],
  standalone: true
})
export class Tab2Page implements OnInit, OnDestroy {

  private toast = inject(ToastService);
  private browseService = inject(BrowseService);
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  private modalCtrl = inject(ModalController);
  private uploadService = inject(UploadService);
  private destroy$ = new Subject<void>();

  sezione: 'iniziale' | 'location' | 'staff' = 'iniziale';

  isAuthenticated = false;
  isAdmin = false;
  isSaving = false;
  searchTerm = '';
  isSearching = false;
  hasStaffResults = false;

  listaLocation: LocationResource[] = [];  
  listaStaff: StaffResource[] = [];
  locationFiltrate: LocationResource[] = [];

  dj: StaffResource[] = [];
  catering: StaffResource[] = [];
  fotografo: StaffResource[] = [];
  altro: StaffResource[] = [];


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
    });
  }
  
  ionViewWillEnter(){
   this.resetData();

    this.loadData();
  }

  resetData() {
    this.searchTerm = '';
    this.isSearching = false;
    this.hasStaffResults = false;
    this.listaLocation = [];
    this.listaStaff = [];
    this.locationFiltrate = [];
    this.dj = [];
    this.catering = [];
    this.altro = [];
    this.fotografo = [];
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

  filterData() {
    const ricerca = this.searchTerm.trim().toLowerCase();
    this.isSearching = ricerca !== '';

    this.locationFiltrate = this.listaLocation.filter(location => {
      const testoLocation = `${location.nome} ${location.citta} ${location.indirizzo} ${location.descrizione}`.toLowerCase();
      return testoLocation.includes(ricerca);
    });

    const staffFiltrato = this.listaStaff.filter(staff => {
      const testoStaff = `${staff.nome} ${staff.cognome} ${staff.tipo} ${staff.descrizione} ${staff.genereMusicale} ${staff.genereFotografico} ${staff.mansione}`.toLowerCase();
      return testoStaff.includes(ricerca);
    });

    this.dj = staffFiltrato.filter(staff => staff.tipo === 'intrattenimento');
    this.catering = staffFiltrato.filter(staff => staff.tipo === 'catering');
    this.fotografo = staffFiltrato.filter(staff => staff.tipo === 'fotografo');
    this.altro = staffFiltrato.filter(staff => staff.tipo === 'altro');

    this.hasStaffResults = staffFiltrato.length > 0;
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.filterData();
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
        this.toast.error(err.message);
      }
    });
  }

  async openCreateLocationModal() {
    const modal = await this.modalCtrl.create({
      component: AddLocationModalComponent,
    });
    await modal.present();

    const result = await modal.onDidDismiss<CreateLocationRequest>();
    if (result.role !== 'confirm' || !result.data) {
      return;
    }

    this.createLocation(result.data);
  }

  createLocation(locationData: CreateLocationRequest) {
    this.isSaving = true;

    this.adminService.createLocation(locationData).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (!response.success) {
          this.toast.error(response.message || 'Errore durante la creazione della location');
          this.deleteUploadedImage(locationData.urlImg);
          return;
        }

        this.toast.success('Location creata');
        this.loadData();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.toast.error(err.error?.message || err.message || 'Errore durante la creazione della location');
        this.deleteUploadedImage(locationData.urlImg);
      }
    });
  }

  private deleteUploadedImage(url: string | null | undefined) {
    if (url) {
      this.uploadService.deleteImage(url).subscribe({
        error: (err) => console.error('Errore durante la cancellazione dell\'immagine:', err)
      });
    }
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

  async openCreateStaffModal() {
    const modal = await this.modalCtrl.create({
      component: AddStaffModalComponent,
      componentProps: {
        locations: this.listaLocation.filter(location => !location.custom)
      },
      cssClass: 'add-resource-modal'
    });
    await modal.present();

    const result = await modal.onDidDismiss<CreateStaffRequest>();
    if (result.role !== 'confirm' || !result.data) {
      return;
    }

    this.createStaff(result.data);
  }

  createStaff(staffData: CreateStaffRequest) {
    this.isSaving = true;

    this.adminService.createStaff(staffData).subscribe({
      next: (response) => {
        this.isSaving = false;
        if (!response.success) {
          this.toast.error(response.message || 'Errore durante la creazione dello staff');
          this.deleteUploadedImage(staffData.urlImg);
          return;
        }

        this.toast.success('Staff creato');
        this.loadData();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.toast.error(err.error?.message || err.message || 'Errore durante la creazione dello staff');
        this.deleteUploadedImage(staffData.urlImg);
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
}
