"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { parseInput, formatDual, getUnitHint, type UnitType } from "@/lib/units"

interface DualUnitInputProps {
  /** Metric value as a string (e.g. "1.2") */
  value: string
  /** Unit type for conversion */
  unitType: UnitType
  /** Called with the metric value as a string */
  onChange: (metricValueStr: string) => void
  placeholder?: string
  id?: string
  className?: string
}

export function DualUnitInput({
  value,
  unitType,
  onChange,
  placeholder,
  id,
  className,
}: DualUnitInputProps) {
  const [text, setText] = useState(value)
  const [focused, setFocused] = useState(false)
  const lastPropValue = useRef(value)

  // Sync from parent when value changes externally and field is not focused
  useEffect(() => {
    if (value !== lastPropValue.current && !focused) {
      setText(value)
      lastPropValue.current = value
    }
  }, [value, focused])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setText(raw)

    // Try to parse with unit detection
    const parsed = parseInput(raw, unitType)
    if (!isNaN(parsed.value)) {
      const metricStr = String(parsed.value)
      lastPropValue.current = metricStr
      onChange(metricStr)
    } else if (raw === "" || raw === "-") {
      lastPropValue.current = ""
      onChange("")
    }
  }

  function handleBlur() {
    setFocused(false)
    // Normalize display to the metric number on blur
    const parsed = parseInput(text, unitType)
    if (!isNaN(parsed.value)) {
      const metricStr = String(parsed.value)
      setText(metricStr)
      lastPropValue.current = metricStr
      onChange(metricStr)
    } else if (text.trim() === "") {
      setText("")
    } else {
      // Invalid input — reset to stored value
      setText(value)
    }
  }

  const metricNum = parseFloat(value)
  const showDual = !isNaN(metricNum)
  const dual = showDual ? formatDual(metricNum, unitType) : null
  const hint = getUnitHint(unitType)

  return (
    <div>
      <Input
        id={id}
        className={className}
        type="text"
        inputMode="decimal"
        value={text}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        placeholder={placeholder ?? `e.g. ${hint}`}
      />
      {dual ? (
        <p className="text-[11px] text-bark-400 mt-1">
          {dual.primary}{" "}
          <span className="text-bark-300">({dual.secondary})</span>
        </p>
      ) : (
        <p className="text-[11px] text-bark-300 mt-1">Accepts {hint}</p>
      )}
    </div>
  )
}
