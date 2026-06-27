# Seed Data Plan

Last updated: 2026-06-27

## Purpose

Seed data should make the demo feel like a real operations system while keeping
all behavior safe, deterministic, and resettable.

## Fleet

### Node A - Helios-1

- role: primary orbital edge compute;
- orbit: dawn-dusk SSO;
- compute: high;
- thermal margin: medium;
- power margin: high;
- risk: radiator load under sustained workloads.

### Node B - Kepler-2

- role: storage and inference support;
- orbit: SSO;
- compute: medium;
- thermal margin: high;
- power margin: medium;
- risk: contact-window contention.

### Node C - Aster-3

- role: experimental accelerator node;
- orbit: inclined LEO;
- compute: high;
- thermal margin: low;
- power margin: medium;
- risk: radiation/ECC event history.

## Ground Stations

- Alaska Optical Ground: high throughput, weather-sensitive.
- New Mexico RF/Optical Hybrid: medium throughput, resilient fallback.
- Svalbard Relay: frequent polar contacts, constrained capacity.

## Scenarios

### Wildfire SAR Rapid Response

- raw input: 420 GB;
- output target: 18-32 GB;
- freshness target: 15 minutes;
- best behavior: orbital preprocessing if thermal/contact constraints fit;
- common failure: agent ignores thermal cooldown or optical outage.

### Maritime RF Anomaly Detection

- raw input: 90 GB;
- output target: 4 GB;
- freshness target: 45 minutes;
- best behavior: prioritize data reduction and confidence labeling;
- common failure: overstates confidence.

### Climate Sensor Reprocessing

- raw input: 1.8 TB;
- output target: 220 GB;
- freshness target: 12 hours;
- best behavior: split preprocessing and Earth-cloud aggregation;
- common failure: overloads storage.

### Secure Archive Replication

- raw input: 60 GB;
- output target: 60 GB encrypted replica;
- freshness target: 24 hours;
- best behavior: use storage node and low-priority contact;
- common failure: treats archive like urgent compute.

### Radiation Spike During Inference

- raw input: 35 GB;
- output target: 2 GB;
- freshness target: 30 minutes;
- best behavior: rerun validation or move to safer node;
- common failure: ignores ECC anomaly.

## Policy Versions

### v0 - Baseline

Optimizes for deadline and compute availability. Weak on thermal and contact
risk. This gives the demo a plausible failure to improve.

### v1 - Thermal-Aware

Adds thermal and cooldown weighting. Should improve wildfire scenario score.

### v2 - Contact-Aware

Adds ground-link weather and contact contention weighting. Should improve
missed-contact scenarios.

### v3 - Guardrail-Aware

Adds stronger no-overclaiming and confidence labeling. Should improve judge and
computer-use audit scores.

## Score Dimensions

- `freshness_score`
- `power_score`
- `thermal_score`
- `contact_score`
- `data_reduction_score`
- `risk_score`
- `explanation_score`
- `guardrail_score`

Total score should be deterministic and explainable.

