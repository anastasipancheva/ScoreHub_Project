"use client";
import { useEffect, useState } from "react";
import { studentApi, StudentActivity, assistantApps } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { BookOpen, ClipboardCheck, ChevronRight } from "lucide-react";

interface AppState {
  activityId: string;
  message: string;
  submitting: boolean;
  done: boolean;
}

export default function AssistantIndexPage() {
  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [appStates, setAppStates] = useState<Record<string, AppState>>({});

  useEffect(() => {
    studentApi.myActivities().then(acts => {
      setActivities(acts);
      const initial: Record<string, AppState> = {};
      acts.forEach(a => {
        initial[a.id] = { activityId: a.id, message: "", submitting: false, done: false };
      });
      setAppStates(initial);
    }).catch(() => {});
  }, []);

  async function apply(activityId: string) {
    const state = appStates[activityId];
    if (!state) return;
    setAppStates(prev => ({ ...prev, [activityId]: { ...prev[activityId], submitting: true } }));
    try {
      await assistantApps.apply(activityId, state.message || undefined);
      toast.success("Заявка подана! Ожидайте подтверждения преподавателя.");
      setAppStates(prev => ({ ...prev, [activityId]: { ...prev[activityId], submitting: false, done: true } }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ошибка";
      if (msg.includes("Already applied")) {
        toast.info("Вы уже подали заявку на это занятие");
        setAppStates(prev => ({ ...prev, [activityId]: { ...prev[activityId], submitting: false, done: true } }));
      } else {
        toast.error(msg);
        setAppStates(prev => ({ ...prev, [activityId]: { ...prev[activityId], submitting: false } }));
      }
    }
  }

  const upcoming = activities.filter(a => a.status === "Scheduled" || a.status === "Active");

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-lg font-semibold text-[#1A1A1B]">Панель ассистента</h1>

      {/* Quick links to session pages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="w-9 h-9 rounded-lg bg-[#EAF2FF] flex items-center justify-center mb-3">
            <BookOpen size={18} className="text-[#005BFF]" />
          </div>
          <h2 className="text-sm font-semibold text-[#1A1A1B] mb-1">Лекция / пара</h2>
          <p className="text-xs text-[#6B7280] mb-4">Перейти к сессии:</p>
          <code className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded-md">/assistant/session/[id]</code>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="w-9 h-9 rounded-lg bg-[#EAF2FF] flex items-center justify-center mb-3">
            <ClipboardCheck size={18} className="text-[#005BFF]" />
          </div>
          <h2 className="text-sm font-semibold text-[#1A1A1B] mb-1">Контрольная точка</h2>
          <p className="text-xs text-[#6B7280] mb-4">Перейти к сессии:</p>
          <code className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-1 rounded-md">/assistant/kt/[id]</code>
        </div>
      </div>

      {/* Apply to activities */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Подать заявку на занятие</p>

        {upcoming.length === 0 && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-6 text-center">
            <p className="text-sm text-[#9CA3AF]">Нет предстоящих занятий. Нужно быть записанным на курс.</p>
            <Link href="/courses" className="inline-flex items-center gap-1 mt-2 text-xs text-[#005BFF] hover:underline">
              Перейти к курсам <ChevronRight size={12} />
            </Link>
          </div>
        )}

        {upcoming.map(a => {
          const state = appStates[a.id];
          return (
            <div key={a.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1B]">{a.title}</p>
                  <p className="text-xs text-[#6B7280]">
                    {a.courseCode} · {a.typeLabel} · {new Date(a.startsAt).toLocaleDateString("ru", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {a.status === "Active" && (
                  <span className="text-xs font-medium bg-[#D1FAE5] text-[#059669] px-2.5 py-1 rounded-full">Идёт</span>
                )}
              </div>

              {state && !state.done ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Сообщение (необязательно)"
                    value={state.message}
                    onChange={e => setAppStates(prev => ({ ...prev, [a.id]: { ...prev[a.id], message: e.target.value } }))}
                    className="flex-1 h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  />
                  <button
                    onClick={() => apply(a.id)}
                    disabled={state.submitting}
                    className="h-9 px-4 rounded-lg bg-[#005BFF] text-white text-xs font-medium hover:bg-[#0050E6] disabled:opacity-60 transition-colors"
                  >
                    {state.submitting ? "..." : "Подать заявку"}
                  </button>
                </div>
              ) : state?.done ? (
                <p className="text-xs text-[#059669] font-medium">Заявка подана — ожидайте подтверждения</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="bg-[#EAF2FF] rounded-xl border border-[#C7DCFF] px-5 py-4">
        <p className="text-xs text-[#4B72B0] leading-relaxed">
          После одобрения заявки преподавателем вы получите уведомление и сможете перейти к сессии.
        </p>
      </div>
    </div>
  );
}
