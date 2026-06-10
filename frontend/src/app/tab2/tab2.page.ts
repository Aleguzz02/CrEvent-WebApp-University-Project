import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonButton, IonCard, IonCardHeader, IonCardTitle, IonList, IonSegment, IonSegmentButton, IonItemDivider } from '@ionic/angular/standalone';
import { CardCreventComponent } from '../components/card-crevent/card-crevent.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, CardCreventComponent, IonLabel, CommonModule, 
    IonCard, IonCardHeader, IonCardTitle, IonButton, IonList, IonSegmentButton, IonSegment, IonItemDivider
  ],
  standalone: true
})
export class Tab2Page implements OnInit {

  sezione: 'iniziale' | 'location' | 'staff' = 'iniziale';
  listaLocation: any[] = [];
  listaStaff: any[] = [];

  dj: any[] = [];
  catering: any[] = [];
  fotografo: any[] = [];
  altro: any[] = [];

  constructor() {}
  ngOnInit(){
    this.caricaDatiFinti(); 
    this.filtraDati();
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
      { id: 1, nome: 'Galati', cognome: 'Catering', tipo: 'catering', costo: 80 },
      { id: 2, nome: 'Natale', cognome: 'Chef Catering', tipo: 'catering', costo: 95 },
      { id: 3, nome: 'Riccardo', cognome: 'Ferrarese', tipo: 'intrattenimento', costo: 500, genereMusicale: 'Commerciale' },
      { id: 5, nome: 'Tiberio', cognome: 'Cantafia', tipo: 'fotografo', costo: 1200 },
      { id: 7, nome: 'Emanuele', cognome: 'D\'Angeli', tipo: 'altro', costo: 600, mansione: 'Illusionista' }];
  }

  filtraDati() {
    this.dj = this.listaStaff.filter(staff => staff.tipo === 'dj');
    this.catering = this.listaStaff.filter(staff => staff.tipo === 'catering');
    this.fotografo = this.listaStaff.filter(staff => staff.tipo === 'fotografo');
    this.altro = this.listaStaff.filter(staff => staff.tipo === 'altro');
  }
}
