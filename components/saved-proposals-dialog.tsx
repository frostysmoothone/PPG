"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FolderOpen, Edit, Trash2, Calendar } from "lucide-react"
import { getSavedProposals, deleteProposal } from "../utils/proposal-storage"
import type { SavedProposal } from "../types/proposal"

interface SavedProposalsDialogProps {
  onLoadProposal: (proposal: SavedProposal) => void
}

export function SavedProposalsDialog({ onLoadProposal }: SavedProposalsDialogProps) {
  const [open, setOpen] = useState(false)
  const [proposals, setProposals] = useState<SavedProposal[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setProposals(getSavedProposals())
    }
  }, [open])

  const handleDelete = (id: string) => {
    deleteProposal(id)
    setProposals(getSavedProposals())
    setDeleteId(null)
  }

  const handleLoad = (proposal: SavedProposal) => {
    onLoadProposal(proposal)
    setOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <FolderOpen className="h-4 w-4" />
            Load Proposal
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Saved Proposals</DialogTitle>
            <DialogDescription>Load a previously saved proposal to continue editing.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] w-full">
            {proposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <FolderOpen className="h-8 w-8 mb-2" />
                <p>No saved proposals found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{proposal.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Client: {proposal.data.clientName || proposal.data.clientCompany || "N/A"}</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Updated: {formatDate(proposal.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoad(proposal)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(proposal.id)}
                        className="flex items-center gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this proposal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
