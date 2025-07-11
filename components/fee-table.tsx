"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CardFee } from "../types/proposal"

interface FeeTableProps {
  cardFees: CardFee[]
  onChange: (cardFees: CardFee[]) => void
}

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
]

export function FeeTable({ cardFees, onChange }: FeeTableProps) {
  const updateCardFee = (index: number, field: keyof CardFee, value: any) => {
    const updatedFees = [...cardFees]
    updatedFees[index] = { ...updatedFees[index], [field]: value }
    onChange(updatedFees)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Processing Fees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Card Type</th>
                <th className="text-left p-2 font-medium">Rate (%)</th>
                <th className="text-left p-2 font-medium">Fixed Fee</th>
                <th className="text-left p-2 font-medium">Currency</th>
              </tr>
            </thead>
            <tbody>
              {cardFees.map((fee, index) => (
                <tr key={fee.cardType} className="border-b">
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={fee.enabled}
                        onCheckedChange={(checked) => updateCardFee(index, "enabled", checked)}
                      />
                      <span className={fee.enabled ? "text-gray-900" : "text-gray-400"}>{fee.cardType}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={fee.percentageFee}
                      onChange={(e) => updateCardFee(index, "percentageFee", Number.parseFloat(e.target.value) || 0)}
                      disabled={!fee.enabled}
                      className="w-28"
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={fee.fixedFee}
                      onChange={(e) => updateCardFee(index, "fixedFee", Number.parseFloat(e.target.value) || 0)}
                      disabled={!fee.enabled}
                      className="w-28"
                    />
                  </td>
                  <td className="p-2">
                    <Select
                      value={fee.currency}
                      onValueChange={(value) => updateCardFee(index, "currency", value)}
                      disabled={!fee.enabled}
                    >
                      <SelectTrigger className="w-40">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
