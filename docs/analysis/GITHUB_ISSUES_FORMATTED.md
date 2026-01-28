# GitHub Issues - SynergyCon 2.0 Feature Development

> **⚠️ NOTE**: These issues are formatted and ready to be created in GitHub. See instructions below for creating them in your repository.

---

## Issue #1: Partner & Sponsor Tier Management System

### Title
`[Feature] Partner & Sponsor Tier Management System - Application to Fulfillment`

### Body

## Overview

Enable complete lifecycle management of conference sponsorships from inquiry through fulfillment. Allow partners to browse tiers, apply online, and receive approvals. Let admins manage partnerships, track benefits, and update sponsor information.

**Priority**: 🔴 **TIER 1 - CRITICAL**  
**Effort**: Medium (2.5-3.5 weeks)  
**Business Value**: Direct revenue generation  

## Scope

### What's Included
- Partner application workflow with form submission
- 4 sponsorship tiers (Gold, Platinum, Diamond, Title) with dynamic benefits
- Sponsor profile pages (public-facing with logo and company info)
- Admin benefit tracking and fulfillment status
- Sponsor communication tools (emails, notes, meeting logs)
- Revenue tracking by tier and sponsor
- Email notifications for new applications and status changes

### What's Excluded
- Contract generation (manual process via external tools)
- Invoice/payment system (use external integrations like Stripe/Wave)
- Advanced sponsorship negotiation or customization workflow
- Sponsor analytics/reporting (future phase)

## Technical Requirements

### Database Schema

```sql
-- Main sponsors table
CREATE TABLE sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  description TEXT,
  contact_email TEXT NOT NULL UNIQUE,
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  tier TEXT NOT NULL CHECK (tier IN ('gold', 'platinum', 'diamond', 'title')),
  status TEXT NOT NULL DEFAULT 'inquiry' CHECK (status IN ('inquiry', 'applied', 'approved', 'rejected', 'active', 'completed')),
  amount_committed DECIMAL(12, 2),
  booth_size TEXT, -- for exhibition
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Track sponsor benefits fulfillment
CREATE TABLE sponsor_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  tier TEXT NOT NULL, -- gold, platinum, etc
  benefit_name TEXT NOT NULL, -- e.g., "Logo on website", "Speaking slot"
  benefit_type TEXT CHECK (benefit_type IN ('booth', 'speaking', 'advertising', 'vip_passes', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'not_applicable', 'waived')),
  notes TEXT,
  completed_date TIMESTAMP,
  assigned_to UUID REFERENCES auth.users(id), -- admin responsible
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(sponsor_id, benefit_name)
);

-- Communication log with sponsors
CREATE TABLE sponsor_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'internal_note', 'meeting', 'call')),
  subject TEXT,
  message TEXT NOT NULL,
  sent_by UUID NOT NULL REFERENCES auth.users(id),
  external BOOLEAN DEFAULT true, -- true = sent to sponsor, false = internal only
  sent_at TIMESTAMP DEFAULT now(),
  response_received BOOLEAN DEFAULT false,
  response_at TIMESTAMP
);

-- Enable RLS
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_communications ENABLE ROW LEVEL SECURITY;
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/sponsors/apply` | Submit partner application |
| GET | `/api/sponsors` | List approved partners (public) |
| GET | `/api/sponsors/:id` | Get sponsor profile page data |
| GET | `/api/admin/sponsors` | List all sponsors (admin) |
| GET | `/api/admin/sponsors/:id` | Sponsor detail with communications |
| PATCH | `/api/admin/sponsors/:id` | Update sponsor info |
| PATCH | `/api/admin/sponsors/:id/status` | Approve/reject/activate |
| POST | `/api/admin/sponsors/:id/benefits/:benefitId` | Mark benefit as fulfilled |
| POST | `/api/admin/sponsors/:id/communicate` | Send communication to sponsor |
| GET | `/api/admin/sponsors/analytics/revenue` | Revenue by tier/month |
| DELETE | `/api/admin/sponsors/:id` | Soft delete sponsor |

