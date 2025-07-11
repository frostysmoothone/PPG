"use client"

import type React from "react"

import { useState } from "react"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Trash2, Calendar, User } from "lucide-react"
import type { SavedProposal } from "../types/proposal"

interface SavedProposalsDialogProps {
  proposals: SavedProposal[]
  onLoad: (proposal: SavedProposal) => void
  onDelete: (proposalId: string) => void
  trigger: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SavedProposalsDialog({
  proposals,
  onLoad,
  onDelete,
  trigger,
  open,
  onOpenChange,
}: SavedProposalsDialogProps) {
  const [selectedProposal, setSelectedProposal] = useState<SavedProposal | null>(null)

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Saved Proposals ({proposals.length})
          </DialogTitle>
          <DialogDescription>Load or manage your saved proposals</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {proposals.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No saved proposals yet</p>
              <p className="text-sm text-muted-foreground">Create and save your first proposal to see it here</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{proposal.name}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {proposal.data.clientName || "No client specified"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(proposal.updatedAt)}
                          </span>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            onLoad(proposal)
                            onOpenChange(false)
                          }}
                        >
                          Load
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" onClick={() => setSelectedProposal(proposal)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{proposal.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(proposal.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2">
                      {proposal.data.businessType && <Badge variant="secondary">{proposal.data.businessType}</Badge>}
                      {proposal.data.monthlyVolume > 0 && (
                        <Badge variant="outline">${proposal.data.monthlyVolume.toLocaleString()}/month</Badge>
                      )}
                      {proposal.data.cardFees?.filter((fee: any) => fee.enabled).length > 0 && (
                        <Badge variant="outline">
                          {proposal.data.cardFees.filter((fee: any) => fee.enabled).length} card types
                        </Badge>
                      )}
                    </div>
                    {proposal.data.notes && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{proposal.data.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
