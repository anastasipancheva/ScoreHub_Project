import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { SignalRService } from '../../core/signalr.service';
import { ToastService } from '../../core/toast.service';
import { Subscription } from 'rxjs';

interface KtSubmission {
  submissionId: string;
  studentName: string;
  status: string;
  readyAt: string | null;
  solutionUrl: string | null;
  result01: number;
}
interface KtTask {
  taskItemId: string;
  taskCode: string;
  submissions: KtSubmission[];
}

const STATUS_STYLE: Record<string, string> = {
  Draft: 'bg-[#F3F4F6] text-[#6B7280]',
  ReadyForReview: 'bg-[#FEF3C7] text-[#D97706]',
  InReview: 'bg-[#EAF2FF] text-[#005BFF]',
  Accepted: 'bg-[#D1FAE5] text-[#059669]',
  Rejected: 'bg-[#FEE2E2] text-[#DC2626]',
};
const STATUS_LABEL: Record<string, string> = {
  Draft: 'Решение приложено',
  ReadyForReview: 'В очереди',
  InReview: 'На защите',
  Accepted: 'Принято',
  Rejected: 'Не принято',
};

@Component({
  selector: 'app-assistant-kt',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 max-w-3xl">
      <div class="flex items-center justify-between">
        <h1 class="text-lg font-semibold text-[#1A1A1B]">КТ — панель ассистента</h1>
        <button (click)="reload()"
          class="h-9 px-4 rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280] font-medium hover:border-[#005BFF] hover:text-[#005BFF] transition-colors">
          🔄 Обновить
        </button>
      </div>

      @if (tasks.length === 0) {
        <div class="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
          <p class="text-sm text-[#9CA3AF]">Нет задач. Преподаватель ещё не настроил задачи КТ.</p>
        </div>
      }

      @for (task of tasks; track task.taskItemId) {
        <div class="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div class="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-[#1A1A1B]">Задача {{ task.taskCode }}</span>
              <span class="h-5 min-w-5 px-1.5 rounded-full bg-[#FEF3C7] text-[#D97706] text-xs font-bold flex items-center justify-center">
                {{ inQueueCount(task) }} в очереди
              </span>
            </div>
            <button (click)="callNext(task)" [disabled]="inQueueCount(task) === 0"
              class="h-9 px-4 rounded-lg bg-[#005BFF] text-white text-sm font-medium hover:bg-[#0050E6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Вызвать следующего
            </button>
          </div>

          <div class="divide-y divide-[#F3F4F6]">
            @if (task.submissions.length === 0) {
              <p class="px-5 py-4 text-sm text-[#9CA3AF]">Никто пока не приложил решение</p>
            }
            @for (s of task.submissions; track s.submissionId) {
              <div class="flex items-center justify-between px-5 py-3 gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-[#1A1A1B] truncate">{{ s.studentName }}</p>
                  <div class="flex items-center gap-3 mt-0.5">
                    @if (s.readyAt) {
                      <span class="text-xs text-[#9CA3AF]">отметил в {{ s.readyAt | date:'shortTime' }}</span>
                    }
                    @if (s.solutionUrl) {
                      <a [href]="s.solutionUrl" target="_blank" rel="noopener noreferrer"
                        class="text-xs text-[#005BFF] hover:underline inline-flex items-center gap-1">🔗 Решение</a>
                    } @else {
                      <span class="text-xs text-[#9CA3AF]">решение не приложено</span>
                    }
                  </div>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <span class="text-xs font-medium px-2.5 py-1 rounded-full" [class]="statusStyle(s.status)">
                    {{ statusLabel(s.status) }}
                  </span>
                  @if (s.status === 'InReview') {
                    <button (click)="complete(s.submissionId, true)"
                      class="h-8 px-3 rounded-lg bg-[#059669] text-white text-xs font-medium hover:bg-[#047857] transition-colors">
                      Принять
                    </button>
                    <button (click)="complete(s.submissionId, false)"
                      class="h-8 px-3 rounded-lg bg-[#DC2626] text-white text-xs font-medium hover:bg-[#B91C1C] transition-colors">
                      Не принять
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class AssistantKtComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private signalr = inject(SignalRService);
  private toast = inject(ToastService);

  activityId = '';
  tasks: KtTask[] = [];
  private sub?: Subscription;

  ngOnInit() {
    this.activityId = this.route.snapshot.paramMap.get('id') ?? '';
    this.reload();
    this.sub = this.signalr.notification$.subscribe(payload => {
      if (payload.type === 'KtTaskReady') { this.toast.info(payload.title); this.reload(); }
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  async reload() {
    this.tasks = await this.api.ktOverview(this.activityId).catch(() => [] as KtTask[]);
  }

  inQueueCount(task: KtTask) {
    return task.submissions.filter(s => s.status === 'ReadyForReview').length;
  }

  async callNext(task: KtTask) {
    try {
      await this.api.ktCallNext(this.activityId, task.taskItemId);
      this.toast.success('Студент вызван');
      this.reload();
    } catch (e: unknown) {
      this.toast.error(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  async complete(submissionId: string, accepted: boolean) {
    try {
      await this.api.ktCompleteReview(this.activityId, submissionId, accepted, accepted ? 1 : 0);
      accepted ? this.toast.success('Принято') : this.toast.error('Не принято');
      this.reload();
    } catch (e: unknown) {
      this.toast.error(e instanceof Error ? e.message : 'Ошибка');
    }
  }

  statusStyle(s: string) { return STATUS_STYLE[s] ?? 'bg-[#F3F4F6] text-[#6B7280]'; }
  statusLabel(s: string) { return STATUS_LABEL[s] ?? s; }
}
