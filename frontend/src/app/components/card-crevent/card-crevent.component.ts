import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ModalController, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from '@ionic/angular/standalone';
import { ResourceDetailPage } from '../../resource-detail/resource-detail.page';
import { LocationResource } from '../../interfaces/location.interface';
import { StaffResource } from '../../interfaces/staff.interface';

type ResourceData = LocationResource | StaffResource;

@Component({
  selector: 'app-card-crevent',
  templateUrl: './card-crevent.component.html',
  styleUrls: ['./card-crevent.component.scss'],
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton],
  standalone: true
})
export class CardCreventComponent  implements OnInit {

@Input({ required: true }) resourceData!: ResourceData;

  isLocation: boolean = false;
  isStaff: boolean = false;
  nomeVisualizzato: string = '';
  specificDetail: {label: string, valore: string}[] = [];
  priceText: string = '';  

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    const resource = this.resourceData;

    this.isLocation = this.isLocationResource(resource);
    this.isStaff = this.isStaffResource(resource);

    this.nomeVisualizzato = this.isStaffResource(resource)
      ? `${resource.nome} ${resource.cognome || ''}`
      : resource.nome;

    this.priceText =
      (this.isLocation ? 'Costo affitto: ' : 'Prezzo ingaggio: ') +
      (this.isStaffResource(resource) && resource.tipo === 'catering'
        ? `${resource.costo}€ pp`
        : `${resource.costo}€`);

    this.preparaDettagli();
  }

  private isLocationResource(resource: ResourceData): resource is LocationResource {
    return 'capienza' in resource;
  }

  private isStaffResource(resource: ResourceData): resource is StaffResource {
    return 'tipo' in resource;
  }

  preparaDettagli() {
    const resource = this.resourceData;

    if (this.isLocationResource(resource)) {
      if (resource.citta) {
        this.specificDetail.push({
          label: 'Città:',
          valore: `${resource.citta} (${resource.indirizzo || ''})`
        });
      }

      if (resource.capienza) {
        this.specificDetail.push({
          label: 'Capienza:',
          valore: `${resource.capienza} persone`
        });
      }
    }

    if (this.isStaffResource(resource)) {
      if (resource.tipo) {
        this.specificDetail.push({
          label: 'Categoria:',
          valore: resource.tipo.toUpperCase()
        });
      }

      if (resource.genereMusicale) {
        this.specificDetail.push({
          label: 'Genere musicale:',
          valore: resource.genereMusicale
        });
      }

      if (resource.genereFotografico) {
        this.specificDetail.push({
          label: 'Stile fotografico:',
          valore: resource.genereFotografico
        });
      }

      if (resource.mansione) {
        this.specificDetail.push({
          label: 'Specialità:',
          valore: resource.mansione
        });
      }
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

    return 'https://via.placeholder.com/350x180';
  }

}
