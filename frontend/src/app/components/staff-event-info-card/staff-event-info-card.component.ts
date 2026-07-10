import { Component, OnInit, inject } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  calendarOutline,
  chevronForwardOutline,
  locationOutline,
  peopleOutline,
  refreshOutline
} from 'ionicons/icons';
import { StaffEventInfo } from '../../interfaces/event.interface';
import { EventService } from '../../services/event.service';
import { StaffEventInfoModalComponent } from '../staff-event-info-modal/staff-event-info-modal.component';

type StaffMemberInfo = {
  id: number | null;
  nome: string;
  ruolo: string;
};

export type StaffEventCard = {
  event: StaffEventInfo;
  staff: StaffMemberInfo[];
  staffNames: string;
  clientName: string;
  clientInitials: string;
  day: string;
  month: string;
  formattedDate: string;
  locationLabel: string | null;
  locationDetails: LocationDetails | null;
  profileImage: string | null;
  staffCountLabel: string;
};

type LocationDetails = {
  primary: string;
  secondary: string | null;
};

@Component({
  selector: 'app-staff-event-info-card',
  templateUrl: './staff-event-info-card.component.html',
  styleUrls: ['./staff-event-info-card.component.scss'],
  standalone: true,
  imports: [
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonSkeletonText,
    StaffEventInfoModalComponent
  ]
})
export class StaffEventInfoCardComponent implements OnInit {
  private readonly eventService = inject(EventService);

  eventCards: StaffEventCard[] = [];
  selectedEvent: StaffEventCard | null = null;
  loading = true;
  errorMessage = '';
  readonly skeletonRows = [0, 1];

  constructor() {
    addIcons({
      alertCircleOutline,
      calendarOutline,
      chevronForwardOutline,
      locationOutline,
      peopleOutline,
      refreshOutline
    });
  }

  ngOnInit(): void {
    this.loadStaffEvents();
  }

  loadStaffEvents(): void {
    this.loading = true;
    this.errorMessage = '';

    this.eventService.getStaffEvents().subscribe({
      next: (response) => {
        this.loading = false;

        if (response.success) {
          this.eventCards = this.groupEventsById(response.data ?? []);
          return;
        }

        this.errorMessage = response.message || 'Impossibile caricare gli eventi assegnati.';
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message
          || error?.error?.error
          || 'Errore di connessione durante il recupero degli eventi.';
      }
    });
  }

  openEventModal(card: StaffEventCard): void {
    this.selectedEvent = card;
  }

  closeEventModal(): void {
    this.selectedEvent = null;
  }

  handleCardKeydown(event: KeyboardEvent, card: StaffEventCard): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.openEventModal(card);
  }

  private groupEventsById(events: StaffEventInfo[]): StaffEventCard[] {
    const groupedEvents = new Map<number, StaffEventCard>();

    for (const event of events) {
      let card = groupedEvents.get(event.id);

      if (!card) {
        const clientName = `${event.nomeCliente || ''} ${event.cognomeCliente || ''}`.trim();
        const clientInitials = `${event.nomeCliente?.charAt(0) || ''}${event.cognomeCliente?.charAt(0) || ''}`;
        const datePart = event.data.substring(0, 10);
        const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(datePart)
          ? new Date(`${datePart}T00:00:00`)
          : null;
        const eventDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
        const locationName = event.nomeLocation?.trim() || '';
        const locationCity = event.customLocation === 1
          ? null
          : event.cittaLocation?.trim() || null;
        const locationAddress = event.customLocation === 1
          ? 'Location personalizzata'
          : event.indirizzoLocation?.trim() || null;
        const locationPrimary = locationAddress || locationCity;
        const profileUrl = event.urlFotoProfiloCliente?.trim() || '';

        card = {
          event,
          staff: [],
          staffNames: '',
          clientName: clientName || 'Cliente',
          clientInitials: clientInitials.toUpperCase() || '?',
          day: eventDate ? String(eventDate.getDate()).padStart(2, '0') : '--',
          month: eventDate
            ? eventDate.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '')
            : '---',
          formattedDate: eventDate
            ? eventDate.toLocaleDateString('it-IT', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })
            : event.data,
          locationLabel: [locationName, locationCity].filter(Boolean).join(', ') || null,
          locationDetails: locationPrimary
            ? {
                primary: locationPrimary,
                secondary: locationAddress ? locationCity : null
              }
            : null,
          profileImage: profileUrl
            ? profileUrl.startsWith('http://') || profileUrl.startsWith('https://')
              ? profileUrl
              : `http://localhost:3000${profileUrl.startsWith('/') ? '' : '/'}${profileUrl}`
            : null,
          staffCountLabel: ''
        };
        groupedEvents.set(event.id, card);
      }

      const staffMember = this.toStaffMember(event);

      if (staffMember && !card.staff.some((staff) => staff.id === staffMember.id)) {
        card.staff.push(staffMember);
      }
    }

    return Array.from(groupedEvents.values()).map((card) => {
      const staffCount = card.staff.length;

      return {
        ...card,
        staffNames: card.staff.map((staff) => staff.nome).join(', '),
        staffCountLabel: `${staffCount} ${staffCount === 1 ? 'membro' : 'membri'} staff`
      };
    });
  }

  private toStaffMember(event: StaffEventInfo): StaffMemberInfo | null {
    const nome = `${event.nomeStaff || ''} ${event.cognomeStaff || ''}`.trim();

    if (event.idStaff == null && !nome) {
      return null;
    }

    return {
      id: event.idStaff ?? null,
      nome: nome || 'Staff non disponibile',
      ruolo: event.tipoStaff || event.mansioneStaff || 'Ruolo non disponibile'
    };
  }

}
