# Domain Map

## Short Version

Space datacenters are not one clean market yet. The practical near-term domain
is **orbital compute operations**: placing compute, storage, and AI accelerators
on spacecraft so data can be processed closer to where it is generated, then
downlinked as smaller products or used by other spacecraft. Larger visions
imagine orbital cloud or AI-training clusters powered by continuous sunlight,
but those visions remain constrained by heat rejection, launch mass, radiation,
networking, regulatory approval, and repair/replenishment economics.

The product opportunity is not "launch a satellite from a dashboard." It is a
credible operator cockpit for answering:

- Which orbital node has enough compute, power, thermal margin, storage, and
  link availability for this workload?
- Should the workload run in orbit, on Earth, or wait for a better contact
  window?
- What risk, cost, carbon, water, debris, and regulatory assumptions are implied
  by that choice?

## Core Terms

- **Orbital data center (ODC):** compute and storage infrastructure hosted on
  satellites or orbital platforms.
- **Space-based data center:** broader label for datacenter-like compute in
  Earth orbit or cislunar/lunar contexts.
- **Orbital edge computing:** processing data in space near the sensor or
  mission source before downlinking.
- **Orbital cloud:** general-purpose cloud-like compute capacity in orbit.
- **Onboard AI processing:** inference, filtering, autonomy, compression, or
  model execution directly on spacecraft.
- **Optical inter-satellite link (OISL):** laser/free-space optical link between
  spacecraft. This is central for high-bandwidth space-to-space compute.
- **TT&C:** telemetry, tracking, and command. This is the spacecraft control
  channel, usually kept conservative and separate from data-plane compute.
- **Ground segment:** ground stations, cloud regions, fiber backhaul, mission
  control, scheduling, and operators.
- **Sun-synchronous orbit (SSO):** low Earth orbit that maintains a consistent
  local solar time. Dawn-dusk SSO is attractive because it can offer high solar
  exposure.
- **Contact window:** period when a spacecraft can communicate with a ground
  station or other relay.
- **Conjunction:** close approach between space objects that may require
  avoidance analysis or maneuvering.
- **Post-mission disposal:** end-of-life deorbit or disposal plan, including
  regulatory commitments.
- **CUE / lifecycle carbon usage effectiveness:** carbon-accounting idea from
  space datacenter research for comparing lifecycle carbon impact.

## System Layers

1. **Compute payload:** GPUs, TPUs, FPGAs, CPUs, storage, memory, networking,
   and workload runtime. This can use more commercial hardware if the system
   adds redundancy, radiation monitoring, checkpointing, and validation.
2. **Spacecraft bus:** power, batteries, attitude control, propulsion,
   thermal control, avionics, TT&C, and safing logic.
3. **Thermal system:** heat spreaders, cold plates, heat pipes or pumped loops,
   deployable radiators, coatings, and thermal throttling policy.
4. **Power system:** solar arrays, battery storage, power conditioning, eclipse
   handling, degradation model, and load shedding.
5. **Network:** OISLs for high-rate data plane, RF/Ka-band/S-band where
   appropriate, optical ground links, weather/site diversity, fallback TT&C.
6. **Ground operations:** mission control, contact scheduling, telemetry
   archive, workload placement engine, regulatory/compliance state, customer
   delivery, and sustainability reporting.
7. **Business layer:** customer workloads, reservations, SLAs, risk terms,
   pricing assumptions, launch/replacement cadence, and carbon/water claims.

## Two Main Architecture Families

**Distributed close-formation cluster**

- Many smaller satellites flying in coordinated orbits.
- Uses OISLs for distributed compute or data movement.
- Example direction: Google Project Suncatcher, which plans a learning mission
  with Planet to launch two prototype satellites by early 2027 to test TPUs and
  optical links.
- Product implication: the scheduler must understand formation geometry, link
  windows, multi-node placement, and correlated orbital risks.

**Modular orbital facility**

- Larger modules, containers, or assembled platforms with shared power,
  radiators, and internal networking.
- Example direction: ASCEND and larger Starcloud-style concepts.
- Product implication: the model looks more like DCIM in orbit: modules,
  racks, thermal loops, power domains, redundancy groups, servicing status, and
  capacity planning.

## Near-Term vs Speculative Workloads

Near-term credible:

- Earth-observation preprocessing and data reduction.
- SAR/RF/event detection before downlink.
- Onboard inference for disaster response, maritime monitoring, defense, or
  climate sensing.
- Spacecraft anomaly detection and autonomy.
- Secure storage, store-and-forward, or cislunar/lunar archival demos.
- Limited customer inference where latency and bandwidth expectations are
  realistic.

Still speculative:

- Replacing terrestrial hyperscale cloud.
- Low-latency general-purpose cloud for Earth users.
- Large-scale AI training in orbit without Tbps-class OISLs, strong
  corruption checks, and serious thermal/power infrastructure.
- "Free cooling" claims that ignore radiator area, mass, pointing, degradation,
  and heat transport.

## Product Lens

The impressive demo should make the domain legible by combining four operator
mental models:

- **Mission control:** telemetry, timeline, contacts, alerts, orbit/risk state.
- **DCIM:** assets, capacity, power, cooling, utilization, lifecycle.
- **Cloud placement:** workload fit, queueing, cost, data gravity, carbon.
- **Regulatory/risk:** licensing status, debris commitments, sustainability
  caveats, confidence labels.

## Source Anchors

- [GAO, Data Centers in Space](https://www.gao.gov/products/gao-26-109012)
- [Google Research, Project Suncatcher](https://research.google/blog/exploring-a-space-based-scalable-ai-infrastructure-system-design/)
- [Nature Electronics, carbon-neutral data centres in space](https://www.nature.com/articles/s41928-025-01476-1)
- [ASCEND Horizon project](https://ascend-horizon.eu/)
- [NASA Open MCT](https://nasa.github.io/openmct/about-open-mct/)
- [Schneider Electric DCIM overview](https://www.se.com/ww/en/work/software/data-center-infrastructure-management-dcim/)

