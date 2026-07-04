import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalController, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { ResourceDetailPage } from '../../resource-detail/resource-detail.page';

@Component({
  selector: 'app-card-crevent',
  templateUrl: './card-crevent.component.html',
  styleUrls: ['./card-crevent.component.scss'],
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton],
  standalone: true
})
export class CardCreventComponent  implements OnInit {

  @Input() resourceData: any;

  isLocation: boolean = false;
  isStaff: boolean = false;
  nomeVisualizzato: string = '';
  specificDetail: {label: string, valore: string}[] = [];
  priceText: string = '';  

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    if(!this.resourceData) return;

    this.isLocation = 'capienza' in this.resourceData;
    this.isStaff = 'tipo' in this.resourceData;
    this.nomeVisualizzato = this.isStaff ? `${this.resourceData.nome} ${this.resourceData.cognome || ''}` : this.resourceData.nome;
    this.priceText = ( this.isLocation ? 'Costo affitto: ' : 'Prezzo ingaggio: ' ) + ( this.resourceData.tipo === 'catering' ? `${this.resourceData.costo}€ pp` : `${this.resourceData.costo}€` );
    this.preparaDettagli();  
  }

  preparaDettagli() {
    if(this.isLocation){
      if(this.resourceData.citta) this.specificDetail.push({label: 'Città:', valore: `${this.resourceData.citta} (${this.resourceData.indirizzo || ''})`});
      if(this.resourceData.capienza) this.specificDetail.push({label: 'Capienza:', valore: `${this.resourceData.capienza} persone`});    }
    else if(this.isStaff){
      if(this.resourceData.tipo) this.specificDetail.push({label: 'Categoria:', valore: `${this.resourceData.tipo.toUpperCase()}`});
      if(this.resourceData.genereMusicale) this.specificDetail.push({label: 'Genere musicale:', valore: `${this.resourceData.genereMusicale}`});
      if(this.resourceData.genereFotografico) this.specificDetail.push({label: 'Stile fotografico:', valore: `${this.resourceData.genereFotografico}`});
      if(this.resourceData.mansione) this.specificDetail.push({label: 'Specialità:', valore: `${this.resourceData.mansione}`});
    }
  }

  async openDetail(){

    const modal = await this.modalController.create({
      component: ResourceDetailPage,
      componentProps: {
        resource: this.resourceData,
        priceText: this.priceText
      },
      cssClass: 'resource-detail-modal'
    });
    await modal.present();
  }

  get locationImage() {
    if (this.resourceData?.url) {
      if (
        this.resourceData.url.startsWith('http://') ||
        this.resourceData.url.startsWith('https://')
      ) {
        return this.resourceData.url;
      }

      return 'http://localhost:3000' + this.resourceData.url;
    }

    if (this.resourceData?.immagine) {
      return this.resourceData.immagine;
    }

    return 'https://via.placeholder.com/350x180';
  }

}
