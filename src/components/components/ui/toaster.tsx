'use client'

import { useToast } from '@components/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from './toast.tsx'

export function Toaster() {
  const { showToast } = useToast()
  // @ts-ignore
  const toasts = (useToast() as any).toasts || []

  return (
    <ToastProvider>
      {toasts &&
        toasts.map(function ({ id, title, description, action, ...props }) {
          return (
            <Toast key={id} {...props}>
              <div className="flex w-full justify-between gap-2">
                <div className="flex flex-col gap-3">
                  <div className="space-y-1">
                    {title && <ToastTitle>{title}</ToastTitle>}
                    {description && <ToastDescription>{description}</ToastDescription>}
                  </div>
                  <div>{action}</div>
                </div>
                <div>
                  <ToastClose />
                </div>
              </div>
            </Toast>
          )
        })}
      <ToastViewport />
    </ToastProvider>
  )
}
