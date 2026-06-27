# Space Datacenter Platform Research Synthesis

Date: 2026-06-27

## Executive Read

The right project is **Orbital ComputeOps**: a seeded SaaS cockpit for planning
and monitoring orbital compute workloads against spacecraft power, thermal,
network/contact-window, radiation, regulatory, debris, and sustainability
constraints.

This is more compelling than a generic "space datacenter dashboard" because it
turns the topic into a concrete operator workflow:

1. submit a workload;
2. compare Earth cloud, ground edge, and orbital edge;
3. explain why a placement is safe or unsafe;
4. reserve compute and contact windows;
5. monitor seeded telemetry;
6. export a serious operator brief with risk and sustainability caveats.

The app should be a demo, not a fake satellite command system. All telemetry,
nodes, contacts, and workloads should be seeded or simulated.

## What Is True Now

The topic is hot because several things happened at once:

- GAO published a 2026 Science & Tech Spotlight on data centers in space,
  explicitly recognizing the opportunity and the barriers.
- Google announced Project Suncatcher and a planned Planet learning mission for
  two prototype satellites by early 2027.
- Starcloud claims a 2025 orbital H100 demo and filed for a massive ODC
  constellation.
- SpaceX, Starcloud, and Blue Origin filed FCC applications for large orbital
  datacenter systems.
- Axiom/Red Hat, Lonestar/Sidus, Ramon.Space/Ingrasys, NVIDIA, and China-linked
  programs show adjacent orbital edge and infrastructure momentum.

The mature part is not hyperscale space cloud. The mature-ish part is onboard
processing, orbital edge inference, data reduction, storage, and mission
autonomy.

## Product Recommendation

Build a single polished local app demo with these first-class surfaces:

- Mission Overview.
- Workload Placement Studio.
- Fleet and Node Detail.
- Schedule Timeline.
- Data Products.
- Sustainability and Risk.

The best demo scenario is:

> A SAR wildfire detection workload starts with 420 GB of raw orbital data and a
> 15-minute freshness target. The platform recommends orbital edge processing,
> shows why the chosen node fits power/thermal/contact constraints, reduces the
> downlink to a small product, reserves a contact window, and labels the
> regulatory/sustainability assumptions.

## Why This Will Feel Impressive

- It gives Mark a current, buzzy topic with real depth.
- It avoids a thin "space-themed CRUD app."
- It has a clear wow flow: a workload moves through a serious orbital
  operations decision.
- It uses seeded data but feels truthful because it respects constraints.
- It can visually combine mission control, DCIM, cloud placement, and risk
  reporting.

## Key Design Constraint

The app should never imply real satellite control. It should say:

- seeded telemetry;
- scenario estimate;
- operator proposal;
- simulated contact;
- reservation plan;
- real integration unavailable.

It should avoid:

- launch now;
- command sent;
- uplink complete;
- live constellation control;
- guaranteed carbon neutral.

## What To Build Next

Next artifact should be a PRD for the demo app, not implementation yet. The PRD
should define:

- the product name;
- target user;
- seeded data model;
- exact screens;
- first demo scenario;
- visual direction;
- acceptance criteria;
- browser QA path;
- what counts as done.

Suggested build stack can be chosen later from local project conventions. If no
existing app stack is reused, a Vite/React/TypeScript app with static seeded
data is enough for the first version.

## High-Signal Files

- [knowledge-base/domain-map.md](../knowledge-base/domain-map.md)
- [knowledge-base/market-landscape.md](../knowledge-base/market-landscape.md)
- [knowledge-base/technical-architecture.md](../knowledge-base/technical-architecture.md)
- [knowledge-base/regulation-economics-risk.md](../knowledge-base/regulation-economics-risk.md)
- [knowledge-base/product/opportunities.md](../knowledge-base/product/opportunities.md)
- [knowledge-base/product/seeded-demo-model.md](../knowledge-base/product/seeded-demo-model.md)
- [knowledge-base/sources/source-index.md](../knowledge-base/sources/source-index.md)

