"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ZakatPage() {
  const [cash, setCash] = useState("");
  const [gold, setGold] = useState("");
  const [silver, setSilver] = useState("");
  const [stocks, setStocks] = useState("");
  const [debts, setDebts] = useState("");
  const [result, setResult] = useState<number | null>(null);

  // Approximate values - user should check current prices
  const GOLD_GRAM_PRICE = 250; // USD approximate
  const SILVER_GRAM_PRICE = 3;
  const NISAB_GOLD = 85 * GOLD_GRAM_PRICE; // 85 grams of gold

  const calculate = () => {
    const totalCash = parseFloat(cash) || 0;
    const totalGold = (parseFloat(gold) || 0) * GOLD_GRAM_PRICE;
    const totalSilver = (parseFloat(silver) || 0) * SILVER_GRAM_PRICE;
    const totalStocks = parseFloat(stocks) || 0;
    const totalDebts = parseFloat(debts) || 0;

    const totalWealth = totalCash + totalGold + totalSilver + totalStocks - totalDebts;

    if (totalWealth >= NISAB_GOLD) {
      setResult(totalWealth * 0.025); // 2.5%
    } else {
      setResult(0);
    }
  };

  const fields = [
    { label: "النقود والحسابات البنكية", value: cash, setter: setCash, placeholder: "المبلغ بالدولار" },
    { label: "الذهب (بالغرام)", value: gold, setter: setGold, placeholder: "عدد الغرامات" },
    { label: "الفضة (بالغرام)", value: silver, setter: setSilver, placeholder: "عدد الغرامات" },
    { label: "الأسهم والاستثمارات", value: stocks, setter: setStocks, placeholder: "القيمة بالدولار" },
    { label: "الديون المستحقة عليك", value: debts, setter: setDebts, placeholder: "المبلغ بالدولار" },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <Header title="حاسبة الزكاة" showBack />
      <div className="px-4 py-6 space-y-4">
        <Card className="text-center">
          <p className="text-sm text-[var(--muted)]">النصاب الحالي (تقريبي)</p>
          <p className="text-xl font-bold mt-1">${NISAB_GOLD.toLocaleString()}</p>
          <p className="text-[10px] text-[var(--muted)]">85 غرام ذهب</p>
        </Card>

        {fields.map((field, i) => (
          <div key={i}>
            <label className="text-sm font-medium mb-1 block">{field.label}</label>
            <input
              type="number"
              value={field.value}
              onChange={(e) => field.setter(e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-sm focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        ))}

        <Button fullWidth size="lg" onClick={calculate}>
          احسب الزكاة
        </Button>

        {result !== null && (
          <Card gradient={result > 0 ? "primary" : "none"} className="text-center">
            {result > 0 ? (
              <>
                <p className="text-sm opacity-80">مبلغ الزكاة المستحق</p>
                <p className="text-3xl font-bold mt-2">${result.toFixed(2)}</p>
                <p className="text-sm mt-2 opacity-80">2.5٪ من إجمالي الأموال الزكوية</p>
              </>
            ) : (
              <>
                <p className="font-bold">لم يبلغ المال النصاب</p>
                <p className="text-sm text-[var(--muted)] mt-1">لا تجب عليك الزكاة حالياً</p>
              </>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
