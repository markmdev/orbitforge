# Market Landscape

## Read This First

As of 2026-06-27, the market has real momentum but uneven maturity.

Real:

- In-orbit edge AI and storage demonstrations.
- ISS or smallsat compute payloads.
- Optical link and ground-station service patterns.
- FCC filings for very large ODC constellations.
- Serious hyperscaler R&D.
- Investor funding for pure-play orbital compute startups.

Hype or unproven:

- Hyperscale cloud replacement.
- Large AI-training clusters in space.
- Tens of thousands to one million satellite constellations operating safely as
  datacenters.
- Space as an "infinite heat sink."
- Legal or sovereignty claims that make orbital data immune to Earth law.

## Company and Program Map

| Actor | What it appears to be doing | Evidence status | Product relevance |
|---|---|---|---|
| Starcloud | Pure-play orbital datacenter startup. Starcloud says Starcloud-1 launched in November 2025 with an NVIDIA H100 and claims first LLM training in orbit. It also filed for up to 88,000 distributed datacenter satellites. | Real flight claim plus FCC filing and funding reports; large-scale vision unproven. | Strong demo inspiration for orbital node telemetry, GPU workloads, staged commercial capacity, and hype/claim labels. |
| Google Project Suncatcher + Planet | R&D program for space-based AI infrastructure using TPUs and optical links. Planet says it will build and operate two prototype satellites targeting early 2027. | Primary-source R&D and partner announcement; not a commercial service yet. | Best technical reference for close-formation compute and honest "learning mission" framing. |
| SpaceX Orbital Data Center system | FCC application for up to one million NGSO satellites to operate as an orbital data center system. | FCC public notice confirms filing; deployment/commercial reality not proven. | Useful as a regulatory/risk scenario, not as a near-term product benchmark. |
| Blue Origin Project Sunrise | FCC application for up to 51,600 satellites to operate as a data center in space, with optical links and TeraWave/mesh backhaul. | FCC public notice confirms filing; deployment not proven. | Useful for fleet-scale scenario modeling and policy risk. |
| Axiom Space AxDCU-1 | Orbital data center unit on or for the ISS using Red Hat Device Edge/MicroShift to run cloud-native edge workloads. | Stronger near-term operational credibility through ISS infrastructure and partner docs. | Good reference for Kubernetes-like orbital edge runtime and autonomous updates. |
| Lonestar Data Holdings / StarVault | Space/cislunar/lunar data storage and edge inference. Sidus says StarVault payloads are being built for LizzieSat missions no earlier than fall 2026. | Forward-looking capacity and payload claims; useful but not proof of a mature service. | Good reference for data-resilience, archival, and sovereign-storage demo scenarios. |
| Ramon.Space + Ingrasys/Foxconn | Supplier/enabler for scalable in-orbit data center infrastructure. | Partnership and prototype-to-production positioning. | Good reference for hardware modules, manufacturing scale, and infrastructure layer. |
| NVIDIA Space Computing | Space AI hardware/platform push with named companies using NVIDIA platforms. | Primary NVIDIA positioning; customer deployment claims vary by partner. | Useful source for credible accelerator terminology and SWaP-constrained edge AI. |
| ASCEND / Thales Alenia Space | European feasibility study for space data centers, sovereignty, and lifecycle emissions. | Feasibility-study evidence, not deployed infrastructure. | Useful for sustainability accounting, lifecycle comparison, and long-range facility scenarios. |
| China Three-Body Computing Constellation | Reported state-backed space-computing constellation with first batch of AI satellites launched in 2025. | Public/state-media and industry reporting; treat scale claims cautiously. | Useful as a competitive landscape signal and edge-compute scenario. |
| Adjacent onboard AI firms | Ubotica, KP Labs, Spiral Blue, HPE Spaceborne Computer, and similar operators. | Mature relative to ODC hype: they prove onboard processing and downlink reduction use cases. | The demo should borrow near-term workload logic from this layer. |

