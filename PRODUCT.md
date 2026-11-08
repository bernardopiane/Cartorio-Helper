# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

(Electron desktop app: web technologies packaged for Windows/macOS/Linux via electron-builder.)

## Users

The team of a Brazilian cartório — escreventes and oficiais who share one installed machine for daily internal work. Confirmed via interview 2026-11-06.

## Product Purpose

A companion toolkit ("livro de ferramentas") for the everyday chores of a cartório. Confirmed: it is deliberately a kit of daily tools — file upload/organization, text formatting, label printing (Etiquetas), CRM consultation, and certificate (certidão) reading — with no single dominant feature; its value is having the right small tools at hand.

## Positioning

An internal, offline companion that speaks the cartório's own formats and routine — local files, registry XML, labels — instead of cloud or web services. Success means the team opens it several times a day instead of reaching for workarounds. (Derived from interview + repository evidence.)

## Operating Context

- Runs on the cartório's desktop (Windows first; NSIS installer), alongside the office's routine document work in Portuguese (pt-BR UI).
- Inputs are local files: XML from registration sections (e.g., `RIT`, `RCPN` records, seen in `cartorio_helper/sample/`), PDFs (rendered via pdfjs-dist), and plain text that needs formatting.
- Recurring rituals: preparing labels (Etiquetas), consulting CRM listings, extracting data from certidões.

## Capabilities and Constraints

- Current surfaces (routes in `cartorio_helper/src/routes/index.jsx`): `/dashboard`, `/upload` (file upload + table), `/formatter` (text formatter), `/etiquetas`, `/consulta` (Consulta CRM), `/certidao` (Leitor de Certidões with XML/PDF parsing).
- Technical: React 19 + Vite + React Router (HashRouter) in Electron; Tailwind CSS 4 with CSS design tokens; MUI and PrimeReact are installed dependencies; custom XML processing (`xmlProcessor.js`, `certidaoParser.js`).
- Product constraint (confirmed): the app must stay completely local and offline — data never leaves the cartório's machine. No cloud services, no telemetry needs, no external APIs as the primary path.
- Undecided/open: whether more registry sections are in scope, multi-cartório distribution, and shared-data behavior between team members (currently a single installed instance).

## Brand Commitments

- Name: "Cartório Helper" (en-US/pt-BR hybrid; used verbatim, with "Livro de ferramentas" tagline in the sidebar).
- Owner identity: Bernardopiane (electron-builder appId `com.bernardopiane.cartorio_helper`, © 2025).
- Voice: Portuguese (pt-BR) UI copy.

## Evidence on Hand

- Real sample XMLs of certidões: `cartorio_helper/sample/1664_20250514_RIT_I_113052.xml` and `..._RCPN_I_113037.xml`.
- A built production bundle exists (`cartorio_helper/dist/`). Logo files, testimonials, and case studies: none — future work must not fabricate them.

## Product Principles

- Offline is the contract: every feature must work with zero external network dependencies; the machine is the boundary.
- Tools pay rent daily: each surface must earn its place by saving real time in the cartório's routine; no demo features.
- Precision over flourish: the app touches official documents; a wrong parse or a wrong label is a worse failure than a plain interface.
- Shared tool for a shared desk: remember the team context — workflow must survive interruption (tracked tab, one v0.1.0 install per machine).
