"use client";
import { use, useEffect, useState, useCallback } from "react";
import { teams, miniTest, MiniTestDto } from "@/lib/api";
import { useSignalR } from "@/hooks/useSignalR";
import { toast } from "sonner";

interface PageProps { params: Promise<{ id: string }> }

export default function LecturePage({ params }: PageProps) {
  const { id: activityId } = use(params);

  const [teamId, setTeamId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<{ id: string; code: string; status: string }[]>([]);
  const [miniTestData, setMiniTestData] = useState<MiniTestDto | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const fetchMiniTest = useCallback(async () => {
    try {
      const data = await miniTest.get(activityId);
      setMiniTestData(data);
      setSecondsLeft(data.secondsRemaining);
    } catch {}
  }, [activityId]);

  useEffect(() => { fetchMiniTest(); }, [fetchMiniTest]);

  useEffect(() => {
    if (!miniTestData?.isOpen || secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [miniTestData?.isOpen, secondsLeft]);

  useSignalR(useCallback((payload) => {
    if (payload.type === "MiniTestOpened") fetchMiniTest();
    if (payload.type === "TaskAccepted" || payload.type === "TaskRejected") {
      toast[payload.type === "TaskAccepted" ? "success" : "error"](payload.title);
    }
  }, [fetchMiniTest]));

  async function callAssistant() {
    if (!teamId) return;
    try {
      await teams.requestHelp(teamId);
      toast.success("Ассистент вызван!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function markReady(taskItemId: string) {
    if (!teamId) return;
    try {
      await teams.markReady(teamId, taskItemId);
      toast.success("Ассистент уведомлён о готовности");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function submitTest() {
    const ans = Object.entries(answers).map(([questionId, selectedOptionIndex]) => ({
      questionId,
      selectedOptionIndex,
    }));
    try {
      await miniTest.submit(activityId, ans);
      setTestSubmitted(true);
      toast.success("Тест сдан!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    }
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const taskStatus: Record<string, string> = {
    Accepted: "bg-[#D1FAE5] text-[#059669]",
    InReview: "bg-[#EAF2FF] text-[#005BFF]",
    Rejected: "bg-[#FEE2E2] text-[#DC2626]",
  };

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-[#1A1A1B]">Лекция</h1>

      {/* Mini-test active */}
      {miniTestData && !testSubmitted && miniTestData.isOpen && secondsLeft > 0 && (
        <div className="bg-white rounded-xl border border-[#C7DCFF] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#C7DCFF] bg-[#EAF2FF] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#005BFF]">Мини-тест</span>
            <span className="text-sm font-mono font-bold text-[#D97706] bg-[#FEF3C7] px-2.5 py-1 rounded-lg">
              {fmt(secondsLeft)}
            </span>
          </div>
          <div className="p-5 space-y-5">
            {miniTestData.questions.map((q) => (
              <div key={q.id}>
                <p className="text-sm font-medium text-[#1A1A1B] mb-2">{q.order}. {q.text}</p>
                <div className="space-y-1.5">
                  {q.options.map((opt, i) => (
                    <label
                      key={i}
                      className={`flex items-center gap-3 text-sm cursor-pointer px-3 py-2 rounded-lg border transition-colors ${
                        answers[q.id] === i
                          ? "border-[#005BFF] bg-[#EAF2FF] text-[#005BFF]"
                          : "border-[#E5E7EB] text-[#1A1A1B] hover:border-[#005BFF]/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={i}
                        checked={answers[q.id] === i}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                        className="accent-[#005BFF]"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={submitTest}
              className="h-10 px-5 rounded-lg bg-[#005BFF] text-white text-sm font-medium hover:bg-[#0050E6] transition-colors"
            >
              Сдать тест
            </button>
          </div>
        </div>
      )}

      {/* Test submitted */}
      {testSubmitted && (
        <div className="bg-[#D1FAE5] border border-[#6EE7B7] rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-[#059669]">Тест сдан!</p>
        </div>
      )}

      {/* Team actions */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <p className="text-sm font-semibold text-[#1A1A1B] mb-1">Команда</p>
        <p className="text-xs text-[#6B7280] mb-4">
          Вызовите ассистента на консультацию или отметьте задачу готовой.
        </p>
        <button
          onClick={callAssistant}
          disabled={!teamId}
          className="h-10 px-5 rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280] font-medium hover:border-[#005BFF] hover:text-[#005BFF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Позвать ассистента
        </button>
        {!teamId && (
          <p className="text-xs text-[#9CA3AF] mt-2">
            teamId будет подтянут через API курса (GET /api/activities/{activityId}/my-team).
          </p>
        )}
      </div>

      {/* Tasks */}
      {tasks.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <p className="text-sm font-semibold text-[#1A1A1B]">Задачи</p>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3">
                <span className="text-sm font-mono font-medium text-[#1A1A1B]">{t.code}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${taskStatus[t.status] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                    {t.status}
                  </span>
                  {t.status !== "Accepted" && (
                    <button
                      onClick={() => markReady(t.id)}
                      className="h-8 px-3 rounded-lg border border-[#E5E7EB] text-xs text-[#6B7280] font-medium hover:border-[#005BFF] hover:text-[#005BFF] transition-colors"
                    >
                      Готовы сдать
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