### Components Needed

- `components/sponsors/partner-application-form.tsx` - Public application form
- `components/sponsors/sponsor-card.tsx` - Partner showcase card
- `components/admin/sponsors/sponsor-list.tsx` - Admin list view
- `components/admin/sponsors/sponsor-detail.tsx` - Edit form
- `components/admin/sponsors/benefits-tracker.tsx` - Fulfillment tracker
- `components/admin/sponsors/communications-log.tsx` - Email/notes log
- `app/admin/sponsors/page.tsx` - Admin sponsor management page
- `app/sponsors/[id]/page.tsx` - Public sponsor profile page (optional)

## Implementation Plan

### Phase 1: Foundation (Days 1-5)
- [ ] Create database schema and RLS policies
- [ ] Implement sponsor-related API endpoints (POST apply, GET list, etc.)
- [ ] Write database access functions with proper error handling
- [ ] Test endpoints with Postman/API testing

### Phase 2: Application Form (Days 6-8)
- [ ] Build partner application form component
- [ ] Add validation (company name, email, tier selection)
- [ ] Integrate with API endpoint
- [ ] Add success/error messaging
- [ ] Test form submission

### Phase 3: Admin Interface (Days 9-14)
- [ ] Create sponsor list page with filtering/search
- [ ] Build sponsor detail/edit page
- [ ] Implement benefit tracking interface (checkboxes for status)
- [ ] Add communication log viewer
- [ ] Build approval workflow (approve/reject buttons)

### Phase 4: Public Partner Pages (Days 15-17)
- [ ] Update public `/partners` page to show approved sponsors
- [ ] Display sponsor logos in grid format
- [ ] Add sponsor profile link (optional enhanced page)
- [ ] Ensure responsive design

### Phase 5: Automation & Notifications (Days 18-21)
- [ ] Auto-email confirmation when application submitted
- [ ] Auto-email admins when new application received
- [ ] Notify sponsor when approved/rejected
- [ ] Send benefit reminder emails
- [ ] Create email templates for each communication type

## Code Example

### API Endpoint - Apply as Partner
```typescript
// app/api/sponsors/apply/route.ts
import { createSupabaseClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { companyName, website, tier, contactEmail, contactName, contactPhone, description } = body
    
    // Validation
    if (!companyName || !contactEmail || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const supabase = createSupabaseClient()
    
    // Create sponsor record
    const { data, error } = await supabase
      .from('sponsors')
      .insert([{
        company_name: companyName,
        website,
        tier: tier.toLowerCase(),
        contact_email: contactEmail,
        contact_name: contactName,
        contact_phone: contactPhone,
        description,
        status: 'applied'
      }])
      .select()
    
    if (error) throw error
    
    // Send confirmation email to sponsor
    await sendEmail({
      to: contactEmail,
      subject: 'SynergyCon Partner Application Received',
      template: 'sponsor-application-received',
      data: {
        companyName,
        tier: tier.toUpperCase(),
        applicationId: data[0].id
      }
    })
    
    // Notify admins
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `[SynergyCon] New ${tier} Partner Application: ${companyName}`,
      template: 'admin-sponsor-notification',
      data: {
        companyName,
        tier,
        contactEmail,
        link: `${process.env.NEXTAUTH_URL}/admin/sponsors/${data[0].id}`
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      sponsorId: data[0].id
    })
  } catch (error) {
    console.error('[Sponsors API Error]', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
```

## Acceptance Criteria

- ✅ Partners can submit application with all required information
- ✅ Application data stored in database with timestamp
- ✅ Admins can view all applications with status
- ✅ Admins can approve/reject with reason tracking
- ✅ Approved sponsors appear on public partners page
- ✅ Sponsor tier benefits clearly displayed
- ✅ Admins can track benefit fulfillment (checkboxes)
- ✅ Communication log shows all interactions with sponsor
- ✅ Confirmation emails sent automatically
- ✅ Admin notifications sent when new application received
- ✅ Approval/rejection emails sent to sponsors
- ✅ Revenue amounts tracked per sponsor
- ✅ No TypeScript/build errors
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ RLS policies prevent unauthorized access

