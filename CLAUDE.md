# Sky Landers — KubeJS Modpack Dev Context

## Project overview
Custom Minecraft 1.21.1 modpack with a linear tech-age progression gated through KubeJS recipes.
Working directory for all script work: `create-skylanders/kubejs/`

## Key mods
| Mod | Role |
|-----|------|
| Create | Core automation: shafts, cogwheels, mechanical press, mixer, fans, pipes, fluid tanks |
| TFMG (The Factory Must Grow) | Industrial Blast Furnace (IBF), casting basin, coke oven, air intake, blast stove |
| Rubberworks | Compressor, rubber production |
| Aeronautics | Wooden propeller (used in copper-age air intake) |
| KubeJS | All custom recipe gates and items |

## Age progression

### Age 1 — Zinc Age (starting age)
- **Zinc** is the starting metal; all zinc smelting/crushing uses Create/vanilla defaults untouched.
- Gate: craft **fireclay** (clay + 2 sand + charcoal) → smelt to **fireproof bricks** → unlock TFMG blast furnace components.
- **Copper** is deliberately inefficient at this tier:
  - Millstone: coal or charcoal → `kubejs:carbon_dust`
  - Shapeless: crushed copper + carbon dust → `kubejs:unrefined_copper_blend`
  - Smelt blend → **3 copper nuggets** (vs 9/ingot) — forces IBF automation.

### Age 2 — Copper Age
- **IBF** is the automation centrepiece.
- Gate: build **coke oven** (iron + fireproof bricks + fluid pipe + copper sheet) to get `tfmg:coal_coke`.
  - `tfmg:coal_coke` → millstone → `tfmg:coal_coke_dust` (IBF fuel/input).
- Gate: build **air intake** (shaft + wooden propeller + fluid pipe + cogwheels + copper sheet + andesite bars).
- Gate: build **blast stove** (fluid pipe + fluid tank + fireproof bricks).
- IBF recipe: `create:crushed_raw_copper` → `kubejs:molten_copper` (144 mb).
- Cast: `kubejs:molten_copper` (144 mb) → `minecraft:copper_ingot`.
- **Copper hammer** (`kubejs:copper_hammer`, 128 durability, `forge:hammers` tag):
  - Recipe: 6 copper ingots + stick.
  - Use: 2 copper ingots + hammer → `create:copper_sheet` (hammer loses 1 durability).
- **Compressor** (Rubberworks): shaft + andesite alloy block + copper block.
- **Brass** is available via Create defaults but naturally gated — the mixer requires a heat source (blaze burner) which isn't accessible until a later age.
- **Mechanical press** is iron age — gates copper casing, fans, mechanical pump.
- **Item vault** is iron age (iron plates + wooden barrel).

### Age 3 — Iron Age
- Vanilla iron smelting/blasting is fully removed — the only paths to iron ingots are the two IBF routes below.
- **Item vault** gated behind `#c:plates/iron`.
- Mechanical press available here → unlocks copper casing → fans, pumps, encased pipes.

#### Iron processing — Bootstrap path (inefficient, no full machine setup required)
Uses the IBF but yields only 1/3 of an ingot per run — forces automation.
1. Millstone: `minecraft:raw_iron` → `create:crushed_raw_iron`
2. Shapeless: `create:crushed_raw_iron` + `kubejs:carbon_dust` → `kubejs:iron_carbon_mix`
3. IBF: `kubejs:iron_carbon_mix` → **48 mb** `kubejs:molten_iron` (1/3 ingot — inefficient by design)
4. Casting basin: 144 mb `kubejs:molten_iron` → `minecraft:iron_ingot`

