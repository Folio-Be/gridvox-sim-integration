# Reiza Studios Contact Research & Strategy
**Date:** November 3, 2025  
**Purpose:** Establish communication with Reiza about AMS2 race configuration file format  
**Context:** GridVox AI voice assistant needs to programmatically configure race sessions

---

## Executive Summary

GridVox is building an AI-powered voice assistant for sim racing that would benefit AMS2 users and potentially drive sales. We need assistance understanding the race configuration file format (`default.sav`) to enable voice-commanded race setup. This document outlines contact strategies and communication drafts.

---

## About Reiza Studios

**Company:** Reiza Studios  
**Founded:** 2010  
**Location:** São Paulo, Brazil  
**Key Product:** Automobilista 2 (AMS2) - Built on Madness Engine (licensed from SMS/Slightly Mad Studios)  
**Company Size:** ~30-50 employees (small/medium indie studio)  
**Known For:** Community-focused, responsive to modders and enthusiasts

---

## Contact Channels (Ranked by Effectiveness)

### 1. Official Forum - Developer Section ⭐⭐⭐⭐⭐
**URL:** https://forum.reizastudios.com/  
**Best For:** Technical questions, modding support, developer communication  
**Response Time:** 1-5 days (developers actively monitor)  
**Strategy:** Post in "Modding & Tools" or "General Discussion" with detailed explanation  
**Success Rate:** HIGH - Reiza has history of helping community developers

**Advantages:**
- Public visibility (others may have insights)
- Official developer monitoring
- Can reference thread in other communications
- Community may already have partial solutions

### 2. Direct Email to Support/Development ⭐⭐⭐⭐
**Email:** support@reizastudios.com  
**Alternative:** info@reizastudios.com  
**Best For:** Formal requests, partnership discussions  
**Response Time:** 3-10 days  
**Strategy:** Professional email explaining project and mutual benefits

**Advantages:**
- Direct communication
- Can attach documents/examples
- More formal/professional channel
- Better for NDA discussions if needed

### 3. Social Media - Twitter/X ⭐⭐⭐
**Twitter:** @ReizaStudios  
**Best For:** Initial contact, flagging urgent issues  
**Response Time:** Variable (1-7 days)  
**Strategy:** Public tweet + DM combination

**Advantages:**
- Quick initial response possible
- Can tag specific developers
- Public nature may motivate response

### 4. Steam Community / Discord ⭐⭐⭐
**Steam:** AMS2 Community Hub  
**Discord:** Reiza Studios Official Discord  
**Best For:** Community networking, finding internal contacts  
**Response Time:** Variable  
**Strategy:** Engage community first, find developer contacts

**Advantages:**
- Active developer presence
- Informal communication
- Can network with community members who may know format

### 5. LinkedIn - Direct Developer Contact ⭐⭐
**Strategy:** Find Reiza developers/engineers on LinkedIn  
**Best For:** Professional networking  
**Response Time:** Variable (may be ignored)  
**Approach:** Respectful InMail with brief explanation

**Advantages:**
- Direct to technical staff
- Professional context
- Can showcase GridVox project

---

## Alternative Strategies

### Strategy A: Community Investigation First
**Before contacting Reiza, investigate community resources:**

1. **Check Existing Mods:**
   - Search for AMS2 mods that modify race configurations
   - Look for championship/race editors in community
   - Check RaceDepartment, OverTake forums

2. **Community Expertise:**
   - Post in modding communities asking if anyone has decoded format
   - Check if pCARS2 (predecessor) has similar format with documentation
   - Look for data mining/modding Discord servers

3. **Related Projects:**
   - Check if SimHub, CrewChief, or other tools read these files
   - Look for open source AMS2 tools on GitHub

**Time Investment:** 2-4 hours  
**Success Rate:** Medium (someone may have already solved this)

