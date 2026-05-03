"use client";
import { useEffect, useState } from "react";
import { courses, Course, StudentScore } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ScoresPage() {
  const { user } = useAuth();
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState<StudentScore | null>(null);

  useEffect(() => { courses.list().then(setCourseList).catch(() => {}); }, []);

  useEffect(() => {
    if (!selected || !user) return;
    courses.scores(selected)
      .then((all) => setScore(all.find((s) => s.studentId === user.id) ?? null))
      .catch(() => setScore(null));
  }, [selected, user]);

  const byModule = (n: number) => score?.modules.find((m) => m.moduleNumber === n)?.moduleScore ?? null;

  const markColor = (mark: string) => {
    if (mark.startsWith("5")) return "text-[#059669] bg-[#D1FAE5]";
    if (mark.startsWith("4")) return "text-[#005BFF] bg-[#EAF2FF]";
    if (mark.startsWith("3")) return "text-[#D97706] bg-[#FEF3C7]";
    return "text-[#DC2626] bg-[#FEE2E2]";
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-lg font-semibold text-[#1A1A1B]">Мои баллы</h1>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
        <p className="text-xs font-medium text-[#6B7280] mb-3 uppercase tracking-wide">Выберите курс</p>
        <div className="flex flex-wrap gap-2">
          {courseList.length === 0 && <p className="text-sm text-[#9CA3AF]">Нет доступных курсов</p>}
          {courseList.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c.id === selected ? null : c.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                selected === c.id
                  ? "bg-[#005BFF] text-white border-[#005BFF]"
                  : "bg-white text-[#1A1A1B] border-[#E5E7EB] hover:border-[#005BFF]/40"
              }`}
            >
              {c.code} — {c.title}
            </button>
          ))}
        </div>
      </div>

      {selected && !score && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center text-sm text-[#9CA3AF]">
          Нет данных по баллам
        </div>
      )}

      {selected && score && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1A1A1B]">{score.displayName}</span>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6B7280]">
                Итог: <span className="font-semibold text-[#1A1A1B]">{score.finalScore.toFixed(1)}</span>
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${markColor(score.mark)}`}>
                {score.mark}
              </span>
            </div>
          </div>
          <div className="divide-y divide-[#F3F4F6]">
            {[1, 2, 3].map((n) => {
              const val = byModule(n);
              return (
                <div key={n} className="px-5 py-3.5 flex items-center justify-between">
                  <span className="text-sm text-[#6B7280]">Модуль {n}</span>
                  <span className="text-sm font-semibold text-[#1A1A1B]">
                    {val !== null ? val.toFixed(1) : <span className="text-[#9CA3AF] font-normal">—</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
