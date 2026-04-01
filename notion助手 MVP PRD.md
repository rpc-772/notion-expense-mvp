## 1. Product Overview

**Product name:**  notion助手**Version:**  MVP / v1**Document type:**  Product Requirements Document (PRD)

### 1.1 One-line summary

notion助手 allows users to send natural-language messages from WeChat/chat entry points and automatically structure and save them into a fixed Notion Inbox database, reducing the friction of manual note capture.

### 1.2 Problem statement

People who already use Notion for knowledge management, project tracking, or personal organization often fail to capture ideas at the moment they occur because opening Notion, locating the right page, formatting content, and filling fields creates too much friction. As a result, they either delay capture or use temporary tools such as self-chat in WeChat, notes apps, or rough drafts that later require manual re-entry.

### 1.3 MVP objective

Validate within 2 days whether a low-cost, lightweight workflow can reliably complete the core loop:

**WeChat/ClawBot message → AI parsing → write into Notion Inbox → return success/failure feedback**

The MVP is successful if this loop is stable enough that users are willing to reuse it for real note capture.

---

## 2. Target Users

### 2.1 Primary user

People who already use Notion for:

- knowledge management
- project recording
- personal organization
- inbox-style information collection

### 2.2 User characteristics

These users:

- already trust Notion as a storage destination
- frequently have short bursts of input such as ideas, todos, meeting fragments, reminders, or note snippets
- prefer low-friction mobile capture
- do not want to think about database fields or page structure at the moment of capture

### 2.3 Current alternatives

Users currently rely on:

- sending messages to themselves on WeChat
- Apple Notes / phone notes apps
- manual Notion page creation
- delayed整理 later

---

## 3. User Problem and Jobs To Be Done

### 3.1 Core problem

When users think of something worth saving, the cost of opening Notion and organizing the information is too high.

### 3.2 Job to be done

**When I have a thought, task, or note fragment, I want to send it naturally in chat and have it automatically stored in Notion, so I can capture it immediately without breaking my flow.**

### 3.3 Desired outcome

Users should feel:

- capture is faster than opening Notion manually
- nothing is lost even if parsing is imperfect
- the saved result is structured enough for later review and sorting

---

## 4. Product Goals and Non-Goals

### 4.1 Goals for MVP

1. Enable users to send natural-language input from WeChat / ClawBot.
2. Parse the message into a minimum useful structure.
3. Save the result into a fixed Notion Inbox database.
4. Return clear success/failure feedback to the user.
5. Preserve the raw original content if parsing is incomplete or fails.

### 4.2 Non-goals for MVP

The following are explicitly out of scope for v1:

- writing to arbitrary Notion pages or arbitrary destinations
- multi-user / multi-tenant support
- group collaboration
- two-way sync between Notion and chat
- advanced rich-text formatting
- rewriting or improving old notes automatically
- complex workflows or multi-agent orchestration
- web admin dashboard
- desktop-first experience

### 4.3 Why these non-goals can wait

The MVP is intended to validate the narrowest possible value loop. Adding routing, collaboration, formatting, or management features would increase scope and slow validation without proving the most important assumption: **Will users trust and repeatedly use chat-based capture into Notion?**

---

## 5. Success Metrics

### 5.1 Short-term success metric (within 1 month)

- 50+ valid note writes completed by the founder or test users
- successful write rate above 90%

### 5.2 Medium-term success metric (within 3 months)

- 5–10 real users continue to use the product
- each active user uses it at least 3 times per week

### 5.3 Qualitative signals

- users prefer this over “send to self and整理 later”
- users trust the bot enough to rely on it for real capture
- users feel the time-to-capture is meaningfully lower than manual Notion entry

---

## 6. Core User Flow

### 6.1 Trigger

The user has an idea, todo, reminder, note fragment, or short content they want to save immediately.

### 6.2 Main flow

1. User opens WeChat.

2. User sends a natural-language message to notion助手 / ClawBot.

3. System receives the message.

