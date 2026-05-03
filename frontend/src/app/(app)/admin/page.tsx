"use client";
import { useEffect, useState } from "react";
import { courses, Course, StudentScore, teaching } from "@/lib/api";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

export default function AdminPage() {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [allScores, setAllScores] = useState<StudentScore[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newYear, setNewYear] = useState("2024/2025");

  useEffect(() => { courses.list().then(setCourseList).catch(() => {}); }, []);
  useEffect(() => {
    if (!selected) return;
    courses.scores(selected).then(setAllScores).catch(() => setAllScores([]));
  }, [selected]);

  async function createCourse() {
    if (!newCode || !newTitle) { toast.error("Заполните код и название"); return; }
    try {
      await teaching.createCourse(newCode, newTitle, newYear);
      toast.success("Курс создан");
      courses.list().then(setCourseList).catch(() => {});
      setNewCode(""); setNewTitle("");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Ошибка");
    }
  }

  const markColor = (mark: string) => {
    if (mark.startsWith("5")) return "text-[#059669] bg-[#D1FAE5]";
    if (mark.startsWith("4")) return "text-[#005BFF] bg-[#EAF2FF]";
    if (mark.startsWith("3")) return "text-[#D97706] bg-[#FEF3C7]";
    return "text-[#DC2626] bg-[#FEE2E2]";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold text-[#1A1A1B]">Управление</h1>

      <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
        <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-4">Создать курс</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-[#6B7280] mb-1">Код</label>
            <input
              className="h-9 w-24 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
              value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="MKN2"
            />
          </div>
          <div>
            <label className="block text-xs text-[#6B7280] mb-1">Название</label>
            <input
              className="h-9 w-56 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
              value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Математика для КН ч.2"
            />
          </div>
          <div>
            <label className="block text-xs text-[#6B7280] mb-1">Учебный год</label>
            <input
              className="h-9 w-28 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
              value={newYear} onChange={(e) => setNewYear(e.target.value)}
            />
          </div>
          <button
            onClick={createCourse}
            className="h-9 px-4 rounded-lg bg-[#005BFF] text-white text-sm font-medium hover:bg-[#0050E6] transition-colors flex items-center gap-1.5"
          >
            <PlusCircle size={15} />
            Создать
          </button>
        </div>
      </div>

      {courseList.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-3">Курсы</p>
          <div className="flex flex-wrap gap-2">
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
                {c.code} — {c.title} ({c.academicYear})
              </button>
            ))}
          </div>
        </div>
      )}

      {selected && allScores.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <p className="text-sm font-semibold text-[#1A1A1B]">Таблица баллов</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <th className="text-left px-5 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wide">Студент</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wide">М1</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wide">М2</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wide">М3</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wide">Итог</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-[#6B7280] uppercase tracking-wide">Оценка</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {allScores.map((s) => {
                  const byModule = (n: number) => s.modules.find((m) => m.moduleNumber === n)?.moduleScore ?? 0;
                  return (
                    <tr key={s.studentId} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-5 py-3 font-medium text-[#1A1A1B]">{s.displayName}</td>
                      <td className="text-right px-4 py-3 text-[#6B7280]">{byModule(1).toFixed(1)}</td>
                      <td className="text-right px-4 py-3 text-[#6B7280]">{byModule(2).toFixed(1)}</td>
                      <td className="text-right px-4 py-3 text-[#6B7280]">{byModule(3).toFixed(1)}</td>
                      <td className="text-right px-4 py-3 font-semibold text-[#1A1A1B]">{s.finalScore.toFixed(1)}</td>
                      <td className="text-right px-5 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${markColor(s.mark)}`}>
                          {s.mark}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