## Testing Checklist

- [ ] Submit valid application → data saved, confirmation email sent
- [ ] Submit invalid application (missing field) → error message shown
- [ ] Admin approves application → sponsor receives email
- [ ] Admin rejects application → sponsor receives rejection
- [ ] Mark benefit as fulfilled → UI updates instantly
- [ ] Filter sponsors by tier → correct results
- [ ] Public partners page shows approved sponsors → accurate list
- [ ] Check email templates → correct content and formatting
- [ ] Test on mobile device → form is usable
- [ ] Verify RLS → user can't see other users' data

## Dependencies

- **Blocks**: Nothing (independent feature)
- **Blocked by**: Nothing (ready to start immediately)
- **Related to**: Will feed data to analytics dashboard (future)

## Labels
- `feature`
- `high-priority`
- `event-operations`
- `revenue-critical`

---

## Issue #2: Complete Speaker Management System

### Title
`[Feature] Complete Speaker Management System - Application to Session Assignment`

### Body

## Overview

Enable complete lifecycle management of conference speakers from application through session assignment. Allow speakers to submit applications, manage bios, and view assigned sessions. Let admins review applications, manage speaker information, and assign speakers to sessions.

**Priority**: 🔴 **TIER 1 - CRITICAL**  
**Effort**: Medium-Large (3-4 weeks)  
**Business Value**: Event credibility and marketing (speakers are the event)  
**Dependencies**: Blocks "Event Schedule & Sessions" feature  

## Scope

### What's Included
- Speaker application system with form submission
- Speaker profile management (bio, photo, expertise, social links)
- Admin speaker approval/rejection workflow
- Session-to-speaker assignment interface
- Speaker confirmation tracking
- Public speaker gallery/directory with filtering
- Speaker bio modal on public pages (enhance existing)
- Speaker communication system (notifications, confirmations)

### What's Excluded
- Speaker payment/contract system (manual process)
- Speaker portal with login (future phase)
- Advanced speaker analytics or ratings
- Speaker video integration
- Speaker merchandising or store

## Technical Requirements

### Database Schema

```sql
-- Main speakers table
CREATE TABLE speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  bio TEXT,
  image_url TEXT,
  expertise TEXT[], -- e.g., ['UI Design', 'Web Development', 'Startups']
  social_links JSONB, -- {twitter: "...", linkedin: "...", website: "..."}
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'approved', 'rejected', 'confirmed', 'completed')),
  confirmation_sent_at TIMESTAMP,
  confirmation_received_at TIMESTAMP,
  confirmed_by_speaker BOOLEAN DEFAULT false,
  travel_requirements TEXT, -- accommodation, visa assistance, etc
  dietary_requirements TEXT,
  application_date TIMESTAMP DEFAULT now(),
  approved_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Speaker to session assignments
CREATE TABLE speaker_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker_id UUID NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('keynote', 'panelist', 'workshop_facilitator', 'moderator', 'facilitator')),
  order_index INTEGER, -- for multiple speakers on same session
  confirmed BOOLEAN DEFAULT false,
  speaker_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(speaker_id, session_id)
);

-- Communication with speakers
CREATE TABLE speaker_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speaker_id UUID NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('application_received', 'approved', 'rejected', 'session_assigned', 'confirmation_requested', 'reminder', 'thank_you', 'other')),
  subject TEXT,
  message TEXT,
  sent_at TIMESTAMP DEFAULT now(),
  read_by_speaker BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE speaker_communications ENABLE ROW LEVEL SECURITY;
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/speakers/apply` | Submit speaker application |
| GET | `/api/speakers` | List approved speakers (public) |
| GET | `/api/speakers/:id` | Get speaker profile details |
| GET | `/api/speakers/:id/sessions` | Get speaker's assigned sessions |
| GET | `/api/admin/speakers` | List all speakers (admin) |
| GET | `/api/admin/speakers/:id` | Speaker detail with history |
| PATCH | `/api/admin/speakers/:id` | Update speaker info (bio, image, etc) |
| PATCH | `/api/admin/speakers/:id/status` | Approve/reject/confirm |
| POST | `/api/admin/speakers/:id/sessions` | Assign to session |
| DELETE | `/api/admin/speakers/:id/sessions/:sessionId` | Unassign from session |
| POST | `/api/admin/speakers/:id/communicate` | Send communication |
| GET | `/api/admin/speakers/analytics` | Speaker stats (count, status breakdown) |

