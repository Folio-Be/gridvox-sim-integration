# User Stories & Personas

**Project:** GridVox AI Livery Designer
**Purpose:** Define target users, workflows, and success metrics
**Last Updated:** January 11, 2025

---

## Overview

This document details 4 primary user personas with complete workflows showing:
- Current pain points and manual processes
- How GridVox solves their problems
- Step-by-step usage flows
- Time/cost/quality improvements
- Success criteria and edge cases

---

## Persona 1: Amateur Racer "Alex"

### Background
- **Age:** 28
- **Occupation:** Software developer
- **Sim Racing Experience:** 3 years, iRacing C-class
- **Technical Skills:** Comfortable with software, zero Photoshop experience
- **Budget:** $10-20/month for sim racing tools
- **Time Available:** 5-10 hours/week for racing

### Current Pain Points
- Wants custom livery to stand out in races
- Tried Photoshop tutorials, gave up after 4 hours (couldn't understand UV mapping)
- Default liveries feel generic and unprofessional
- Can't afford $200-300 to hire a designer
- Frustrated by steep learning curve of traditional tools

### Goals
- Get a professional-looking custom livery without learning Photoshop
- Replicate a real-world race car livery they saw at a local track
- Complete the process in under 30 minutes so they can race the same day

### Workflow: Before GridVox
```
Day 1 (4 hours):
1. Search YouTube: "How to make iRacing livery" (30 min)
2. Download Photoshop trial (15 min)
3. Download car UV template from Trading Paints (10 min)
4. Watch UV mapping tutorial, get confused (2 hours)
5. Attempt to paint hood, accidentally paint door (45 min)
6. Give up in frustration (20 min rage-quitting)

Result: ❌ No usable livery, wasted 4 hours, $0 spent but Adobe trial activated
```

### Workflow: With GridVox
```
Total Time: 8 minutes

STEP 1: Upload Photo (1 minute)
- Opens GridVox app
- Clicks "Create New Livery"
- Takes photo of friend's Porsche 992 GT3 R at local track (phone photo)
- Drags photo into upload zone
- AI validates: ✅ Side view detected, ✅ Good lighting, ✅ 87% quality score

STEP 2: Select Car (30 seconds)
- Selects "iRacing" tab (default is current simulator)
- Types "Porsche 992" in search
- Clicks Porsche 992 GT3 R card (shows 3D preview rotating)
- Confirms: "Yes, this matches my car"

STEP 3: AI Generation (30 seconds)
- Watches progress: "Analyzing colors... Mapping to UV... Generating texture..."
- Sees animated wireframe car filling with livery paint
- Completion: "Your livery is ready!"

STEP 4: Review & Adjust (4 minutes)
- Sees side-by-side: Reference photo | AI-generated result | Applied to 3D model
- Quality score: 89% match
- Minor adjustment: Sponsor logo on door is slightly misaligned
  - Clicks door in 3D view → Opens 2D UV canvas zoomed to door section
  - Drags logo 20px to the right
  - Sees live preview update in 3D view
- Satisfied with result

STEP 5: Export (2 minutes)
- Clicks "Export for iRacing"
- Selects TGA format (auto-detected)
- Adds custom car number: #42
- Adds driver name: "A. Rodriguez"
- Clicks "Export & Install"
- GridVox copies .tga to Documents/iRacing/paint/porsche_992_gt3_r/car_42.tga
- Success message: "Ready to race! Restart iRacing to see your livery."

STEP 6: Race! (0 minutes in-app)
- Opens iRacing, selects Porsche 992 GT3 R
- Sees custom livery applied to car in garage
- 😊 Races with professional-looking livery

Result: ✅ Professional livery in 8 minutes, $4.99/month subscription
```

### Success Metrics
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Time to Livery** | 15-20 hours (or give up) | 8 minutes | 150x faster |
| **Cost** | $220 (designer) or $0 (give up) | $4.99/month | 98% cost reduction |
| **Quality (1-10)** | 3 (amateur) or 0 (gave up) | 8.5 (professional) | 183% increase |
| **Satisfaction** | 2/10 (frustration) | 9/10 (racing same day) | 350% increase |
| **Completion Rate** | 20% (80% give up) | 95% | 375% increase |

### Edge Cases & Solutions
- **Photo has poor lighting:** AI shows warning: "Dark areas detected. Try uploading a brighter photo for better results." Allows proceeding with 65% quality estimate.
- **Car not available yet:** Shows "Request Car" button → Votes for car in community wishlist
- **AI misses small sponsor logos:** User adds them manually in 2D UV editor with logo library (drag-drop)
- **First-time user:** Onboarding wizard shows 2-minute interactive tutorial

---

## Persona 2: League Organizer "Marcus"

### Background
- **Age:** 35
- **Occupation:** Marketing manager (non-technical)
- **Sim Racing Role:** Organizes 24-driver GT3 league (AMS2)
- **Technical Skills:** Basic PC skills, no design experience
- **Budget:** $500/season for league operations
- **Time Available:** 5 hours/week for league admin

### Current Pain Points
- Needs 24 matching liveries for all league drivers (team branding)
- Current process: Hire designer for $150/livery = $3,600 (unaffordable)
- Alternative: Drivers use mismatched default liveries (looks unprofessional in broadcasts)
- Takes 2-3 weeks to get all liveries from designer
- Last-minute driver changes require $50 rush fee per livery

### Goals
- Create cohesive team branding for all 24 drivers
- Each driver gets custom number and name
- Complete all liveries in 1-2 hours
- Easy to update for mid-season driver changes
- Stay under $100 budget for liveries

### Workflow: Before GridVox
```
Week 1:
1. Email 3 designers for quotes (2 hours spread over 3 days)
2. Select designer: $150/livery × 24 = $3,600 (over budget, considers giving up)
3. Negotiates bulk discount: $100/livery × 24 = $2,400 (still over budget)

Week 2:
4. Collects driver names and numbers via spreadsheet (3 hours)
5. Sends list to designer with base livery concept (JPG of McLaren F1 GTR livery)

Week 3-4:
6. Designer sends drafts for 3 cars (Week 3, Tuesday)
7. Marcus requests changes: "Sponsor logo should be bigger" (Thursday)
8. Designer revises and sends 12 more drafts (Week 4, Monday)

Week 5:
9. Designer finishes final 9 cars (Wednesday)
10. Marcus discovers typo in driver name "Jhonson" → should be "Johnson" ($25 rush fee)
11. All liveries delivered Friday, season starts Saturday

Result: ✅ Professional liveries BUT 5 weeks + $2,425 spent
```

### Workflow: With GridVox
```
Total Time: 45 minutes (all 24 liveries)

STEP 1: Upload Reference & Create Base Template (10 minutes)
- Uploads photo of McLaren F1 GTR #59 Gulf livery (team theme)
- Selects "Automobilista 2" + "McLaren 720S GT3"
- AI generates base livery: 92% match (Gulf colors, sponsor placement)
- Reviews and approves base template

STEP 2: Batch Generate Team Liveries (5 minutes)
- Clicks "Create Team Set" button
- Uploads CSV:
  ```
  Driver,Number,Sponsors
  Marcus Silva,1,"Gulf Oil, Mobil 1"
  Sarah Chen,2,"Gulf Oil, BBS"
  James Park,3,"Gulf Oil, Enkei"
  [... 21 more rows]
  ```
- GridVox generates 24 variations:
  - Same base livery (Gulf colors)
  - Custom number on door/hood (large, readable)
  - Driver name on windshield banner
  - Optional: Different sponsor placement per driver

STEP 3: Bulk Review (20 minutes)
- Reviews all 24 in grid view (6 per screen)
- Clicks each to see 3D preview rotating
- Notices #7 has small logo alignment issue
  - Opens in editor, adjusts in 30 seconds, saves
- Approves batch: "All liveries look great!"

STEP 4: Export & Distribute (10 minutes)
- Clicks "Export All for AMS2"
- GridVox generates 24 .dds files with mipmaps
- Creates ZIP: "McLaren_Team_Liveries_2025_Season1.zip"
- Uploads to league Discord with installation instructions
- Drivers install in 2 minutes each: Copy to UserData/CustomLiveries/

Result: ✅ 24 professional liveries in 45 minutes, $14.99/month (Creator tier)
```

### Success Metrics
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Total Time** | 40 hours (5 weeks) | 45 minutes | 53x faster |
| **Cost** | $2,400 (bulk designer discount) | $14.99/month | 99% cost reduction |
| **Time to Season Start** | 5 weeks | Same day | 35x faster |
| **Flexibility** | $25-50 per change | Free unlimited changes | Unlimited |
| **Quality Consistency** | Varies (human error) | 100% consistent | Perfect |

### Edge Cases & Solutions
- **Driver drops out mid-season:** Delete from CSV, generate replacement in 2 minutes
- **Sponsor change:** Update base template, regenerate batch in 5 minutes
- **Multiple teams:** Create 2+ base templates (e.g., Gulf vs Martini liveries), batch each separately
- **iRacing league (different simulator):** Change export format to TGA, same workflow

---

## Persona 3: Content Creator "Jake"

### Background
- **Age:** 24
- **Occupation:** Full-time YouTube sim racing content creator (45k subscribers)
- **Content Style:** Cinematic race highlights, historical livery replicas
- **Technical Skills:** Expert video editor (Premiere Pro), intermediate Photoshop
- **Budget:** $2,000/month production budget
- **Goal:** 3 videos per week, each needs 1-2 custom liveries

### Current Pain Points
- Spends 6-8 hours per video creating replica liveries (e.g., 1988 McLaren MP4/4 Senna livery for modern F1 car)
- Quality is "good enough" (75%) but not sponsor-accurate
- Time spent on liveries reduces time for video editing and racing
- Can't afford to hire designer for every video ($200 × 12/month = $2,400)
- Viewers comment: "Close, but the Marlboro placement is wrong"

### Goals
- Create 2-3 historically accurate replica liveries per week
- Achieve 90%+ accuracy for sponsor placement
- Reduce livery creation time to <1 hour per video
- Maintain professional quality to match video production

### Workflow: Before GridVox
```
Per Video (8 hours):

Research Phase (2 hours):
1. Finds high-res reference photos of 1991 McLaren MP4/6 (Google Images, Getty)
2. Downloads 15 reference photos from different angles
3. Studies sponsor placement: Marlboro (main), Shell, Honda, Boss

Photoshop Work (6 hours):
4. Opens modern McLaren MCL60 UV template (iRacing)
5. Manually paints base color (white/red) - 1 hour
6. Places Marlboro logo on sidepod - tries 5 times to get angle right - 1.5 hours
7. Adds Shell, Honda, Boss logos - 2 hours
8. Exports TGA, tests in iRacing, notices rear wing logo is wrong - 30 min
9. Re-exports, tests again, satisfied with 78% accuracy - 1 hour

Result: ✅ Usable livery but 8 hours spent (25% of weekly production time)
```

### Workflow: With GridVox
```
Total Time: 25 minutes per livery

STEP 1: Reference Photo Upload (2 minutes)
- Uploads 3 photos of 1991 McLaren MP4/6 from different angles
- GridVox detects multiple views, asks: "Merge all 3 for better accuracy?"
- Confirms: "Yes, use all 3 views"
- AI analyzes: ✅ Side view, ✅ Front view, ✅ Rear 3/4 view

STEP 2: Car Selection (1 minute)
- Selects "iRacing" + "McLaren MCL60" (modern F1 car)
- AI shows warning: "Historical livery on modern car. Expect some panel shape differences."
- Proceeds anyway (intentional for creative vision)

STEP 3: AI Generation (45 seconds)
- AI generates livery with multi-view fusion: 91% accuracy
- Correctly maps:
  - Marlboro branding (red/white scheme)
  - Shell logo on sidepod (accurate placement)
  - Honda logo on rear wing
  - Boss logo on front wing

STEP 4: Fine-Tuning (18 minutes)
- Reviews 3D preview, rotates to inspect all angles
- Issue 1: Honda logo on rear wing is slightly too small
  - Opens 3D editor, clicks rear wing
  - Scales logo up 20%, repositions 5px left
  - Live preview updates: "Perfect!"
- Issue 2: Marlboro text on sidepod should be bolder
  - Opens 2D UV editor (sidepod section)
  - Uses text tool to increase font weight: Regular → Bold
  - Applies change
- Issue 3: Wants to add custom YouTube channel logo on rear wing endplate
  - Uploads channel logo PNG (transparent background)
  - Drags onto rear wing endplate in 3D view
  - Scales to fit, applies

STEP 5: Export for Video Production (3 minutes)
- Exports as TGA for iRacing
- Also exports high-res preview renders (8 angles, 4K resolution) for video thumbnail
- Saves project: "McLaren_MP4-6_Replica_Ep47.gvox" for future tweaks

Result: ✅ 91% accurate replica in 25 minutes, can create 3 per week with time to spare
```

### Success Metrics
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Time per Livery** | 8 hours | 25 minutes | 19x faster |
| **Liveries per Week** | 1 (max) | 3-5 (comfortable) | 3-5x capacity |
| **Accuracy** | 75-80% (good enough) | 90-95% (sponsor-perfect) | 20% quality gain |
| **Monthly Cost** | $0 (DIY) or $2,400 (designer) | $14.99 (Creator tier) | 99% savings vs designer |
| **Viewer Satisfaction** | 7/10 ("close enough") | 9/10 ("perfect replica!") | 29% increase |

### Monetization Opportunity
- Adds affiliate link in video descriptions: "Create your own liveries with GridVox" (10% commission)
- Earns $150-300/month from referrals
- Net cost: $14.99 - $200 avg = **Profitable side income**

### Edge Cases & Solutions
- **Tobacco/alcohol sponsors (Marlboro, Martini):** GridVox allows for historical/educational use, but adds watermark: "Historical replica for content creation only"
- **Low-res reference photo:** AI shows quality warning but still generates 82% match (better than manual 75%)
- **Livery for non-existent car combo:** Example: 1970s F1 livery on modern GT3 car (creative freedom)
  - AI maps colors/patterns but shows: "Panel shapes don't match. Expect artistic interpretation."

---

## Persona 4: Professional Livery Designer "Sophia"

### Background
- **Age:** 31
- **Occupation:** Freelance livery designer (full-time, 6 years experience)
- **Client Base:** Sim racing teams, esports orgs, individual racers
- **Technical Skills:** Expert Photoshop, Blender, UV mapping mastery
- **Revenue:** $60,000/year ($200/livery × 300 liveries)
- **Pain Point:** Limited capacity (300 liveries/year max = 1.2 per workday)

### Current Workflow (Manual)
```
Per Livery (6 hours = $200):

1. Client consultation (30 min): Discuss vision, colors, sponsors
2. Mood board creation (45 min): Gather references, create concept in Illustrator
3. UV painting in Photoshop (3 hours): Manual painting, logo placement
4. 3D preview in Blender (45 min): Render 4 angles for client approval
5. Revisions (1 hour): Client requests 2-3 changes (avg)
6. Final export & delivery (15 min): DDS with mipmaps, installation guide

Total: 6 hours × $33/hour = $200 per livery
Capacity: 1.2 liveries/day = 300/year (working 5 days/week, 50 weeks)
```

### Concern About GridVox
> "Will this AI tool replace me and destroy my livelihood?"

### How GridVox Helps Professional Designers
GridVox is a **force multiplier**, not a replacement. It handles the tedious 80% (base generation) so designers focus on the creative 20% (refinement, client vision, artistic direction).

### Workflow: With GridVox (Hybrid AI + Human)
```
Per Livery (1.5 hours = $150 competitive pricing, or $200 for premium service):

1. Client consultation (30 min): Same as before (AI can't replace human communication)
2. AI base generation (3 min):
   - Upload client's reference photo or concept sketch
   - Select target car (e.g., Porsche 992 GT3 R)
   - AI generates 85% complete base livery
3. Professional refinement (45 min):
   - Fine-tune sponsor placement (pixel-perfect alignment)
   - Add custom elements: gradient effects, carbon fiber accents, metallic paint
   - Ensure brand consistency (client's team colors, fonts)
   - Artistic touches that AI can't replicate (e.g., custom airbrushed flames)
4. Client preview (15 min): Export 8-angle renders, send for approval
5. Revisions (if needed) (15 min): Adjust in 3D editor, re-export

Total: 1.5 hours × $33/hour = $50 cost → Sell for $150 (competitive) or $200 (premium)
Capacity: 4 liveries/day = 1,000/year (3.3x increase)
```

### Success Metrics
| Metric | Before GridVox | After GridVox | Improvement |
|--------|----------------|---------------|-------------|
| **Time per Livery** | 6 hours | 1.5 hours | 4x faster |
| **Capacity per Year** | 300 liveries | 1,000 liveries | 3.3x increase |
| **Revenue per Livery** | $200 | $150 avg | -25% (offset by volume) |
| **Annual Revenue** | $60,000 | $150,000 | 2.5x increase |
| **Hourly Rate** | $33/hour | $100/hour | 3x increase |
| **Client Satisfaction** | 85% (good) | 95% (faster turnaround) | 12% increase |

### New Business Opportunities
1. **Tiered Pricing:**
   - **Basic ($75):** AI-generated livery with minor tweaks (30 min work)
   - **Standard ($150):** AI base + professional refinement (1.5 hours)
   - **Premium ($300):** Fully custom artistic design, AI as starting point only (4 hours)

2. **Bulk Team Orders:**
   - League of 24 drivers: $3,600 manual → $1,800 with GridVox (2x profit per hour)

3. **Expansion Services:**
   - More time to offer: 3D renders for marketing, animated livery reveals, helmet designs

### Competitive Advantage Over DIY Users
Professional designers using GridVox still outcompete amateurs because:
- **Artistic eye:** Knows what looks good (color theory, balance, negative space)
- **Brand expertise:** Understands client's brand identity, not just copying photos
- **Technical mastery:** Pixel-perfect sponsor placement, advanced shading/effects
- **Client service:** Consultation, revisions, fast turnaround, reliability

Amateur with GridVox: 85% quality (good enough for personal use)
Pro designer with GridVox: 95-98% quality (broadcast-ready, sponsor-approved)

### Edge Cases & Solutions
- **Client wants fully custom design (no reference photo):**
  - Designer creates concept sketch in Illustrator (1 hour)
  - Uploads sketch to GridVox → AI interprets and maps to UV (saves 2 hours vs manual)
- **Ultra-high-end client (esports team, $500 budget):**
  - Uses GridVox for base, spends 4 hours on custom artistry (hand-painted effects)
  - Still 2 hours faster than 6-hour manual workflow
- **AI-generated base doesn't match vision:**
  - Designer overrides 50% of AI output (still faster than 100% manual)

---

## Comparison Matrix: All 4 Personas

| Persona | Current Time | GridVox Time | Time Saved | Current Cost | GridVox Cost | Cost Saved | Quality Before | Quality After |
|---------|--------------|--------------|------------|--------------|--------------|------------|----------------|---------------|
| **Amateur Racer** | 15-20 hours (or give up) | 8 minutes | 150x faster | $220 (hire) or $0 (give up) | $4.99/month | 98% | 3/10 (or 0/10) | 8.5/10 |
| **League Organizer** | 40 hours (5 weeks) | 45 minutes | 53x faster | $2,400 (bulk) | $14.99/month | 99% | 8/10 | 9/10 |
| **Content Creator** | 8 hours | 25 minutes | 19x faster | $0 (DIY) or $2,400/month | $14.99/month | 99% vs hiring | 7.5/10 | 9/10 |
| **Pro Designer** | 6 hours | 1.5 hours | 4x faster | N/A (sells service) | $14.99/month | +$90k revenue/year | 8.5/10 | 9.5/10 |

---

## Success Criteria

### For Amateur Racers
- ✅ 90% of users complete their first livery in <15 minutes
- ✅ 80% approval rating in quality surveys (vs reference photo)
- ✅ 60% convert from free tier to Pro ($4.99/month) after trial
- ✅ <5% refund requests (high satisfaction)

### For League Organizers
- ✅ Batch generation of 20+ liveries in <1 hour
- ✅ CSV import works flawlessly (zero manual entry errors)
- ✅ 95% of teams report "significant time savings" in surveys
- ✅ Repeat usage: 80% create liveries for multiple seasons

### For Content Creators
- ✅ Historical replica accuracy: 85-95% match to reference photos
- ✅ Multi-angle preview exports work perfectly for video thumbnails
- ✅ 50% of users share GridVox affiliate links (monetization opportunity)
- ✅ Livery creation becomes <25% of production time (down from 50%)

### For Professional Designers
- ✅ 3x capacity increase (300 → 1,000 liveries/year)
- ✅ 2.5x revenue increase ($60k → $150k/year)
- ✅ Positive testimonials: "GridVox made me a better designer, not obsolete"
- ✅ 70% of pro designers subscribe to Creator tier ($14.99/month)

---

## User Acquisition Strategy

### Free Tier (Persona 1 entry point)
- 3 liveries/month free
- AI generation with 85% quality
- Basic 2D editor
- Watermark: "Made with GridVox" (small, bottom corner)

### Pro Tier - $4.99/month (Persona 1 + 3)
- Unlimited liveries
- No watermark
- Advanced 2D/3D editor
- Multi-view AI fusion (3+ photos → higher accuracy)
- 4K preview renders

### Creator Tier - $14.99/month (Persona 2 + 4)
- Everything in Pro
- Batch team generation (CSV import)
- API access (integrate with existing tools)
- Priority support
- Commercial license (sell liveries to others)

---

**Next Steps:**
1. Validate personas with 20 sim racers (surveys + interviews)
2. Prototype onboarding flow for Persona 1 (highest volume)
3. Design batch workflow for Persona 2 (highest revenue per user)
4. Create case study videos featuring Persona 4 (address designer concerns)

---

**Last Updated:** January 11, 2025
**Status:** ✅ User stories documented → Ready for UX prototyping
