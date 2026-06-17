import { Component, OnInit, Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle} from "@ionic/angular/standalone";


@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonButton] 
})
export class EventCardComponent  implements OnInit {
  @Input() evento: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.caricaEventi();
  }

  caricaEventi(){

  }

  apriDettagli(){}
}