### Components Needed

- `components/speakers/speaker-application-form.tsx` - Public application form
- `components/speakers/speaker-card.tsx` - Speaker showcase card (enhance)
- `components/speakers/speaker-bio-modal.tsx` - Speaker bio modal (enhance)
- `components/speakers/speaker-gallery.tsx` - Directory view
- `components/admin/speakers/speaker-list.tsx` - Admin list view
- `components/admin/speakers/speaker-detail.tsx` - Edit form
- `components/admin/speakers/session-assignment.tsx` - Assign to sessions
- `components/admin/speakers/communications-log.tsx` - Email log
- `app/admin/speakers/page.tsx` - Admin speaker management page
- `app/speakers/[id]/page.tsx` - Public speaker profile (optional)

## Implementation Plan

### Phase 1: Foundation (Days 1-7)
- [ ] Create database schema and RLS policies
- [ ] Implement speaker API endpoints
- [ ] Build speaker application form component
- [ ] Test endpoints and form submission
- [ ] Add validation and error handling

### Phase 2: Admin Interface (Days 8-14)
- [ ] Create speaker list page with filtering (status, expertise)
- [ ] Build speaker detail/edit page (edit bio, image, expertise)
- [ ] Implement session assignment interface
- [ ] Add confirmation workflow (send confirmation, track responses)
- [ ] Create communications log viewer

### Phase 3: Public Pages (Days 15-18)
- [ ] Populate speakers directory with approved speakers
- [ ] Build speaker gallery view with filters
- [ ] Enhance speaker bio modal with real data
- [ ] Add speaker social links to profile
- [ ] Create individual speaker profile pages (optional)

### Phase 4: Notifications & Automation (Days 19-21)
- [ ] Auto-send confirmation email when approved
- [ ] Auto-send rejection email with feedback option
- [ ] Auto-send confirmation request before event
- [ ] Auto-send reminders closer to event date
- [ ] Auto-send thank you post-event

## Code Example

### API Endpoint - Apply as Speaker
```typescript
// app/api/speakers/apply/route.ts
import { createSupabaseClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, email, bio, imageUrl, expertise, socialLinks, phone } = body
    
    // Validation
    if (!fullName || !email || !bio) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const supabase = createSupabaseClient()
    
    // Create speaker record
    const { data, error } = await supabase
      .from('speakers')
      .insert([{
        full_name: fullName,
        email,
        bio,
        image_url: imageUrl,
        expertise: expertise || [],
        social_links: socialLinks || {},
        phone,
        status: 'applied'
      }])
      .select()
    
    if (error) throw error
    
    // Send confirmation email
    await sendEmail({
      to: email,
      subject: 'SynergyCon Speaker Application Received',
      template: 'speaker-application-received',
      data: {
        name: fullName,
        applicationId: data[0].id
      }
    })
    
    // Notify admins
    await sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `[SynergyCon] New Speaker Application: ${fullName}`,
      template: 'admin-speaker-notification',
      data: {
        name: fullName,
        email,
        expertise: (expertise || []).join(', '),
        link: `${process.env.NEXTAUTH_URL}/admin/speakers/${data[0].id}`
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      speakerId: data[0].id
    })
  } catch (error) {
    console.error('[Speakers API Error]', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
```

## Acceptance Criteria