## Key Partnerships and Signals

- [Starcloud-1](https://www.starcloud.com/starcloud-1) is the most visible
  pure-play claim: a launched satellite with an NVIDIA H100 in orbit.
- [FCC Starcloud public notice](https://docs.fcc.gov/public/attachments/DOC-419509A1.pdf)
  describes a request for up to 88,000 satellites as a distributed datacenter.
- [Via Satellite](https://www.satellitetoday.com/finance/2026/03/30/starcloud-raises-170m-to-fund-orbital-data-center-plans/)
  reports Starcloud's $170M Series A and $1.1B valuation.
- [Crusoe's Starcloud partnership](https://www.crusoe.ai/resources/newsroom/crusoe-to-become-first-cloud-operator-in-space-through-partnership-with-starcloud)
  claims a public cloud in space direction by 2027. Treat that as roadmap, not
  current service proof.
- [Google Research](https://research.google/blog/exploring-a-space-based-scalable-ai-infrastructure-system-design/)
  frames Suncatcher as a learning mission and calls out TPUs, models, optical
  inter-satellite links, and early-2027 prototypes with Planet.
- [Planet](https://www.planet.com/pulse/planet-to-build-and-operate-advanced-space-platform-for-project-suncatcher-moonshot/)
  says it will deploy two prototype satellites for Google to test hardware and
  high-bandwidth crosslink communications.
- [FCC SpaceX public notice](https://docs.fcc.gov/public/attachments/DA-26-113A1.pdf)
  confirms a one-million-satellite ODC application.
- [FCC Blue Origin public notice](https://docs.fcc.gov/public/attachments/DOC-420864A1.pdf)
  confirms Project Sunrise as a 51,600-satellite space datacenter filing.
- [Axiom Space](https://www.axiomspace.com/orbital-data-center) describes
  AxDCU-1 as a test application unit for cloud computing, AI/ML, data fusion,
  cybersecurity, storage, and edge processing in orbit.
- [Red Hat and Axiom](https://www.redhat.com/en/about/press-releases/red-hat-teams-axiom-space-launch-optimize-axiom-spaces-data-center-unit-1-orbit)
  identify Red Hat Device Edge as the software substrate for AxDCU-1.
- [Sidus and Lonestar](https://investors.sidusspace.com/news-events/press-releases/detail/279/sidus-space-expands-existing-agreement-with-lonestar-data)
  describe StarVault payloads and a no-earlier-than-fall-2026 launch target.
- [Ramon.Space and Foxconn/Ingrasys](https://ramon.space/press/ramon-space-and-foxconn-expand-strategic-partnership-to-deliver-scalable-in-orbit-data-center-infrastructure/)
  position their partnership as scaling in-orbit data center infrastructure.
- [NVIDIA Space Computing](https://nvidianews.nvidia.com/news/space-computing)
  names orbital datacenters, geospatial intelligence, autonomous space
  operations, and space-ready accelerator platforms.

## What the Demo Should Learn From the Market

1. **Use "staged maturity" everywhere.** Every node, company, and capability
   should have a status such as `deployed demo`, `prototype`, `application
   filed`, `capacity reservation`, `concept`, or `speculative`.
2. **Make edge workloads the credible center.** The near-term buyer story is
   less "run ChatGPT from orbit" and more "turn 420 GB of raw orbital data into
   a 28 GB actionable product before the next downlink."
3. **Expose capacity as constrained.** Power, radiator margin, radiation,
   contacts, and storage are not background details; they are the product.
4. **Track giant-constellation risk without endorsing it.** SpaceX, Blue
   Origin, and Starcloud filings make the topic current, but a credible demo
   should show phased authorization, debris, collision, and sustainability
   concerns.
5. **Borrow cloud language carefully.** Reservations, regions, workload
   placement, carbon accounting, and utilization fit. "Instant elastic cloud"
   does not.

