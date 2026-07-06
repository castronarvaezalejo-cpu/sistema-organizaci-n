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
        bg-slate-900/40
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
        max-w-md
        rounded-xl
        border
        border-slate-200
        bg-white
        p-4
        text-slate-800
        shadow-xl
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
    <div className="mb-3">
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
        text-lg
        font-bold
        text-slate-800
      "
    >

      {children}

    </h2>
  )
}
