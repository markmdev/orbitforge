# Seeded Demo Model

## Demo Name

Working name: **Orbital ComputeOps**.

Alternate names:

- OrbitOps Cloud
- StarVault Ops
- HelioCompute Control
- Suncapacity
- Orbital Edge Console

Best current name: **Orbital ComputeOps**. It is clear, serious, and does not
overclaim a real public cloud.

## App Promise

Show how an operator would plan, reserve, and monitor compute workloads on a
small seeded orbital compute fleet.

The app should make three ideas obvious:

1. Orbital compute is valuable when data is already in space or downlink volume
   is the bottleneck.
2. Every job competes for power, thermal margin, storage, contact windows,
   radiation risk, and regulatory constraints.
3. A credible orbital datacenter platform must explain why it recommended a
   placement and what assumptions remain uncertain.

## Screens

### 1. Mission Overview

Purpose: executive/operator cockpit.

Elements:

- fleet map or orbit/timeline strip;
- total available orbital GPU-hours;
- active workloads;
- queued workloads;
- battery reserve;
- thermal/radiator margin;
- next contact windows;
- downlink queue;
- alerts and risk banner;
- sustainability estimate summary;
- regulatory status summary.

Seeded wow moment: a timeline where a radiation watch, ground-station weather
outage, and thermal throttle change the placement recommendation.

### 2. Workload Placement Studio

Purpose: core product workflow.

Inputs:

- workload type: EO inference, SAR detection, RF anomaly detection, model
  inference, storage replication, compression, training experiment;
- raw input volume;
- expected output volume;
- deadline/freshness target;
- priority;
- region/orbit source;
- security/regulatory sensitivity;
- compute estimate;
- validation strictness.

Outputs:

- recommendation: orbital edge, Earth cloud, terrestrial edge, defer, split;
- scorecard: latency/freshness, downlink reduction, thermal fit, power fit,
  radiation fit, contact fit, cost estimate, sustainability estimate;
- explanation;
- reservation proposal;
- risk flags.

### 3. Fleet and Node Detail

Purpose: DCIM-style inspection of orbital assets.

Node fields:

- name and callsign;
- orbit, altitude, inclination, LTAN;
- mass;
- compute modules;
- GPU/TPU/edge accelerator capacity;
- storage capacity;
- solar array area and generation;
- battery capacity and reserve;
- radiator area and current load;
- thermal-loop health;
- shielding and radiation dose;
- current link state;
- TT&C state;
- propellant/delta-v margin;
- disposal plan and target date;
- maturity status: demo, prototype, filed, operational concept.

### 4. Schedule Timeline

Purpose: conflict resolution.

Shows:

- contact windows;
- optical inter-satellite windows;
- planned workloads;
- thermal cooldown windows;
- battery recharge windows;
- regulatory holds;
- conjunction-risk windows;
- failed-to-schedule reasons.

Actions:

- propose reservation;
- move workload;
- split workload;
- hold for safer window;
- export schedule brief.

### 5. Data Products

Purpose: customer delivery view.

Shows:

- raw data source;
- transformed product;
- compression/reduction ratio;
- validation confidence;
- delivery target;
- status: queued, processing, stored, contact pending, delivered, stale;
- customer/project.

### 6. Sustainability and Risk

Purpose: honesty and differentiation.

Shows:

- avoided terrestrial MWh estimate;
- avoided water estimate;
- launch/reentry emissions assumption;
- lifecycle carbon confidence;
- debris/conjunction exposure;
- five-year disposal compliance;
- regulatory state;
- confidence label and caveat text.

## Data Entities

```text
Tenant
Mission
OrbitalNode
HardwareModule
PowerSystem
ThermalSystem
GroundStation
ContactWindow
InterSatelliteLinkWindow
TelemetrySample
Workload
PlacementPlan
Reservation
DataProduct
Alert
RiskEvent
RegulatoryArtifact
SustainabilityMetric
Scenario
OperatorBrief
```

## Seeded Missions

### Wildfire SAR Rapid Response

- Raw volume: 420 GB.
- Output: 18-32 GB detection product.
- Freshness target: 15 minutes.
- Best placement: orbital edge if source satellite and compute node align.
- Risk: thermal load and contact-window fit.

### Maritime RF Anomaly Detection

- Raw volume: 90 GB.
- Output: 4 GB anomaly package.
- Freshness target: 45 minutes.
- Best placement: orbital edge or defer depending on link.
- Risk: validation confidence and downlink contention.

### Climate Sensor Reprocessing

- Raw volume: 1.8 TB.
- Output: 220 GB aggregated model product.
- Freshness target: 12 hours.
- Best placement: split orbital preprocessing plus Earth cloud.
- Risk: storage pressure and battery/thermal schedule.

### Secure Archive Replication

- Raw volume: 60 GB.
- Output: 60 GB encrypted replica.
- Freshness target: 24 hours.
- Best placement: storage node, not compute node.
- Risk: legal/sovereignty caveats and contact cost.

### Experimental Foundation-Model Fine Tune

- Raw volume: 3 TB.
- Output: model checkpoint.
- Freshness target: none.
- Best placement: reject or mark speculative unless scenario is 10 MW+ and
  high-bandwidth multi-node networking is enabled.
- Risk: thermal, link bandwidth, silent data corruption, utilization, cost.

## Guardrails for UI Copy

Good labels:

- Seeded telemetry.
- Scenario estimate.
- Operator proposal.
- Reservation plan.
- Simulated contact.
- Confidence: medium.
- Regulatory state: filed.
- Real integration: unavailable.

Avoid:

- Satellite command sent.
- Launch now.
- Uplink complete.
- Live constellation control.
- Guaranteed carbon neutral.
- Sovereign by default.
- Infinite cooling.

## Design Direction

The UI should feel like an expensive operations console, not a marketing page:

- dense but calm dashboard;
- timeline and resource constraints first;
- orbit/fleet visuals as working tools, not decoration;
- dark-on-light or balanced technical palette, avoiding a one-note space-blue
  theme;
- clear status chips and confidence labels;
- operator explanations written like actual infrastructure tradeoffs.

The first screen should be the usable Mission Overview. No landing page.

