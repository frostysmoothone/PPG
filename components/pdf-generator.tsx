"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Save, FolderOpen, Plus, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FeeTable } from "./fee-table"
import { AdditionalFeesTable } from "./additional-fees-table"
import { SettlementSection } from "./settlement-section"
import { PDFPreview } from "./pdf-preview"
import { SaveProposalDialog } from "./save-proposal-dialog"
import { SavedProposalsDialog } from "./saved-proposals-dialog"
import { generatePDF } from "../utils/pdf-generator"
import type { ProposalData, SavedProposal } from "../types/proposal"
import { getCurrentUser } from "../utils/supabase-auth"
import { saveProposal, getProposals, updateProposal, deleteProposal } from "../utils/supabase-proposals"
import {
  getCompanyDefaults,
  getDefaultCardFees,
  getDefaultAdditionalFees,
  getDefaultSettlementTerms,
} from "../utils/supabase-settings"

export default function PDFGenerator() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentProposal, setCurrentProposal] = useState<SavedProposal | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isSavedProposalsDialogOpen, setIsSavedProposalsDialogOpen] = useState(false)
  const [savedProposals, setSavedProposals] = useState<SavedProposal[]>([])
  const { toast } = useToast()

  const [proposalData, setProposalData] = useState<ProposalData>({
    // Company Information
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    companyLogo: "",

    // Client Information
    clientName: "",
    clientAddress: "",
    clientPhone: "",
    clientEmail: "",
    clientWebsite: "",

    // Business Information
    businessType: "",
    monthlyVolume: 0,
    averageTicket: 0,
    highestTicket: 0,

    // Fee Structure
    cardFees: [],
    additionalFees: [],

    // Settlement Information
    settlementPeriod: "",
    settlementFee: 0,
    settlementCurrency: "USD",
    minimumSettlement: 0,

    // Additional Information
    notes: "",
    validUntil: "",
  })

  useEffect(() => {
    const initializeData = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)

      if (user) {
        await loadSavedProposals()
        await loadDefaultSettings()
      }
    }
    initializeData()
  }, [])

  const loadDefaultSettings = async () => {
    try {
      const [companyDefaults, cardFees, additionalFees, settlementTerms] = await Promise.all([
        getCompanyDefaults(),
        getDefaultCardFees(),
        getDefaultAdditionalFees(),
        getDefaultSettlementTerms(),
      ])

      setProposalData((prev) => ({
        ...prev,
        companyName: companyDefaults.companyName || "",
        companyAddress: companyDefaults.companyAddress || "",
        companyPhone: companyDefaults.companyPhone || "",
        companyEmail: companyDefaults.companyEmail || "",
        companyLogo: companyDefaults.companyLogo || "",
        cardFees: cardFees || [],
        additionalFees: additionalFees || [],
        settlementPeriod: settlementTerms.settlementPeriod || "",
        settlementFee: settlementTerms.settlementFee || 0,
        settlementCurrency: settlementTerms.settlementCurrency || "USD",
        minimumSettlement: settlementTerms.minimumSettlement || 0,
      }))
    } catch (error) {
      console.error("Error loading default settings:", error)
    }
  }

  const loadSavedProposals = async () => {
    if (!currentUser) return

    try {
      const proposals = await getProposals(currentUser.id)
      setSavedProposals(proposals)
    } catch (error) {
      console.error("Error loading saved proposals:", error)
    }
  }

  const handleSaveProposal = async (name: string) => {
    if (!currentUser) return

    try {
      let savedProposal: SavedProposal | null = null

      if (currentProposal) {
        // Update existing proposal
        savedProposal = await updateProposal(currentProposal.id, name, proposalData)
        if (savedProposal) {
          setCurrentProposal(savedProposal)
          setSavedProposals((prev) => prev.map((p) => (p.id === savedProposal!.id ? savedProposal! : p)))
        }
      } else {
        // Create new proposal
        savedProposal = await saveProposal(currentUser.id, name, proposalData)
        if (savedProposal) {
          setCurrentProposal(savedProposal)
          setSavedProposals((prev) => [savedProposal!, ...prev])
        }
      }

      if (savedProposal) {
        toast({
          title: "Success",
          description: `Proposal ${currentProposal ? "updated" : "saved"} successfully`,
        })
        setIsSaveDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: `Failed to ${currentProposal ? "update" : "save"} proposal`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${currentProposal ? "update" : "save"} proposal`,
        variant: "destructive",
      })
    }
  }

  const handleLoadProposal = (proposal: SavedProposal) => {
    setProposalData(proposal.data)
    setCurrentProposal(proposal)
    setIsSavedProposalsDialogOpen(false)
    toast({
      title: "Success",
      description: `Loaded proposal: ${proposal.name}`,
    })
  }

  const handleDeleteProposal = async (proposalId: string) => {
    try {
      const success = await deleteProposal(proposalId)
      if (success) {
        setSavedProposals((prev) => prev.filter((p) => p.id !== proposalId))
        if (currentProposal?.id === proposalId) {
          setCurrentProposal(null)
        }
        toast({
          title: "Success",
          description: "Proposal deleted successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to delete proposal",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete proposal",
        variant: "destructive",
      })
    }
  }

  const handleNewProposal = async () => {
    setCurrentProposal(null)
    await loadDefaultSettings()
    toast({
      title: "New Proposal",
      description: "Started a new proposal with default settings",
    })
  }

  const handleGeneratePDF = async () => {
    try {
      await generatePDF(proposalData)
      toast({
        title: "Success",
        description: "PDF generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Proposal Generator</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-muted-foreground">
              {currentProposal ? `Editing: ${currentProposal.name}` : "New Proposal"}
            </p>
            {currentProposal && <Badge variant="secondary">Saved</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleNewProposal}>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
          <SavedProposalsDialog
            proposals={savedProposals}
            onLoad={handleLoadProposal}
            onDelete={handleDeleteProposal}
            trigger={
              <Button variant="outline">
                <FolderOpen className="h-4 w-4 mr-2" />
                Load ({savedProposals.length})
              </Button>
            }
            open={isSavedProposalsDialogOpen}
            onOpenChange={setIsSavedProposalsDialogOpen}
          />
          <SaveProposalDialog
            onSave={handleSaveProposal}
            currentName={currentProposal?.name || ""}
            isUpdate={!!currentProposal}
            trigger={
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            }
            open={isSaveDialogOpen}
            onOpenChange={setIsSaveDialogOpen}
          />
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>PDF Preview</DialogTitle>
                <DialogDescription>Preview of the generated proposal</DialogDescription>
              </DialogHeader>
              <PDFPreview data={proposalData} />
            </DialogContent>
          </Dialog>
          <Button onClick={handleGeneratePDF}>
            <Download className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Your company details for the proposal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={proposalData.companyName}
                onChange={(e) => setProposalData({ ...proposalData, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Textarea
                id="companyAddress"
                value={proposalData.companyAddress}
                onChange={(e) => setProposalData({ ...proposalData, companyAddress: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Phone</Label>
                <Input
                  id="companyPhone"
                  value={proposalData.companyPhone}
                  onChange={(e) => setProposalData({ ...proposalData, companyPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={proposalData.companyEmail}
                  onChange={(e) => setProposalData({ ...proposalData, companyEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyLogo">Logo Path</Label>
              <Input
                id="companyLogo"
                value={proposalData.companyLogo}
                onChange={(e) => setProposalData({ ...proposalData, companyLogo: e.target.value })}
                placeholder="/path/to/logo.png"
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Details about the client receiving this proposal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={proposalData.clientName}
                onChange={(e) => setProposalData({ ...proposalData, clientName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Address</Label>
              <Textarea
                id="clientAddress"
                value={proposalData.clientAddress}
                onChange={(e) => setProposalData({ ...proposalData, clientAddress: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  value={proposalData.clientPhone}
                  onChange={(e) => setProposalData({ ...proposalData, clientPhone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={proposalData.clientEmail}
                  onChange={(e) => setProposalData({ ...proposalData, clientEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientWebsite">Website</Label>
              <Input
                id="clientWebsite"
                value={proposalData.clientWebsite}
                onChange={(e) => setProposalData({ ...proposalData, clientWebsite: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Business details and transaction volumes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                value={proposalData.businessType}
                onChange={(e) => setProposalData({ ...proposalData, businessType: e.target.value })}
                placeholder="e.g., E-commerce, Retail, Restaurant"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyVolume">Monthly Volume ($)</Label>
                <Input
                  id="monthlyVolume"
                  type="number"
                  value={proposalData.monthlyVolume}
                  onChange={(e) =>
                    setProposalData({ ...proposalData, monthlyVolume: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="averageTicket">Average Ticket ($)</Label>
                <Input
                  id="averageTicket"
                  type="number"
                  value={proposalData.averageTicket}
                  onChange={(e) =>
                    setProposalData({ ...proposalData, averageTicket: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="highestTicket">Highest Ticket ($)</Label>
                <Input
                  id="highestTicket"
                  type="number"
                  value={proposalData.highestTicket}
                  onChange={(e) =>
                    setProposalData({ ...proposalData, highestTicket: Number.parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Notes and proposal validity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={proposalData.notes}
                onChange={(e) => setProposalData({ ...proposalData, notes: e.target.value })}
                placeholder="Additional terms, conditions, or notes..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={proposalData.validUntil}
                onChange={(e) => setProposalData({ ...proposalData, validUntil: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Fee Tables */}
      <div className="space-y-6">
        <FeeTable
          fees={proposalData.cardFees}
          onFeesChange={(fees) => setProposalData({ ...proposalData, cardFees: fees })}
        />

        <AdditionalFeesTable
          fees={proposalData.additionalFees}
          onFeesChange={(fees) => setProposalData({ ...proposalData, additionalFees: fees })}
        />

        <SettlementSection
          settlementPeriod={proposalData.settlementPeriod}
          settlementFee={proposalData.settlementFee}
          settlementCurrency={proposalData.settlementCurrency}
          minimumSettlement={proposalData.minimumSettlement}
          onSettlementChange={(field, value) => setProposalData({ ...proposalData, [field]: value })}
        />
      </div>
    </div>
  )
}
