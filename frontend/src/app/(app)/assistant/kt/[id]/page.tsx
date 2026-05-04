"use client";
import { use, useEffect, useState, useCallback } from "react";
import { kt, KtQueueEntry } from "@/lib/api";
import { useSignalR } from "@/hooks/useSignalR";
import { toast } from "sonner";

interface PageProps { params: Promise<{ id: string }> }

export default function AssistantKtPage({ params }: PageProps) {
  const { id: activityId } = use(params);
  const [taskItemId, setTaskItemId] = useState("");
  const [queue, setQueue] = useState<KtQueueEntry[]>([]);

  const reload = useCallback(async () => {
    if (!taskItemId) return;
    const data = await kt.queue(activityId, taskItemId).catch(() => [] as KtQueueEntry[]);
    setQueue(data);
  }, [activityId, taskItemId]);

  useEffect(() => { reload(); }, [reload]);

  useSignalR(useCallback((payload) => {
    if (payload.type === "KtTaskReady") { toast.info(payload.title); reload(); }
  }, [reload]));

  async function callNext() {
    try {
      await kt.callNext(activityId, taskItemId);
      toast.success("Студент вызван");
      reload();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    }
  }

  async function complete(submissionId: string, accepted: boolean) {
    try {
      await kt.completeReview(activityId, submissionId, accepted, accepted ? 1 : 0);
      toast[accepted ? "success" : "error"](accepted ? "Принято" : "Не принято");
      reload();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    }
  }

  const statusStyle: Record<string, string> = {
    ReadyForReview: "bg-[#FEF3C7] text-[#D97706]",
    InReview: "bg-[#EAF2FF] text-[#005BFF]",
    Accepted: "bg-[#D1FAE5] text-[#059669]",
    Rejected: "bg-[#FEE2E2] text-[#DC2626]",
  };

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-[#1A1A1B]">КТ — панель ассистента</h1>

      {/* Task selector */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <p className="text-sm font-semibold text-[#1A1A1B] mb-3">Задача</p>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            className="h-10 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition flex-1 max-w-xs"
            placeholder="Task Item ID (UUID)"
            value={taskItemId}
            onChange={(e) => setTaskItemId(e.target.value)}
          />
          <button
            onClick={reload}
            className="h-10 px-4 rounded-lg border border-[#E5E7EB] text-sm text-[#6B7280] font-medium hover:border-[#005BFF] hover:text-[#005BFF] transition-colors"
          >
            Загрузить очередь
          </button>
          <button
            onClick={callNext}
            disabled={!taskItemId}
            className="h-10 px-5 rounded-lg bg-[#005BFF] text-white text-sm font-medium hover:bg-[#0050E6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Вызвать следующего
          </button>
        </div>
      </div>

      {/* Queue */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
          <span className="text-sm font-semibold text-[#1A1A1B]">Очередь</span>
          {queue.length > 0 && (
            <span className="h-5 min-w-5 px-1.5 rounded-full bg-[#EAF2FF] text-[#005BFF] text-xs font-bold flex items-center justify-center">
              {queue.length}
            </span>
          )}
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {queue.length === 0 && (
            <p className="px-5 py-4 text-sm text-[#9CA3AF]">Очередь пуста</p>
          )}
          {queue.map((entry, i) => (
            <div key={entry.submissionId} className="flex items-center justify-between px-5 py-3">
              <div>
                <span className="text-sm font-medium text-[#9CA3AF] mr-2">#{i + 1}</span>
                <span className="text-sm font-medium text-[#1A1A1B]">{entry.studentEmail}</span>
                {entry.readyAt && (
                  <span className="text-xs text-[#9CA3AF] ml-2">
                    с {new Date(entry.readyAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[entry.status] ?? "bg-[#F3F4F6] text-[#6B7280]"}`}>
                  {entry.status}
                </span>
                {entry.status === "InReview" && (
                  <>
                    <button
                      onClick={() => complete(entry.submissionId, true)}
                      className="h-8 px-3 rounded-lg bg-[#059669] text-white text-xs font-medium hover:bg-[#047857] transition-colors"
                    >
                      Принять
                    </button>
                    <button
                      onClick={() => complete(entry.submissionId, false)}
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
    </div>
  );
}
