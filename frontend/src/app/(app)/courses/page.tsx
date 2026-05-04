"use client";
import { useEffect, useState } from "react";
import { courses, Course, studentApi } from "@/lib/api";
import { toast } from "sonner";
import { BookOpen, CheckCircle } from "lucide-react";

export default function CoursesPage() {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    courses.list().then(setCourseList).catch(() => {});
  }, []);

  async function enroll(courseId: string) {
    setLoading(courseId);
    try {
      await studentApi.enroll(courseId);
      setEnrolled(prev => new Set([...prev, courseId]));
      toast.success("Вы записаны на курс");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ошибка";
      if (msg.includes("Already enrolled")) toast.info("Вы уже записаны на этот курс");
      else toast.error(msg);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-lg font-semibold text-[#1A1A1B]">Курсы</h1>

      {courseList.length === 0 && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
          <BookOpen size={32} className="mx-auto text-[#E5E7EB] mb-3" />
          <p className="text-sm text-[#9CA3AF]">Нет доступных курсов</p>
        </div>
      )}

      <div className="space-y-3">
        {courseList.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1A1A1B]">{c.code} — {c.title}</p>
              <p className="text-xs text-[#6B7280]">{c.academicYear}</p>
            </div>
            {enrolled.has(c.id) ? (
              <span className="flex items-center gap-1.5 text-xs text-[#059669] font-medium">
                <CheckCircle size={14} /> Записан
              </span>
            ) : (
              <button
                onClick={() => enroll(c.id)}
                disabled={loading === c.id}
                className="h-8 px-4 rounded-lg bg-[#005BFF] text-white text-xs font-medium hover:bg-[#0050E6] disabled:opacity-60 transition-colors"
              >
                {loading === c.id ? "..." : "Записаться"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