- ✅ Speakers can submit application with bio, expertise, and image
- ✅ Application data stored with timestamp
- ✅ Admins can view all applications with status
- ✅ Admins can approve/reject with tracking
- ✅ Approved speakers appear on public speakers page
- ✅ Speaker gallery filterable by expertise/district
- ✅ Speakers assignable to one or more sessions
- ✅ Session details show speaker names (not "TBA")
- ✅ Speaker bio modal displays real data
- ✅ Social links (Twitter, LinkedIn) displayed where available
- ✅ Confirmation emails sent automatically
- ✅ Admin notifications sent for new applications
- ✅ Approval/rejection emails sent to speakers
- ✅ Communication history tracked and visible
- ✅ No TypeScript/build errors
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ RLS policies prevent unauthorized access
- ✅ No "Speaker TBA" remaining on site

## Testing Checklist

- [ ] Submit valid speaker application → data saved, confirmation email sent
- [ ] Submit invalid application → error message
- [ ] Admin approves application → speaker receives email
- [ ] Assign speaker to session → session details updated
- [ ] Filter speakers by expertise → correct results
- [ ] Check speaker gallery → approved speakers displayed
- [ ] Verify speaker bio modal → real data shown
- [ ] Test on mobile → form and gallery responsive
- [ ] Verify social links → clickable and correct
- [ ] Check email templates → correct formatting

## Dependencies

- **Blocks**: "Event Schedule & Sessions" feature (speakers needed for sessions)
- **Blocked by**: Nothing (ready to start after Partner Management)

## Labels
- `feature`
- `high-priority`
- `event-operations`
- `critical-path`

---

## Issue #3: Real-Time Event Schedule & Session Details

### Title
`[Feature] Real-Time Event Schedule & Session Details - Admin Management & Attendee Display`

### Body

## Overview

Enable complete management of event schedule and sessions. Allow admins to create and manage sessions with speaker assignments and capacity tracking. Display rich session details to attendees including descriptions, speakers, learning outcomes, and registration options. Support real-time schedule updates with notifications.

**Priority**: 🔴 **TIER 1 - CRITICAL**  
**Effort**: Medium-Large (3.5-4.5 weeks)  
**Business Value**: Core attendee experience (what they came for)  
**Dependencies**: Depends on "Speaker Management System"  

## Scope

### What's Included
- Dynamic session management (create, edit, delete, archive)
- Rich session details (title, description, learning outcomes, prerequisites)
- Speaker-to-session assignment (single or multiple speakers)
- Capacity and registration tracking
- Session filtering and search (by track, speaker, time, type)
- Real-time schedule display with venue/room information
- Attendee session registration/unregistration
- Session bookmarking/favorites for attendees
- Calendar export functionality (iCal, Google Calendar format)
- Real-time notifications for schedule changes
- Session feedback/rating system (post-event)

### What's Excluded
- Advanced scheduling algorithms (no auto-conflict resolution)
- Session recording/video integration (future phase)
- Session analytics dashboard (future phase)
- Virtual session support (focus on in-person)
- Attendee pre-session materials (future phase)

## Technical Requirements

### Database Schema

```sql
-- Sessions table
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  learning_outcomes TEXT[], -- e.g., ['Learn X', 'Understand Y']
  prerequisites TEXT,
  district TEXT NOT NULL, -- e.g., "Tech & Entrepreneurship"
  session_type TEXT NOT NULL CHECK (session_type IN ('keynote', 'panel', 'workshop', 'masterclass', 'exhibition', 'networking')),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration_minutes INTEGER,
  venue TEXT NOT NULL, -- "Federal Palace Hotel", "Royal Box", "Police College"
  room TEXT, -- specific room/track
  capacity INTEGER,
  estimated_attendees INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  tags TEXT[], -- for searching
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Session speakers (linking speakers to sessions)
CREATE TABLE session_speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  speaker_id UUID NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('keynote', 'panelist', 'facilitator', 'moderator')),
  order_index INTEGER DEFAULT 0, -- for ordering multiple speakers
  speaker_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(session_id, speaker_id)
);

-- Attendee session registrations
CREATE TABLE session_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  registered_at TIMESTAMP DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP,
  feedback_score INTEGER CHECK (feedback_score >= 1 AND feedback_score <= 5),
  feedback_text TEXT,
  rating_submitted_at TIMESTAMP
);

-- Session favorites/bookmarks
CREATE TABLE session_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  bookmarked_at TIMESTAMP DEFAULT now(),
  UNIQUE(session_id, registration_id)
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookmarks ENABLE ROW LEVEL SECURITY;
```

