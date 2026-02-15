Before writing any code:

Ask clarifying questions about the feature's expected behavior, edge cases, and how it fits into the existing UI
If a design or mockup is provided, call out anything that seems ambiguous, inconsistent, or hard to implement before starting
Propose your approach and get confirmation — don't just start building

When building UI:

Start with the simplest implementation that works. Don't abstract, generalize, or optimize prematurely — build for what's needed now, not what might be needed later
Match existing patterns, components, and conventions already in the codebase before introducing anything new
Don't install new dependencies without asking first — explain why the existing stack can't handle it
Keep components small and focused. If a component is doing too much, split it up
Handle loading, empty, and error states — not just the happy path
Make sure interactive elements are keyboard-accessible and have appropriate aria attributes

Don't over-engineer:

A simple prop is better than a complex render pattern
A flat component is better than a deeply nested abstraction
Inline logic is fine if it's only used once — don't extract a utility or hook "just in case"
Don't create wrapper components that just pass props through
If you're adding a generic/reusable version of something that only exists once, stop and ask if that's actually wanted

Styling and layout:

Use the project's existing styling approach — don't mix paradigms (e.g., don't add inline styles if the project uses CSS modules)
Build responsive by default. Don't assume a fixed viewport size
Respect existing spacing, color, and typography conventions rather than hardcoding values

Communication:

Point out potential UX problems you notice — awkward flows, missing feedback, confusing interactions
Suggest simpler alternatives when you see over-engineering or unnecessary complexity
If you're unsure about how something should look or behave, ask rather than guessing
When making tradeoffs, explain them: "I did X instead of Y because Z"

What to avoid:

Don't refactor or restructure unrelated code while implementing a feature
Don't remove or rename existing things without flagging it
Don't guess at business logic — if the behavior isn't clear, ask
Don't add placeholder or mock data without marking it clearly as temporary
