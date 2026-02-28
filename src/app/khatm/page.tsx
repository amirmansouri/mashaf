"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useKhatmStore } from "@/stores/khatmStore";

export default function KhatmPage() {
  const { groups, createGroup, deleteGroup } = useKhatmStore();
  const [newGroupName, setNewGroupName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = () => {
    if (!newGroupName.trim()) return;
    createGroup(newGroupName.trim());
    setNewGroupName("");
    setShowCreate(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <Header title="ختمة جماعية" showBack />
      <div className="px-4 py-6 space-y-6">
        <Card className="text-center py-6">
          <span className="text-5xl">👥</span>
          <h2 className="text-xl font-bold mt-3">ختمة جماعية</h2>
          <p className="text-sm text-[var(--muted)] mt-2">
            اقرأ القرآن مع عائلتك وأصدقائك
          </p>
        </Card>

        {showCreate ? (
          <Card>
            <p className="font-bold mb-3">مجموعة جديدة</p>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="اسم المجموعة..."
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--accent)] mb-3"
            />
            <div className="flex gap-2">
              <Button fullWidth onClick={handleCreate}>إنشاء</Button>
              <Button variant="secondary" fullWidth onClick={() => setShowCreate(false)}>إلغاء</Button>
            </div>
          </Card>
        ) : (
          <Button fullWidth size="lg" onClick={() => setShowCreate(true)}>
            + إنشاء مجموعة جديدة
          </Button>
        )}

        {/* Groups List */}
        {groups.map((group) => {
          const totalCompleted = group.members.reduce((sum, m) => sum + m.completed.length, 0);
          const progress = (totalCompleted / 30) * 100;
          return (
            <Card key={group.id}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold">{group.name}</p>
                <span className="text-xs text-[var(--muted)]">{group.members.length} أعضاء</span>
              </div>
              <ProgressBar progress={progress} showLabel />
              <p className="text-xs text-[var(--muted)] mt-2 text-center">
                {totalCompleted}/30 جزء مكتمل
              </p>
              <div className="flex gap-2 mt-3">
                <Button variant="secondary" size="sm" fullWidth onClick={() => deleteGroup(group.id)}>
                  حذف
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