### API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/sessions` | List sessions with filters (public) |
| GET | `/api/sessions/:id` | Session details with speakers |
| GET | `/api/sessions/:id/speakers` | Get speakers for session |
| GET | `/api/sessions/by-track/:track` | Sessions filtered by track |
| POST | `/api/sessions/:id/register` | Register attendee for session |
| DELETE | `/api/sessions/:id/register` | Unregister from session |
| POST | `/api/sessions/:id/bookmark` | Bookmark/favorite session |
| DELETE | `/api/sessions/:id/bookmark` | Remove bookmark |
| GET | `/api/sessions/:id/calendar` | Get calendar export (iCal) |
| POST | `/api/sessions/:id/feedback` | Submit session feedback |
| GET | `/api/admin/sessions` | List all sessions (admin) |
| POST | `/api/admin/sessions` | Create session |
| PATCH | `/api/admin/sessions/:id` | Update session |
| DELETE | `/api/admin/sessions/:id` | Soft delete/archive |
| POST | `/api/admin/sessions/:id/speakers` | Assign speaker |
| DELETE | `/api/admin/sessions/:id/speakers/:speakerId` | Unassign speaker |
| GET | `/api/admin/sessions/:id/registrations` | Get registered attendees |
| PATCH | `/api/admin/sessions/:id/status` | Cancel/reschedule |

### Components Needed

- `components/schedule/session-list.tsx` - Filterable session list
- `components/schedule/session-card.tsx` - Session card for grid/list
- `components/schedule/schedule-grid.tsx` - Calendar/grid view
- `components/schedule/session-detail-modal.tsx` - Enhance existing
- `components/schedule/speaker-assignment.tsx` - Assign speakers
- `components/schedule/session-filters.tsx` - Filter controls
- `components/admin/sessions/session-list.tsx` - Admin list view
- `components/admin/sessions/session-edit.tsx` - Create/edit form
- `components/admin/sessions/registrations-list.tsx` - Attendees view
- `app/admin/sessions/page.tsx` - Admin sessions page
- `app/schedule/page.tsx` - Enhanced public schedule page

## Implementation Plan

### Phase 1: Foundation (Days 1-7)
- [ ] Create database schema and RLS policies
- [ ] Migrate hardcoded sessions to database
- [ ] Implement session API endpoints
- [ ] Write query functions with proper joins (speakers)
- [ ] Test endpoints thoroughly

### Phase 2: Admin Interface (Days 8-14)
- [ ] Create session list page with sorting/filtering
- [ ] Build session create/edit form
- [ ] Implement speaker assignment interface
- [ ] Add capacity and registration tracking
- [ ] Build registrations viewer for each session

### Phase 3: Public Pages (Days 15-19)
- [ ] Update schedule page with real data
- [ ] Implement session filtering (track, time, type)
- [ ] Add session registration UI
- [ ] Build session favorites/bookmarks
- [ ] Enhance session detail modal
- [ ] Add calendar export functionality

### Phase 4: Real-Time & Polish (Days 20-23)
- [ ] Implement real-time updates (WebSocket or polling)
- [ ] Add schedule change notifications
- [ ] Build session feedback/rating system
- [ ] Remove all "coming soon" notices
- [ ] Test all flows end-to-end

## Code Example

### API Endpoint - Get Sessions
```typescript
// app/api/sessions/route.ts
import { createSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const track = searchParams.get('track')
    const type = searchParams.get('type')
    const date = searchParams.get('date')
    const search = searchParams.get('search')
    
    const supabase = createSupabaseClient()
    
    let query = supabase
      .from('sessions')
      .select(`
        *,
        session_speakers (
          *,
          speakers (id, full_name, image_url)
        )
      `)
      .eq('status', 'scheduled')
      .order('start_time', { ascending: true })
    
    if (track) query = query.eq('district', track)
    if (type) query = query.eq('session_type', type)
    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      query = query
        .gte('start_time', startOfDay.toISOString())
        .lt('start_time', endOfDay.toISOString())
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('[Sessions API Error]', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}
```

