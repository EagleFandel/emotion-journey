---
name: product-tech-generator
description: Convert messy or incomplete ideas into phased, execution-ready product and engineering deliverables. Use when users ask for requirement clarification, architecture decisions, tech stack selection, project structure design, MVP PRD writing, design specification, development planning, or a "plan first, implement later" workflow.
---

# Product Tech Generator

## Overview

Transform ambiguous user input into concrete outputs that product, design, and engineering teams can execute directly.

## Enforce Working Principles

Execute work in phases and label phase boundaries clearly.

Produce practical deliverables instead of conceptual discussion.

Expose assumptions and unresolved points explicitly.

Do not start coding by default.

## Control Phase Gate

Execute Phase 1 through Phase 5 in order when users ask for full planning.

Execute only the requested phase when users ask for a subset.

Reconstruct assumptions and continue when input is incomplete.

Enter Phase 6 only after explicit confirmation such as "enter implementation phase", "start implementation", "go implement", or equivalent user approval.

Request implementation confirmation before Phase 6 whenever it has not been granted.

## Apply Output Standards

Use clear section headers and explicit deliverable labels.

Make each output actionable enough to convert into tasks and tickets.

Quantify scope, effort, risk, and target constraints when possible.

Define out-of-scope boundaries to prevent scope creep.

Use the templates in `references/output-templates.md`.

## Phase Workflow

### Phase 1 | Requirement Understanding and Structuring

Reconstruct all provided information into a requirement understanding document.

Deliver:

- Project background and goals
- Target users and usage scenarios
- Core problems and value proposition
- Explicit non-goals (what not to build)
- Uncertainties and assumptions list

### Phase 2 | Technical Architecture and Project Structure

Select a suitable architecture based on Phase 1 findings.

Explain trade-offs and reasons for choices.

Deliver:

- Architecture choice with trade-off rationale
- Tech stack list (frontend, backend, data, AI)
- Project directory structure ready for scaffolding
- Core modules and responsibility boundaries

### Phase 3 | PRD for MVP Delivery

Write a development-oriented PRD focused on MVP launchability.

Deliver:

- One-sentence product definition
- Feature list with P0, P1, P2 priorities
- Core user flows (text or flowchart-ready description)
- Exceptions and edge cases
- Non-functional requirements (performance, security, scalability)

### Phase 4 | Design Specification (Visual and Interaction)

Produce UI/UX design specs ready for direct handoff.

Deliver:

- Design principles and style keywords
- Color system (primary, secondary, state colors)
- Typography and text hierarchy
- Core component specs (button, input, card, etc.)
- Key interaction behaviors (loading, error, empty state)

### Phase 5 | Development Plan

Build an implementation roadmap from PRD and Design outputs.

Deliver:

- Module-level task breakdown
- Development order and dependency map
- MVP time estimation
- Risk points and technical challenges

### Phase 6 | Code Implementation (Confirmation Required)

Start only after explicit user confirmation.

Implement module by module.

Explain module design before providing code.

Keep code readable, maintainable, and aligned with architecture decisions.

## Use Response Pattern

Structure each phase response in this order:

1. Phase title
2. Deliverables
3. Assumptions and uncertainty notes
4. Phase completion summary and next-step recommendation

Pause before Phase 6 and request explicit implementation confirmation.

## Run Quality Checklist

Confirm all of the following before finishing a phase:

- Include every required deliverable for that phase.
- Keep outputs specific and execution-ready.
- Make scope boundaries explicit.
- Surface assumptions, risks, and open questions.
- Keep language concise and action-oriented.

