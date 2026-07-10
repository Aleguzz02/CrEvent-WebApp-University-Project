import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { callOutline, closeOutline, mailOutline } from 'ionicons/icons';
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
    IonModal,
    IonTitle,
    IonToolbar
  ]
})
export class StaffEventInfoModalComponent {
  @Input() selectedEvent: StaffEventCard | null = null;
  @Output() dismissed = new EventEmitter<void>();

  constructor() {
    addIcons({ callOutline, closeOutline, mailOutline });
  }

  closeEventModal(): void {
    this.dismissed.emit();
  }
}