#### Iron processing — Full IBF line (efficient, GregTech-style multi-step)
1. Millstone: `minecraft:raw_iron` → `create:crushed_raw_iron`
2. Fan + water (splashing): `create:crushed_raw_iron` → `kubejs:washed_crushed_raw_iron` (+ 25% chance iron nugget)
3. Millstone: `kubejs:washed_crushed_raw_iron` → `kubejs:iron_dust`
4. Shapeless: `kubejs:iron_dust` + `tfmg:coal_coke_dust` → `kubejs:purified_iron_carbon_mix`
5. Fan + fire (smoking): `kubejs:purified_iron_carbon_mix` → `kubejs:sintered_iron_mix`
6. IBF: `kubejs:sintered_iron_mix` → **144 mb** `kubejs:molten_iron`
7. Casting basin: 144 mb `kubejs:molten_iron` → `minecraft:iron_ingot`

### Age 4 — Diamond Age
- Vanilla diamond ore drops and smelting fully removed — drops `kubejs:raw_diamond` instead.
- **Diamond processing line** (6-step, requires Nether access for blaze burner):
  1. Mechanical saw: `kubejs:raw_diamond` → `kubejs:diamond_fragments`
  2. Heated mixing: fragments + 500mb water → `kubejs:washed_diamond_fragments` (needs blaze burner)
  3. Mixing: washed fragments + 1000mb lava → 500mb `kubejs:diamond_slurry`
  4. Rubberworks compressor (heated): 500mb slurry → `kubejs:rough_diamond`
  5. Sandpaper polishing (deployer): `kubejs:rough_diamond` → `minecraft:diamond`
- **TFMG oil machines** are gated naturally — their default recipes use steel components, and steel is locked behind the Advanced IBF (Age 5).

### Age 5 — Advanced Metals
- **Advanced IBF** (mod `skylandersmeteors`, built with diamonds) is the only path to all late-game metals.
- Custom recipe type: `skylandersmeteors:advanced_industrial_blasting`. The Advanced IBF can also run normal `tfmg:industrial_blasting` recipes (copper, iron) — faster than the basic IBF.
- Default smelting/blasting/vat paths removed for every metal in this age.
- **Steel**: crushed_raw_iron / iron_dust / raw_iron + flux → `tfmg:molten_steel` (+ slag + furnace gas). Arc-furnace vat bypass also closed.
- **Lead / Lithium / Nickel**: raw → 288 mb molten (2 ingots), crushed → 144 mb molten (1 ingot). Cast to ingot.
- **Aluminum**: 2× `tfmg:bauxite_powder` → 144 mb `kubejs:molten_aluminum` + 250 mb CO₂. Cast to ingot. (Recipe type caps at 2 item inputs — see [[project-advanced-ibf]].)
- **Silicon**: `minecraft:quartz` → 40 mb `tfmg:liquid_silicon` (existing TFMG fluid, used downstream — no basin step).
- Cast iron remains iron-age accessible via heated compacting in a basin — intentionally not gated.

## Custom items & fluids (foundry_startup.js)
| ID | Display name | Notes |
|----|-------------|-------|
| `kubejs:unrefined_copper_blend` | Unrefined Copper Blend | Gunpowder texture, orange tint (`0xFF7A59`) |
| `kubejs:carbon_dust` | Carbon Dust | Gunpowder texture, near-black tint (`0x202020`) |
| `kubejs:copper_hammer` | Copper Hammer | Custom 16×16 texture, 128 durability, `forge:hammers` |
| `kubejs:molten_copper` (fluid) | Molten Copper | Lava texture, orange tint (`0xFF7A59`) |
| `kubejs:iron_carbon_mix` | Iron Carbon Mix | Gunpowder texture, dark brown tint (`0x3D2E28`) |
| `kubejs:washed_crushed_raw_iron` | Washed Crushed Raw Iron | Crushed zinc texture, silver tint (`0xC0C0C0`) |
| `kubejs:iron_dust` | Iron Dust | Gunpowder texture, gray tint (`0x8A8A8A`) |
| `kubejs:purified_iron_carbon_mix` | Purified Iron Carbon Mix | Gunpowder texture, dark tint (`0x2E2E2E`) |
| `kubejs:sintered_iron_mix` | Sintered Iron Mix | Gunpowder texture, near-black tint (`0x1A1A1A`) |
| `kubejs:molten_iron` (fluid) | Molten Iron | Lava texture, yellow-orange tint (`0xFFA020`) |
| `kubejs:raw_diamond` | Raw Diamond | Raw iron texture, diamond blue tint (`0x4AEDD9`) |
| `kubejs:diamond_fragments` | Diamond Fragments | Gunpowder texture, light cyan tint (`0x6CF0E0`) |
| `kubejs:washed_diamond_fragments` | Washed Diamond Fragments | Gunpowder texture, bright cyan tint (`0x8CF8F0`) |
| `kubejs:rough_diamond` | Rough Diamond | Diamond texture, dull green-blue tint (`0x9ABEAA`) |
| `kubejs:diamond_slurry` (fluid) | Diamond Slurry | Lava texture, teal tint (`0x5BC0B0`) |
| `kubejs:molten_lead` (fluid) | Molten Lead | Lava texture, dull blue-grey (`0x6B7A8C`) |
| `kubejs:molten_lithium` (fluid) | Molten Lithium | Lava texture, pale pinkish silver (`0xD4C8D8`) |
| `kubejs:molten_nickel` (fluid) | Molten Nickel | Lava texture, pale gold-green (`0xE0DAA0`) |
| `kubejs:molten_aluminum` (fluid) | Molten Aluminum | Lava texture, light bluish silver (`0xD8D8DE`) |

