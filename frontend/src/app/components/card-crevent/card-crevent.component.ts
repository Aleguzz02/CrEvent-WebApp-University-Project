import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-card-crevent',
  templateUrl: './card-crevent.component.html',
  styleUrls: ['./card-crevent.component.scss'],
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton],
  standalone: true
})
export class CardCreventComponent  implements OnInit {

  @Input() dati: any;

  isLocation: boolean = false;
  isStaff: boolean = false;
  nomeVisualizzato: string = '';
  dettagliSpecifici: {label: string, valore: string}[] = [];
  testoPrezzo: string = '';  

  constructor(private router: Router) { }

  ngOnInit() {
    if(!this.dati) return;

    this.isLocation = 'capienza' in this.dati;
    this.isStaff = 'tipo' in this.dati;
    this.nomeVisualizzato = this.isStaff ? `${this.dati.nome} ${this.dati.cognome || ''}` : this.dati.nome;
    this.testoPrezzo = this.isLocation ? 'Costo affitto: ' : 'Prezzo ingaggio: ';
    this.preparaDettagli();  }

  preparaDettagli() {
    if(this.isLocation){
      if(this.dati.citta) this.dettagliSpecifici.push({label: 'Città:', valore: `${this.dati.citta} (${this.dati.indirizzo || ''})`});
      if(this.dati.capienza) this.dettagliSpecifici.push({label: 'Capienza:', valore: `${this.dati.capienza} persone`});
      if(this.dati.costo)  this.testoPrezzo = this.testoPrezzo + `${this.dati.costo}€`;
    }
    else if(this.isStaff){
      if(this.dati.tipo) this.dettagliSpecifici.push({label: 'Categoria:', valore: `${this.dati.tipo.toUpperCase()}`});
      if(this.dati.genereMusicale) this.dettagliSpecifici.push({label: 'Genere musicale:', valore: `${this.dati.genereMusicale}`});
      if(this.dati.genereFotografico) this.dettagliSpecifici.push({label: 'Stile fotografico:', valore: `${this.dati.genereFotografico}`});
      if(this.dati.mansione) this.dettagliSpecifici.push({label: 'Specialità:', valore: `${this.dati.mansione}`});
      if(this.dati.tipo === 'catering'){
        if(this.dati.costo) this.testoPrezzo = this.testoPrezzo + `${this.dati.costo}€ pp`;
      }else{
        if(this.dati.costo) this.testoPrezzo = this.testoPrezzo + `${this.dati.costo}€`;
      }
    }
  }

  openDetail(){
    this.router.navigate(['/resource-detail'], {state: {details: this.dati}})
  }

}
