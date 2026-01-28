"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface CountdownProps {
  targetDate: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +new Date(targetDate) - +new Date()

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center p-3">
      <div className="relative">
        <span className="block text-5xl md:text-6xl font-bold tracking-tighter text-white leading-none font-sans">
          {value < 10 ? `0${value}` : value}
        </span>
      </div>
      <div className="mt-2 w-6 h-[2px] bg-zinc-700"></div>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 mt-2">{label}</span>
    </div>
  )

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  // Prevent hydration mismatch by not rendering seconds on server
  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-y-3 gap-x-6 w-full">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeUnit value={0} label="Seconds" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-y-3 gap-x-6 w-full">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  )
}

export const CountdownMobile: React.FC<CountdownProps> = ({ targetDate }) => {
  const calculateTimeLeft = (): TimeLeft => {
    const difference = +new Date(targetDate) - +new Date()

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center flex-1">
      <div className="relative">
        <span className="block text-2xl font-bold tracking-tighter text-white leading-none font-sans">
          {value < 10 ? `0${value}` : value}
        </span>
      </div>
      <div className="mt-1 w-3 h-[1px] bg-zinc-700"></div>
      <span className="text-[7px] font-bold uppercase tracking-[0.1em] text-zinc-300 mt-1">{label}</span>
    </div>
  )

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="grid grid-cols-4 gap-1 w-full">
        <TimeUnit value={timeLeft.days} label="Days" />
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <TimeUnit value={timeLeft.minutes} label="Minutes" />
        <TimeUnit value={0} label="Seconds" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-4 gap-1 w-full">
      <TimeUnit value={timeLeft.days} label="Days" />
      <TimeUnit value={timeLeft.hours} label="Hours" />
      <TimeUnit value={timeLeft.minutes} label="Minutes" />
      <TimeUnit value={timeLeft.seconds} label="Seconds" />
    </div>
  )
}

export default Countdown
