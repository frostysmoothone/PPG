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
  { value: "USD", label: "USD: United States Dollar" },
  { value: "EUR", label: "EUR: Euro" },
  { value: "GBP", label: "GBP: British Pound" },
  { value: "CAD", label: "CAD: Canadian Dollar" },
]

const settlementPeriods = ["T+1 Business Day", "T+2 Business Days", "T+3 Business Days", "Weekly", "Monthly"]

export function SettlementSection({ settlementTerms, onChange }: SettlementSectionProps) {
  const handleChange = (field: keyof SettlementTerms, value: any) => {
    onChange({ ...settlementTerms, [field]: value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement Terms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="settlementPeriod">Settlement Period</Label>
          <Select
            value={settlementTerms.settlementPeriod}
            onValueChange={(value) => handleChange("settlementPeriod", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {settlementPeriods.map((period) => (
                <SelectItem key={period} value={period}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="settlementFee">Settlement Fee</Label>
            <div className="relative">
              <Input
                id="settlementFee"
                type="number"
                step="0.01"
                value={settlementTerms.settlementFee}
                onChange={(e) => handleChange("settlementFee", Number.parseFloat(e.target.value) || 0)}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {settlementTerms.settlementCurrency}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="minimumSettlement">Minimum Settlement</Label>
            <div className="relative">
              <Input
                id="minimumSettlement"
                type="number"
                step="0.01"
                value={settlementTerms.minimumSettlement}
                onChange={(e) => handleChange("minimumSettlement", Number.parseFloat(e.target.value) || 0)}
                className="pr-12"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                {settlementTerms.settlementCurrency}
              </span>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="settlementCurrency">Settlement Currency</Label>
          <Select
            value={settlementTerms.settlementCurrency}
            onValueChange={(value) => handleChange("settlementCurrency", value)}
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
      </CardContent>
    </Card>
  )
}
