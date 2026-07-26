# .agents/ Folder — xTred AI Rules & Guidelines

This folder contains instructions, standards, checklists, and workflows controlling how AI agents operate in the **xTred** repository.

---

## File Inventory

| File | Type | Purpose |
|---|---|---|
| `AGENTS.md` | 🌍 Master | Master rules, trading non-negotiable guidelines, stack & architecture |
| `skill.md` | 🌍 Standards | Next.js 15, React 19, TypeScript strict, security & state management standards |
| `FEATURES.md` | 📊 Features | Full feature inventory, module breakdown & status matrix |
| `projectstyle.md` | 🎨 Design & Tokens | Dark-mode `@theme` tokens, folder structure, libraries, component inventory |
| `WORKFLOW.md` | 🔄 Workflow | 12-step execution workflow from requirement analysis to verification |
| `CHECKLIST.md` | ✅ Pre-Delivery | Pre-delivery checklist verified before completing tasks |
| `PROMPTS.md` | 💬 Prompts | Ready-to-use prompts for dev and QA audit sessions |
| `QA.md` | 🧪 QA Audit | Full QA audit checklist covering security, trading rules, TS, state, UI |

---

## Key xTred Rules Summary

1. **No Directional Signals**: Never output "Buy" or "Sell". Output probability % + confidence score (1-5).
2. **Server-Side API Security**: Gemini API and Delta Exchange API keys are server-side only. Zero client exposure.
3. **Zod Payload Validation**: All incoming market & AI data payloads must be Zod-validated.
4. **State Architecture**: Server state → TanStack Query, UI state → Zustand, Form mutations → Server Actions.
5. **Dark Mode & Styling**: Use `@theme` CSS variables from `src/app/globals.css`. Financial numbers use `.tabular-nums`.
