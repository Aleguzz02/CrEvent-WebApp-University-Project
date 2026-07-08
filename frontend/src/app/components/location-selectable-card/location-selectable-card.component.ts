import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { addIcons } from 'ionicons';
import { peopleOutline, cashOutline, checkmarkCircle, people } from 'ionicons/icons';
import { IonCard, IonCardContent, IonIcon, IonImg, IonText } from '@ionic/angular/standalone';
import { LocationResource } from '../../interfaces/location.interface';



@Component({
  selector: 'app-location-selectable-card',
  templateUrl: './location-selectable-card.component.html',
  styleUrls: ['./location-selectable-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonCard, IonCardContent,
    IonImg, IonText, IonIcon
  ]
})
export class LocationSelectableCardComponent {

  @Input() selezionata: boolean = false;

  @Input() location!: LocationResource;
  @Output() selectedLocation = new EventEmitter<LocationResource>();

  constructor() {
    addIcons({
      people,
      cashOutline,
      checkmarkCircle
    });
  }

  selezionaLocation() {
    this.selectedLocation.emit(this.location);
  }

  get locationImage() {
    if (this.location?.url) {
      if (
        this.location.url.startsWith('http://') ||
        this.location.url.startsWith('https://')
      ) {
        return this.location.url;
      }

      return 'http://localhost:3000' + this.location.url;
    }

    if (this.location?.url) {
      return this.location.url;
    }

    return 'https://via.placeholder.com/350x180';
  }

}