"use client"

import * as React from "react"

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function Dialog({
  open,
  children,
}: DialogProps) {

  if (!open) return null

  return (

    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-sm
      "
    >

      {children}

    </div>
  )
}

export function DialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {

  return (

    <div
      className={`
        w-full
        max-w-lg
        rounded-2xl
        p-6
        shadow-2xl
        ${className}
      `}
    >

      {children}

    </div>
  )
}

export function DialogHeader({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="mb-4">
      {children}
    </div>
  )
}

export function DialogTitle({
  children,
}: {
  children: React.ReactNode
}) {

  return (

    <h2
      className="
        text-2xl
        font-bold
      "
    >

      {children}

    </h2>
  )
}