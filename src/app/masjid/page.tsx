"use client";

import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";

export default function MasjidPage() {
  return (
    <div className="max-w-lg mx-auto">
      <Header title="دليل المساجد" showBack />
      <div className="px-4 py-6 space-y-6">
        <Card className="text-center py-12">
          <span className="text-6xl">🕌</span>
          <h2 className="text-xl font-bold mt-4">دليل المساجد</h2>
          <p className="text-sm text-[var(--muted)] mt-2">
            اعرف أي جزء تصلي به التراويح في مسجدك الليلة
          </p>
          <p className="text-sm text-[var(--muted)] mt-4">
            هذه الميزة قيد التطوير وستتوفر قريباً إن شاء الله
          </p>
        </Card>
      </div>
    </div>
  );
}
