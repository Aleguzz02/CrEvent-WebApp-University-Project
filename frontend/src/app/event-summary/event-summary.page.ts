import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  ModalController,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { EventDraft } from '../interfaces/event.interface';
import { LocationResource } from '../interfaces/location.interface';
import { StaffResource } from '../interfaces/staff.interface';
import { CheckoutModalComponent } from '../components/checkout-modal/checkout-modal.component';
import { EventService } from '../services/event.service';
import { ToastService } from '../services/toast.service';

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
    private location: Location,
    private modalController: ModalController,
    private eventService: EventService,
    private toastService: ToastService
  ) {
    if (!this.eventDraft || !this.selectedLocation || !this.selectedDate) {
      this.router.navigate(['/tabs/tab1']);
    }
    this.selectedDate = this.selectedDate.substring(0,10);
  }

  ionViewWillEnter() {
      this.eventDraft = history.state?.eventDraft ?? null;
      this.selectedDate = history.state?.selectedDate ?? '';
      this.selectedLocation = history.state?.selectedLocation ?? null;
      this.selectedStaff = history.state?.selectedStaff ?? [];
      this.customLocation = history.state?.customLocation ?? false;

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

  get people() : number {
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

  async confirmEvent() {
    const modal = await this.modalController.create({
      component: CheckoutModalComponent,
      cssClass: 'checkout-modal-sheet',
      componentProps: {
        amount: this.paymentPrice
      }
    });

    await modal.present();

    const result = await modal.onDidDismiss<{
      paid: boolean;
      amount: number;
      cardBrand: string;
    }>();

    if (result.role !== 'confirm' || !result.data?.paid) {
      return;
    }

    if (!this.eventDraft || !this.selectedLocation) {
      return;
    }

    this.eventService.createEvent(
      this.eventDraft,
      this.selectedLocation,
      this.selectedStaff,
      this.selectedDate,
      this.totalPrice
    ).subscribe({
      next: (res) => {
        if (!res.success) {
          this.toastService.error(res.message || 'Errore durante la creazione evento');
          return;
        }

        this.toastService.success('Evento creato con successo');
        this.router.navigate(['/tabs/tab1']);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Errore durante la creazione evento'
        );
      }
    });
  }

  get paymentPrice(): number {
    return this.totalPrice*0.4;
  }
}
