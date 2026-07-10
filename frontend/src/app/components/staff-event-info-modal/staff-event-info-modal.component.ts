import { Component, Input, OnInit } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { callOutline, closeOutline, mailOutline, mapOutline } from 'ionicons/icons';
import type { StaffEventCard } from '../staff-event-info-card/staff-event-info-card.component';

@Component({
  selector: 'app-staff-event-info-modal',
  templateUrl: './staff-event-info-modal.component.html',
  styleUrls: ['./staff-event-info-modal.component.scss'],
  standalone: true,
  imports: [
    IonBadge,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar
  ]
})
export class StaffEventInfoModalComponent implements OnInit {
  @Input({ required: true }) eventCard!: StaffEventCard;

  day = '--';
  month = '---';
  formattedDate = '';
  clientName = 'Cliente';
  clientInitials = '?';
  profileImage: string | null = null;
  locationLabel: string | null = null;
  locationAddress: string | null = null;

  constructor(private modalController: ModalController) {
    addIcons({ callOutline, closeOutline, mailOutline, mapOutline });
  }

  ngOnInit(): void {
    const event = this.eventCard.event;
    const datePart = event.data.substring(0, 10);
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(datePart)
      ? new Date(`${datePart}T00:00:00`)
      : null;
    const date = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
    const profileUrl = event.urlFotoProfiloCliente?.trim() || '';

    this.day = date ? String(date.getDate()).padStart(2, '0') : '--';
    this.month = date
      ? date.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '')
      : '---';
    this.formattedDate = date
      ? date.toLocaleDateString('it-IT', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      : event.data;
    this.clientName = `${event.nomeCliente} ${event.cognomeCliente}`.trim() || 'Cliente';
    this.clientInitials = `${event.nomeCliente.charAt(0)}${event.cognomeCliente.charAt(0)}`.toUpperCase() || '?';
    this.profileImage = profileUrl
      ? profileUrl.startsWith('http://') || profileUrl.startsWith('https://')
        ? profileUrl
        : `http://localhost:3000${profileUrl.startsWith('/') ? '' : '/'}${profileUrl}`
      : null;
    this.locationLabel = [
      event.nomeLocation?.trim() || '',
      event.customLocation === 1 ? '' : event.cittaLocation?.trim() || ''
    ].filter(Boolean).join(', ') || null;
    this.locationAddress = event.customLocation === 1
      ? 'Location personalizzata'
      : event.indirizzoLocation?.trim() || null;
  }

  close(): void {
    this.modalController.dismiss();
  }

  get locationMapUrl(): string | null {
    const event = this.eventCard.event;

    if (
      event.customLocation !== 1 ||
      typeof event.lat !== 'number' ||
      typeof event.lng !== 'number' ||
      !Number.isFinite(event.lat) ||
      !Number.isFinite(event.lng)
    ) {
      return null;
    }

    return `https://www.google.com/maps?q=${event.lat},${event.lng}`;
  }
}