4. AI parsing extracts a structured representation, such as:
   - title
   - body/content
   - tags
   - time (if present or inferable)

5. System writes the content into the fixed Notion Inbox database.

6. System replies with a concise success/failure confirmation.

### 6.3 User value at the end of the flow

The user has captured the information into Notion without opening Notion or manually formatting the note.

### 6.4 Fallback flow

If parsing confidence is low or parsing partially fails:

1. system still stores the original raw message in Notion
2. system marks the entry as raw / fallback / unparsed if needed
3. system notifies the user that the content was saved but may require later cleanup

This fallback is essential because the product promise is **do not lose user input**.

---

## 7. MVP Functional Requirements

### FR1. Chat-based input capture

**Description**The system must accept user input from the WeChat/chat entry point as natural-language text.

**Why it matters**Without this input channel, the main product loop does not exist.

**Acceptance criteria**

- User can send a plain natural-language message without using a strict command format.
- The system receives the message and begins processing.
- The user does not need to open Notion to start capture.

### FR2. AI-based structured parsing

**Description**The system must parse the user message into a minimal structured object for storage.

**Minimum target fields**

- title
- body/content
- tags
- time/date (when explicitly present or reasonably inferable)

**Why it matters**Users should not need to remember templates or manually fill Notion properties.

**Acceptance criteria**

- Free-form input can be converted into a minimum usable structure.
- If one or more fields cannot be extracted, the system still continues with partial structured output.
- Parsing should not block storage of raw input.

### FR3. Write to fixed Notion Inbox database

**Description**The system must write each parsed message into one predefined Notion Inbox database.

**Why it matters**This is the core delivery of the product. The saved record must exist in Notion.

**Acceptance criteria**

- All successful captures are written to a single fixed Notion destination.
- Each entry contains at minimum the original content and timestamp.
- Parsed fields are mapped into predefined Notion properties when available.

### FR4. Success/failure feedback

**Description**The system must return a concise confirmation message indicating whether the write succeeded.

**Why it matters**Users need confidence that the note was actually saved.

**Acceptance criteria**

- On success, user receives a short confirmation.
- On failure, user receives a short failure message.
- Failure feedback should be understandable without technical jargon.

### FR5. Raw content fallback storage

**Description**If structured parsing fails or is incomplete, the system must still save the original user message into Notion.

**Why it matters**Avoiding data loss is more important than perfect structure in v1.

**Acceptance criteria**

- Raw original message is preserved.
- Parsing failure does not prevent note creation whenever Notion write is still available.
- Fallback entries can later be manually cleaned up by the user.

---

## 8. Suggested Data Model for Notion Inbox

The MVP should use one fixed Notion database with a lightweight schema.

### 8.1 Required fields

- **Title**: short generated or extracted title
- **Content / Body**: main text content
- **Created At**: time of capture
- **Source**: e.g. WeChat / ClawBot
- **Raw Message**: original user message

### 8.2 Optional fields

- **Tags**
- **Parsed Time** / Event Time
- **Parse Status**: parsed / partial / raw
- **Write Status**: success / failed / retry if needed

### 8.3 Design principle

The schema should be minimal and forgiving. It should support later cleanup, not force perfect normalization during capture.

---

## 9. UX and Interaction Principles

### 9.1 Product tone

The experience should feel:

- simple
- lightweight
- trustworthy
- low interruption

### 9.2 UX principles

1. **Capture first, organize later**The product should prioritize fast saving over perfect structure.
2. **Minimal user burden**Users should not need to learn commands or templates.
3. **Clear confirmation**Every submission should produce an understandable status result.
4. **Mobile-first behavior**The primary use case is mobile chat capture.

### 9.3 Key surfaces

- WeChat chat interface
- Notion Inbox database
- optional lightweight configuration/binding page or setup guide

### 9.4 Device priority

- **Primary:**  mobile
- **Secondary:**  desktop later
- **MVP:**  no dedicated desktop product required

---

## 10. Non-Functional Requirements

