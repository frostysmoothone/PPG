import type { SavedProposal, ProposalData } from "../types/proposal"

const STORAGE_KEY = "saved-proposals"

export function getSavedProposals(): SavedProposal[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error loading saved proposals:", error)
    return []
  }
}

export function saveProposal(name: string, data: ProposalData, id?: string): SavedProposal {
  const proposals = getSavedProposals()
  const now = new Date().toISOString()

  if (id) {
    // Update existing proposal
    const index = proposals.findIndex((p) => p.id === id)
    if (index !== -1) {
      proposals[index] = {
        ...proposals[index],
        name,
        data,
        updatedAt: now,
      }
    }
  } else {
    // Create new proposal
    const newProposal: SavedProposal = {
      id: crypto.randomUUID(),
      name,
      data,
      createdAt: now,
      updatedAt: now,
    }
    proposals.push(newProposal)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals))
  return proposals.find((p) => p.id === id) || proposals[proposals.length - 1]
}

export function deleteProposal(id: string): void {
  const proposals = getSavedProposals()
  const filtered = proposals.filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function getProposalById(id: string): SavedProposal | null {
  const proposals = getSavedProposals()
  return proposals.find((p) => p.id === id) || null
}
