# Technical Architecture

## Feasibility Read

Orbital compute is plausible first as an **edge and data-reduction layer**. The
hardest problem is not whether a GPU, TPU, or edge accelerator can run in
orbit. The hard problems are:

- rejecting waste heat in vacuum;
- launching enough power, radiator, shielding, storage, and network mass;
- surviving radiation without silent data corruption;
- moving data through intermittent and weather-sensitive links;
- operating without hands-on repair;
- satisfying debris, collision, spectrum, and disposal constraints.

GAO's 2026 spotlight is a useful baseline: support systems such as power,
cooling, and communication rely on mature technology, but deployment and
operation at datacenter scale is unproven. Smaller in-space data processing is
closer to maturity than large AI-training datacenters.

## Reference Architecture

```text
Customer workload
  -> placement engine
  -> mission scheduler
  -> orbital node reservation
  -> onboard runtime execution
  -> data product generation
  -> contact / relay / downlink
  -> ground cloud delivery
  -> audit, risk, and sustainability report
```

### Orbital Node

An orbital compute node should be modeled as:

- compute payload: GPUs/TPUs/edge AI modules, CPUs, RAM, storage, NICs, ECC,
  checkpointing, integrity checks;
- control avionics: radiation-tolerant flight computer, safing, command
  validation, fault detection, isolation, and recovery;
- power: solar arrays, batteries, power conditioning, load shedding;
- thermal: heat spreaders, cold plates, heat pipes or pumped loops, radiators,
  coatings, thermal sensors, throttling policy;
- attitude and orbit: ADCS, star trackers, reaction wheels, propulsion,
  conjunction maneuver capability;
- comms: TT&C, RF fallback, optical data links, downlink, crosslinks;
- lifecycle: shielding, degradation model, replacement window, deorbit plan.

### Ground Segment

The ground segment should include:

- mission control and telemetry archive;
- ground-station/contact scheduling;
- optical-ground weather and site diversity model;
- cloud region or storage target for delivered data products;
- regulatory state, licensing evidence, and incident/audit trail;
- operator roles and approval gates;
- customer-facing workload and delivery surface.

### Scheduler

The scheduler should optimize over:

- compute availability and reservation windows;
- battery state, solar exposure, and eclipse risk;
- thermal margin and radiator load;
- radiation events or high-risk orbital regions;
- storage headroom and data product size;
- optical/RF link availability;
- ground-station contact windows;
- customer freshness deadline;
- regulatory or safety holds;
- carbon/water/cost estimates and confidence labels.

## Technical Constraints

### Power

Sun-synchronous and dawn-dusk orbits can be attractive because of solar
exposure, but MW-scale compute needs MW-scale generation. NASA's small
spacecraft power chapter emphasizes that solar cells and arrays have mass,
surface-area, and stowed-volume limits, not just efficiency curves.

Demo implication: seed power as a scarce budget. A node should have generation,
battery state, payload draw, thermal draw, and safe-mode reserves.

### Thermal

Space is not a magic refrigerator. In vacuum, there is no convective cooling.
Waste heat must be transported from chips to radiating surfaces and rejected
through radiation. NASA thermal-control material explains radiator coatings,
absorptivity/emissivity, multilayer insulation, and drift/degradation concerns.

Demo implication: every workload should consume thermal margin. High compute
can force throttling, queue delay, or placement on another node.

### Radiation

Radiation creates total ionizing dose, single-event effects, resets, memory
corruption, and silent data corruption. Inference can often be validated or
rerun. Training is harder because a silent bit flip can poison a long run.
NASA's HPSC and RadPC work show two different needs: robust flight/mission
control compute and fault-tolerant use of commercial processors.

Demo implication: model radiation events, ECC events, validation failures,
checkpoint loss, and workload class sensitivity.

### Networking

Optical links are central for serious orbital compute, especially for
space-to-space data plane. NASA's LCRD shows laser communications can provide
major improvements over radio, but optical ground links need site diversity
because clouds break links. CCSDS standards matter for interoperable space data
systems.

Demo implication: link windows should be a first-class resource. A perfect
always-on link is unrealistic.

### Launch Mass and Replenishment

Compute hardware is only part of the payload. The real mass includes power,
radiators, thermal transport, shielding, structure, batteries, propulsion,
deployment mechanisms, comms, and redundancy. Hardware refresh cycles create a
business problem because Earth data centers can swap accelerators faster than
orbital infrastructure can be serviced.

Demo implication: show capacity tiers and replacement cadence rather than an
infinitely expanding fleet.

### Autonomy

At scale, ground operators cannot babysit every failure. Nodes need autonomous
safing, local power/thermal scheduling, fault isolation, conjunction response,
and recovery behavior. The ground sets policy and accepts or rejects plans.

Demo implication: use "operator proposal" and "autonomous safing event" states,
not direct joystick-style control.

## Seeded Capability Tiers

Use these as scenario tiers:

| Tier | Purpose | Good for | Avoid claiming |
|---|---|---|---|
| 1-10 kW edge node | Near-term onboard processing and demos | EO filtering, inference, compression, anomaly detection | General cloud |
| 100 kW orbital compute cluster | Ambitious near-term/medium-term fleet | Multi-node inference, queued customer jobs, storage, routing | Full hyperscale elasticity |
| 10 MW concept facility | Strategy/risk what-if | Economics, launch cadence, thermal/radiator scenarios | Current deployability |
| 1 GW speculative future | Long-range policy and capital model | "What would it take?" dashboards | Current feasibility |

## Failure Modes To Seed

- optical ground outage due to weather;
- inter-satellite link pointing loss;
- radiator coating degradation;
- pump/thermal-loop anomaly;
- thermal throttle during a high-priority workload;
- solar storm / radiation event;
- ECC surge or silent-output mismatch;
- compute module reset;
- battery reserve violation;
- missed contact window;
- ground-station reservation conflict;
- conjunction warning and maneuver;
- propulsion margin crossing disposal threshold;
- delayed replenishment launch;
- forced deorbit or end-of-life retirement.

## Source Anchors

- [GAO, Data Centers in Space](https://www.gao.gov/products/gao-26-109012)
- [Google Research, Project Suncatcher](https://research.google/blog/exploring-a-space-based-scalable-ai-infrastructure-system-design/)
- [NASA Small Spacecraft Power SOA](https://www.nasa.gov/wp-content/uploads/2025/02/3-soa-power-2024.pdf?emrc=68685c1d0750f)
- [NASA Small Spacecraft Thermal SOA](https://www.nasa.gov/wp-content/uploads/2025/02/7-soa-thermal-2024.pdf?emrc=67af7d4756122)
- [NASA LCRD](https://www.nasa.gov/mission/laser-communications-relay/)
- [NASA HPSC](https://www.nasa.gov/game-changing-development-projects/high-performance-spaceflight-computing-hpsc/)
- [NASA RadPC](https://www.nasa.gov/missions/artemis/clps/nasa-to-test-solution-for-radiation-tolerant-computing-in-space/)
- [CCSDS Blue Books](https://ccsds.org/publications/bluebooks/)
- [NVIDIA Space Computing](https://nvidianews.nvidia.com/news/space-computing)

