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
  customLocation: boolean = history.state?.customLocation ?? false;

  constructor(
    private router: Router,
    private location: Location
  ) {
    if (!this.eventDraft || !this.selectedLocation || !this.selectedDate) {
      this.router.navigate(['/tabs/tab1']);
    }
    this.selectedDate = this.selectedDate.substring(0,10);
  }

  get totalPrice(): number {
    if(!this.selectedLocation){
      return 0;
    }
    else{
      var tempPrice = this.selectedLocation.costo;
      if(this.selectedStaff){
        this.selectedStaff.forEach(staff => {
          if(staff.tipo === 'catering')
            tempPrice += staff.costo * this.people;
          else
            tempPrice += staff.costo;
        });
      }
      return tempPrice;
    }
  }

  get people() : number{
    return this.customLocation 
    ? this.selectedLocation?.capienza ?? 0
    : this.eventDraft?.capacity ?? 0
  }

  get locationImage(): string {
    if (!this.selectedLocation?.url) {
      return 'https://via.placeholder.com/120x90';
    }

    if (
      this.selectedLocation.url.startsWith('http://') ||
      this.selectedLocation.url.startsWith('https://')
    ) {
      return this.selectedLocation.url;
    }

    return 'http://localhost:3000' + this.selectedLocation.url;
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

  get paymentPrice(): number {
    return this.totalPrice*0.4;
  }
}
