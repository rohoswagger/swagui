# Agent component roadmap

The transcript primitives are established. This roadmap covers the next layer: the surfaces where agent work opens, asks for input, and becomes inspectable without making the chat shell own host state.

## Principles

- Components own layout, presentation, accessibility and interaction mechanics.
- Hosts own processes, navigation, persistence, permissions and external opening.
- Durable results remain transcript history; live environment surfaces belong in a workbench.
- Desktop panels may dock or overlay, while small screens use modal sheets.

## Sequence

### 1. Workbench panel

Status: planned

A resizable right-side shell for browser previews, terminals, files and artifacts. It owns docking, tabs or breadcrumbs, close/replace behavior and responsive presentation. The host owns open panels and their content.

### 2. Browser preview

Status: planned

A browser frame with URL and status presentation, reload and external-open actions, loading/live/crashed/disconnected states and a screenshot fallback. The host provides the actual browser viewport and callbacks.

### 3. Terminal session

Status: planned

A streaming terminal surface with running, completed, failed, cancelled and disconnected states. It supports command grouping, truncation and host-owned copy, clear, expand and reconnect actions.

### 4. File preview

Status: planned

An inspector for code, images, documents, spreadsheets, slides and PDFs. It presents metadata and renderer slots, and is the primary destination for `Artifact.onOpen()`.

### 5. Diff review

Status: planned

A unified or split diff surface with file navigation, added/removed line treatment and host-owned accept, reject and comment actions.

### 6. Input request

Status: implemented

A blocking request for missing information rather than permission. It accepts choices, free text, files and structured fields, validates through native form semantics and settles into a transcript receipt.

`Request` is the shared lifecycle and presentation shell. `Approval` specializes it for authorization and destructive decisions; `InputRequest` specializes it for collecting data.

### 7. Response branch

Status: planned

A compact navigator for regenerated answers and alternate agent branches, with previous/next controls, branch count and an optional host-provided comparison action.

## Explicit non-goals

- The workbench does not run browsers, terminals or renderers.
- Input requests do not authorize side effects; that remains Approval's job.
- Branch navigation does not own model execution or transcript persistence.
