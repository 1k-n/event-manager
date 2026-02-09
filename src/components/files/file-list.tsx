"use client";

import { useState, useRef, useCallback } from "react";
import useSWR from "swr";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDateTime } from "@/lib/format";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { Upload, Trash2, Download, FileText, FileImage, File as FileIcon } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProjectFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

interface FileListProps {
  project: Record<string, unknown>;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  return FileText;
}

export function FileList({ project }: FileListProps) {
  const projectId = project.id as string;
  const { data, mutate } = useSWR(`/api/projects/${projectId}/files`, fetcher);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProjectFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const files: ProjectFile[] = data?.data || [];

  const handleUpload = useCallback(async (fileList: FileList) => {
    setError("");
    setUploading(true);

    try {
      for (const file of Array.from(fileList)) {
        if (file.size > MAX_FILE_SIZE) {
          setError(`${file.name}: ファイルサイズは10MB以下にしてください`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/projects/${projectId}/files`, {
          method: "POST",
          body: formData,
        });

        const result = await res.json();
        if (!result.success) {
          setError(result.error?.message || "アップロードに失敗しました");
        }
      }
      mutate();
    } catch {
      setError("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }, [projectId, mutate]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await fetch(`/api/projects/${projectId}/files/${deleteTarget.id}`, {
        method: "DELETE",
      });
      mutate();
    } catch {
      setError("削除に失敗しました");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">ファイル</CardTitle>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-1 h-4 w-4" />
            {uploading ? "アップロード中..." : "ファイルを追加"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUpload(e.target.files);
              }
              e.target.value = "";
            }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md mb-4">
            {error}
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/20"
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
        >
          <FileIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            ここにファイルをドラッグ&ドロップ
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            最大10MBまで
          </p>
        </div>

        {files.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            ファイルがありません
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => {
              const isImage = ALLOWED_IMAGE_TYPES.includes(file.mimeType);
              const Icon = getFileIcon(file.mimeType);

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted/50 transition-colors"
                >
                  {isImage ? (
                    <div className="relative w-10 h-10 rounded overflow-hidden shrink-0">
                      <Image
                        src={file.fileUrl}
                        alt={file.fileName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {file.fileName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.fileSize)} ・ {formatDateTime(file.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <a href={file.fileUrl} download={file.fileName}>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(file)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="ファイルを削除"
          description={`「${deleteTarget?.fileName}」を削除しますか？`}
          onConfirm={handleDelete}
          loading={deleting}
        />
      </CardContent>
    </Card>
  );
}
