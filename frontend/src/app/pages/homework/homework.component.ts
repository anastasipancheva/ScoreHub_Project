import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

const INPUT = 'w-full h-10 px-3 rounded-lg border border-[#E5E7EB] text-sm text-[#1A1A1B] placeholder-[#9CA3AF] outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition';

interface SourceTask { taskItemId: string; code: string; points: number; }
interface Source { sourceActivityId: string; kind: 'homework' | 'lecture'; title: string; tasks: SourceTask[]; }
interface MySub { submissionId: string; taskItemId: string; code: string; status: string; timeCoefficient: number; documentUrl: string; }

const STATUS_LABEL: Record<string, string> = {
  Draft: 'В очереди', ReadyForReview: 'В очереди', InReview: 'На приёме', Accepted: 'Принято', Rejected: 'Не принято',
};
const STATUS_CLASS: Record<string, string> = {
  Draft: 'bg-[#FEF3C7] text-[#D97706]', ReadyForReview: 'bg-[#FEF3C7] text-[#D97706]',
  InReview: 'bg-[#EAF2FF] text-[#005BFF]', Accepted: 'bg-[#D1FAE5] text-[#059669]', Rejected: 'bg-[#FEE2E2] text-[#DC2626]',
};

@Component({
  selector: 'app-homework',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-5 max-w-2xl">
      <h1 class="text-lg font-semibold text-[#1A1A1B]">Дорешка{{ activityTitle ? ' — ' + activityTitle : '' }}</h1>

      <div class="bg-[#EAF2FF] rounded-xl border border-[#C7DCFF] px-5 py-4">
        <p class="text-xs text-[#4B72B0] leading-relaxed">
          Здесь можно досдать задачи лекций текущего модуля и сдать домашки. Выберите источник,
          отметьте номера задач, прикрепите ссылку на решение (файл/Google&nbsp;Drive/фото) и отправьте.
          Можно сдавать одному или командой 1–3 человека.
        </p>
      </div>

      @if (sources.length === 0 && !loading) {
        <div class="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
          <p class="text-sm text-[#9CA3AF]">Нет доступных задач для сдачи. Возможно, преподаватель ещё не настроил материалы.</p>
        </div>
      }

      @if (sources.length > 0) {
        <div class="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
          <!-- Source selector -->
          <div>
            <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Источник задач</label>
            <div class="flex flex-wrap gap-1.5">
              @for (s of sources; track s.sourceActivityId) {
                <button (click)="selectSource(s)"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors"
                  [class]="selected?.sourceActivityId === s.sourceActivityId ? 'border-[#005BFF] bg-[#EAF2FF] text-[#005BFF]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#005BFF]/40'">
                  {{ s.kind === 'homework' ? '🏠 ' : '📖 ' }}{{ s.title }}
                </button>
              }
            </div>
          </div>

          @if (selected) {
            <!-- Tasks -->
            <div>
              <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Какие задачи сдаёте</label>
              <div class="flex flex-wrap gap-2">
                @for (t of selected.tasks; track t.taskItemId) {
                  <button (click)="toggleTask(t.taskItemId)"
                    class="px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1.5"
                    [class]="picked.has(t.taskItemId) ? 'border-[#059669] bg-[#D1FAE5] text-[#059669]' : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#059669]/40'">
                    @if (picked.has(t.taskItemId)) { <span>✓</span> }
                    №{{ t.code }}
                  </button>
                }
              </div>
            </div>

            <!-- Solution link -->
            <div>
              <label class="block text-xs font-medium text-[#6B7280] mb-1.5">Ссылка на решение</label>
              <input [class]="INPUT" placeholder="https://drive.google.com/... (файл, фото или ссылка)" [(ngModel)]="docUrl" />
            </div>

            <!-- Teammates -->
            <div>
              <label class="flex items-center gap-2 text-xs font-medium text-[#6B7280] mb-1.5">
                <input type="checkbox" [(ngModel)]="withTeam" /> Сдаю с командой (до 3 человек)
              </label>
              @if (withTeam) {
                <input [class]="INPUT" placeholder="ID сокомандников через запятую (без вашего)" [(ngModel)]="teammates" />
                <p class="text-[11px] text-[#9CA3AF] mt-1">Вы добавляетесь автоматически. Всего в группе до 3 человек.</p>
              }
            </div>

            <button (click)="submit()" [disabled]="loading || picked.size === 0"
              class="h-10 px-5 rounded-lg bg-[#005BFF] text-white text-sm font-medium hover:bg-[#0050E6] disabled:opacity-50 transition-colors">
              {{ loading ? 'Отправка...' : '📤 Отправить (' + picked.size + ')' }}
            </button>
          }
        </div>
      }

      <!-- My submissions -->
      @if (mySubmissions.length > 0) {
        <div class="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div class="px-5 py-3 border-b border-[#E5E7EB]"><p class="text-sm font-semibold text-[#1A1A1B]">Мои сдачи</p></div>
          <div class="divide-y divide-[#F3F4F6]">
            @for (s of mySubmissions; track s.submissionId) {
              <div class="flex items-center justify-between px-5 py-3">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-medium text-[#1A1A1B]">Задача №{{ s.code }}</span>
                  @if (s.timeCoefficient < 1) {
                    <span class="text-[11px] text-[#9CA3AF]">коэф. времени {{ s.timeCoefficient }}</span>
                  }
                </div>
                <span class="text-xs font-medium px-2.5 py-1 rounded-full" [class]="STATUS_CLASS[s.status] ?? 'bg-[#F3F4F6] text-[#6B7280]'">
                  {{ STATUS_LABEL[s.status] ?? s.status }}
                </span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class HomeworkComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  readonly INPUT = INPUT;
  readonly STATUS_LABEL = STATUS_LABEL;
  readonly STATUS_CLASS = STATUS_CLASS;

  activityId = '';
  activityTitle = '';
  sources: Source[] = [];
  mySubmissions: MySub[] = [];
  selected: Source | null = null;
  picked = new Set<string>();
  docUrl = '';
  withTeam = false;
  teammates = '';
  loading = false;

  ngOnInit() {
    this.activityId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.activityId) this.load();
  }

  async load() {
    this.loading = true;
    try {
      const data = await this.api.doreshkaInfo(this.activityId);
      this.activityTitle = data.activityTitle;
      this.sources = data.sources;
      this.mySubmissions = data.mySubmissions;
      if (!this.selected && this.sources.length > 0) this.selectSource(this.sources[0]);
    } catch (e: unknown) {
      this.toast.error(e instanceof Error ? e.message : 'Не удалось загрузить дорешку');
    } finally { this.loading = false; }
  }

  selectSource(s: Source) { this.selected = s; this.picked.clear(); }
  toggleTask(id: string) { this.picked.has(id) ? this.picked.delete(id) : this.picked.add(id); }

  async submit() {
    if (this.picked.size === 0) return;
    if (!this.docUrl.trim()) { this.toast.error('Укажите ссылку на решение'); return; }
    const myId = this.auth.user()?.id;
    if (!myId) { this.toast.error('Не удалось определить пользователя'); return; }

    let members = [myId];
    if (this.withTeam && this.teammates.trim()) {
      members = [myId, ...this.teammates.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean)];
    }
    if (members.length > 3) { this.toast.error('В группе не больше 3 человек'); return; }

    this.loading = true;
    try {
      await this.api.submitDoreshka(this.activityId, [...this.picked], this.docUrl.trim(), members);
      this.toast.success('Решение отправлено!');
      this.docUrl = ''; this.picked.clear(); this.teammates = ''; this.withTeam = false;
      await this.load();
    } catch (e: unknown) {
      this.toast.error(e instanceof Error ? e.message : 'Ошибка');
    } finally { this.loading = false; }
  }
}
