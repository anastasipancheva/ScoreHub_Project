import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';

interface HwRow {
  submissionId: string; taskItemId: string; taskCode: string; taskTitle: string;
  memberIds: string[]; memberNames: string[]; submittedAt: string; status: string;
  timeCoefficient: number; priority: number; documentUrl: string;
}

const STATUS_CLASS: Record<string, string> = {
  Draft: 'bg-[#FEF3C7] text-[#D97706]', ReadyForReview: 'bg-[#FEF3C7] text-[#D97706]',
  InReview: 'bg-[#EAF2FF] text-[#005BFF]',
};

@Component({
  selector: 'app-assistant-doreshka',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 max-w-3xl">
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-semibold text-[#1A1A1B]">Дорешка — очередь приёма</h1>
        <button (click)="load()" class="h-9 px-4 rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280] font-medium hover:border-[#005BFF] hover:text-[#005BFF] transition-colors">🔄 Обновить</button>
      </div>

      @if (queue.length === 0) {
        <div class="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
          <p class="text-sm text-[#9CA3AF]">Очередь пуста.</p>
        </div>
      }

      <div class="space-y-2">
        @for (s of queue; track s.submissionId; let i = $index) {
          <div class="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-sm font-semibold text-[#1A1A1B]">Задача №{{ s.taskCode }}</span>
                  <span class="text-xs font-medium px-2 py-0.5 rounded-full" [class]="STATUS_CLASS[s.status] ?? 'bg-[#F3F4F6] text-[#6B7280]'">
                    {{ s.status === 'InReview' ? 'на приёме' : 'в очереди' }}
                  </span>
                  @if (s.timeCoefficient < 1) {
                    <span class="text-[11px] text-[#D97706] bg-[#FEF3C7] px-2 py-0.5 rounded-full">время ×{{ s.timeCoefficient }}</span>
                  }
                </div>
                <p class="text-sm text-[#1A1A1B]">{{ s.memberNames.join(', ') }}</p>
                <a [href]="s.documentUrl" target="_blank" rel="noopener noreferrer"
                  class="text-xs text-[#005BFF] hover:underline inline-flex items-center gap-1 mt-0.5">🔗 Решение</a>
              </div>
              <span class="text-xs text-[#9CA3AF] flex-shrink-0">#{{ i + 1 }}</span>
            </div>

            <div class="mt-3 flex items-center gap-2 flex-wrap">
              @if (s.status !== 'InReview') {
                <button (click)="start(s)" class="h-9 px-4 rounded-lg bg-[#005BFF] text-white text-xs font-semibold hover:bg-[#0050E6] transition-colors">Начать приём</button>
              } @else if (acceptFor === s.submissionId) {
                <div class="flex items-center gap-2 bg-[#F0FDF4] rounded-lg p-2">
                  <label class="text-xs text-[#059669]">Коэф. (0.8–1.2):</label>
                  <input type="number" step="0.1" min="0.8" max="1.2" [(ngModel)]="coefValue"
                    class="h-8 w-20 px-2 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#059669]" />
                  <button (click)="confirmAccept(s)" class="h-8 px-3 rounded-lg bg-[#059669] text-white text-xs font-semibold hover:bg-[#047857] transition-colors">Подтвердить</button>
                  <button (click)="acceptFor = null" class="h-8 px-2 rounded-lg text-xs text-[#6B7280]">Отмена</button>
                </div>
              } @else {
                <button (click)="startAccept(s)" class="h-9 px-4 rounded-lg bg-[#059669] text-white text-xs font-semibold hover:bg-[#047857] transition-colors">Принять</button>
                <button (click)="reject(s)" class="h-9 px-4 rounded-lg bg-[#DC2626] text-white text-xs font-semibold hover:bg-[#B91C1C] transition-colors">Не принять</button>
                <button (click)="backToQueue(s)" class="h-9 px-4 rounded-lg border border-[#E5E7EB] text-xs text-[#6B7280] font-medium hover:border-[#D97706] hover:text-[#D97706] transition-colors">В конец очереди</button>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class AssistantDoreshkaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  readonly STATUS_CLASS = STATUS_CLASS;

  activityId = '';
  queue: HwRow[] = [];
  acceptFor: string | null = null;
  coefValue = '0.8';

  ngOnInit() {
    this.activityId = this.route.snapshot.paramMap.get('id') ?? '';
    this.load();
  }

  async load() {
    this.queue = await this.api.homeworkQueue(this.activityId).catch(() => [] as HwRow[]);
  }

  async start(s: HwRow) {
    try { await this.api.hwStartReview(s.submissionId); this.toast.success('Приём начат'); this.load(); }
    catch (e: unknown) { this.toast.error(e instanceof Error ? e.message : 'Ошибка'); }
  }

  startAccept(s: HwRow) { this.acceptFor = s.submissionId; this.coefValue = '0.8'; }

  async confirmAccept(s: HwRow) {
    const coef = parseFloat(this.coefValue);
    if (isNaN(coef) || coef < 0.8 || coef > 1.2) { this.toast.error('Коэффициент должен быть от 0.8 до 1.2'); return; }
    try {
      await this.api.hwCompleteReview(s.submissionId, true, coef);
      this.toast.success('Принято');
      this.acceptFor = null;
      this.load();
    } catch (e: unknown) { this.toast.error(e instanceof Error ? e.message : 'Ошибка'); }
  }

  async reject(s: HwRow) {
    try { await this.api.hwCompleteReview(s.submissionId, false); this.toast.error('Не принято'); this.load(); }
    catch (e: unknown) { this.toast.error(e instanceof Error ? e.message : 'Ошибка'); }
  }

  async backToQueue(s: HwRow) {
    try { await this.api.hwBackToQueue(s.submissionId); this.toast.info('Перемещено в конец очереди'); this.load(); }
    catch (e: unknown) { this.toast.error(e instanceof Error ? e.message : 'Ошибка'); }
  }
}
