"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, RefreshCw, Building, CreditCard, DollarSign, Shield, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User } from "../types/user"
import {
  updateSetting,
  getCompanyDefaults,
  getDefaultCardFees,
  getDefaultAdditionalFees,
  getDefaultSettlementTerms,
  getPasswordPolicy,
  getSessionTimeout,
} from "../utils/supabase-settings"

interface SettingsManagementProps {
  currentUser: User
}

export function SettingsManagement({ currentUser }: SettingsManagementProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [companyDefaults, setCompanyDefaults] = useState<any>({})
  const [cardFees, setCardFees] = useState<any[]>([])
  const [additionalFees, setAdditionalFees] = useState<any[]>([])
  const [settlementTerms, setSettlementTerms] = useState<any>({})
  const [passwordPolicy, setPasswordPolicy] = useState<any>({})
  const [sessionTimeout, setSessionTimeout] = useState<number>(480)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const [company, cards, additional, settlement, password, timeout] = await Promise.all([
        getCompanyDefaults(),
        getDefaultCardFees(),
        getDefaultAdditionalFees(),
        getDefaultSettlementTerms(),
        getPasswordPolicy(),
        getSessionTimeout(),
      ])

      setCompanyDefaults(company)
      setCardFees(cards)
      setAdditionalFees(additional)
      setSettlementTerms(settlement)
      setPasswordPolicy(password)
      setSessionTimeout(timeout)
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveCompanyDefaults = async () => {
    try {
      await updateSetting("company_defaults", companyDefaults, "Default company information for new proposals")
      toast({
        title: "Success",
        description: "Company defaults saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save company defaults",
        variant: "destructive",
      })
    }
  }

  const saveCardFees = async () => {
    try {
      await updateSetting("default_card_fees", cardFees, "Default card processing fees")
      toast({
        title: "Success",
        description: "Card fees saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save card fees",
        variant: "destructive",
      })
    }
  }

  const saveAdditionalFees = async () => {
    try {
      await updateSetting("default_additional_fees", additionalFees, "Default additional fees")
      toast({
        title: "Success",
        description: "Additional fees saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save additional fees",
        variant: "destructive",
      })
    }
  }

  const saveSettlementTerms = async () => {
    try {
      await updateSetting("default_settlement_terms", settlementTerms, "Default settlement terms")
      toast({
        title: "Success",
        description: "Settlement terms saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settlement terms",
        variant: "destructive",
      })
    }
  }

  const savePasswordPolicy = async () => {
    try {
      await updateSetting("password_policy", passwordPolicy, "Password policy requirements")
      toast({
        title: "Success",
        description: "Password policy saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save password policy",
        variant: "destructive",
      })
    }
  }

  const saveSessionTimeout = async () => {
    try {
      await updateSetting("session_timeout_minutes", sessionTimeout.toString(), "Session timeout in minutes")
      toast({
        title: "Success",
        description: "Session timeout saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save session timeout",
        variant: "destructive",
      })
    }
  }

  if (currentUser.role !== "admin") {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You don't have permission to access settings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Settings Management</h2>
          <p className="text-muted-foreground">Configure global application settings and defaults</p>
        </div>
        <Button onClick={loadSettings} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="settlement" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Settlement
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Defaults</CardTitle>
              <CardDescription>Default company information used in new proposals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyDefaults.companyName || ""}
                    onChange={(e) => setCompanyDefaults({ ...companyDefaults, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={companyDefaults.companyEmail || ""}
                    onChange={(e) => setCompanyDefaults({ ...companyDefaults, companyEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  value={companyDefaults.companyAddress || ""}
                  onChange={(e) => setCompanyDefaults({ ...companyDefaults, companyAddress: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={companyDefaults.companyPhone || ""}
                    onChange={(e) => setCompanyDefaults({ ...companyDefaults, companyPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Company Logo Path</Label>
                  <Input
                    id="companyLogo"
                    value={companyDefaults.companyLogo || ""}
                    onChange={(e) => setCompanyDefaults({ ...companyDefaults, companyLogo: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={saveCompanyDefaults}>
                <Save className="h-4 w-4 mr-2" />
                Save Company Defaults
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card Fees</CardTitle>
              <CardDescription>Default processing fees for different card types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cardFees.map((fee, index) => (
                <div key={fee.cardType} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Switch
                      checked={fee.enabled}
                      onCheckedChange={(checked) => {
                        const updated = [...cardFees]
                        updated[index].enabled = checked
                        setCardFees(updated)
                      }}
                    />
                    <div>
                      <p className="font-medium">{fee.cardType}</p>
                      <p className="text-sm text-muted-foreground">
                        {fee.percentageFee}% + ${fee.fixedFee}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      step="0.01"
                      value={fee.percentageFee}
                      onChange={(e) => {
                        const updated = [...cardFees]
                        updated[index].percentageFee = Number.parseFloat(e.target.value) || 0
                        setCardFees(updated)
                      }}
                      className="w-20"
                    />
                    <span>%</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={fee.fixedFee}
                      onChange={(e) => {
                        const updated = [...cardFees]
                        updated[index].fixedFee = Number.parseFloat(e.target.value) || 0
                        setCardFees(updated)
                      }}
                      className="w-20"
                    />
                    <span>$</span>
                  </div>
                </div>
              ))}
              <Button onClick={saveCardFees}>
                <Save className="h-4 w-4 mr-2" />
                Save Card Fees
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Settlement Terms</CardTitle>
              <CardDescription>Default settlement configuration for new proposals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="settlementPeriod">Settlement Period</Label>
                  <Input
                    id="settlementPeriod"
                    value={settlementTerms.settlementPeriod || ""}
                    onChange={(e) => setSettlementTerms({ ...settlementTerms, settlementPeriod: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settlementCurrency">Settlement Currency</Label>
                  <Input
                    id="settlementCurrency"
                    value={settlementTerms.settlementCurrency || ""}
                    onChange={(e) => setSettlementTerms({ ...settlementTerms, settlementCurrency: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="settlementFee">Settlement Fee</Label>
                  <Input
                    id="settlementFee"
                    type="number"
                    step="0.01"
                    value={settlementTerms.settlementFee || 0}
                    onChange={(e) =>
                      setSettlementTerms({
                        ...settlementTerms,
                        settlementFee: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumSettlement">Minimum Settlement</Label>
                  <Input
                    id="minimumSettlement"
                    type="number"
                    step="0.01"
                    value={settlementTerms.minimumSettlement || 0}
                    onChange={(e) =>
                      setSettlementTerms({
                        ...settlementTerms,
                        minimumSettlement: Number.parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={saveSettlementTerms}>
                <Save className="h-4 w-4 mr-2" />
                Save Settlement Terms
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>Configure password requirements for user accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minLength">Minimum Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  value={passwordPolicy.minLength || 8}
                  onChange={(e) =>
                    setPasswordPolicy({
                      ...passwordPolicy,
                      minLength: Number.parseInt(e.target.value) || 8,
                    })
                  }
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                  <Switch
                    id="requireUppercase"
                    checked={passwordPolicy.requireUppercase || false}
                    onCheckedChange={(checked) => setPasswordPolicy({ ...passwordPolicy, requireUppercase: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireLowercase">Require Lowercase Letters</Label>
                  <Switch
                    id="requireLowercase"
                    checked={passwordPolicy.requireLowercase || false}
                    onCheckedChange={(checked) => setPasswordPolicy({ ...passwordPolicy, requireLowercase: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireNumbers">Require Numbers</Label>
                  <Switch
                    id="requireNumbers"
                    checked={passwordPolicy.requireNumbers || false}
                    onCheckedChange={(checked) => setPasswordPolicy({ ...passwordPolicy, requireNumbers: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                  <Switch
                    id="requireSpecialChars"
                    checked={passwordPolicy.requireSpecialChars || false}
                    onCheckedChange={(checked) =>
                      setPasswordPolicy({ ...passwordPolicy, requireSpecialChars: checked })
                    }
                  />
                </div>
              </div>
              <Button onClick={savePasswordPolicy}>
                <Save className="h-4 w-4 mr-2" />
                Save Password Policy
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings and timeouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number.parseInt(e.target.value) || 480)}
                />
                <p className="text-sm text-muted-foreground">
                  Current: {Math.floor(sessionTimeout / 60)} hours {sessionTimeout % 60} minutes
                </p>
              </div>
              <Button onClick={saveSessionTimeout}>
                <Save className="h-4 w-4 mr-2" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
