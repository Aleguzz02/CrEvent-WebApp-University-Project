import { Component, OnInit, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle} from "@ionic/angular/standalone";
import { Evento } from '../../interfaces/event.interface';



@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonButton] 
})
export class EventCardComponent  implements OnInit {
  @Input({ required: true }) evento!: Evento;
   
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.caricaEventi();
  }

  caricaEventi(){

  }

  apriDettagli(){}

  get locationImage() {
    if (this.evento?.url) {
      if (
        this.evento.url.startsWith('http://') ||
        this.evento.url.startsWith('https://')
      ) {
        return this.evento.url;
      }

      return 'http://localhost:3000' + this.evento.url;
    }

    return 'https://via.placeholder.com/350x180';
  }
}
