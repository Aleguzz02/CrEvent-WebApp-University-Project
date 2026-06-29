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
  IonDatetime
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { LocationSelectableCardComponent } from '../components/location-selectable-card/location-selectable-card.component';

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
    LocationSelectableCardComponent
  ]
})
export class CreateEventPage implements OnInit {

  modalita: string = 'location';
  mostraCalendario: boolean = true;

  locations: any[] = [];
  locationsLibere: any[] = [];

  locationSelezionata: any = null;
  dataSelezionata: string = '';

  dateOccupate: string[] = [];
  intervalliDisponibili: any[] = [];

  dataOggi: string = new Date().toISOString().substring(0, 10);


  constructor(private router: Router) { }

  

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
    this.locationSelezionata = null;
    this.dataSelezionata = '';
    this.dateOccupate = [];
    this.locationsLibere = [];
  }

  selezionaLocation(location: any) {
    this.locationSelezionata = location;
    this.dataSelezionata = '';

    this.ricaricaCalendario();
  }

  caricaDateOccupate() {
    if (!this.locationSelezionata) {
      return;
    }

    // Esempio provvisorio: poi questi dati arrivano dal backend/db.
    // Ogni intervallo usa i campi inizio e fine del DB.

    if (this.locationSelezionata.id === 1) {
      this.intervalliDisponibili = [
        { inizio: '2026-07-01', fine: '2026-07-20' },
        { inizio: '2026-08-01', fine: '2026-08-10' }
      ];

      this.dateOccupate = ['2026-07-05', '2026-07-06'];
    }
    else if (this.locationSelezionata.id === 2) {
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
    if (!this.locationSelezionata) {
      return false;
    }

    const giorno = dateString.substring(0, 10);

    return this.locationLibera(this.locationSelezionata, giorno);
  };

  caricaLocationLibere() {
    if (!this.dataSelezionata) {
      return;
    }

    const giorno = this.dataSelezionata.substring(0, 10);

    this.locationsLibere = this.locations.filter(location =>
      this.locationLibera(location, giorno)
    );
  }

  continua() {
    console.log('Location scelta:', this.locationSelezionata);
    console.log('Data scelta:', this.dataSelezionata);
  }

  annulla() {
    this.router.navigate(['/tabs/tab1']);
  }

  ricaricaCalendario() {
    this.mostraCalendario = false;

    setTimeout(() => {
      this.mostraCalendario = true;
    }, 0);
  }
  selezionaModalita(modalita: string) {
    this.modalita = modalita;
    this.resetScelta();
  }

}