### Strategy B: Hybrid Approach (UI Automation + Future API)
**Present to Reiza:**
- We're using UI automation as interim solution
- Request they consider official API in future updates
- Position as "community enhancement request"
- Reduces pressure on them to document legacy format

### Strategy C: Offer Collaboration
**Value Proposition to Reiza:**
- GridVox will showcase AMS2 integration prominently
- Free marketing to AI/voice control enthusiasts
- Could drive new AMS2 sales from accessibility market
- Offer to beta test and provide feedback
- Willing to sign NDA if needed

### Strategy D: Investigate Madness Engine
**Since AMS2 uses Madness Engine (from pCARS2/SMS):**
- Check if pCARS2 community has documentation
- Look for Madness Engine modding documentation
- Original engine may have been more documented

---

## Communication Drafts

### Draft 1: Forum Post (Recommended First Step)

**Title:** [Developer Question] Race Configuration File Format - AI Voice Assistant Integration

**Post:**
```
Hello Reiza Team and Community,

I'm developing GridVox, an AI-powered voice assistant for sim racing that allows 
drivers to control their simulator through natural voice commands. Think "Hey 
GridVox, set up a GT3 race at Spa with 24 opponents in the rain" and it handles 
everything.

We've successfully implemented real-time telemetry integration with AMS2 (reading 
shared memory for live commentary and event detection), and the next feature is 
voice-commanded race configuration.

CHALLENGE:
We need to programmatically configure race sessions (track, car class, opponents, 
weather, etc.). We've investigated the savegame files (default.sav) but the format 
appears to be proprietary binary/compressed:

- File: C:\Users\<user>\Documents\Automobilista 2\savegame\<id>\automobilista 2\profiles\default.sav
- Format: Binary (not XML/JSON/plaintext)
- No readable strings or obvious structure
- Changes detected but structure unclear

QUESTIONS:
1. Is there any documentation on the race configuration file format?
2. Would you be open to sharing the file structure (even partial)?
3. Are there plans for an official API for race configuration?
4. Any guidance on safe modification approaches?

ALTERNATIVE APPROACH:
We can use UI automation (AutoHotkey simulating menu navigation), but direct file 
access would be more reliable and efficient.

WHY THIS BENEFITS AMS2:
- GridVox will showcase AMS2 as a supported sim (free marketing)
- Accessibility features may attract new customers
- Could drive sales from AI/voice control enthusiasts
- We're happy to credit Reiza and collaborate

We're willing to:
- Sign NDA if needed
- Beta test and provide feedback
- Share our telemetry integration code with community
- Showcase AMS2 integration prominently

Has anyone in the community already tackled this? Any insights would be greatly 
appreciated!

Project Context:
- GitHub: [would add if public]
- Already working: Real-time AMS2 telemetry via shared memory (<1ms latency)
- Goal: Complete voice-controlled race weekend experience

Thanks for building such an amazing sim!

Best regards,
GridVox Development Team
```

---

### Draft 2: Professional Email to Support

**To:** support@reizastudios.com  
**CC:** info@reizastudios.com  
**Subject:** Development Partnership Inquiry - AI Voice Assistant Integration (AMS2)