## File map
One server script per age. Higher priority runs first, so removals from a later
age can override an earlier age's recipe if needed.

| File | Purpose | Priority |
|------|---------|----------|
| `startup_scripts/foundry_startup.js` | Item + fluid registration | startup |
| `server_scripts/zinc_age.js` | Andesite alloy, aeronautics, zinc machines, TFMG foundry shell (fireclay → blast furnace + casting basin) | 110 |
| `server_scripts/copper_age.js` | Copper bootstrap blend, carbon/coke dusts, IBF infrastructure (air intake, blast stove, coke oven), molten copper + casting, copper hammer/sheet, Rubberworks compressor | 100 |
| `server_scripts/iron_age.js` | Item vault gate, full iron processing line (bootstrap + IBF), obsidian via mixing | 90 |
| `server_scripts/diamond_age.js` | Raw diamond drop + 5-step diamond processing line | 80 |
| `server_scripts/steel_age.js` | Advanced IBF metals: steel, lead, lithium, nickel, aluminum, silicon (all default paths removed) | 70 |

## Assets
- `assets/kubejs/textures/item/copper_hammer.png` — hand-drawn 16×16 pixel art
- `assets/kubejs/models/item/copper_hammer.json` — `minecraft:item/handheld` parent
- `assets/tfmg/textures/block/air_intake/` — copper-tinted air intake block textures (generated by `tools/tint_air_intake.py`)
- `tools/gen_hammer_texture.py` — generates the copper hammer PNG

## Coding conventions
- **Rhino (ES5) only** — no ES6 shorthand properties (`{ id }` → `{ id: id }`), no arrow functions inside `.forEach` (use `function(x) {}`).
- **Recipe IDs**: `kubejs:age{N}/{recipe_name}` where N is the age number.
- **Textures**: reuse existing textures with `.texture('ns:path').color(layer, 0xRRGGBB)` rather than generating new PNGs. Only generate a PNG when the shape needs to differ.
- **Comments**: explain WHY (a design constraint, a gate reason), not WHAT the code does.
- **No fallback smelting for copper or iron** — vanilla smelting is explicitly removed for both metals; the only paths are the KubeJS-gated processing lines.
- **Create KubeJS recipe API (1.21.1)**:
  - Fan washing → `event.recipes.create.splashing(outputs[], input)`
  - Fan smoking → `event.recipes.create.smoking(outputs[], input)`
  - Millstone → `event.recipes.create.milling(outputs[], input)`
  - Chance outputs → `Item.of('item_id').withChance(0.0–1.0)` (NOT `CreateItem.of()`)
  - KubeJS items as milling inputs require `event.custom({ type: 'create:milling', ... })` — the `.milling()` binding rejects them.
  - `event.custom({ type: 'create:fan_washing' })` does not work — use `.splashing()` binding instead.
