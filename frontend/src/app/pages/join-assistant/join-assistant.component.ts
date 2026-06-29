import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-join-assistant',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm w-full max-w-sm p-8 space-y-6 text-center">

        @if (loading) {
          <div class="space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto text-2xl">🎓</div>
            <p class="text-sm text-[#6B7280] animate-pulse">Загрузка...</p>
          </div>
        }

        @if (!loading && error) {
          <div class="space-y-4">
            <div class="w-12 h-12 rounded-2xl bg-[#FEE2E2] flex items-center justify-center mx-auto text-2xl">❌</div>
            <p class="text-sm font-semibold text-[#1A1A1B]">Ссылка недействительна</p>
            <p class="text-xs text-[#6B7280]">{{ error }}</p>
            <a href="/" class="inline-block text-sm text-[#005BFF] font-medium hover:underline">На главную →</a>
          </div>
        }

        @if (!loading && course && !submitted) {
          <div class="space-y-5">
            <div class="w-12 h-12 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mx-auto text-2xl">🎓</div>
            <div>
              <p class="text-xs text-[#9CA3AF] mb-1">Приглашение ассистента</p>
              <p class="text-lg font-bold text-[#1A1A1B]">{{ course.code }} — {{ course.title }}</p>
              <p class="text-sm text-[#6B7280] mt-1">{{ course.academicYear }}</p>
            </div>

            @if (!auth.isAuth()) {
              <div class="bg-[#FEF3C7] rounded-xl px-4 py-3">
                <p class="text-xs text-[#D97706]">Войдите в аккаунт, чтобы подать заявку.</p>
              </div>
              <div class="flex gap-2">
                <a [href]="loginUrl" class="flex-1 h-10 rounded-lg bg-[#005BFF] text-white text-sm font-medium flex items-center justify-center hover:bg-[#0050E6] transition-colors">
                  Войти
                </a>
                <a [href]="registerUrl" class="flex-1 h-10 rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280] flex items-center justify-center hover:border-[#D1D5DB] transition-colors">
                  Регистрация
                </a>
              </div>
            } @else {
              @if (alreadyApplied) {
                <div class="bg-[#FEF3C7] rounded-xl px-4 py-3">
                  <p class="text-sm text-[#D97706] font-medium">⏳ Заявка уже подана — ожидайте одобрения преподавателя</p>
                </div>
                <a href="/" class="inline-block text-sm text-[#005BFF] font-medium hover:underline">На главную →</a>
              } @else {
                <div class="bg-[#EEF2FF] rounded-xl px-4 py-3 text-left">
                  <p class="text-xs text-[#4338CA] font-medium">Что произойдёт после подачи заявки:</p>
                  <ul class="mt-1.5 space-y-1">
                    <li class="text-xs text-[#4338CA]">• Преподаватель получит уведомление</li>
                    <li class="text-xs text-[#4338CA]">• После одобрения вам будет присвоена роль ассистента</li>
                  </ul>
                </div>
                <button (click)="apply()" [disabled]="applying"
                  class="w-full h-11 rounded-xl bg-[#4F46E5] text-white font-semibold hover:bg-[#4338CA] disabled:opacity-60 transition-colors">
                  {{ applying ? 'Отправка...' : '✓ Подать заявку ассистента' }}
                </button>
              }
            }
          </div>
        }

        @if (!loading && submitted) {
          <div class="space-y-4">
            <div class="w-14 h-14 rounded-2xl bg-[#D1FAE5] flex items-center justify-center mx-auto text-3xl">✓</div>
            <p class="text-lg font-bold text-[#1A1A1B]">Заявка отправлена!</p>
            <p class="text-sm text-[#6B7280]">
              Преподаватель рассмотрит вашу заявку на курс<br/>
              <strong>{{ course?.code }} — {{ course?.title }}</strong>
            </p>
            <div class="bg-[#FEF3C7] rounded-xl px-4 py-3">
              <p class="text-xs text-[#D97706]">⏳ Ожидайте одобрения. После этого вам будет присвоена роль ассистента.</p>
            </div>
            <button (click)="router.navigate(['/'])"
              class="w-full h-10 rounded-xl bg-[#005BFF] text-white font-semibold hover:bg-[#0050E6] transition-colors">
              На главную →
            </button>
          </div>
        }

      </div>
    </div>
  `
})
export class JoinAssistantComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  auth = inject(AuthService);
  router = inject(Router);
  private toast = inject(ToastService);

  loading = true;
  error = '';
  applying = false;
  submitted = false;
  alreadyApplied = false;
  course: { id: string; code: string; title: string; academicYear: string } | null = null;

  private inviteCode = '';

  get loginUrl() { return `/login?redirect=/join-assistant/${this.inviteCode}`; }
  get registerUrl() { return `/register?redirect=/join-assistant/${this.inviteCode}`; }

  async ngOnInit() {
    this.inviteCode = this.route.snapshot.paramMap.get('code') ?? '';
    if (!this.inviteCode) { this.error = 'Код приглашения не найден.'; this.loading = false; return; }

    try {
      this.course = await this.api.getCourseByAssistantInvite(this.inviteCode);
    } catch {
      this.error = 'Курс не найден или ссылка-приглашение недействительна.';
    }
    this.loading = false;
  }

  async apply() {
    if (!this.course) return;
    this.applying = true;
    try {
      await this.api.applyAssistant(this.course.id, this.inviteCode);
      this.submitted = true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка';
      if (msg.includes('Заявка уже подана') || msg.includes('Already')) {
        this.alreadyApplied = true;
      } else {
        this.toast.error(msg);
      }
    } finally {
      this.applying = false;
    }
  }
}
