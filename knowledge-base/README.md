# Knowledge Base

This knowledge base turns current research on orbital datacenters, space-based
compute, adjacent satellite/cloud operations, and the hackathon Gemini 3.5
requirements into a product-ready domain model.

Last integrated research pass: 2026-06-27.

## Core Map

- [domain-map.md](domain-map.md): terms, system model, and how the pieces fit
  together.
- [market-landscape.md](market-landscape.md): companies, projects,
  partnerships, and status.
- [technical-architecture.md](technical-architecture.md): orbital compute
  architecture and constraints.
- [regulation-economics-risk.md](regulation-economics-risk.md): licensing,
  economics, sustainability, and risk.
- [product/opportunities.md](product/opportunities.md): plausible product
  wedges and recommended demo wedge.
- [product/seeded-demo-model.md](product/seeded-demo-model.md): seeded app
  model, screens, entities, scenarios, and guardrails.
- [product/hackathon-alignment.md](product/hackathon-alignment.md): theme fit,
  Gemini prize mapping, and demo narrative.
- [sources/source-index.md](sources/source-index.md): source list with
  relevance notes.
- [sources/gemini-source-index.md](sources/gemini-source-index.md): Gemini docs
  and implementation-source notes.

## Current Recommendation

Build **OrbitForge**: a seeded, self-improving mission-ops stack. Orbital
ComputeOps is the domain surface; OrbitForge is the Gemini-powered improvement
loop around it.

The demo should show:

- seeded orbital-compute incidents;
- Gemini operator plans;
- deterministic evaluation;
- Gemini critique and policy mutation;
- A/B comparison;
- promotion of better policies;
- Gemini computer-use audit of the UI.

The demo should not claim to control satellites. It should simulate, plan,
reserve, recommend, compare, monitor seeded telemetry, improve its own policy,
and export operator briefings.
