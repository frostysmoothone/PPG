"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AdditionalFee } from "../types/proposal"
import { Plus, Trash2 } from "lucide-react"

interface AdditionalFeesTableProps {
  additionalFees: AdditionalFee[]
  onChange: (additionalFees: AdditionalFee[]) => void
}

const currencies = [
  { value: "USD", label: "USD: United States Dollar" },
  { value: "EUR", label: "EUR: Euro" },
  { value: "GBP", label: "GBP: British Pound" },
  { value: "CAD", label: "CAD: Canadian Dollar" },
]

export function AdditionalFeesTable({ additionalFees, onChange }: AdditionalFeesTableProps) {
  const [newCustomFee, setNewCustomFee] = useState("")

  const handleFeeChange = (index: number, field: keyof AdditionalFee, value: any) => {
    const updatedFees = [...additionalFees]
    updatedFees[index] = { ...updatedFees[index], [field]: value }
    onChange(updatedFees)
  }

  const addCustomFee = () => {
    if (newCustomFee.trim()) {
      const customFee: AdditionalFee = {
        feeType: newCustomFee.trim(),
        enabled: true,
        percentageFee: 0,
        fixedFee: 0,
        currency: "USD",
        isCustom: true,
      }
      onChange([...additionalFees, customFee])
      setNewCustomFee("")
    }
  }

  const removeCustomFee = (index: number) => {
    const updatedFees = additionalFees.filter((_, i) => i !== index)
    onChange(updatedFees)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Fees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold">Fee Type</th>
                <th className="text-left p-2 font-semibold">Fee Structure</th>
                <th className="text-left p-2 font-semibold">Currency</th>
                <th className="text-left p-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {additionalFees.map((fee, index) => (
                <tr key={`${fee.feeType}-${index}`} className="border-b">
                  <td className="p-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={fee.enabled}
                        onCheckedChange={(checked) => handleFeeChange(index, "enabled", checked)}
                      />
                      <span className="text-sm font-medium">{fee.feeType}</span>
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
                            handleFeeChange(index, "percentageFee", Number.parseFloat(e.target.value) || 0)
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
                          placeholder={fee.feeType === "Reserve" ? "Days" : "0.00"}
                          value={fee.feeType === "Reserve" ? fee.days || "" : fee.fixedFee || ""}
                          onChange={(e) => {
                            const value = Number.parseFloat(e.target.value) || 0
                            if (fee.feeType === "Reserve") {
                              handleFeeChange(index, "days", value)
                            } else {
                              handleFeeChange(index, "fixedFee", value)
                            }
                          }}
                          disabled={!fee.enabled}
                          className="w-20 pr-12"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                          {fee.feeType === "Reserve" ? "Days" : fee.currency}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-2">
                    {fee.feeType !== "Reserve" && (
                      <Select
                        value={fee.currency}
                        onValueChange={(value) => handleFeeChange(index, "currency", value)}
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
                    )}
                  </td>
                  <td className="p-2">
                    {fee.isCustom && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeCustomFee(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Custom Fee */}
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <Label htmlFor="customFee" className="text-sm font-medium">
            Add Custom Fee
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="customFee"
              placeholder="Enter custom fee name (e.g., Monthly Fee, PCI Compliance Fee)"
              value={newCustomFee}
              onChange={(e) => setNewCustomFee(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCustomFee()}
            />
            <Button onClick={addCustomFee} disabled={!newCustomFee.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
