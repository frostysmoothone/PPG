"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import type { ProposalData } from "../types/proposal"

interface SaveProposalDialogProps {
  proposalData: ProposalData
  onSave: (name: string) => void
  currentName?: string
  isEditing?: boolean
}

export function SaveProposalDialog({
  proposalData,
  onSave,
  currentName = "",
  isEditing = false,
}: SaveProposalDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(currentName)

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim())
      setOpen(false)
    }
  }

  const generateDefaultName = () => {
    const clientName = proposalData.clientName || proposalData.clientCompany || "Client"
    const date = new Date().toLocaleDateString()
    return `${clientName} - ${date}`
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Save className="h-4 w-4" />
          {isEditing ? "Update" : "Save"} Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Update" : "Save"} Proposal</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the name for this proposal."
              : "Give your proposal a name to save it for later editing."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={generateDefaultName()}
              className="col-span-3"
              onKeyPress={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!name.trim()}>
            {isEditing ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
