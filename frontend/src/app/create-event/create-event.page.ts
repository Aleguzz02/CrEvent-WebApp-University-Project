import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonDatetime,
  ModalController,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { LocationSelectableCardComponent } from '../components/location-selectable-card/location-selectable-card.component';
import { CustomLocationMapModalComponent } from '../components/custom-location-map-modal/custom-location-map-modal.component';
import { CustomLocationNameModalComponent } from '../components/custom-location-name-modal/custom-location-name-modal.component';
import { EventService } from '../services/event.service';
import { EventDraft } from '../interfaces/event.interface';
import { DateLocation, LocationResource } from '../interfaces/location.interface';
import { StaffSelectableCardComponent } from '../components/staff-selectable-card/staff-selectable-card.component';
import { StaffResource, TipoStaff } from '../interfaces/staff.interface';

type SingleStaffCategory = Exclude<TipoStaff, 'altro'>;
type SelectedStaffByCategory = {
  catering: StaffResource | null;
  intrattenimento: StaffResource | null;
  fotografo: StaffResource | null;
  altro: StaffResource[];
};


@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.page.html',
  styleUrls: ['./create-event.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonList,
    IonDatetime,
    LocationSelectableCardComponent,
    IonCard, IonCardContent,
    StaffSelectableCardComponent
  ]
})

export class CreateEventPage implements OnInit {

  private eventService = inject(EventService);
  staffDisponibile: StaffResource[] = [];


  tempEvent: EventDraft | null = null;  
  mode: 'location' | 'data' = 'location';
  showCalendar: boolean = true;

  locations: LocationResource[] = [];
  freeLocations: LocationResource[] = [];

  selectedDate: string = '';

  selectedLocation: LocationResource | null = null;
  intervalliDisponibili: DateLocation[] = [];

  usedDates: string[] = [];

  dataOggi: string = new Date().toISOString().substring(0, 10);
  customLocationSetted: boolean = false;
  newCustomLocation: LocationResource | null = null;
  step: 'locationDate' | 'staff' = 'locationDate';

  listaStaff: StaffResource[] = [];
  catering: StaffResource[] = [];
  intrattenimento: StaffResource[] = [];
  fotografo: StaffResource[] = [];
  altro: StaffResource[] = [];

  selectedStaffByCategory: SelectedStaffByCategory = {
    catering: null,
    intrattenimento: null,
    fotografo: null,
    altro: []
  };


  constructor(private router: Router, private modalController: ModalController) {
      this.tempEvent = history.state?.eventDraft ?? null;
  }  

  ngOnInit() {
    if (!this.tempEvent) {
    this.router.navigate(['/tabs/tab1']);
    return;
  }

  this.caricaLocations();
  }
  get eventName(): string {
    return this.tempEvent?.name ?? '';
  }

  get eventCapacity(): number {
    return this.tempEvent?.capacity ?? 0;
  }

  caricaLocations() {
  this.eventService.getLocationsByCapacity(this.eventCapacity).subscribe({
    next: (response) => {
      if (!response.success || !response.data) {
        return;
      }

      this.locations = response.data;
    },
    error: (err) => {
      console.error(err);
    }
  });
}

locationLibera(location: LocationResource, day: string) {
    if (day < this.dataOggi) {
      return false;
    }

    const inFreeIntervall = this.intervalliDisponibili.some(intervallo => {
      const inizio = intervallo.dataInizio.substring(0, 10);
      const fine = intervallo.dataFine.substring(0, 10);

      return day >= inizio && day <= fine;
    });

    if (!inFreeIntervall) {
      return false;
    }

    if (this.usedDates.includes(day)) {
      return false;
    }

    return true;
}

  resetScelta() {
    this.selectedLocation = null;
    this.selectedDate = '';
    this.usedDates = [];
    this.freeLocations = [];
  }

  selectLocation(location: LocationResource) {
    this.selectedLocation = location;

    if (this.mode === 'location') {
      this.selectedDate = '';
      this.loadUsedDates();
    }
  }

  loadUsedDates() {
  if (!this.selectedLocation?.id) {
    return;
  }

  this.eventService.getFreeDatesByLocation(this.selectedLocation.id).subscribe({
    next: (response) => {
      if (!response.success || !response.freeDates) {
        return;
      }

      this.intervalliDisponibili = response.freeDates;
      this.usedDates = (response.usedDates ?? []).map(usedDate =>
        usedDate.data.substring(0, 10)
      );

      this.reloadCalendar();
    },
    error: (err) => {
      console.error(err);
    }
  });
  }

  dataDisponibile = (dateString: string) => {
    if (!this.selectedLocation) {
      return false;
    }

    const day = dateString.substring(0, 10);

    return this.locationLibera(this.selectedLocation, day);
  };

