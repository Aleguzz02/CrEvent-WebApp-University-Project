import { Component, OnInit } from '@angular/core';
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

  mode: string = 'location';
  showCalendar: boolean = true;

  locations: any[] = [];
  freeLocations: any[] = [];

  selectedLocation: any = null;
  selectedDate: string = '';

  dateOccupate: string[] = [];
  intervalliDisponibili: any[] = [];

  dataOggi: string = new Date().toISOString().substring(0, 10);
  customLocationSetted: boolean = false;
  newCustomLocation: any = null;


  constructor(private router: Router, private modalController: ModalController) { }  

  ngOnInit() {
    this.caricaLocations();
  }

  caricaLocations() {
    this.locations = [
      {
        id: 1,
        nome: 'Villa Aurora',
        citta: 'Milano',
        indirizzo: 'Via Roma 10',
        capienza: 120,
        costo: 2500,
        url: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600',
        inizio: '2026-07-01',
        fine: '2026-07-20',
        dateOccupate: ['2026-07-05', '2026-07-06']
      },
      {
        id: 2,
        nome: 'Sala Cristallo',
        citta: 'Torino',
        indirizzo: 'Corso Francia 25',
        capienza: 80,
        costo: 1600,
        url: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600',
        inizio: '2026-07-10',
        fine: '2026-07-30',
        dateOccupate: ['2026-07-15']
      },
      {
        id: 3,
        nome: 'Terrazza Mare',
        citta: 'Genova',
        indirizzo: 'Via Porto 4',
        capienza: 200,
        costo: 4200,
        url: 'https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=600',
        inizio: '2026-07-01',
        fine: '2026-09-01',
        dateOccupate: ['2026-07-10']
      }
    ];
  }

  locationLibera(location: any, giorno: string) {
    if (giorno < this.dataOggi) {
      return false;
    }

    if (giorno < location.inizio || giorno > location.fine) {
      return false;
    }

    if (location.dateOccupate.includes(giorno)) {
      return false;
    }

    return true;
  }

  resetScelta() {
    this.selectedLocation = null;
    this.selectedDate = '';
    this.dateOccupate = [];
    this.freeLocations = [];
  }

  selectLocation(location: any) {
    this.selectedLocation = location;

    if (this.mode === 'location') {
      this.selectedDate = '';
      this.reloadCalendar();
    }
  }

  caricaDateOccupate() {
    if (!this.selectedLocation) {
      return;
    }

    // Esempio provvisorio: poi questi dati arrivano dal backend/db.
    // Ogni intervallo usa i campi inizio e fine del DB.

    if (this.selectedLocation.id === 1) {
      this.intervalliDisponibili = [
        { inizio: '2026-07-01', fine: '2026-07-20' },
        { inizio: '2026-08-01', fine: '2026-08-10' }
      ];

      this.dateOccupate = ['2026-07-05', '2026-07-06'];
    }
    else if (this.selectedLocation.id === 2) {
      this.intervalliDisponibili = [
        { inizio: '2026-07-10', fine: '2026-07-30' }
      ];

      this.dateOccupate = ['2026-07-15'];
    }
    else {
      this.intervalliDisponibili = [
        { inizio: '2026-07-01', fine: '2026-09-01' }
      ];

      this.dateOccupate = ['2026-07-10'];
    }
  }

  dataDisponibile = (dateString: string) => {
    if (!this.selectedLocation) {
      return false;
    }

    const giorno = dateString.substring(0, 10);

    return this.locationLibera(this.selectedLocation, giorno);
  };

  loadFreeLocations() {
    if (!this.selectedDate) {
      return;
    }

    const giorno = this.selectedDate.substring(0, 10);

    this.freeLocations = this.locations.filter(location =>
      this.locationLibera(location, giorno)
    );
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
        capienza: 0,
        costo: 0,
        url: '',
        lat: position.data.lat,
        lng: position.data.lng,
        inizio: this.dataOggi,
        fine: '2026-12-31',
        dateOccupate: [],
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