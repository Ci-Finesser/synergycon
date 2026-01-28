"use client"

import { useEffect, useState, type ReactNode } from "react"
import { use } from "react"

interface MaintenanceWrapperProps {
  children: ReactNode
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  previewKey: string
  fullSite?: ReactNode
}

export function MaintenanceWrapper({ 
  children, 
  searchParams, 
  previewKey,
  fullSite 
}: MaintenanceWrapperProps) {
  const params = use(searchParams)
  const isPreview = params?.preview === previewKey
  
  if (isPreview && fullSite) {
    return <>{fullSite}</>
  }
  
  if (isPreview) {
    return null // Will be handled by parent
  }
  
  return <>{children}</>
}
