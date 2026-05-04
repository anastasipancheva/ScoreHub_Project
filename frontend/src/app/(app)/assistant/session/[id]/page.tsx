"use client";
import { use, useEffect, useState, useCallback } from "react";
import { assistantSession, HelpRequest, TeamSubmission } from "@/lib/api";
import { useSignalR } from "@/hooks/useSignalR";
import { toast } from "sonner";

interface PageProps { params: Promise<{ id: string }> }

export default function AssistantSessionPage({ params }: PageProps) {
  const { id: activityId } = use(params);

  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [submissions, setSubmissions] = useState<TeamSubmission[]>([]);
  const [groupCoeffs, setGroupCoeffs] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    const [hr, subs] = await Promise.all([
      assistantSession.openHelp(activityId).catch(() => [] as HelpRequest[]),
      assistantSession.pendingSubmissions(activityId).catch(() => [] as TeamSubmission[]),
    ]);
    setHelpRequests(hr);
    setSubmissions(subs);
  }, [activityId]);

  useEffect(() => { reload(); }, [reload]);

  useSignalR(useCallback((payload) => {
    if (["TeamHelpRequested", "TeamReadyToDefend", "ReviewStarted", "TaskAccepted", "TaskRejected"].includes(payload.type)) {
      toast.info(payload.title, { description: payload.body ?? undefined });
      reload();
    }
  }, [reload]));

  async function resolveHelp(id: string) {
    await assistantSession.resolveHelp(id);
    reload();
  }

  async function startReview(sub: TeamSubmission) {
    const defender = prompt(`Введите userId защитника (из команды ${sub.teamName}):`);
    if (!defender) return;
    try {
      await assistantSession.startReview(sub.submissionId, defender);
      toast.success("Приём начат");
      reload();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function completeReview(sub: TeamSubmission, accepted: boolean) {
    try {
      await assistantSession.completeReview(sub.submissionId, accepted, accepted ? 1 : 0);
      toast[accepted ? "success" : "error"](accepted ? "Принято" : "Не принято");
      reload();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function setGroupScore(teamId: string) {
    const coeff = parseFloat(groupCoeffs[teamId] ?? "1");
    if (isNaN(coeff) || coeff < 0.8 || coeff > 1.2) {
      toast.error("Коэффициент должен быть от 0.8 до 1.2");
      return;
    }
    try {
      await assistantSession.setGroupScore(activityId, teamId, coeff);
      toast.success("Коэффициент выставлен");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    }
  }

  const uniqueTeamIds = [...new Set(submissions.map((s) => s.teamId))];

  const statusLabel: Record<string, string> = {
    ReadyForReview: "Ожидает",
    InReview: "На проверке",
    Accepted: "Принято",
    Rejected: "Не принято",
  };

  const statusStyle: Record<string, string> = {
    ReadyForReview: "bg-[#FEF3C7] text-[#D97706]",
    InReview: "bg-[#EAF2FF] text-[#005BFF]",
    Accepted: "bg-[#D1FAE5] text-[#059669]",
    Rejected: "bg-[#FEE2E2] text-[#DC2626]",
  };

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-[#1A1A1B]">Панель ассистента</h1>

      {/* Help requests */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
          <span className="text-sm font-semibold text-[#1A1A1B]">Вызовы ассистента</span>
          {helpRequests.length > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#DC2626] text-white text-xs font-bold flex items-center justify-center">
              {helpRequests.length}
            </span>
          )}
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {helpRequests.length === 0 && (
            <p className="px-5 py-4 text-sm text-[#9CA3AF]">Нет вызовов</p>
          )}
          {helpRequests.map((hr) => (
            <div key={hr.id} className="flex items-start justify-between gap-3 px-5 py-3">
              <div>
                <p className="text-sm font-medium text-[#1A1A1B]">{hr.teamName}</p>
                {hr.message && <p className="text-xs text-[#6B7280] mt-0.5">{hr.message}</p>}
                <p className="text-xs text-[#9CA3AF] mt-0.5">{new Date(hr.createdAt).toLocaleTimeString()}</p>
              </div>
              <button
                onClick={() => resolveHelp(hr.id)}
                className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280] font-medium hover:border-[#005BFF] hover:text-[#005BFF] transition-colors shrink-0"
              >
                Закрыть
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submission queue */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
          <span className="text-sm font-semibold text-[#1A1A1B]">Очередь сдач</span>
          {submissions.length > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#EAF2FF] text-[#005BFF] text-xs font-bold flex items-center justify-center">
              {submissions.length}
            </span>
          )}
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {submissions.length === 0 && (
            <p className="px-5 py-4 text-sm text-[#9CA3AF]">Очередь пуста</p>
          )}
          {submissions.map((sub) => (
            <div key={sub.submissionId} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <span className="text-sm font-medium text-[#1A1A1B]">{sub.teamName}</span>
                <span className="text-xs text-[#6B7280] ml-2 font-mono">задача {sub.taskCode}</span>
                {sub.readyAt && (
                  <span className="text-xs text-[#9CA3AF] ml-2">
                    с {new Date(sub.readyAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle[sub.status] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                  {statusLabel[sub.status] ?? sub.status}
                </span>
                {sub.status === "ReadyForReview" && (
                  <button
                    onClick={() => startReview(sub)}
                    className="h-8 px-3 rounded-lg bg-[#005BFF] text-white text-xs font-medium hover:bg-[#0050E6] transition-colors"
                  >
                    Начать
                  </button>
                )}
                {sub.status === "InReview" && (
                  <>
                    <button
                      onClick={() => completeReview(sub, true)}
                      className="h-8 px-3 rounded-lg bg-[#059669] text-white text-xs font-medium hover:bg-[#047857] transition-colors"
                    >
                      Принять
                    </button>
                    <button
                      onClick={() => completeReview(sub, false)}
                      className="h-8 px-3 rounded-lg bg-[#DC2626] text-white text-xs font-medium hover:bg-[#B91C1C] transition-colors"
                    >
                      Не принять
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Group coefficients */}
      {uniqueTeamIds.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <span className="text-sm font-semibold text-[#1A1A1B]">Групповой коэффициент</span>
            <p className="text-xs text-[#6B7280] mt-0.5">Допустимый диапазон: 0.8 — 1.2</p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {uniqueTeamIds.map((teamId) => {
              const teamName = submissions.find((s) => s.teamId === teamId)?.teamName ?? teamId;
              return (
                <div key={teamId} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-sm text-[#1A1A1B] min-w-28 font-medium">{teamName}</span>
                  <input
                    className="h-9 w-24 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                    type="number"
                    step="0.1"
                    min="0.8"
                    max="1.2"
                    value={groupCoeffs[teamId] ?? "1.0"}
                    onChange={(e) => setGroupCoeffs((p) => ({ ...p, [teamId]: e.target.value }))}
                  />
                  <button
                    onClick={() => setGroupScore(teamId)}
                    className="h-9 px-4 rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280] font-medium hover:border-[#005BFF] hover:text-[#005BFF] transition-colors"
                  >
                    Сохранить
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