**Email:**
```
Dear Reiza Studios Team,

My name is [Your Name], and I'm reaching out regarding a potential collaboration 
opportunity that could benefit both our projects.

PROJECT OVERVIEW:
I'm developing GridVox, an AI-powered voice assistant for sim racing that enables 
drivers to control their simulator through natural voice commands. The system allows 
commands like "Set up a GT3 race at Spa with 24 opponents in the rain" and handles 
the entire race configuration automatically.

CURRENT PROGRESS:
We've successfully integrated with Automobilista 2 for real-time telemetry:
- Direct shared memory access for <1ms latency telemetry
- 20+ event detection types (overtakes, incidents, pit stops, etc.)
- Live AI commentary based on race events
- Proven with 41-car race sessions (100% reliability)

THE CHALLENGE:
The next feature is voice-commanded race configuration. We've investigated two 
approaches:

1. DIRECT FILE MANIPULATION (Preferred):
   - File: default.sav (race configuration storage)
   - Format: Proprietary binary (compressed/encrypted)
   - Estimated reverse engineering time: 2-4 weeks minimum
   - Risk: May break with updates, no guarantee of success

2. UI AUTOMATION (Fallback):
   - Using AutoHotkey to simulate menu navigation
   - Works but fragile and slower
   - Requires maintenance with UI updates

REQUEST:
Would Reiza Studios be willing to provide:
- Documentation on the race configuration file format (full or partial)
- Guidance on safe modification approaches
- Or confirmation that UI automation is the only supported path

We understand if the format is proprietary and you prefer not to share. In that 
case, we'll proceed with UI automation and revisit in the future.

MUTUAL BENEFITS:
For Reiza:
- Free marketing: GridVox will prominently feature AMS2 integration
- New market: Accessibility features attract voice control enthusiasts
- Potential increased sales from AI/gaming crossover audience
- Community goodwill: Open development approach

For GridVox:
- More reliable race configuration
- Better user experience
- Reduced maintenance burden

TERMS:
- Willing to sign NDA if needed
- Can provide beta access for feedback
- Happy to share our telemetry integration code with community
- Open to formal partnership or simple informal guidance

ALTERNATIVE:
If direct file format documentation isn't feasible, would you consider adding an 
official API for race configuration in a future AMS2 update? We'd be happy to 
contribute requirements and test implementations.

NEXT STEPS:
I'd appreciate a brief call or email exchange to discuss possibilities. Even if 
the answer is "not possible right now," that feedback would help us plan our 
development roadmap.

Thank you for creating such an incredible sim. We're excited to showcase AMS2's 
capabilities through GridVox.

Best regards,
[Your Name]
GridVox Development Team

---
Project Repository: [URL if public]
Demo Video: [URL if available]
Contact: [Your Email]
Website: [If applicable]
```

---

### Draft 3: Twitter/X Initial Contact

**Tweet:**
```
Hey @ReizaStudios! 👋 

Building an AI voice assistant for sim racing (GridVox) - already integrated 
AMS2 telemetry successfully. 

Question: Any docs on race config file format (default.sav)? Want to enable 
voice-commanded race setup but format is proprietary binary.

UI automation works but direct file = better UX 🏎️
```

**Follow-up DM (if they respond):**
```
Thanks for the response! 

Quick context: GridVox lets drivers say "Set up GT3 race at Spa with 24 opponents" 
and it configures everything via voice. Already working with AMS2 telemetry 
(<1ms latency, real-time events).

Race config is the last piece. Happy to share more details or hop on a call if 
helpful. Would love to collaborate - this could drive AMS2 sales in the AI/voice 
control market.

Email: [your email] if easier to discuss there!
```

---

### Draft 4: Forum Post - Community Investigation

**Title:** Anyone decoded AMS2 race config file format? (default.sav)

**Post:**
```
Hey everyone,

Working on a project that needs to programmatically configure races (track, 
car, opponents, weather, etc.). 

Has anyone successfully decoded the race configuration file format?
- File: default.sav (in savegame/profiles directory)
- Format: Binary (not XML/plaintext)
- ~7MB size
- Updates when race config changes

Tried:
- Hex analysis (no obvious patterns)
- String search (no readable track/car names)
- Binary diff (changes detected but structure unclear)

Anyone have:
- Partial documentation?
- Tools that read/write these files?
- Links to pCARS2 format docs (similar engine)?
- Contacts at Reiza who might help?

Alternative is UI automation but direct file access would be cleaner.

Any leads appreciated! 🏁
```

---

## Recommended Action Plan

### Phase 1: Community Investigation (Week 1)
**Day 1:**
- [ ] Search RaceDepartment, OverTake, Reddit for existing solutions
- [ ] Check GitHub for AMS2 modding tools
- [ ] Look for pCARS2 file format documentation

