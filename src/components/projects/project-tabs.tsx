"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectOverview } from "@/components/projects/project-overview";
import { ProjectArtistsTab } from "@/components/artists/project-artists-tab";
import { TimetableView } from "@/components/timetable/timetable-view";
import { TaskList } from "@/components/tasks/task-list";
import { BudgetSummary } from "@/components/budget/budget-summary";
import { MemoList } from "@/components/memos/memo-list";
import { NoteList } from "@/components/memos/note-list";
import { TicketList } from "@/components/tickets/ticket-list";
import { FileList } from "@/components/files/file-list";
import { Users, Clock, ListTodo, Wallet, Info, MessageCircle, StickyNote, Ticket, Paperclip } from "lucide-react";

interface ProjectTabsProps {
  project: Record<string, unknown>;
  onUpdate: () => void;
}

export function ProjectTabs({ project, onUpdate }: ProjectTabsProps) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview" className="gap-1">
          <Info className="h-4 w-4" />
          概要
        </TabsTrigger>
        <TabsTrigger value="artists" className="gap-1">
          <Users className="h-4 w-4" />
          アーティスト
        </TabsTrigger>
        <TabsTrigger value="timetable" className="gap-1">
          <Clock className="h-4 w-4" />
          タイムテーブル
        </TabsTrigger>
        <TabsTrigger value="tasks" className="gap-1">
          <ListTodo className="h-4 w-4" />
          タスク
        </TabsTrigger>
        <TabsTrigger value="tickets" className="gap-1">
          <Ticket className="h-4 w-4" />
          チケット
        </TabsTrigger>
        <TabsTrigger value="budget" className="gap-1">
          <Wallet className="h-4 w-4" />
          予算
        </TabsTrigger>
        <TabsTrigger value="files" className="gap-1">
          <Paperclip className="h-4 w-4" />
          ファイル
        </TabsTrigger>
        <TabsTrigger value="notes" className="gap-1">
          <StickyNote className="h-4 w-4" />
          メモ
        </TabsTrigger>
        <TabsTrigger value="messages" className="gap-1">
          <MessageCircle className="h-4 w-4" />
          連絡帳
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ProjectOverview project={project} />
      </TabsContent>
      <TabsContent value="artists">
        <ProjectArtistsTab project={project} onUpdate={onUpdate} />
      </TabsContent>
      <TabsContent value="timetable">
        <TimetableView project={project} onUpdate={onUpdate} />
      </TabsContent>
      <TabsContent value="tasks">
        <TaskList project={project} onUpdate={onUpdate} />
      </TabsContent>
      <TabsContent value="tickets">
        <TicketList project={project} onUpdate={onUpdate} />
      </TabsContent>
      <TabsContent value="budget">
        <BudgetSummary project={project} onUpdate={onUpdate} />
      </TabsContent>
      <TabsContent value="files">
        <FileList project={project} />
      </TabsContent>
      <TabsContent value="notes">
        <NoteList project={project} />
      </TabsContent>
      <TabsContent value="messages">
        <MemoList project={project} />
      </TabsContent>
    </Tabs>
  );
}
