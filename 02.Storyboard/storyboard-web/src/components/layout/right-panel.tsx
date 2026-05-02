export function RightPanel({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="w-80 border-l border-border bg-surface flex flex-col shrink-0">
      {children ?? (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-text-muted">选择镜头查看详情</p>
        </div>
      )}
    </aside>
  );
}
