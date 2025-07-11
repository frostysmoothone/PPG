"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CardFee } from "../types/proposal"

interface FeeTableProps {
  cardFees: CardFee[]
  onChange: (cardFees: CardFee[]) => void
}

const currencies = [
  { value: "USD", label: "USD: United States Dollar" },
  { value: "EUR", label: "EUR: Euro" },
  { value: "GBP", label: "GBP: British Pound" },
  { value: "CAD", label: "CAD: Canadian Dollar" },
]

export function FeeTable({ cardFees, onChange }: FeeTableProps) {
  const handleCardFeeChange = (index: number, field: keyof CardFee, value: any) => {
    const updatedFees = [...cardFees]
    updatedFees[index] = { ...updatedFees[index], [field]: value }
    onChange(updatedFees)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule A - Card Processing Fees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold">Card Type</th>
                <th className="text-left p-2 font-semibold">Processing Fee</th>
                <th className="text-left p-2 font-semibold">Currency</th>
              </tr>
            </thead>
            <tbody>
              {cardFees.map((fee, index) => (
                <tr key={fee.cardType} className="border-b">
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={fee.enabled}
                        onCheckedChange={(checked) => handleCardFeeChange(index, "enabled", checked)}
                      />
                      <span className="text-sm font-medium">{fee.cardType}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={fee.percentageFee || ""}
                          onChange={(e) =>
                            handleCardFeeChange(index, "percentageFee", Number.parseFloat(e.target.value) || 0)
                          }
                          disabled={!fee.enabled}
                          className="w-20 pr-6"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                          %
                        </span>
                      </div>
                      <span className="text-sm">+</span>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={fee.fixedFee || ""}
                          onChange={(e) =>
                            handleCardFeeChange(index, "fixedFee", Number.parseFloat(e.target.value) || 0)
                          }
                          disabled={!fee.enabled}
                          className="w-20 pr-10"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                          {fee.currency}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    <Select
                      value={fee.currency}
                      onValueChange={(value) => handleCardFeeChange(index, "currency", value)}
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