  loadFreeLocations() {
    if (!this.selectedDate) {
      return;
    }

    const day = this.selectedDate.substring(0, 10);

    this.eventService.getLocationsByCapacityAndDate(day, this.eventCapacity).subscribe({
      next: (response) => {
        if (!response.success || !response.data) {
          return;
        }

        this.freeLocations = response.data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  continue() {
  if (this.step === 'locationDate') {
    this.step = 'staff';
    this.loadAvaiableStaff();
    return;
  }

  //this.createEvent();
}
  loadAvaiableStaff() {
    if (!this.selectedLocation || !this.selectedDate) return;

      const day = this.selectedDate.substring(0, 10);

      this.eventService.getAvailableStaff(this.selectedLocation.id, day).subscribe({
        next: (response) => {
          if (!response.success || !response.data) return;

          this.staffDisponibile = response.data;

          this.catering = this.staffDisponibile.filter(s => s.tipo === 'catering');
          this.intrattenimento = this.staffDisponibile.filter(s => s.tipo === 'intrattenimento');
          this.fotografo = this.staffDisponibile.filter(s => s.tipo === 'fotografo');
          this.altro = this.staffDisponibile.filter(s => s.tipo === 'altro');
        },
        error: err => console.error(err)
      });  
    }

  goBackStep() {
    if (this.step === 'staff') {
      this.step = 'locationDate';
      return;
    }

    this.goBack();
  }

  goBack() {
    this.router.navigate(['/tabs/tab1']);
  }

  reloadCalendar() {
    this.showCalendar = false;

    setTimeout(() => {
      this.showCalendar = true;
    }, 0);
  }
  selectMode(mode: 'data' | 'location') {
    this.mode = mode;
    this.resetScelta();
  }

  async openCustomNameModal(mapPosition: any) {
    const nameModal = await this.modalController.create({
      component: CustomLocationNameModalComponent,
      cssClass: "create-modals"
    });

    await nameModal.present();

    const nameResult = await nameModal.onDidDismiss();

     if (!nameResult.data) {
      this.openMapModal();
      return;
    }
    this.createLocationCustom(nameResult, mapPosition);
  }

  async openMapModal() {
    const mapModal = await this.modalController.create({
      component: CustomLocationMapModalComponent,
      cssClass: "create-modals"
    });

    await mapModal.present();
    
    const mapPosition = await mapModal.onDidDismiss();
    if(!mapPosition.data) {
      return;
    }
    this.openCustomNameModal(mapPosition);
  }
  
  createLocationCustom(name: any, position: any){
    
      const customLocation: LocationResource = {
        id: Date.now(),
        nome: name.data.nome,
        indirizzo: `Location personale`,
        citta: 'Posizione scelta',
        descrizione: 'Location personalizzata scelta sulla mappa',
        capienza: this.eventCapacity,
        lat: position.data.lat,
        lng: position.data.lng,
        linkSito: null,
        costo: 0,
        url: null,

        inizio: this.dataOggi,
        fine: '2026-12-31',
        usedDates: [],
        custom: true
      };

      this.newCustomLocation = customLocation;
      this.locations.push(this.newCustomLocation);
      this.selectLocation(this.newCustomLocation);
      this.customLocationSetted = true;
  }

  deleteLocationCustom(event: Event, location: LocationResource) {
    event.stopPropagation();

    if (!location.custom) {
      return;
    }

    this.locations = this.locations.filter(loc => loc.id !== location.id);
    this.freeLocations = this.freeLocations.filter(loc => loc.id !== location.id);

    if (this.selectedLocation?.id === location.id) {
      this.selectedLocation = null;
      this.selectedDate = '';
    }
    this.newCustomLocation = null;
    this.customLocationSetted = false;
  }

  toggleStaff(staff: StaffResource) {
    if (staff.tipo === 'altro') {
      const giaSelezionato = this.selectedStaffByCategory.altro
        .some(s => s.id === staff.id);

      this.selectedStaffByCategory.altro = giaSelezionato
        ? this.selectedStaffByCategory.altro.filter(s => s.id !== staff.id)
        : [...this.selectedStaffByCategory.altro, staff];

      return;
    }

    const tipo: SingleStaffCategory = staff.tipo;

    this.selectedStaffByCategory[tipo] =
      this.selectedStaffByCategory[tipo]?.id === staff.id
        ? null
        : staff;
  }

  isStaffSelected(staff: StaffResource): boolean {
    if (staff.tipo === 'altro') {
      return this.selectedStaffByCategory.altro.some(s => s.id === staff.id);
    }

    const tipo: SingleStaffCategory = staff.tipo;

    return this.selectedStaffByCategory[tipo]?.id === staff.id;
  }

  get selectedStaff(): StaffResource[] {
    return [
      this.selectedStaffByCategory.catering,
      this.selectedStaffByCategory.intrattenimento,
      this.selectedStaffByCategory.fotografo,
      ...this.selectedStaffByCategory.altro
    ].filter((staff): staff is StaffResource => staff !== null);
  }

}