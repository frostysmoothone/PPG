"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { FeeTable } from "./fee-table"
import { AdditionalFeesTable } from "./additional-fees-table"
import { SettlementSection } from "./settlement-section"
import { PDFPreview } from "./pdf-preview"
import { SaveProposalDialog } from "./save-proposal-dialog"
import { SavedProposalsDialog } from "./saved-proposals-dialog"
import { generatePDF } from "../utils/pdf-generator"
import { getSavedProposals, saveProposal, deleteProposal } from "../utils/proposal-storage"
import { getDefaultProposalData } from "../utils/system-settings"
import type { ProposalData, CardFee, AdditionalFee, SavedProposal } from "../types/proposal"
import { FileText, Eye, EyeOff, RotateCcw } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

export default function PDFGenerator() {
  const [showPreview, setShowPreview] = useState(false)
  const [logoDataUrl, setLogoDataUrl] = useState<string>("")
  const [proposalData, setProposalData] = useState<ProposalData | null>(null)
  const [currentProposalId, setCurrentProposalId] = useState<string | null>(null)
  const [currentProposalName, setCurrentProposalName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Initialize component with proper defaults
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Get default proposal data
        const defaultData = getDefaultProposalData()
        setProposalData(defaultData)
        
        // Convert default logo to data URL
        try {
          const response = await fetch("/linx-logo.png")
          const blob = await response.blob()
          const reader = new FileReader()
          reader.onload = () => {
            const dataUrl = reader.result as string
            setLogoDataUrl(dataUrl)
            setProposalData((prev) => prev ? { ...prev, companyLogo: dataUrl } : null)
          }
          reader.readAsDataURL(blob)
        } catch (error) {
          console.error("Failed to load default logo:", error)
        }
      } catch (error) {
        console.error("Failed to initialize component:", error)
        // Use fallback data if system defaults fail
        setProposalData(getDefaultProposalData())
      } finally {
        setIsLoading(false)
      }
    }

    initializeComponent()
  }, [])

  const handleCompanyInfoChange = (field: keyof ProposalData, value: string) => {
    if (!proposalData) return
    setProposalData((prev) => prev ? { ...prev, [field]: value } : null)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && proposalData) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setLogoDataUrl(dataUrl)
        setProposalData((prev) => prev ? { ...prev, companyLogo: dataUrl } : null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProposal = async (name: string) => {
    if (!proposalData) return
    
    try {
      const saved = await saveProposal(name, proposalData, currentProposalId || undefined)
      setCurrentProposalId(saved.id)
      setCurrentProposalName(saved.name)
      toast({
        title: "Proposal Saved",
        description: `"${name}" has been saved successfully.`,
      })
    } catch (error) {
      console.error("Save proposal error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save proposal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLoadProposal = (proposal: SavedProposal) => {
    // Ensure all fields have proper values when loading
    const loadedData: ProposalData = {
      ...getDefaultProposalData(),
      ...proposal.data,
      // Ensure no undefined values
      companyName: proposal.data.companyName || "",
      companyAddress: proposal.data.companyAddress || "",
      companyPhone: proposal.data.companyPhone || "",
      companyEmail: proposal.data.companyEmail || "",
      clientName: proposal.data.clientName || "",
      clientCompany: proposal.data.clientCompany || "",
      clientAddress: proposal.data.clientAddress || "",
      clientEmail: proposal.data.clientEmail || "",
      cardFees: proposal.data.cardFees || [],
      additionalFees: proposal.data.additionalFees || [],
      settlementTerms: proposal.data.settlementTerms || {
        settlementPeriod: "T+2 Business Days",
        settlementFee: 0,
        settlementCurrency: "USD",
        minimumSettlement: 0,
      },
    }
    
    setProposalData(loadedData)
    setCurrentProposalId(proposal.id)
    setCurrentProposalName(proposal.name)
    if (proposal.data.companyLogo) {
      setLogoDataUrl(proposal.data.companyLogo)
    }
    toast({
      title: "Proposal Loaded",
      description: `"${proposal.name}" has been loaded.`,
    })
  }

  const handleNewProposal = async () => {
    try {
      const defaultData = getDefaultProposalData()
      setProposalData(defaultData)
      setCurrentProposalId(null)
      setCurrentProposalName("")
      
      // Reset logo to default
      if (logoDataUrl && logoDataUrl.startsWith("data:")) {
        setProposalData((prev) => prev ? { ...prev, companyLogo: logoDataUrl } : null)
      }
      
      toast({
        title: "New Proposal",
        description: "Started a new proposal.",
      })
    } catch (error) {
      console.error("New proposal error:", error)
      setProposalData(getDefaultProposalData())
    }
  }

  const handleGeneratePDF = () => {
    if (!proposalData) return
    generatePDF(proposalData)
  }

  // Show loading state while initializing
  if (isLoading || !proposalData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
         
            {currentProposalName && (
              <p className="text-sm text-blue-600 mt-1">Currently editing: {currentProposalName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleNewProposal} className="flex items-center gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              New
            </Button>
            <SavedProposalsDialog onLoadProposal={handleLoadProposal} />
            <SaveProposalDialog
              proposalData={proposalData}
              onSave={handleSaveProposal}
              currentName={currentProposalName}
              isEditing={!!currentProposalId}
            />
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2">
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button onClick={handleGeneratePDF} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Generate PDF
            </Button>
          </div>
        </div>

        <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
          {/* Form Section */}
          <div className={showPreview ? "" : "max-w-4xl mx-auto w-full"}>
            <Tabs defaultValue="company" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="client">Client</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="settlement">Settlement</TabsTrigger>
              </TabsList>

              <TabsContent value="company" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="logo">Company Logo</Label>
                      <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="mt-1" />
                      {logoDataUrl && (
                        <div className="mt-2">
                          <img
                            src={logoDataUrl || "/placeholder.svg"}
                            alt="Company Logo"
                            className="h-12 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={proposalData.companyName || ""}
                          onChange={(e) => handleCompanyInfoChange("companyName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyPhone">Phone</Label>
                        <Input
                          id="companyPhone"
                          value={proposalData.companyPhone || ""}
                          onChange={(e) => handleCompanyInfoChange("companyPhone", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="companyAddress">Address</Label>
                      <Textarea
                        id="companyAddress"
                        value={proposalData.companyAddress || ""}
                        onChange={(e) => handleCompanyInfoChange("companyAddress", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyEmail">Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={proposalData.companyEmail || ""}
                        onChange={(e) => handleCompanyInfoChange("companyEmail", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="client" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input
                          id="clientName"
                          value={proposalData.clientName || ""}
                          onChange={(e) => handleCompanyInfoChange("clientName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientCompany">Company</Label>
                        <Input
                          id="clientCompany"
                          value={proposalData.clientCompany || ""}
                          onChange={(e) => handleCompanyInfoChange("clientCompany", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clientAddress">Address</Label>
                      <Textarea
                        id="clientAddress"
                        value={proposalData.clientAddress || ""}
                        onChange={(e) => handleCompanyInfoChange("clientAddress", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientEmail">Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={proposalData.clientEmail || ""}
                        onChange={(e) => handleCompanyInfoChange("clientEmail", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="proposalDate">Proposal Date</Label>
                        <Input
                          id="proposalDate"
                          type="date"
                          value={proposalData.proposalDate || ""}
                          onChange={(e) => handleCompanyInfoChange("proposalDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="validUntil">Valid Until</Label>
                        <Input
                          id="validUntil"
                          type="date"
                          value={proposalData.validUntil || ""}
                          onChange={(e) => handleCompanyInfoChange("validUntil", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fees" className="space-y-4">
                <FeeTable
                  cardFees={proposalData.cardFees || []}
                  onChange={(cardFees) => setProposalData((prev) => prev ? { ...prev, cardFees } : null)}
                />
                <AdditionalFeesTable
                  additionalFees={proposalData.additionalFees || []}
                  onChange={(additionalFees) => setProposalData((prev) => prev ? { ...prev, additionalFees } : null)}
                />
              </TabsContent>

              <TabsContent value="settlement" className="space-y-4">
                <SettlementSection
                  settlementTerms={proposalData.settlementTerms || {
                    settlementPeriod: "T+2 Business Days",
                    settlementFee: 0,
                    settlementCurrency: "USD",
                    minimumSettlement: 0,
                  }}
                  onChange={(settlementTerms) => setProposalData((prev) => prev ? { ...prev, settlementTerms } : null)}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="lg:sticky lg:top-4 lg:h-fit">
              <PDFPreview proposalData={proposalData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
