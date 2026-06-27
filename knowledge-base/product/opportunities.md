# Product Opportunities

## Product Principles

An impressive demo should feel like a real operator tool, not a sci-fi landing
page. It should combine satellite mission operations, DCIM, workload placement,
and sustainability/risk accounting.

Use these verbs:

- simulate;
- plan;
- reserve;
- recommend;
- compare;
- monitor seeded telemetry;
- export briefing.

Avoid these verbs without real integrations:

- launch;
- command;
- uplink;
- control satellite;
- deploy to orbit;
- operate spacecraft.

## Concepts Considered

### 1. Orbital ComputeOps Dashboard

A mission-control-style SaaS dashboard for managing seeded orbital compute
fleets: node health, compute capacity, power, thermal margin, storage, contact
windows, workload queue, alerts, and risk.

Why it works:

- Visually impressive.
- Domain-specific.
- Buildable with seeded data.
- Grounded in existing mission-control and DCIM patterns.

### 2. Workload Placement Studio

A product that answers "where should this workload run?" It compares Earth
cloud, terrestrial edge, ground-station region, and orbital edge based on data
gravity, power/thermal windows, latency, freshness, downlink reduction, risk,
carbon, and cost.

Why it works:

- Makes the business case tangible.
- Shows the difference between hype and credible workloads.
- Lets the demo produce a clear recommendation.

### 3. Space DCIM Digital Twin

Treat satellites as datacenter rooms, racks, modules, power chains, cooling
domains, network links, storage pools, and lifecycle assets.

Why it works:

- Converts unfamiliar spacecraft into familiar infrastructure management.
- Allows rich inspection states and capacity planning.
- Can support beautiful technical UI.

### 4. Contact and Downlink Scheduler

A scheduler for ground-station contacts, optical links, reservations, and data
delivery windows.

Why it works:

- Scheduling is a real satellite-ops workflow.
- AWS Ground Station's contact lifecycle gives a grounded adjacent pattern.
- Shows why orbital compute is not simply elastic cloud.

### 5. Sustainability and Risk Ledger

A reporting surface for avoided terrestrial MWh/water, launch/reentry
assumptions, debris exposure, five-year disposal state, and confidence labels.

Why it works:

- Space datacenters are sold partly on sustainability.
- The honest version is more interesting than the hype version.
- It differentiates the demo from a generic satellite dashboard.

## Recommendation

Build **Orbital ComputeOps** as the first demo.

One-sentence product:

> Orbital ComputeOps is a seeded SaaS cockpit that plans and monitors orbital
> compute workloads against spacecraft power, thermal, network, regulatory,
> debris, and sustainability constraints.

The strongest demo moment:

1. The user submits a workload: "SAR wildfire detection inference, 420 GB raw,
   15-minute freshness target, western U.S. priority region."
2. The platform compares Earth cloud, ground edge, and orbital edge.
3. It recommends orbital edge because the raw data is already in space, the
   node has enough thermal/power margin, and the next contact can deliver a
   smaller data product before deadline.
4. It shows tradeoffs: thermal margin consumed, radiation confidence, downlink
   reduction, customer SLA risk, sustainability estimate, and regulatory status.
5. It reserves a seeded compute/contact window and adds an operator briefing.

Why this is better than a generic "space datacenter dashboard":

- It shows a clear job-to-outcome workflow.
- It does not require pretending to control real satellites.
- It uses the actual constraints that make the domain interesting.
- It can be built as a polished local app with deterministic seeded data.

## Adjacent UX Patterns

- [NASA Open MCT](https://nasa.github.io/openmct/about-open-mct/) for mission
  telemetry, planning, and operations visualization.
- [AWS Ground Station contacts](https://docs.aws.amazon.com/ground-station/latest/ug/contacts.html)
  for reservable contact windows and lifecycle states.
- [AWS Ground Station how it works](https://docs.aws.amazon.com/ground-station/latest/ug/how-it-works.html)
  for `SCHEDULED` and `FAILED_TO_SCHEDULE` contact outcomes.
- [Schneider Electric DCIM](https://www.se.com/ww/en/work/software/data-center-infrastructure-management-dcim/)
  for monitoring and managing IT plus supporting power/cooling infrastructure.
- [Sunbird DCIM](https://www.sunbirddcim.com/what-dcim) for capacity, power,
  environmental monitoring, and asset-management patterns.

