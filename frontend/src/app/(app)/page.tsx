"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { studentApi, StudentActivity, courses, Course } from "@/lib/api";
import Link from "next/link";
import { BookOpen, ClipboardList, Bell, Star, ChevronRight, Zap } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const role = user?.role ?? "";

  const [activities, setActivities] = useState<StudentActivity[]>([]);
  const [courseList, setCourseList] = useState<Course[]>([]);

  useEffect(() => {
    if (role === "Teacher" || role === "Admin") {
      router.replace("/admin");
      return;
    }
    studentApi.myActivities().then(setActivities).catch(() => {});
    courses.list().then(setCourseList).catch(() => {});
  }, [role, router]);

  const active = activities.filter(a => a.status === "Active");
  const upcoming = activities.filter(a => a.status === "Scheduled").slice(0, 5);

  const activityHref = (a: StudentActivity) =>
    a.type === 1 ? `/kt/${a.id}` : `/lecture/${a.id}`;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-[#EAF2FF] rounded-xl border border-[#C7DCFF] px-6 py-5">
        <p className="text-sm text-[#005BFF] font-medium mb-0.5">Добро пожаловать</p>
        <h1 className="text-xl font-semibold text-[#1A1A1B]">{user?.displayName}</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">
          {role === "Assistant" ? "Ассистент" : "Студент"}
        </p>
      </div>

      {/* Active activities */}
      {active.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide flex items-center gap-1.5">
            <Zap size={12} className="text-[#005BFF]" /> Сейчас идёт
          </p>
          {active.map(a => (
            <Link key={a.id} href={activityHref(a)}>
              <div className="bg-white rounded-xl border-2 border-[#005BFF]/20 p-4 flex items-center justify-between hover:border-[#005BFF]/40 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-[#1A1A1B]">{a.title}</p>
                  <p className="text-xs text-[#6B7280]">{a.courseCode} · {a.typeLabel}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-[#005BFF] bg-[#EAF2FF] px-3 py-1.5 rounded-lg">
                  Перейти <ChevronRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Предстоящие занятия</p>
          {upcoming.map(a => (
            <div key={a.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1A1A1B]">{a.title}</p>
                <p className="text-xs text-[#6B7280]">
                  {a.courseCode} · {a.typeLabel} · {new Date(a.startsAt).toLocaleDateString("ru", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <span className="text-xs text-[#9CA3AF] bg-[#F3F4F6] px-2 py-1 rounded-md">Запланировано</span>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { href: "/scores", icon: Star, label: "Мои баллы", color: "#005BFF", show: role !== "Assistant" },
          { href: "/notifications", icon: Bell, label: "Уведомления", color: "#7C3AED", show: true },
          { href: "/homework", icon: BookOpen, label: "Домашние задания", color: "#059669", show: role !== "Assistant" },
          { href: "/courses", icon: ClipboardList, label: "Мои курсы", color: "#D97706", show: true },
        ].filter(x => x.show).map(item => (
          <Link key={item.href} href={item.href}>
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 hover:border-[#005BFF]/30 transition-all group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: item.color + "15" }}>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              <p className="text-sm font-medium text-[#1A1A1B] group-hover:text-[#005BFF] transition-colors">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {active.length === 0 && upcoming.length === 0 && courseList.length === 0 && role === "Student" && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
          <p className="text-sm text-[#6B7280] mb-3">Вы ещё не записаны ни на один курс</p>
          <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm text-[#005BFF] font-medium hover:underline">
            Перейти к списку курсов <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
