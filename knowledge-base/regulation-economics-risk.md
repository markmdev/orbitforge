# Regulation, Economics, Sustainability, and Risk

## Regulatory Surfaces

A U.S.-linked orbital datacenter operator would likely touch several authority
surfaces:

- **FAA/DOT launch and reentry:** vehicle operator licensing under Part 450,
  payload review, launch/reentry public safety, financial responsibility, and
  environmental review.
- **FCC space and earth station licensing:** NGSO space station authorization,
  earth station authorization, TT&C, uplink/downlink, spectrum, U.S. market
  access, orbital debris mitigation, collision risk, passivation, disposal,
  and casualty-risk disclosure.
- **ITU coordination:** international satellite network filing and frequency
  coordination through a national administration.
- **Commerce novel activity authorization:** Commerce's 2026 Space Commerce
  Certification proposal explicitly discusses novel activities, including
  orbital computing, that may not be fully covered by existing regimes.
- **NOAA remote sensing:** relevant if the platform operates or controls
  private remote-sensing space systems or regulated sensor data products.
- **Treaty overlay:** the Outer Space Treaty creates authorization,
  continuing-supervision, due-regard, and liability context for national
  regulators.
- **Export controls:** spacecraft, space electronics, encryption, radiation-hard
  compute, satellite technical data, foreign launch, and integration flows can
  trigger EAR or ITAR analysis.

Demo implication: a serious SaaS concept should track regulatory state per
fleet, node, link, ground station, and workload. Even seeded data should show
`filed`, `granted`, `conditioned`, `not applicable`, `blocked`, and
`needs review` states.

## Economics

The economic model is driven by mass, heat, utilization, and data gravity.

Main cost drivers:

- launch mass and launch cadence;
- spacecraft bus and payload manufacturing;
- solar arrays, batteries, radiators, thermal loops, shielding, propulsion;
- compute hardware and obsolescence;
- optical/RF communications and ground segment;
- licensing, insurance, compliance, and SSA/collision operations;
- replacement launches and deorbit/disposal.

Current SpaceX rideshare pricing is useful for demo-scale assumptions, but it
does not prove gigawatt-scale economics. Large ODC concepts often depend on
future launch-cost reductions, high-cadence heavy lift, or reusable systems that
are not yet proven as a mature hyperscale supply chain.

Business models that make sense first:

- charging for orbital data reduction or inference;
- premium low-downlink data products;
- resilient/immutable storage and custody;
- mission-specific compute reservations;
- government/defense/geospatial workloads;
- "compare orbital vs terrestrial placement" planning tools.

Weak business models:

- generic low-latency public cloud for Earth users;
- bandwidth-heavy workloads that require moving huge data to orbit first;
- AI training that assumes terrestrial datacenter-like networking and repair;
- claims that space automatically solves data sovereignty.

## Sustainability

Pro arguments:

- near-continuous solar exposure in some orbits;
- less terrestrial land and water demand;
- reduced grid interconnection pressure;
- processing data in space can reduce downlink volume;
- possible lifecycle carbon advantage for narrow workloads if launch and
  manufacturing assumptions hold.

Counterarguments:

- launch emissions and atmospheric effects;
- reentry and unrecovered material;
- debris and collision risk;
- electronics and rare-material loss;
- constellation replacement cadence;
- astronomy and night-sky impacts;
- large uncertainty in lifecycle comparisons.

Credible framing: do not say "space is cleaner." Say "for this workload and
assumption set, compare terrestrial energy, water, land, cooling, and grid
constraints against launch, manufacturing, orbital safety, reentry, and
replacement impacts."

## Risk Model for the Demo

### Regulatory Risk

- FCC application/grant status.
- FAA launch and payload status.
- ITU filing/coordination state.
- NOAA remote-sensing applicability.
- export-control classification.
- authorization gap for orbital computing.

### Orbital Safety Risk

- conjunction probability and miss distance.
- maneuver history.
- propellant and delta-v margin.
- post-mission disposal date and five-year rule compliance.
- casualty-risk estimate.
- debris event exposure.

### Compute and Mission Risk

- thermal margin.
- radiation dose and upset events.
- ECC error rate.
- silent-output mismatch.
- storage saturation.
- power/battery reserve.
- optical link availability.
- ground-station conflicts.

### Sustainability and Business Risk

- launch mass and emissions assumption.
- avoided terrestrial MWh and water estimate.
- lifecycle carbon confidence.
- customer utilization.
- revenue per node-day.
- compute per kg and per watt.
- replacement cadence.
- insurance/licensing costs.

## Source Anchors

- [FAA vehicle operator licenses](https://www.faa.gov/space/licenses/operator_licenses_permits)
- [14 CFR Part 450](https://www.ecfr.gov/current/title-14/chapter-III/subchapter-C/part-450)
- [47 CFR Part 25](https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-25)
- [47 CFR 25.114](https://www.law.cornell.edu/cfr/text/47/25.114)
- [FCC 5-year deorbit rule](https://www.fcc.gov/document/fcc-adopts-new-5-year-rule-deorbiting-satellites-0)
- [Federal Register orbital debris rule effective notice](https://www.federalregister.gov/documents/2024/08/09/2024-17093/space-innovation-mitigation-of-orbital-debris-in-the-new-space-age)
- [Commerce Space Commerce Certification proposal](https://space.commerce.gov/wp-content/uploads/2026/03/Space-Commerce-Certification-OSC-Proposal-March-2026.pdf)
- [ITU satellite filings FAQ](https://www.itu.int/en/ITU-R/Documents/FAQs%20on%20ITU%20satellite%20Fillings-March%202025.pdf)
- [NOAA remote-sensing licensing](https://space.commerce.gov/regulations/commercial-remote-sensing-regulatory-affairs/licensing/)
- [15 CFR Part 960](https://www.ecfr.gov/current/title-15/subtitle-B/chapter-IX/subchapter-D/part-960)
- [DOE/LBNL data center energy report release](https://www.energy.gov/articles/doe-releases-new-report-evaluating-increase-electricity-demand-data-centers)
- [ESA Space Environment Report](https://www.sdo.esoc.esa.int/environment_report/Space_Environment_Report_latest.pdf)
- [ESA Space Environment Statistics](https://sdup.esoc.esa.int/discosweb/statistics/)
- [Outer Space Treaty](https://www.unoosa.org/oosa/en/ourwork/spacelaw/treaties/outerspacetreaty.html)

