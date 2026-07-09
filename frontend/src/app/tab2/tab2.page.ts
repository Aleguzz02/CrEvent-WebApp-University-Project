import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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
    IonCard, IonCardHeader, IonCardTitle, IonButton, IonList, IonSegmentButton, IonSegment, IonItemDivider, IonButtons],
  standalone: true
})
export class Tab2Page implements OnInit, OnDestroy {

  // Servizi
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

  listaLocation: LocationResource[] = [];  
  listaStaff: StaffResource[] = [];

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
    this.listaLocation = [];
    this.listaStaff = [];

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
        //this.toast.error("Errore durante la ricezione degli elementi");
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
          if (locationData.urlImg) {
            this.uploadService.deleteImage(locationData.urlImg).subscribe();
          }
          return;
        }

        this.toast.success('Location creata');
        this.loadData();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.toast.error(err.error?.message || err.message || 'Errore durante la creazione della location');
        if (locationData.urlImg) {
          this.uploadService.deleteImage(locationData.urlImg).subscribe();
        }
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

  async openCreateStaffModal() {
    const modal = await this.modalCtrl.create({
      component: AddStaffModalComponent,
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
          if (staffData.urlImg) {
            this.uploadService.deleteImage(staffData.urlImg).subscribe();
          }
          return;
        }

        this.toast.success('Staff creato');
        this.loadData();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
        this.toast.error(err.error?.message || err.message || 'Errore durante la creazione dello staff');
        if (staffData.urlImg) {
          this.uploadService.deleteImage(staffData.urlImg).subscribe();
        }
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
