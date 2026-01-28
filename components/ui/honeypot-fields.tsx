/**
 * Honeypot Fields Component
 * 
 * Invisible fields to trap bots. These fields are hidden using multiple techniques:
 * - CSS display: none
 * - Off-screen positioning
 * - Zero opacity
 * - Semantic HTML attributes (aria-hidden, tabindex)
 */

'use client'

import { HONEYPOT_FIELDS } from '@/lib/honeypot'
import type { HoneypotFieldsProps } from '@/types/components'

// Re-export for backward compatibility
export type { HoneypotFieldsProps }

export function HoneypotFields({ values, onChange }: HoneypotFieldsProps) {
  return (
    <>
      {/* Primary honeypot - hidden with CSS */}
      <input
        type="text"
        name={HONEYPOT_FIELDS.website}
        value={values[HONEYPOT_FIELDS.website] || ''}
        onChange={(e) => onChange(HONEYPOT_FIELDS.website, e.target.value)}
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        style={{ display: 'none' }}
      />

      {/* Secondary honeypot - positioned off-screen */}
      <input
        type="text"
        name={HONEYPOT_FIELDS.company}
        value={values[HONEYPOT_FIELDS.company] || ''}
        onChange={(e) => onChange(HONEYPOT_FIELDS.company, e.target.value)}
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
        }}
      />

      {/* Tertiary honeypot - zero opacity */}
      <input
        type="text"
        name={HONEYPOT_FIELDS.address}
        value={values[HONEYPOT_FIELDS.address] || ''}
        onChange={(e) => onChange(HONEYPOT_FIELDS.address, e.target.value)}
        aria-hidden="true"
        tabIndex={-1}
        autoComplete="off"
        style={{
          opacity: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          height: 0,
          width: 0,
          zIndex: -1,
        }}
      />
    </>
  )
}
