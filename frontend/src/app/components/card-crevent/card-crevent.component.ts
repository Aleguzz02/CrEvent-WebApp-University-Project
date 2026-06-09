import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-crevent',
  templateUrl: './card-crevent.component.html',
  styleUrls: ['./card-crevent.component.scss'],
})
export class CardCreventComponent  implements OnInit {

  @Input() dati: any;

  isLocation: boolean = false;
  isStaff: boolean = false;
  nomeVisualizzato: string = '';
  dettagliSpecifici: string[] = [];
  testoPrezzo: string = '';  

  constructor() { }

  ngOnInit() {
    if(!this.dati) return;

    this.isLocation = 'capienza' in this.dati;
    this.isStaff = 'tipo' in this.dati;
    this.nomeVisualizzato = this.isStaff ? `${this.dati.nome} ${this.dati.cognome || ''}` : this.dati.nome;
    this.testoPrezzo = this.isLocation ? 'Costo affitto: ' : 'Prezzo ingaggio: ';
    this.preparaDettagli();  }

  preparaDettagli() {
    if(this.isLocation){
      if(this.dati.citta) this.dettagliSpecifici.push(`<strong>Città:</strong> ${this.dati.citta} (${this.dati.indirizzo || ''})`);
      if(this.dati.capienza) this.dettagliSpecifici.push(`<strong>Capienza:</strong> ${this.dati.capienza} persone`);
      if(this.dati.costo) this.dettagliSpecifici.push(`${this.dati.costo}€`);
    }
    else if(this.isStaff){
      if(this.dati.tipo) this.dettagliSpecifici.push(`<strong>Categoria:</strong> ${this.dati.tipo.toUpperCase()}`);
      if(this.dati.genereMusicale) this.dettagliSpecifici.push(`<strong>Genere musicale:</strong> ${this.dati.genereMusicale}`);
      if(this.dati.genereFotografico) this.dettagliSpecifici.push(`<strong>Stile fotografico:</strong> ${this.dati.genereFotografico}`);
      if(this.dati.mansione) this.dettagliSpecifici.push(`<strong>Specialità:</strong> ${this.dati.mansione}`);
      if(this.dati.tipo === 'catering'){
        if(this.dati.costo) this.testoPrezzo.concat(`${this.dati.costo}€ pp`);
      }else{
        if(this.dati.costo) this.testoPrezzo.concat(`${this.dati.costo}€`);
      }
    }
  }

}
