"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import type { AdditionalFee } from "../types/proposal"

interface AdditionalFeesTableProps {
  additionalFees: AdditionalFee[]
  onChange: (additionalFees: AdditionalFee[]) => void
}

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
]

export function AdditionalFeesTable({ additionalFees, onChange }: AdditionalFeesTableProps) {
  const [newFeeType, setNewFeeType] = useState("")

  const updateAdditionalFee = (index: number, field: keyof AdditionalFee, value: any) => {
    const updatedFees = [...additionalFees]
    updatedFees[index] = { ...updatedFees[index], [field]: value }
    onChange(updatedFees)
  }

  const removeCustomFee = (index: number) => {
    const updatedFees = additionalFees.filter((_, i) => i !== index)
    onChange(updatedFees)
  }

  const addCustomFee = () => {
    if (newFeeType.trim()) {
      const newFee: AdditionalFee = {
        feeType: newFeeType.trim(),
        enabled: true,
        percentageFee: 0,
        fixedFee: 0,
        currency: "USD",
        isCustom: true,
      }
      onChange([...additionalFees, newFee])
      setNewFeeType("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addCustomFee()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Fees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Fee Type</th>
                <th className="text-left p-2 font-medium">Rate (%)</th>
                <th className="text-left p-2 font-medium">Fixed Fee</th>
                <th className="text-left p-2 font-medium">Currency</th>
              </tr>
            </thead>
            <tbody>
              {additionalFees.map((fee, index) => (
                <tr key={`${fee.feeType}-${index}`} className="border-b">
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={fee.enabled}
                        onCheckedChange={(checked) => updateAdditionalFee(index, "enabled", checked)}
                      />
                      <span className={fee.enabled ? "text-gray-900" : "text-gray-400"}>{fee.feeType}</span>
                      {fee.isCustom && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomFee(index)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={fee.percentageFee}
                      onChange={(e) =>
                        updateAdditionalFee(index, "percentageFee", Number.parseFloat(e.target.value) || 0)
                      }
                      disabled={!fee.enabled}
                      className="w-28"
                    />
                  </td>
                  <td className="p-2">
                    {fee.feeType === "Reserve" ? (
                      <div className="flex items-center space-x-1">
                        <Input
                          type="number"
                          min="0"
                          value={fee.days || 0}
                          onChange={(e) => updateAdditionalFee(index, "days", Number.parseInt(e.target.value) || 0)}
                          disabled={!fee.enabled}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">days</span>
                      </div>
                    ) : (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={fee.fixedFee}
                        onChange={(e) => updateAdditionalFee(index, "fixedFee", Number.parseFloat(e.target.value) || 0)}
                        disabled={!fee.enabled}
                        className="w-28"
                      />
                    )}
                  </td>
                  <td className="p-2">
                    <Select
                      value={fee.currency}
                      onValueChange={(value) => updateAdditionalFee(index, "currency", value)}
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

        <div className="mt-4 flex items-center space-x-2">
          <Input
            placeholder="Enter custom fee name"
            value={newFeeType}
            onChange={(e) => setNewFeeType(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={addCustomFee} disabled={!newFeeType.trim()} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
