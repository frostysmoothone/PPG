"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SettlementTerms } from "../types/proposal"

interface SettlementSectionProps {
  settlementTerms: SettlementTerms
  onChange: (settlementTerms: SettlementTerms) => void
}

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "Cryptocurrency", label: "Cryptocurrency" },
]

const settlementPeriods = [
  { value: "T+1 Business Day", label: "T+1 Business Day" },
  { value: "T+2 Business Days", label: "T+2 Business Days" },
  { value: "T+3 Business Days", label: "T+3 Business Days" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
]

export function SettlementSection({ settlementTerms, onChange }: SettlementSectionProps) {
  const updateSettlementTerms = (field: keyof SettlementTerms, value: any) => {
    onChange({ ...settlementTerms, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement Terms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="settlementPeriod">Settlement Period</Label>
            <Select
              value={settlementTerms.settlementPeriod}
              onValueChange={(value) => updateSettlementTerms("settlementPeriod", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {settlementPeriods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="settlementCurrency">Settlement Currency</Label>
            <Select
              value={settlementTerms.settlementCurrency}
              onValueChange={(value) => updateSettlementTerms("settlementCurrency", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="settlementFee">Settlement Fee</Label>
            <Input
              id="settlementFee"
              type="number"
              step="0.01"
              min="0"
              value={settlementTerms.settlementFee}
              onChange={(e) => updateSettlementTerms("settlementFee", Number.parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <Label htmlFor="minimumSettlement">Minimum Settlement</Label>
            <Input
              id="minimumSettlement"
              type="number"
              step="0.01"
              min="0"
              value={settlementTerms.minimumSettlement}
              onChange={(e) => updateSettlementTerms("minimumSettlement", Number.parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
