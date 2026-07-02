import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { addIcons } from 'ionicons';
import { peopleOutline, cashOutline, checkmarkCircle, people } from 'ionicons/icons';
import { IonCard, IonCardContent, IonIcon, IonImg, IonText } from '@ionic/angular/standalone';

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

  @Input() location: any;
  @Input() selezionata: boolean = false;

  @Output() locationSelezionata = new EventEmitter<any>();

  constructor() {
    addIcons({
      people,
      cashOutline,
      checkmarkCircle
    });
  }

  selezionaLocation() {
    this.locationSelezionata.emit(this.location);
  }

  get immagineLocation() {
    if (this.location?.url) {
      if (
        this.location.url.startsWith('http://') ||
        this.location.url.startsWith('https://')
      ) {
        return this.location.url;
      }

      return 'http://localhost:3000' + this.location.url;
    }

    if (this.location?.immagine) {
      return this.location.immagine;
    }

    return 'https://via.placeholder.com/350x180';
  }

}