**Day 2:**
- [ ] Post community investigation forum thread (Draft 4)
- [ ] Join Reiza Discord and lurk/ask questions

**Day 3-7:**
- [ ] Monitor responses
- [ ] Test any community suggestions

**Expected Outcome:** 30% chance community has partial solution

### Phase 2: Official Contact (Week 1-2)
**Day 1:**
- [ ] Post developer question on Reiza forum (Draft 1)
- [ ] Send professional email (Draft 2)

**Day 3:**
- [ ] Tweet at Reiza (Draft 3) if no forum/email response

**Day 7:**
- [ ] Follow up on forum post with updates
- [ ] Follow up email if no response

**Expected Outcome:** 60% chance of response, 40% chance of helpful info

### Phase 3: Alternative Approach (Parallel)
**Week 1-2:**
- [ ] Complete UI automation MVP (coordinate calibration)
- [ ] Achieve >90% success rate with UI automation
- [ ] Document as "Plan B"

**If Reiza doesn't respond or can't help:**
- Proceed with UI automation as primary method
- Revisit file format investigation in 3-6 months
- Monitor for community breakthroughs

### Phase 4: Future API Request (Week 3+)
**If file format not accessible:**
- [ ] Submit formal feature request for official API
- [ ] Gather community support for request
- [ ] Offer to beta test API if developed

---

## Risk Analysis

### Risk 1: No Response from Reiza
**Likelihood:** Medium (40%)  
**Impact:** Low (we have UI automation fallback)  
**Mitigation:** Community investigation, multiple contact channels

### Risk 2: Reiza Can't/Won't Share Format
**Likelihood:** Medium (50%)  
**Impact:** Low (UI automation works)  
**Mitigation:** Request future API instead, maintain good relationship

### Risk 3: Format is Licensed/Protected
**Likelihood:** Low (20%)  
**Impact:** High (legal issues if we crack it)  
**Mitigation:** Respect decision, use UI automation only

### Risk 4: Community Already Has Solution
**Likelihood:** Low-Medium (30%)  
**Impact:** Positive (saves time)  
**Mitigation:** Thorough community search first

---

## Success Metrics

### Ideal Outcome:
- Reiza provides file format documentation
- We implement direct file manipulation
- 100% reliable race configuration
- Partnership/collaboration established

### Good Outcome:
- Reiza provides partial guidance
- We combine file + UI approaches
- >95% reliability
- Positive relationship established

### Acceptable Outcome:
- No file format info available
- UI automation achieves >90% success
- Reiza aware of GridVox for future API
- Community networking established

### Fallback Outcome:
- UI automation only
- Revisit in 6-12 months
- Monitor community progress

---

## Timeline

**Week 1:**
- Community investigation (Mon-Wed)
- Official contact (Thu-Fri)

**Week 2:**
- Monitor responses
- Follow up communications
- Continue UI automation development

**Week 3:**
- Evaluate response
- Make go/no-go decision on file format approach
- Finalize implementation strategy

**Week 4+:**
- Implement chosen approach
- Maintain relationship with Reiza/community

---

## Conclusion

**Recommended First Steps:**
1. ✅ Spend 2-4 hours investigating community resources
2. ✅ Post on Reiza forum (Draft 1) - highest success rate
3. ✅ Send professional email (Draft 2) - formal channel
4. ✅ Continue UI automation in parallel (fallback)
5. ✅ Be respectful and professional - we want long-term relationship

**Key Message to Reiza:**
"GridVox + AMS2 = Mutual benefit. We're building something that showcases your sim. 
Help us do it right, and we'll drive sales your way."

**Tone:**
- Professional but enthusiastic
- Respectful of their IP/decisions
- Clear mutual benefits
- Not demanding, collaborative
- Open to alternatives

**Expected Timeline to Resolution:** 2-4 weeks

---

**Next Action:** Review and approve communication drafts, then execute Phase 1.

