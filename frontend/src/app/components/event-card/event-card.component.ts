import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, ModalController } from '@ionic/angular/standalone';
import { Evento } from '../../interfaces/event.interface';
import { EventDetailModalComponent } from '../event-detail-modal/event-detail-modal.component';



@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonBadge, IonButton] 
})
export class EventCardComponent {
  @Input({ required: true }) evento!: Evento;
   
  constructor(private modalController: ModalController) { }

  async apriDettagli(): Promise<void> {
    if (!Number.isFinite(this.evento.id)) {
      return;
    }

    const modal = await this.modalController.create({
      component: EventDetailModalComponent,
      cssClass: 'event-detail-modal-sheet',
      componentProps: {
        eventId: this.evento.id,
        evento: this.evento
      }
    });

    await modal.present();
  }

  get formattedDate(): string {
    const date = this.evento?.data;

    if (!date) {
      return '';
    }

    const [year, month, day] = date.substring(0, 10).split('-');

    if (!year || !month || !day) {
      return date;
    }

    return `${day}/${month}/${year}`;
  }

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
