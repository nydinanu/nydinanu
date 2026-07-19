"use client"

import { useState, useRef } from "react"
import { Upload, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface BulkScanInputProps {
  onItemsChange: (items: string[]) => void
  items: string[]
}

export function BulkScanInput({ onItemsChange, items }: BulkScanInputProps) {
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addManualItem = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setError("Please enter an IP address or domain")
      return
    }

    if (items.includes(trimmed)) {
      setError("This item is already in the list")
      return
    }

    if (items.length >= 100) {
      setError("Maximum 100 items allowed")
      return
    }

    onItemsChange([...items, trimmed])
    setInputValue("")
    setError("")
  }

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")

    try {
      const text = await file.text()
      const lines = text.split("\n")
      
      let newItems: string[] = []
      
      if (file.name.endsWith(".csv")) {
        // Parse CSV - handle both simple list and columnar formats
        for (const line of lines) {
          // Remove quotes and split by comma
          const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""))
          // Add non-empty values
          for (const value of values) {
            if (value && !items.includes(value)) {
              newItems.push(value)
            }
          }
        }
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        setError("Excel files require additional parsing. Please convert to CSV first.")
        return
      } else {
        // Assume plain text with items separated by newlines
        newItems = lines
          .map(line => line.trim())
          .filter(line => line.length > 0)
          .filter(item => !items.includes(item))
      }

      if (newItems.length === 0) {
        setError("No new items found in file")
        return
      }

      const totalItems = items.length + newItems.length
      if (totalItems > 100) {
        const canAdd = 100 - items.length
        newItems = newItems.slice(0, canAdd)
        setError(`File truncated to fit 100-item limit. Added ${newItems.length} items.`)
      } else {
        setError("")
      }

      onItemsChange([...items, ...newItems])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError("Failed to read file. Please ensure it's a valid CSV or text file.")
      console.error("File read error:", err)
    }
  }

  return (
    <div className="space-y-4">
      {/* Manual Input Section */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Add Items Manually</label>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setError("")
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                addManualItem()
              }
            }}
            placeholder="Enter IP address, domain, or hash"
            className="flex-1"
          />
          <Button
            onClick={addManualItem}
            className="bg-primary hover:bg-primary/90 text-foreground"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground">Upload File</label>
        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center gap-2 cursor-pointer"
          >
            <Upload className="w-6 h-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Click to upload CSV, TXT, or Excel file
            </span>
            <span className="text-xs text-muted-foreground">
              One item per line (CSV) or cell
            </span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Items List */}
      {items.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Items to Scan ({items.length}/100)
          </label>
          <div className="bg-card border border-border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-background p-2 rounded text-sm">
                <span className="text-foreground truncate">{item}</span>
                <button
                  onClick={() => removeItem(index)}
                  className="text-destructive hover:text-destructive/80 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
