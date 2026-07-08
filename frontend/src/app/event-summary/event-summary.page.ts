import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { EventDraft } from '../interfaces/event.interface';
import { LocationResource } from '../interfaces/location.interface';
import { StaffResource } from '../interfaces/staff.interface';

@Component({
  selector: 'app-event-summary',
  templateUrl: './event-summary.page.html',
  styleUrls: ['./event-summary.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonCard,
    IonCardContent
  ]
})
export class EventSummaryPage {

  eventDraft: EventDraft | null = history.state?.eventDraft ?? null;
  selectedDate: string = history.state?.selectedDate ?? '';
  selectedLocation: LocationResource | null = history.state?.selectedLocation ?? null;
  selectedStaff: StaffResource[] = history.state?.selectedStaff ?? [];

  constructor(
    private router: Router,
    private location: Location
  ) {
    if (!this.eventDraft || !this.selectedLocation || !this.selectedDate) {
      this.router.navigate(['/tabs/tab1']);
    }
  }

  get totalPrice(): Number {
    return 2;
  }

  goBack() {
    this.location.back();
  }

  confirmEvent() {
    // Qui poi chiamerai il backend per salvare Evento + Coinvolge.
    console.log({
      eventDraft: this.eventDraft,
      selectedDate: this.selectedDate,
      selectedLocation: this.selectedLocation,
      selectedStaff: this.selectedStaff,
    });
  }

  paymentPrice() {
    return this.totalPrice*0.4;
  }
}