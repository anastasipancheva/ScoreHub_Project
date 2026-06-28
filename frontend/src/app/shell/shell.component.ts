import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { SignalRService } from '../core/signalr.service';
import { ToastService } from '../core/toast.service';
import { ApiService } from '../core/api.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen flex flex-col bg-[#F9FAFB]">
      <!-- Header -->
      <header class="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div class="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <div class="flex items-center gap-4 sm:gap-8 min-w-0">
            <a [routerLink]="homeHref" class="flex items-center gap-2 flex-shrink-0">
              <div class="w-7 h-7 rounded-lg bg-[#005BFF] flex items-center justify-center">
                <span class="text-white text-xs font-bold">S</span>
              </div>
              <span class="font-semibold text-[#1A1A1B] text-sm tracking-wide">ScoreHub</span>
            </a>
            <!-- Desktop nav -->
            <nav class="hidden sm:flex gap-1">
              @for (item of navItems(); track item.href) {
                <a [routerLink]="item.href" routerLinkActive="bg-[#EAF2FF] text-[#005BFF]"
                   [routerLinkActiveOptions]="item.exact ? {exact:true} : {exact:false}"
                   class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-[#6B7280] hover:text-[#1A1A1B] hover:bg-[#F3F4F6]">
                  {{ item.label }}
                </a>
              }
            </nav>
          </div>
          <div class="flex items-center gap-2 sm:gap-3">
            <a routerLink="/notifications" (click)="unread.set(0)"
               class="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#6B7280] hover:text-[#005BFF] hover:bg-[#EAF2FF] transition-colors">
              🔔
              @if (unread() > 0) {
                <span class="absolute -top-0.5 -right-0.5 bg-[#005BFF] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                  {{ unread() > 99 ? '99+' : unread() }}
                </span>
              }
            </a>
            <!-- Desktop: separator + name + logout -->
            <div class="hidden sm:flex items-center gap-3">
              <div class="h-5 w-px bg-[#E5E7EB]"></div>
              <a routerLink="/profile" class="text-sm text-[#1A1A1B] font-medium hover:text-[#005BFF] transition-colors max-w-[140px] truncate">
                {{ auth.user()?.displayName }}
              </a>
              <button (click)="logout()"
                class="flex items-center justify-center w-8 h-8 rounded-lg text-[#6B7280] hover:text-[#EF4444] hover:bg-red-50 transition-colors"
                title="Выйти">⏏</button>
            </div>
            <!-- Mobile hamburger -->
            <button (click)="mobileMenuOpen.set(!mobileMenuOpen())"
              class="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors text-base">
              {{ mobileMenuOpen() ? '✕' : '☰' }}
            </button>
          </div>
        </div>
        <!-- Mobile dropdown menu -->
        @if (mobileMenuOpen()) {
          <div class="sm:hidden border-t border-[#E5E7EB] bg-white shadow-lg">
            <nav class="px-4 pt-2 pb-2 space-y-0.5">
              @for (item of navItems(); track item.href) {
                <a [routerLink]="item.href" routerLinkActive="bg-[#EAF2FF] text-[#005BFF]"
                   [routerLinkActiveOptions]="item.exact ? {exact:true} : {exact:false}"
                   (click)="mobileMenuOpen.set(false)"
                   class="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-[#6B7280] hover:text-[#1A1A1B] hover:bg-[#F3F4F6]">
                  {{ item.label }}
                </a>
              }
            </nav>
            <div class="px-4 pb-3 pt-1 border-t border-[#F3F4F6] flex items-center justify-between">
              <a routerLink="/profile" (click)="mobileMenuOpen.set(false)"
                class="text-sm font-medium text-[#1A1A1B] truncate max-w-[200px]">
                {{ auth.user()?.displayName }}
              </a>
              <button (click)="logout()"
                class="flex items-center gap-1.5 text-sm text-[#EF4444] font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                Выйти ⏏
              </button>
            </div>
          </div>
        }
      </header>
      <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <router-outlet />
      </main>
    </div>
  `
})
export class ShellComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private signalR = inject(SignalRService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private api = inject(ApiService);
  private sub?: Subscription;

  unread = signal(0);
  mobileMenuOpen = signal(false);

  get homeHref() {
    return this.auth.isTeacher() ? '/admin' : '/';
  }

  navItems() {
    const isTeacher = this.auth.isTeacher();
    const isAssistant = this.auth.isAssistant();
    const isStudent = this.auth.isStudent();
    return [
      { href: '/', label: 'Главная', exact: true, show: isStudent || isAssistant },
      { href: '/calendar', label: 'Календарь', exact: false, show: isStudent || isAssistant },
      { href: '/gradebook', label: 'Баллы', exact: false, show: isStudent || isAssistant || isTeacher },
      { href: '/courses', label: 'Курсы', exact: false, show: isStudent || isAssistant },
      { href: '/assistant', label: 'Ассистент', exact: false, show: isAssistant || isTeacher },
      { href: '/admin', label: 'Управление', exact: false, show: isTeacher },
    ].filter(i => i.show);
  }

  ngOnInit() {
    this.api.listNotifications()
      .then(list => this.unread.set(list.filter(n => !n.readAt).length))
      .catch(() => {});

    this.signalR.start();
    this.sub = this.signalR.notification$.subscribe(payload => {
      this.unread.update(n => n + 1);
      this.toast.notify(payload.title, payload.body);
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  logout() { this.auth.logout(); this.router.navigate(['/login']); }
}
