import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonSkeletonText,
  IonTitle,
  IonToolbar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  calendarOutline,
  callOutline,
  chevronForwardOutline,
  closeOutline,
  locationOutline,
  mailOutline,
  peopleOutline,
  refreshOutline
} from 'ionicons/icons';
import { StaffEventInfo } from '../../interfaces/event.interface';
import { EventService } from '../../services/event.service';

interface StaffMemberInfo {
  id: number | null;
  nome: string;
  ruolo: string;
  descrizione: string | null;
  linkSito: string | null;
  costo: number | null;
}

interface StaffEventCard {
  event: StaffEventInfo;
  staff: StaffMemberInfo[];
  staffNames: string;
}

@Component({
  selector: 'app-staff-event-info-card',
  templateUrl: './staff-event-info-card.component.html',
  styleUrls: ['./staff-event-info-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonModal,
    IonSkeletonText,
    IonTitle,
    IonToolbar
  ]
})
export class StaffEventInfoCardComponent implements OnInit {
  private readonly eventService = inject(EventService);

  staffEvents: StaffEventInfo[] = [];
  eventCards: StaffEventCard[] = [];
  selectedEvent: StaffEventCard | null = null;
  loading = true;
  errorMessage = '';
  readonly skeletonRows = [0, 1];

  constructor() {
    addIcons({
      alertCircleOutline,
      calendarOutline,
      callOutline,
      chevronForwardOutline,
      closeOutline,
      locationOutline,
      mailOutline,
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
          this.staffEvents = response.data ?? [];
          this.eventCards = this.groupEventsById(this.staffEvents);
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

  getClientName(event: StaffEventInfo): string {
    const fullName = `${event.nomeCliente || ''} ${event.cognomeCliente || ''}`.trim();
    return fullName || 'Cliente';
  }

  getClientInitials(event: StaffEventInfo): string {
    const name = event.nomeCliente?.charAt(0) || '';
    const surname = event.cognomeCliente?.charAt(0) || '';
    return `${name}${surname}`.toUpperCase() || '?';
  }

  getDay(dateStr: string): string {
    const date = this.toLocalDate(dateStr);
    return date ? String(date.getDate()).padStart(2, '0') : '--';
  }

  getMonth(dateStr: string): string {
    const date = this.toLocalDate(dateStr);

    if (!date) {
      return '---';
    }

    return date.toLocaleDateString('it-IT', { month: 'short' }).replace('.', '');
  }

  formatDate(dateStr: string): string {
    const date = this.toLocalDate(dateStr);

    if (!date) {
      return dateStr;
    }

    return date.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getStatusLabel(event: StaffEventInfo): string {
    return event.svolto === 1 ? 'Concluso' : 'In programma';
  }

  getStatusColor(event: StaffEventInfo): 'medium' | 'success' {
    return event.svolto === 1 ? 'medium' : 'success';
  }

  getStaffCountLabel(card: StaffEventCard): string {
    if (card.staff.length === 1) {
      return '1 membro staff';
    }

    return `${card.staff.length} membri staff`;
  }

  getStaffTrackId(staff: StaffMemberInfo): string {
    return staff.id ? `${staff.id}` : staff.nome;
  }

  hasStaffList(card: StaffEventCard): boolean {
    return card.staff.length > 0;
  }

  getPrimaryInfo(card: StaffEventCard): string {
    return card.staffNames || this.getLocationLabel(card.event);
  }

  getLocationLabel(event: StaffEventInfo): string {
    const nome = event.nomeLocation || 'Location non disponibile';
    const citta = event.cittaLocation ? `, ${event.cittaLocation}` : '';
    return `${nome}${citta}`;
  }

  getLocationAddress(event: StaffEventInfo): string {
    if (event.customLocation === 1) {
      return 'Location personalizzata';
    }

    return event.indirizzoLocation || 'Indirizzo non disponibile';
  }

  getProfileImage(event: StaffEventInfo): string | null {
    return this.normalizeAssetUrl(event.urlFotoProfiloCliente);
  }

  private groupEventsById(events: StaffEventInfo[]): StaffEventCard[] {
    const groupedEvents = new Map<number, StaffEventCard>();

    for (const event of events) {
      let card = groupedEvents.get(event.id);

      if (!card) {
        card = {
          event,
          staff: [],
          staffNames: ''
        };
        groupedEvents.set(event.id, card);
      }

      const staffMember = this.toStaffMember(event);

      if (staffMember && !card.staff.some((staff) => staff.id === staffMember.id)) {
        card.staff.push(staffMember);
      }
    }

    return Array.from(groupedEvents.values()).map((card) => ({
      ...card,
      staffNames: card.staff.map((staff) => staff.nome).join(', ')
    }));
  }

  private toStaffMember(event: StaffEventInfo): StaffMemberInfo | null {
    if (!event.idStaff && !event.nomeStaff && !event.cognomeStaff) {
      return null;
    }

    const nome = `${event.nomeStaff || ''} ${event.cognomeStaff || ''}`.trim();

    return {
      id: event.idStaff ?? null,
      nome: nome || 'Staff non disponibile',
      ruolo: event.tipoStaff || event.mansioneStaff || 'Ruolo non disponibile',
      descrizione: event.descrizioneStaff ?? null,
      linkSito: event.linkSitoStaff ?? null,
      costo: event.costoStaff ?? null
    };
  }

  private normalizeAssetUrl(url: string | null): string | null {
    if (!url) {
      return null;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
  }

  private toLocalDate(dateStr: string): Date | null {
    if (!dateStr) {
      return null;
    }

    const day = dateStr.substring(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      return null;
    }

    const date = new Date(`${day}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

}
