import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EVENT_NAME, EVENT_DATES, EVENT_LOCATION, EVENT_HASHTAG, EVENT_HASHTAGS } from '@/lib/constants'

export interface ShareTemplate {
  id: string
  user_id: string
  template_name: string
  template_type: 'announcement' | 'speaker' | 'attendee' | 'sponsor'
  template_text: string
  hashtags?: string[]
  created_at: Date
  updated_at: Date
}

export interface ShareVariables {
  name?: string
  title?: string
  organization?: string
  topic?: string
  role?: string
  eventDate?: string
  eventLocation?: string
}

interface SharingState {
  // Templates
  templates: ShareTemplate[]
  selectedTemplate: ShareTemplate | null
  customText: string
  
  // Platforms
  selectedPlatforms: ('twitter' | 'linkedin' | 'instagram' | 'whatsapp')[]
  
  // Sharing state
  isSharing: boolean
  shareHistory: Array<{
    platform: string
    content: string
    timestamp: Date
  }>
  
  // QR Code
  qrCode: string | null
  isGeneratingQR: boolean
  
  // Actions
  setTemplates: (templates: ShareTemplate[]) => void
  setTemplate: (template: ShareTemplate | null) => void
  setCustomText: (text: string) => void
  togglePlatform: (platform: 'twitter' | 'linkedin' | 'instagram' | 'whatsapp') => void
  shareToSocial: (platform: string, content: string) => Promise<void>
  generateQRCode: () => Promise<void>
  clearQRCode: () => void
  addToHistory: (platform: string, content: string) => void
  clearHistory: () => void
}

const hashtagsString = EVENT_HASHTAGS.map(h => `#${h}`).join(' ')

export const DEFAULT_TEMPLATES: Omit<ShareTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    template_name: "I'm Attending!",
    template_type: 'attendee',
    template_text: `🎉 Excited to announce that I'll be attending ${EVENT_NAME} on ${EVENT_DATES.displayRange} in ${EVENT_LOCATION.city}! Join me at Nigeria's premier Creative Economy conference. 🚀\n\n${hashtagsString}`,
    hashtags: EVENT_HASHTAGS,
  },
  {
    template_name: "Looking Forward",
    template_type: 'attendee',
    template_text: `Can't wait for ${EVENT_NAME}! 🌟 Three days of learning, networking, and innovation in Nigeria's creative economy. See you there!\n\n${hashtagsString}`,
    hashtags: EVENT_HASHTAGS,
  },
  {
    template_name: "Join Me",
    template_type: 'attendee',
    template_text: `I'll be at ${EVENT_NAME} this March! 🎯 If you're interested in the creative economy, innovation, and building connections, you should join us. Limited spots available!\n\n#SynergyCon2026 #JoinUs #CreativeTech`,
    hashtags: ['SynergyCon2026', 'JoinUs', 'CreativeTech'],
  },
  {
    template_name: "Speaker Announcement",
    template_type: 'speaker',
    template_text: `Honored to be speaking at ${EVENT_NAME}! 🎤 I'll be sharing insights on {{topic}} at Nigeria's leading creative economy conference. Join me ${EVENT_DATES.displayRange} in ${EVENT_LOCATION.city}!\n\n${hashtagsString}`,
    hashtags: EVENT_HASHTAGS,
  },
  {
    template_name: "Countdown",
    template_type: 'announcement',
    template_text: `⏰ Counting down to ${EVENT_NAME}! Three days of innovation, collaboration, and transformation in Nigeria's creative economy. ${EVENT_DATES.displayRange}. Are you ready?\n\n#SynergyCon2026 #SaveTheDate #Innovation`,
    hashtags: ['SynergyCon2026', 'SaveTheDate', 'Innovation'],
  },
]

export function generateShareContent(template: ShareTemplate, variables: ShareVariables): string {
  let content = template.template_text
  
  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    if (value) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
  })
  
  // Remove unreplaced variables
  content = content.replace(/{{[^}]+}}/g, '')
  
  return content
}

export const useSharingStore = create<SharingState>()(
  persist(
    (set, get) => ({
      templates: [],
      selectedTemplate: null,
      customText: '',
      selectedPlatforms: [],
      isSharing: false,
      shareHistory: [],
      qrCode: null,
      isGeneratingQR: false,

      setTemplates: (templates) => set({ templates }),
      
      setTemplate: (template) => set({ selectedTemplate: template }),
      
      setCustomText: (text) => set({ customText: text }),
      
      togglePlatform: (platform) => {
        const { selectedPlatforms } = get()
        const isSelected = selectedPlatforms.includes(platform)
        
        set({
          selectedPlatforms: isSelected
            ? selectedPlatforms.filter(p => p !== platform)
            : [...selectedPlatforms, platform]
        })
      },
      
      shareToSocial: async (platform, content) => {
        set({ isSharing: true })
        
        try {
          const encodedText = encodeURIComponent(content)
          const profileUrl = window.location.origin + '/profile' // Customize as needed
          
          let shareUrl = ''
          
          switch (platform) {
            case 'twitter':
              shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}`
              break
            case 'linkedin':
              shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}&summary=${encodedText}`
              break
            case 'whatsapp':
              shareUrl = `https://wa.me/?text=${encodedText}`
              break
            case 'instagram':
              // Copy to clipboard for Instagram
              await navigator.clipboard.writeText(content)
              alert('Text copied! Paste it in the Instagram app.')
              break
          }
          
          if (shareUrl && platform !== 'instagram') {
            window.open(shareUrl, '_blank', 'width=600,height=400')
          }
          
          // Add to history
          get().addToHistory(platform, content)
        } catch (error) {
          console.error('Share error:', error)
          throw error
        } finally {
          set({ isSharing: false })
        }
      },
      
      generateQRCode: async () => {
        set({ isGeneratingQR: true })
        
        try {
          const res = await fetch('/api/user/profile/qr-code')
          const data = await res.json()
          
          if (data.success) {
            set({ qrCode: data.qr_code })
          }
        } catch (error) {
          console.error('QR generation error:', error)
          throw error
        } finally {
          set({ isGeneratingQR: false })
        }
      },
      
      clearQRCode: () => set({ qrCode: null }),
      
      addToHistory: (platform, content) => {
        const { shareHistory } = get()
        set({
          shareHistory: [
            { platform, content, timestamp: new Date() },
            ...shareHistory.slice(0, 19) // Keep last 20
          ]
        })
      },
      
      clearHistory: () => set({ shareHistory: [] }),
    }),
    {
      name: 'sharing-storage',
      partialize: (state) => ({
        shareHistory: state.shareHistory,
        selectedPlatforms: state.selectedPlatforms,
      }),
    }
  )
)
