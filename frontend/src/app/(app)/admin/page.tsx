"use client";
import { useEffect, useState } from "react";
import { courses, Course, StudentScore, teaching, admin, CourseStructure, teachingApi, TeacherActivity, assistantApps, AssistantApplicationDto } from "@/lib/api";
import { toast } from "sonner";
import { PlusCircle, ChevronRight, Play, Square, Users } from "lucide-react";

type Tab = "courses" | "structure" | "students" | "scores" | "schedule";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("courses");
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  // Courses tab
  const [newCode, setNewCode] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newYear, setNewYear] = useState("2024/2025");

  // Structure tab
  const [structure, setStructure] = useState<CourseStructure | null>(null);
  const [structureLoading, setStructureLoading] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleNum, setModuleNum] = useState("1");
  const [moduleStart, setModuleStart] = useState("");
  const [moduleEnd, setModuleEnd] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [actTitle, setActTitle] = useState("");
  const [actType, setActType] = useState("0");
  const [actStart, setActStart] = useState("");
  const [actEnd, setActEnd] = useState("");
  const [selectedActId, setSelectedActId] = useState<string | null>(null);
  const [taskSetTitle, setTaskSetTitle] = useState("");
  const [selectedTaskSetId, setSelectedTaskSetId] = useState<string | null>(null);
  const [taskCode, setTaskCode] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPoints, setTaskPoints] = useState("1");

  // Students tab
  const [userList, setUserList] = useState<{ id: string; email: string; displayName: string; role: string }[]>([]);
  const [bulkEmails, setBulkEmails] = useState("");

  // Scores tab
  const [allScores, setAllScores] = useState<StudentScore[]>([]);

  // Schedule tab
  const [scheduleActivities, setScheduleActivities] = useState<TeacherActivity[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [appsActivityId, setAppsActivityId] = useState<string | null>(null);
  const [applications, setApplications] = useState<AssistantApplicationDto[]>([]);

  useEffect(() => { courses.list().then(setCourseList).catch(() => {}); }, []);

  useEffect(() => {
    if (!selected) return;
    if (tab === "scores") courses.scores(selected).then(setAllScores).catch(() => setAllScores([]));
    if (tab === "structure") loadStructure();
    if (tab === "students") loadUsers();
    if (tab === "schedule") loadSchedule();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, tab]);

  async function loadStructure() {
    if (!selected) return;
    setStructureLoading(true);
    try {
      const s = await courses.structure(selected);
      setStructure(s);
    } catch { setStructure(null); }
    finally { setStructureLoading(false); }
  }

  async function loadUsers() {
    try { const u = await admin.listUsers(); setUserList(u); } catch {}
  }

  async function loadSchedule() {
    if (!selected) return;
    setScheduleLoading(true);
    try {
      const acts = await teachingApi.getCourseActivities(selected);
      setScheduleActivities(acts);
    } catch { setScheduleActivities([]); }
    finally { setScheduleLoading(false); }
  }

  async function startActivity(id: string) {
    try {
      await teachingApi.startActivity(id);
      toast.success("Занятие начато");
      loadSchedule();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Ошибка"); }
  }

  async function finishActivity(id: string) {
    try {
      await teachingApi.finishActivity(id);
      toast.success("Занятие завершено");
      loadSchedule();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Ошибка"); }
  }

  async function loadApplications(activityId: string) {
    try {
      const apps = await assistantApps.list(activityId);
      setApplications(apps);
      setAppsActivityId(activityId);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Ошибка"); }
  }

  async function reviewApplication(appId: string, approved: boolean) {
    if (!appsActivityId) return;
    try {
      await assistantApps.review(appsActivityId, appId, approved);
      toast.success(approved ? "Заявка одобрена" : "Заявка отклонена");
      loadApplications(appsActivityId);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Ошибка"); }
  }

  async function enrollBulk() {
    if (!selected || !bulkEmails.trim()) { toast.error("Выберите курс и введите email-адреса"); return; }
    const emails = bulkEmails.split(/[\n,;]+/).map(e => e.trim()).filter(Boolean);
    try {
      const r = await teachingApi.enrollBulk(selected, emails);
      toast.success(`Добавлено: ${r.added}. Не найдено: ${r.notFound}`);
      setBulkEmails("");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Ошибка"); }
  }

  async function createCourse() {
    if (!newCode || !newTitle) { toast.error("Заполните код и название"); return; }
    try {
      await teaching.createCourse(newCode, newTitle, newYear);
      toast.success("Курс создан");
      const list = await courses.list();
      setCourseList(list);
      setNewCode(""); setNewTitle("");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Ошибка"); }
  }

  async function addModule() {
    if (!selected || !moduleTitle || !moduleStart || !moduleEnd) { toast.error("Заполните все поля модуля"); return; }
    try {
      await teaching.addModule(selected, parseInt(moduleNum), moduleTitle, new Date(moduleStart).toISOString(), new Date(moduleEnd).toISOString());
      toast.success("Модуль добавлен");
      setModuleTitle(""); loadStructure();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Ошибка"); }
  }

  async function addActivity() {
    if (!selectedModuleId || !actTitle || !actStart || !actEnd) { toast.error("Заполните все поля занятия"); return; }
    try {
      await teaching.addActivity(selectedModuleId, parseInt(actType), actTitle, new Date(actStart).toISOString(), new Date(actEnd).toISOString());
      toast.success("Занятие добавлено");
      setActTitle(""); loadStructure();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Ошибка"); }
  }

  async function addTaskSet() {
    if (!selectedActId || !taskSetTitle) { toast.error("Выберите занятие и введите название"); return; }
    try {
      await teaching.addTaskSet(selectedActId, taskSetTitle);
      toast.success("Набор задач добавлен");
      setTaskSetTitle(""); loadStructure();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Ошибка"); }
  }

  async function addTask() {
    if (!selectedTaskSetId || !taskCode || !taskTitle) { toast.error("Заполните данные задачи"); return; }
    try {
      await teaching.addTask(selectedTaskSetId, taskCode, taskTitle, null, parseFloat(taskPoints));
      toast.success("Задача добавлена");
      setTaskCode(""); setTaskTitle(""); loadStructure();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Ошибка"); }
  }

  async function setRole(userId: string, roleName: string) {
    try {
      await admin.setUserRole(userId, roleName);
      toast.success("Роль обновлена");
      loadUsers();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Ошибка"); }
  }

  const markColor = (mark: string) => {
    if (mark.startsWith("5")) return "text-[#059669] bg-[#D1FAE5]";
    if (mark.startsWith("4")) return "text-[#005BFF] bg-[#EAF2FF]";
    if (mark.startsWith("3")) return "text-[#D97706] bg-[#FEF3C7]";
    return "text-[#DC2626] bg-[#FEE2E2]";
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "courses", label: "Курсы" },
    { key: "structure", label: "Структура" },
    { key: "students", label: "Студенты" },
    { key: "scores", label: "Баллы" },
    { key: "schedule", label: "Расписание" },
  ];

  const activityTypeLabels: Record<string, string> = { "0": "Лекция", "1": "КТ", "2": "ДЗ-сессия" };

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-[#1A1A1B]">Управление</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-[#F3F4F6] rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? "bg-white text-[#005BFF] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A1B]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Course selector (shown on all tabs except courses) */}
      {tab !== "courses" && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-2">Выберите курс</p>
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
                {c.code} — {c.title}
              </button>
            ))}
            {courseList.length === 0 && <p className="text-sm text-[#9CA3AF]">Нет курсов. Создайте на вкладке Курсы.</p>}
          </div>
        </div>
      )}

      {/* ── Tab: Courses ── */}
      {tab === "courses" && (
        <div className="space-y-5">
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
              <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-3">Все курсы</p>
              <div className="divide-y divide-[#F3F4F6]">
                {courseList.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <span className="text-sm font-semibold text-[#1A1A1B]">{c.code}</span>
                      <span className="text-sm text-[#6B7280] ml-2">{c.title}</span>
                    </div>
                    <span className="text-xs text-[#9CA3AF]">{c.academicYear}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Structure ── */}
      {tab === "structure" && selected && (
        <div className="space-y-5">
          {/* Add module */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-3">Добавить модуль</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Номер</label>
                <input className="h-9 w-16 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  type="number" value={moduleNum} onChange={(e) => setModuleNum(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Название</label>
                <input className="h-9 w-44 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="Модуль 1" />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Начало</label>
                <input className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  type="date" value={moduleStart} onChange={(e) => setModuleStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Конец</label>
                <input className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  type="date" value={moduleEnd} onChange={(e) => setModuleEnd(e.target.value)} />
              </div>
              <button onClick={addModule} className="h-9 px-4 rounded-lg bg-[#005BFF] text-white text-sm font-medium hover:bg-[#0050E6] transition-colors flex items-center gap-1.5">
                <PlusCircle size={14} /> Добавить
              </button>
            </div>
          </div>

          {/* Add activity */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-3">Добавить занятие</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Модуль</label>
                <select
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] bg-white transition"
                  value={selectedModuleId ?? ""} onChange={(e) => setSelectedModuleId(e.target.value || null)}
                >
                  <option value="">— выберите —</option>
                  {structure?.modules.map((m) => (
                    <option key={m.id} value={m.id}>{m.number}. {m.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Тип</label>
                <select
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] bg-white transition"
                  value={actType} onChange={(e) => setActType(e.target.value)}
                >
                  <option value="0">Лекция</option>
                  <option value="1">КТ</option>
                  <option value="2">ДЗ-сессия</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Название</label>
                <input className="h-9 w-44 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  value={actTitle} onChange={(e) => setActTitle(e.target.value)} placeholder="Лекция 1" />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Начало</label>
                <input className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  type="datetime-local" value={actStart} onChange={(e) => setActStart(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Конец</label>
                <input className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  type="datetime-local" value={actEnd} onChange={(e) => setActEnd(e.target.value)} />
              </div>
              <button onClick={addActivity} className="h-9 px-4 rounded-lg bg-[#005BFF] text-white text-sm font-medium hover:bg-[#0050E6] transition-colors flex items-center gap-1.5">
                <PlusCircle size={14} /> Добавить
              </button>
            </div>
          </div>

          {/* Add task set */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-3">Добавить набор задач</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Занятие</label>
                <select
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] bg-white transition"
                  value={selectedActId ?? ""} onChange={(e) => setSelectedActId(e.target.value || null)}
                >
                  <option value="">— выберите —</option>
                  {structure?.modules.flatMap((m) => m.activities.map((a) => (
                    <option key={a.id} value={a.id}>{a.title} ({activityTypeLabels[
                      a.type === "Lecture" ? "0" : a.type === "ControlPoint" ? "1" : "2"
                    ] ?? a.type})</option>
                  )))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Название набора</label>
                <input className="h-9 w-44 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  value={taskSetTitle} onChange={(e) => setTaskSetTitle(e.target.value)} placeholder="КТ вариант А" />
              </div>
              <button onClick={addTaskSet} className="h-9 px-4 rounded-lg bg-[#005BFF] text-white text-sm font-medium hover:bg-[#0050E6] transition-colors flex items-center gap-1.5">
                <PlusCircle size={14} /> Добавить
              </button>
            </div>
          </div>

          {/* Add task */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-3">Добавить задачу</p>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Набор задач</label>
                <select
                  className="h-9 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] bg-white transition"
                  value={selectedTaskSetId ?? ""} onChange={(e) => setSelectedTaskSetId(e.target.value || null)}
                >
                  <option value="">— выберите —</option>
                  {structure?.modules.flatMap((m) => m.activities.flatMap((a) =>
                    a.taskSets.map((ts) => (
                      <option key={ts.id} value={ts.id}>{a.title} / {ts.title}</option>
                    ))
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Код</label>
                <input className="h-9 w-20 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  value={taskCode} onChange={(e) => setTaskCode(e.target.value)} placeholder="A1" />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Название</label>
                <input className="h-9 w-44 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Задача 1" />
              </div>
              <div>
                <label className="block text-xs text-[#6B7280] mb-1">Баллы</label>
                <input className="h-9 w-20 px-3 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition"
                  type="number" value={taskPoints} onChange={(e) => setTaskPoints(e.target.value)} />
              </div>
              <button onClick={addTask} className="h-9 px-4 rounded-lg bg-[#005BFF] text-white text-sm font-medium hover:bg-[#0050E6] transition-colors flex items-center gap-1.5">
                <PlusCircle size={14} /> Добавить
              </button>
            </div>
          </div>

          {/* Structure tree */}
          {structureLoading && <p className="text-sm text-[#6B7280]">Загрузка...</p>}
          {!structureLoading && structure && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB]">
                <p className="text-sm font-semibold text-[#1A1A1B]">Дерево курса: {structure.code} — {structure.title}</p>
              </div>
              <div className="p-4 space-y-3">
                {structure.modules.length === 0 && <p className="text-sm text-[#9CA3AF]">Нет модулей</p>}
                {structure.modules.map((m) => (
                  <div key={m.id} className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                    <div className="bg-[#F9FAFB] px-4 py-2.5 flex items-center gap-2">
                      <span className="text-xs font-bold text-[#005BFF] uppercase">М{m.number}</span>
                      <span className="text-sm font-semibold text-[#1A1A1B]">{m.title}</span>
                    </div>
                    {m.activities.length > 0 && (
                      <div className="divide-y divide-[#F3F4F6]">
                        {m.activities.map((a) => (
                          <div key={a.id} className="px-4 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <ChevronRight size={12} className="text-[#9CA3AF]" />
                              <span className="text-xs text-[#6B7280]">{activityTypeLabels[
                                a.type === "Lecture" ? "0" : a.type === "ControlPoint" ? "1" : "2"
                              ] ?? a.type}</span>
                              <span className="text-sm font-medium text-[#1A1A1B]">{a.title}</span>
                            </div>
                            {a.taskSets.map((ts) => (
                              <div key={ts.id} className="ml-5 mt-1">
                                <p className="text-xs text-[#6B7280] font-medium">{ts.title}</p>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {ts.tasks.map((t) => (
                                    <span key={t.id} className="text-xs bg-[#EAF2FF] text-[#005BFF] px-2 py-0.5 rounded font-mono">
                                      {t.code} ({t.points}б)
                                    </span>
                                  ))}
                                  {ts.tasks.length === 0 && <span className="text-xs text-[#9CA3AF]">нет задач</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "structure" && !selected && (
        <p className="text-sm text-[#9CA3AF]">Выберите курс выше.</p>
      )}

      {/* ── Tab: Students ── */}
      {tab === "students" && (
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <p className="text-sm font-semibold text-[#1A1A1B]">Все пользователи</p>
            <button onClick={loadUsers} className="text-xs text-[#005BFF] hover:underline">Обновить</button>
          </div>
          {userList.length === 0 ? (
            <p className="px-5 py-4 text-sm text-[#9CA3AF]">Нет пользователей</p>
          ) : (
            <div className="divide-y divide-[#F3F4F6]">
              {userList.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1B]">{u.displayName}</p>
                    <p className="text-xs text-[#6B7280]">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B7280]">{u.role}</span>
                    <select
                      defaultValue=""
                      onChange={(e) => { if (e.target.value) setRole(u.id, e.target.value); }}
                      className="h-8 px-2 rounded-lg border border-[#E5E7EB] text-xs outline-none focus:border-[#005BFF] bg-white transition"
                    >
                      <option value="">Изменить...</option>
                      <option value="Student">Student</option>
                      <option value="Assistant">Assistant</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Scores ── */}
      {tab === "scores" && selected && allScores.length > 0 && (
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
      {tab === "scores" && selected && allScores.length === 0 && (
        <p className="text-sm text-[#9CA3AF]">Нет данных о баллах для выбранного курса.</p>
      )}
      {tab === "scores" && !selected && (
        <p className="text-sm text-[#9CA3AF]">Выберите курс выше.</p>
      )}

      {/* ── Tab: Schedule ── */}
      {tab === "schedule" && selected && (
        <div className="space-y-5">
          {/* Bulk enroll */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
            <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wide mb-3">Массовая запись студентов</p>
            <textarea
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm outline-none focus:border-[#005BFF] focus:ring-2 focus:ring-[#005BFF]/10 transition resize-none"
              placeholder={"student1@edu.ru\nstudent2@edu.ru\n..."}
              value={bulkEmails}
              onChange={e => setBulkEmails(e.target.value)}
            />
            <button
              onClick={enrollBulk}
              className="mt-2 h-9 px-4 rounded-lg bg-[#005BFF] text-white text-sm font-medium hover:bg-[#0050E6] transition-colors"
            >
              Записать
            </button>
          </div>

          {/* Activity list */}
          {scheduleLoading && <p className="text-sm text-[#6B7280]">Загрузка...</p>}
          {!scheduleLoading && scheduleActivities.length === 0 && (
            <p className="text-sm text-[#9CA3AF]">Нет занятий. Добавьте их на вкладке Структура.</p>
          )}
          {!scheduleLoading && scheduleActivities.length > 0 && (
            <div className="space-y-2">
              {scheduleActivities.map(a => {
                const statusBadge =
                  a.status === "Active"
                    ? "bg-[#D1FAE5] text-[#059669]"
                    : a.status === "Finished"
                    ? "bg-[#F3F4F6] text-[#9CA3AF]"
                    : "bg-[#FEF3C7] text-[#D97706]";
                const statusLabel =
                  a.status === "Active" ? "Идёт" : a.status === "Finished" ? "Завершено" : "Запланировано";

                return (
                  <div key={a.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-[#6B7280] font-medium">М{a.moduleNumber}</span>
                          <span className="text-xs text-[#9CA3AF]">{a.typeLabel}</span>
                          <span className="text-sm font-semibold text-[#1A1A1B] truncate">{a.title}</span>
                        </div>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {new Date(a.startsAt).toLocaleString("ru", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          {" — "}
                          {new Date(a.endsAt).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge}`}>
                          {statusLabel}
                        </span>

                        {a.status === "Scheduled" && (
                          <button
                            onClick={() => startActivity(a.id)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#005BFF] text-white text-xs font-medium hover:bg-[#0050E6] transition-colors"
                          >
                            <Play size={12} /> Начать
                          </button>
                        )}
                        {a.status === "Active" && (
                          <button
                            onClick={() => finishActivity(a.id)}
                            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#EF4444] text-white text-xs font-medium hover:bg-[#DC2626] transition-colors"
                          >
                            <Square size={12} /> Завершить
                          </button>
                        )}

                        <button
                          onClick={() => appsActivityId === a.id ? setAppsActivityId(null) : loadApplications(a.id)}
                          className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E5E7EB] text-xs text-[#1A1A1B] hover:bg-[#F3F4F6] transition-colors"
                        >
                          <Users size={12} /> Заявки
                        </button>
                      </div>
                    </div>

                    {/* Applications panel */}
                    {appsActivityId === a.id && (
                      <div className="mt-3 pt-3 border-t border-[#F3F4F6] space-y-2">
                        {applications.length === 0 && (
                          <p className="text-xs text-[#9CA3AF]">Заявок нет</p>
                        )}
                        {applications.map(app => (
                          <div key={app.id} className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-medium text-[#1A1A1B]">{app.assistantName}</p>
                              <p className="text-xs text-[#6B7280]">{app.assistantEmail}</p>
                              {app.message && <p className="text-xs text-[#9CA3AF] mt-0.5 italic">{app.message}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              {app.status === "Pending" ? (
                                <>
                                  <button
                                    onClick={() => reviewApplication(app.id, true)}
                                    className="h-7 px-3 rounded-lg bg-[#005BFF] text-white text-xs font-medium hover:bg-[#0050E6] transition-colors"
                                  >
                                    Принять
                                  </button>
                                  <button
                                    onClick={() => reviewApplication(app.id, false)}
                                    className="h-7 px-3 rounded-lg bg-[#EF4444] text-white text-xs font-medium hover:bg-[#DC2626] transition-colors"
                                  >
                                    Отклонить
                                  </button>
                                </>
                              ) : (
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                  app.status === "Approved" ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEE2E2] text-[#DC2626]"
                                }`}>
                                  {app.status === "Approved" ? "Принят" : "Отклонён"}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {tab === "schedule" && !selected && (
        <p className="text-sm text-[#9CA3AF]">Выберите курс выше.</p>
      )}
    </div>
  );
}
