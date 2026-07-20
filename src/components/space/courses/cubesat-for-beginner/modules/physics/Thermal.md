
# ThermalScene Reference Data

## Scene Purpose

This scene represents a spacecraft in Low Earth Orbit (LEO) around Earth receiving thermal energy from the Sun.

The visualization should prioritize **physical correctness over artistic effects**.

---

# Celestial Bodies

## Earth

Real radius

```text
6371 km
```

Real diameter

```text
12742 km
```

Average albedo

```text
0.30
```

Average infrared emission

```text
237 W/m²
```

Average surface temperature

```text
288 K
```

Earth emissivity

```text
0.95
```

Earth should be centered at

```text
(0,0,0)
```

---

## Sun

Real radius

```text
696340 km
```

Real diameter

```text
1392680 km
```

Average distance from Earth

```text
149597870 km
```

Solar Constant at Earth

```text
1361 W/m²
```

Sun effective temperature

```text
5778 K
```

Angular diameter from Earth

```text
0.53°
```

Sunlight reaching Earth is effectively **parallel**.

Therefore:

* Do not use PointLight
* Use DirectionalLight
* DirectionalLight direction should match the Sun position.

---

# Earth–Sun Ratio

Radius ratio

```text
Sun : Earth

109.2 : 1
```

Diameter ratio

```text
109.2 : 1
```

Distance ratio

```text
Earth → Sun

23481 Earth Radii
```

These ratios should be preserved even if render scale is compressed.

---

# Thermal Environment

Spacecraft receives heat from only three sources.

## 1. Direct Solar Radiation

```text
1361 W/m²
```

Only when not in eclipse.

---

## 2. Earth Albedo

Approximately

```text
30%
```

of incoming solar radiation.

Depends on Earth visibility.

---

## 3. Earth Infrared Radiation

Approximately

```text
237 W/m²
```

Always exists while Earth is visible.

Still exists during eclipse.

---

# Heat Loss

Only radiative cooling.

Use Stefan–Boltzmann law.

```text
Qemit = εσAT⁴
```

No convection.

No conduction to vacuum.

---

# Eclipse

Earth blocks sunlight.

Three states should exist.

## Full Sun

```text
Solar = 100%
```

## Penumbra

```text
Solar = smooth transition
```

## Umbra

```text
Solar = 0%
```

Earth infrared remains active.

---

# Orbit

Reference orbit

```text
LEO
```

Altitude

```text
500 km
```

Orbital period

```text
94–95 minutes
```

Velocity

```text
7.6 km/s
```

Animation speed can be accelerated.

---

# Spacecraft Temperature

Typical external temperatures

Sun side

```text
+120°C
```

Shadow side

```text
−100°C
```

Electronics operating range

```text
−40°C to +85°C
```

Temperature should change gradually using thermal inertia.

Never change instantly.

---

# Material Properties

Solar panel

```text
Absorptivity α = 0.92
Emissivity ε = 0.85
```

White paint

```text
α = 0.20
ε = 0.90
```

Polished aluminum

```text
α = 0.25
ε = 0.04
```

MLI blanket

```text
α = 0.15
ε = 0.05
```

---

# Lighting Requirements

Use

```tsx
<DirectionalLight />
```

Sun Mesh is only decorative.

The DirectionalLight is the actual sunlight.

Light direction should always match the Sun position.

---

# Rendering Requirements

* Physically Correct Lighting
* ACES Filmic Tone Mapping
* Bloom only for the Sun
* Soft Shadows
* Earth casts shadow
* Satellite enters Earth's shadow
* Atmosphere should scatter light slightly
* Night side of Earth should remain dark

---

# Things To Avoid

Do NOT

* use PointLight as sunlight
* rotate light independently of the Sun
* instantly change temperature
* use cosine(time) as heating
* heat the satellite while inside Umbra
* illuminate Earth's night side with ambient light
* ignore Earth infrared
* ignore albedo
* make the Sun emissive without emitting actual light

---

## สำหรับ Agent เพิ่มเติม (Best Practices)

```text
Refactor the scene to separate physics from rendering.

Create:

- physics/constants.ts
- physics/thermal.ts
- physics/eclipse.ts
- components/Sun.tsx
- components/Earth.tsx
- components/Satellite.tsx
- components/Lighting.tsx

All real-world constants must be centralized.

Rendering scale must be configurable through a single SCALE constant.

Do not hardcode magic numbers inside components.

All heat calculations must use SI units internally (km, meters, Kelvin, Watts), while rendering may use scaled units.
```
