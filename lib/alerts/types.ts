// ---------------------------------------------------------------------------
// Alert System Types
// ---------------------------------------------------------------------------

export type AlertLevel = "urgent" | "warning" | "preparation"

export type AlertChannel = "email" | "sms" | "both" | "dashboard"

export interface AlertPreferences {
  orchardId: number
  email: string | null
  phone: string | null
  urgentEnabled: boolean
  warningEnabled: boolean
  preparationEnabled: boolean
  quietStart: number // hour (0-23), e.g. 22 for 10 PM
  quietEnd: number   // hour (0-23), e.g. 5 for 5 AM
  channel: AlertChannel
}

export interface PendingAlert {
  level: AlertLevel
  model: string
  title: string
  message: string
  action: string | null
  /** ISO timestamp of when the alert condition was detected */
  detectedAt: string
}

export interface SentAlert {
  id?: number
  orchardId: number
  model: string
  riskLevel: string
  message: string
  sentAt: string
  channel: AlertChannel
  level: AlertLevel
}

export interface AlertEvaluation {
  urgent: PendingAlert[]
  warning: PendingAlert[]
  preparation: PendingAlert[]
}

export interface SendResult {
  success: boolean
  channel: AlertChannel
  error?: string
}