## Acceptance Criteria

- ✅ Sessions stored in database with all details
- ✅ Each session has one or more speakers assigned
- ✅ Speaker names displayed (not "Speaker TBA")
- ✅ Session descriptions show actual content (not coming soon)
- ✅ Attendees can register/unregister for sessions
- ✅ Capacity tracked and enforced
- ✅ Filtering works (by track, type, speaker, date)
- ✅ Search finds sessions by title/description
- ✅ Calendar export works (iCal and Google Calendar)
- ✅ Real-time venue updates when schedule changes
- ✅ Attendees notified of schedule changes
- ✅ Session feedback/rating system works
- ✅ No "coming soon" or placeholder text
- ✅ All venue/room information accurate
- ✅ No TypeScript/build errors
- ✅ Responsive design
- ✅ RLS policies enforce proper access
- ✅ Performance acceptable (queries optimized)

## Testing Checklist

- [ ] Create session with multiple speakers → data saved correctly
- [ ] Edit session time → attendees notified
- [ ] Register for session → registration counted
- [ ] Unregister from session → registration removed
- [ ] Filter by track → only selected track shown
- [ ] Search by title → correct results
- [ ] Export to calendar → file valid
- [ ] Check speaker names → correct speakers listed
- [ ] Verify capacity → can't exceed limit
- [ ] Submit feedback → stored correctly
- [ ] Test on mobile → schedule readable
- [ ] Check performance → loads in <2 seconds

## Dependencies

- **Blocks**: Nothing else (final feature in critical path)
- **Blocked by**: "Speaker Management System" (for speaker assignment)

## Labels
- `feature`
- `high-priority`
- `event-operations`
- `critical-path`
- `attendee-experience`

---

## How to Create These Issues in GitHub

### Option 1: Create via GitHub Web Interface
1. Go to your repository on GitHub
2. Click "Issues" tab
3. Click "New Issue"
4. Copy-paste the **Title** and **Body** for each issue
5. Add the **Labels** listed
6. Click "Submit new issue"

### Option 2: Create via GitHub CLI (ghcli)
```bash
# Install GitHub CLI: https://cli.github.com/

# Create Issue #1
gh issue create \
  --title "[Feature] Partner & Sponsor Tier Management System - Application to Fulfillment" \
  --body "$(cat partner-management-issue.md)" \
  --label "feature,high-priority,event-operations,revenue-critical"

# Create Issue #2
gh issue create \
  --title "[Feature] Complete Speaker Management System - Application to Session Assignment" \
  --body "$(cat speaker-management-issue.md)" \
  --label "feature,high-priority,event-operations,critical-path"

# Create Issue #3
gh issue create \
  --title "[Feature] Real-Time Event Schedule & Session Details - Admin Management & Attendee Display" \
  --body "$(cat schedule-management-issue.md)" \
  --label "feature,high-priority,event-operations,critical-path,attendee-experience"
```

### Option 3: Use GitHub API
```bash
curl -X POST https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/issues \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -d '{
    "title": "[Feature] Partner & Sponsor Tier Management System",
    "body": "...",
    "labels": ["feature", "high-priority"]
  }'
```

---

## Summary

Three critical features identified and specified:

| Feature | Effort | Benefit | Start |
|---------|--------|---------|-------|
| Partner Management | 2.5-3.5 weeks | Revenue generation | Week 1 |
| Speaker Management | 3-4 weeks | Event credibility | Week 2 |
| Schedule Management | 3.5-4.5 weeks | Attendee experience | Week 3 |

**Total Timeline**: 6-8 weeks to completion, with 2-week sprint cycles.

**Recommendation**: Create all three issues now, then follow the implementation order above. This gives clear visibility into work and enables parallel work on different components in later phases.
