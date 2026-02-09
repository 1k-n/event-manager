"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TASK_PRIORITY_LABELS } from "@/lib/constants";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { ja } from "date-fns/locale";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

interface TaskCalendarProps {
  tasks: Record<string, unknown>[];
  onTaskClick: (task: Record<string, unknown>) => void;
}

export function TaskCalendar({ tasks, onTaskClick }: TaskCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Record<string, unknown>[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const dateKey = format(new Date(task.dueDate as string), "yyyy-MM-dd");
      const existing = map.get(dateKey) || [];
      existing.push(task);
      map.set(dateKey, existing);
    }
    return map;
  }, [tasks]);

  const tasksWithoutDate = tasks.filter((t) => !t.dueDate);

  const weekDays = ["月", "火", "水", "木", "金", "土", "日"];

  return (
    <div className="space-y-4">
      {/* ヘッダー: 月の切り替え */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, "yyyy年M月", { locale: ja })}
        </h3>
        <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* カレンダーグリッド */}
      <div className="border rounded-md overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-muted">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
              {day}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7">
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate.get(dateKey) || [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={dateKey}
                className={`min-h-[80px] border-b border-r p-1 ${
                  !inMonth ? "bg-muted/30" : ""
                } ${today ? "bg-primary/5" : ""}`}
              >
                <div className={`text-xs font-medium mb-1 ${
                  !inMonth ? "text-muted-foreground/50" : today ? "text-primary font-bold" : "text-muted-foreground"
                }`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <button
                      key={task.id as string}
                      onClick={() => onTaskClick(task)}
                      className={`w-full text-left text-[10px] leading-tight px-1 py-0.5 rounded truncate hover:opacity-80 transition-opacity ${
                        task.status === "DONE"
                          ? "bg-green-100 text-green-800 line-through"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-0.5 ${priorityColors[task.priority as string]}`} />
                      {task.title as string}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-[10px] text-muted-foreground text-center">
                      +{dayTasks.length - 3}件
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 期限未設定のタスク */}
      {tasksWithoutDate.length > 0 && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                期限未設定 ({tasksWithoutDate.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tasksWithoutDate.map((task) => (
                <button
                  key={task.id as string}
                  onClick={() => onTaskClick(task)}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border hover:bg-muted transition-colors"
                >
                  <Badge className={`${priorityColors[task.priority as string]} text-white h-4 text-[9px] px-1`}>
                    {TASK_PRIORITY_LABELS[task.priority as string]}
                  </Badge>
                  <span className={task.status === "DONE" ? "line-through text-muted-foreground" : ""}>
                    {task.title as string}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
