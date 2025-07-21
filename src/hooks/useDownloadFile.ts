// hooks/useDownloadFile.ts
"use client"

import { useCallback } from "react"

export function useDownloadFile() {
  const downloadFile = useCallback(async (fileUrl: string | null, fileName: string) => {
    if (!fileUrl) return

    try {
      const res = await fetch(fileUrl)
      if (!res.ok) throw new Error("Không thể tải file")

      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = blobUrl
      a.download = fileName
      a.style.display = "none"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Tải file thất bại:", error)
    }
  }, [])

  return downloadFile
}