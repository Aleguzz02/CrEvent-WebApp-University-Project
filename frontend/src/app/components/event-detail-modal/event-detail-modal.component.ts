import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ModalController
} from '@ionic/angular/standalone';
import { Evento, EventoDettaglio } from '../../interfaces/event.interface';
import { LocationResource } from '../../interfaces/location.interface';
import { StaffResource } from '../../interfaces/staff.interface';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-detail-modal',
  templateUrl: './event-detail-modal.component.html',
  styleUrls: ['./event-detail-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonBadge,
    IonSpinner
  ]
})
export class EventDetailModalComponent implements OnInit {
  @Input({ required: true }) eventId!: number;
  @Input() evento: Evento | null = null;

  detail: EventoDettaglio | null = null;
  loading = true;
  errorMessage = '';

  constructor(
    private modalController: ModalController,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadDetail();
  }

  loadDetail(): void {
    if (!Number.isFinite(this.eventId)) {
      this.loading = false;
      this.errorMessage = 'Evento non valido.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.eventService.getEventDetail(this.eventId).subscribe({
      next: (response) => {
        this.loading = false;

        if (!response.success || !response.data) {
          this.errorMessage = response.message || 'Impossibile recuperare i dettagli evento.';
          return;
        }

        this.detail = {
          ...response.data,
          staff: response.data.staff ?? []
        };
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message
          || error?.error?.error
          || 'Errore durante il caricamento dei dettagli evento.';
      }
    });
  }

  close(): void {
    this.modalController.dismiss();
  }

  get modalTitle(): string {
    return this.detail?.nome || this.evento?.nome || 'Dettaglio evento';
  }

  get statusLabel(): string {
    return this.evento?.svolto === 1 ? 'Concluso' : 'In programma';
  }

  get statusColor(): 'medium' | 'success' {
    return this.evento?.svolto === 1 ? 'medium' : 'success';
  }

  get locationImage(): string {
    return this.normalizeAssetUrl(this.detail?.location?.url || this.evento?.url)
      || 'https://via.placeholder.com/350x180';
  }

  get locationSite(): string | null {
    return this.normalizeExternalUrl(this.detail?.location?.linkSito);
  }

  get locationMapUrl(): string | null {
    const location = this.detail?.location;

    if (
      location?.lat === null ||
      location?.lat === undefined ||
      location?.lng === null ||
      location?.lng === undefined
    ) {
      return null;
    }

    return `https://www.google.com/maps?q=${location.lat},${location.lng}`;
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

  formatPrice(value: number | null | undefined, suffix = 'euro'): string {
    if (value === null || value === undefined) {
      return '-';
    }

    return `${value} ${suffix}`;
  }

  getLocationAddress(location: LocationResource): string {
    if (Boolean(location.custom)) {
      return 'Location personalizzata';
    }

    return location.indirizzo || 'Indirizzo non disponibile';
  }

  getStaffName(staff: StaffResource): string {
    return `${staff.nome} ${staff.cognome}`.trim();
  }

  getStaffRole(staff: StaffResource): string {
    return staff.mansione
      || staff.genereMusicale
      || staff.genereFotografico
      || staff.tipo;
  }

  getStaffCost(staff: StaffResource): string {
    const suffix = staff.tipo === 'catering' ? 'euro pp' : 'euro';
    return this.formatPrice(staff.costo, suffix);
  }

  getStaffImage(staff: StaffResource): string {
    return this.normalizeAssetUrl(staff.url) || 'https://via.placeholder.com/120x120';
  }

  getStaffSite(staff: StaffResource): string | null {
    return this.normalizeExternalUrl(staff.linkSito);
  }

  private normalizeAssetUrl(url: string | null | undefined): string | null {
    if (!url) {
      return null;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;
  }

  private normalizeExternalUrl(url: string | null | undefined): string | null {
    if (!url) {
      return null;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return `https://${url}`;
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