### 10.1 Speed

A single write should ideally complete within **5–15 seconds**.

### 10.2 Reliability

- user input should not be lost
- partial parse is acceptable
- fallback raw storage is mandatory when possible

### 10.3 Simplicity

The architecture should remain lightweight and easy to replace, especially the WeChat entry layer.

### 10.4 Security and privacy

For v1:

- only basic security hygiene is required
- do not overbuild compliance systems
- keep access scopes limited to what is necessary
- avoid storing unnecessary sensitive content outside the required workflow

### 10.5 Cost

Target near-zero or very low monthly operating cost.

---

## 11. Technical Direction and Constraints

### 11.1 Preferred architecture characteristics

- fixed Notion Inbox database
- lightweight middleware layer
- low-cost components
- stable and replaceable integration points

### 11.2 Likely system flow

1. WeChat / ClawBot receives message
2. middleware / orchestration layer receives event
3. AI parsing creates structured payload
4. Notion API writes into Inbox database
5. response returned to user

### 11.3 Technical principles for MVP

- avoid over-generalization
- keep routing logic simple
- prioritize observability of write success/failure
- make the input source replaceable in future versions

### 11.4 Explicit constraints

- build and validate within 2 days
- keep dependencies minimal
- do not design for scale before proving repeated usage

---

## 12. Example User Stories

### Story 1: capture a quick idea

As a Notion user, when I suddenly think of an idea, I want to send it in chat immediately so it appears in my Notion Inbox without extra formatting.

### Story 2: capture a todo

As a busy user, when I think of a task while on my phone, I want to send a short sentence and trust that the system will save it for later processing.

### Story 3: capture even if AI parsing is imperfect

As a user, if the system cannot fully understand my message, I still want the original text saved so I do not lose it.

### Story 4: confirm storage outcome

As a user, after sending a message, I want a clear status reply so I know whether I need to resend or not.

---

## 13. Acceptance Criteria for MVP Release

The MVP can be considered releasable when all of the following are true:

1. A user can send a natural-language message through the intended chat entry point.
2. The system can parse at least a basic structure from typical note inputs.
3. The system can create a record in the fixed Notion Inbox database.
4. The system returns a success/failure response to the user.
5. If parsing is poor, the raw original message is still stored.
6. End-to-end latency is generally within an acceptable range for chat interaction.
7. The setup and operating cost remain low.

---

## 14. Risks and Mitigations

### Risk 1: Parsing quality is inconsistent

**Impact:**  saved notes may be messy or wrongly structured**Mitigation:**  prioritize raw-message preservation and simple, tolerant schema design

### Risk 2: Notion write failures reduce trust

**Impact:**  users stop relying on the product**Mitigation:**  clear feedback, simple retry handling, logging of failures, preserve raw payload when possible

### Risk 3: Scope creep during the 2-day build

**Impact:**  no working MVP shipped**Mitigation:**  freeze scope around one input channel, one database, one primary flow

### Risk 4: Entry channel may change later

**Impact:**  rework if current WeChat approach changes**Mitigation:**  keep the middleware and storage logic decoupled from the source channel

---

## 15. Future Opportunities (Post-MVP)

If MVP validation is positive, possible v2 directions include:

- routing to multiple Notion destinations
- richer classification and tag suggestions
- editable confirmation before final write
- support for voice transcription input
- group or team use cases
- web configuration panel
- better history, retries, and error visibility
- integration with other capture surfaces beyond WeChat

These should only be considered after the core capture loop proves repeated user value.

---

## 16. Final Product Definition

**notion助手 MVP** is a mobile-first, low-cost capture tool for existing Notion users. It enables users to send natural-language content via WeChat/chat, automatically structures that input, and stores it in a fixed Notion Inbox database with clear feedback and raw-content fallback.

The MVP is not trying to become a full note-management system. Its purpose is to prove one narrow but valuable promise:

**If a user can think it and send it, notion助手 can safely get it into Notion with minimal friction.**
