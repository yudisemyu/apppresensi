# AGENTS.md

# KKN Internal Attendance System (MVP)

## Project Overview

Build a simple internal attendance application for a KKN team.

This application is **only for internal use** during the KKN period. It is **not** intended to replace the university attendance system or become a SaaS product.

The main goal is to make attendance recording quick, simple, and reliable, then generate attendance recaps that can be submitted as supporting documents to the university.

Keep everything as simple as possible.

---

# Development Philosophy

This project follows the MVP (Minimum Viable Product) approach.

When making development decisions, always ask:

> "Is this feature really necessary for a KKN team?"

If the answer is no, don't build it.

Prioritize simplicity over flexibility.

Avoid over-engineering.

---

# Tech Stack

Framework

- Next.js 15 (App Router)

Language

- TypeScript

Styling

- Tailwind CSS

UI Components

- shadcn/ui

Icons

- lucide-react

Database

- Prisma ORM
- SQLite

Validation

- Zod

Forms

- React Hook Form

---

# Core Principles

Always prioritize:

- Simplicity
- Readability
- Maintainability
- Fast development
- Clean UI

Avoid unnecessary abstraction.

Prefer straightforward solutions.

---

# Application Scope

This application only needs to solve these problems:

- Create attendance sessions
- Share attendance QR Code
- Record participant attendance
- View attendance list
- Export attendance recap

Nothing more.

---

# Features

## Dashboard

Simple dashboard showing:

- Total attendance sessions
- Total participants
- Button to create a new session

No charts.

No analytics.

---

## Attendance Session

Admin can:

- Create session
- Edit session
- Delete session
- Open session
- Close session

Session contains:

- Activity title
- Date
- Start time
- End time
- Location
- Notes (optional)

---

## QR Code

Each attendance session generates one QR Code.

Participants scan the QR Code to access the attendance page.

QR should only work while the session is open.

---

## Attendance

Participants do not need to log in.

Attendance page only contains:

- Participant selection
- Submit button

Attendance is recorded immediately.

---

## Participants

There is no registration.

No authentication.

No account system.

Admin manually creates the participant list once.

Each participant contains:

- Name
- Student ID (NIM)

Participants simply select their name when attending.

Avoid asking users to type their name every time.

---

## Attendance List

Each session displays:

- Participant name
- Student ID
- Attendance time

Admin can:

- Delete attendance record
- Edit attendance time if necessary

---

## Recap

Generate:

- Attendance recap per session
- Overall attendance recap

Export:

- PDF
- Excel

The report should look neat and printable.

---

# Not Included

Do NOT build:

- Login
- Authentication
- User roles
- Permissions
- Email
- Notifications
- GPS validation
- Face recognition
- Photo upload
- Dashboard analytics
- Charts
- Dark mode
- Settings page
- Public API
- Audit log
- Real-time collaboration
- Multi-organization support

Keep the application focused.

---

# Folder Structure

Use a simple structure.

```
src/

app/

components/

lib/

hooks/

services/

schemas/

types/

utils/
```

Do not over-separate files.

---

# Next.js Guidelines

Prefer:

- Server Components
- Server Actions
- App Router

Only use Client Components when interaction is required.

---

# UI Philosophy

The interface should feel like:

- Notion
- Linear
- Vercel

Characteristics:

- Minimal
- Spacious
- Clean
- Easy to use
- Mobile-friendly

Avoid generic admin dashboard designs.

---

# Color Palette

Primary

#2563EB

Background

#FAFAFA

Card

#FFFFFF

Text

#0F172A

Muted Text

#64748B

Border

#E5E7EB

Success

#16A34A

Danger

#DC2626

Keep colors calm and professional.

---

# Typography

Font

Inter

Use a clear visual hierarchy.

Avoid excessive font weights.

---

# Components

Keep components small.

Examples:

- SessionCard
- AttendanceTable
- ParticipantSelect
- QRCodeCard
- ExportButton

Avoid large components with multiple responsibilities.

---

# Database

Keep the schema simple.

## participants

- id
- name
- nim
- createdAt

## sessions

- id
- title
- location
- date
- startTime
- endTime
- status
- notes
- createdAt

## attendances

- id
- participantId
- sessionId
- attendedAt

Do not add unnecessary tables.

---

# Forms

Use:

- React Hook Form
- Zod

Show clear validation messages.

---

# Error Handling

Always show friendly messages.

Never expose technical errors to users.

---

# Responsive Design

The application should work well on:

- Desktop
- Tablet
- Mobile

Participants will mostly use smartphones.

Design mobile-first where practical.

---

# Loading States

Use skeleton loaders or simple loading indicators.

Never leave the user wondering if something is happening.

---

# Animations

Keep animations subtle.

Duration:

150–200ms

Use:

- Fade
- Scale

Avoid flashy effects.

---

# Code Quality

Write code that is:

- Clean
- Readable
- Reusable

Avoid:

- Duplicate logic
- Large functions
- Deep nesting
- Hardcoded values

Use meaningful names.

---

# TypeScript

Avoid using `any`.

Create proper types whenever possible.

---

# Comments

Only explain why something exists.

Do not comment obvious code.

---

# AI Assistant Instructions

When generating code:

- Keep solutions simple.
- Reuse existing components.
- Do not introduce unnecessary dependencies.
- Follow the existing project structure.
- Prefer readable code over clever code.
- Build only what is required for the MVP.
- Do not implement future features unless explicitly requested.

Remember:

This is an internal KKN tool, not a commercial SaaS product. Every feature should have a clear purpose and contribute directly to making attendance recording easier and generating attendance reports efficiently.