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
    IonCard, IonCardContent
  ]
})
export class CreateEventPage implements OnInit {

  private eventService = inject(EventService);

  tempEvent: {name: string, capacity: number} | null = null;
  mode: string = 'location';
  showCalendar: boolean = true;

  locations: any[] = [];
  freeLocations: any[] = [];

  selectedLocation: any = null;
  selectedDate: string = '';

  usedDates: string[] = [];
  intervalliDisponibili: any[] = [];

  dataOggi: string = new Date().toISOString().substring(0, 10);
  customLocationSetted: boolean = false;
  newCustomLocation: any = null;


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
      if (!response.success) {
        return;
      }

      this.locations = response.data;
    },
    error: (err) => {
      console.error(err);
    }
  });
}

locationLibera(location: any, day: string) {
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

  selectLocation(location: any) {
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
      if (!response.success) {
        return;
      }
      this.intervalliDisponibili = response.data;
      this.usedDates = response.usedDates ?? [];

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
        if (!response.success) {
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
    console.log('Location scelta:', this.selectedLocation);
    console.log('Data scelta:', this.selectedDate);
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
  selectMode(mode: string) {
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
    this.newCustomLocation = {
        id: Date.now(),
        nome: name.data.nome,
        citta: 'Posizione scelta',
        indirizzo: `${position.data.lat}, ${position.data.lng}`,
        capienza: this.eventCapacity,
        costo: 0,
        url: '',
        lat: position.data.lat,
        lng: position.data.lng,
        inizio: this.dataOggi,
        fine: '2026-12-31',
        usedDates: [],
        custom: true
      };

      this.locations.push(this.newCustomLocation);
      this.selectLocation(this.newCustomLocation);
      this.customLocationSetted = true;
  }

  deleteLocationCustom(event: Event, location: any) {
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
}