// priority: 50

// Renewable ore via Create: Ore Excavation. Veins are one-per-chunk infinite data (sky-island
// safe — drill from the surface, nothing below needed). Tiered drills gate access; water is the
// upkeep fluid (no power as a cost lever — stress kept minimal); a slow base tick rate means you
// need several drills for real throughput. Default COE veins/drills are wiped in
// drilling_defaults.js (priority 60) so this is the ONLY ore source.
// See memory project-distant-ores-meteors for the full design + decisions.
//
// Tier map (drill -> veins). Only the Copper Drill is custom; the rest are the mod's OWN drills. Each
// metal needs the NEXT drill up (copper→Iron Drill, iron→Diamond Drill, diamond→Netherite Drill).
//   kubejs:copper_drill                 : zinc
//   createoreexcavation:drill ("Iron")  : copper, gold, redstone, lapis
//   createoreexcavation:diamond_drill   : iron, sulfur*, quartz*, glowstone*
//   createoreexcavation:netherite_drill : lead, nickel, lithium, bauxite, diamond, netherite*
// * = NETHER vein (biomeWhitelist minecraft:is_nether); everything else is OVERWORLD. COE generates in
// both dimensions; the biome tag is the only dimension control (no separate dimension field). The helper
// derives the upkeep fluid from the biome — lava for nether veins, water for overworld.
//
// Rate: ticks = extraction time per unit at 32 RPM (~7.5s if maxed to 256 RPM). 1200 = ~60s/unit,
// scaled up for rarer/late metals. Placement = (spacing, separation, salt) in chunks; lower spacing
// = more common (important on sparse sky islands where void chunks can't host a machine).
// Fluid: water for every tier for now — trivially renewable so the upkeep is "needs a water hookup".
// Late tiers can be hardened to a costlier coolant later IF a renewable lava/lubricant source exists.

ServerEvents.recipes(event => {
    const coe = event.recipes.createoreexcavation;

    // Separation = minimum gap between same-metal veins, and it shapes the SCATTER: each vein sits at
    // a random offset in [0, spacing - separation) within its cell, so a HIGH separation pins them near
    // a cell corner → regular grid / "lined up" look; LOWER separation widens the range → more scattered.
    // Decoupled from spacing so we can scatter without changing rarity. Must stay < spacing (128).
    const VEIN_SEPARATION = 16;

    // Helper: one infinite vein + its drilling recipe, sharing an id stem.
    // (Same-salt collision was tested 2026-06-14 to get one-vein-per-cell with random metals — it
    // does NOT work: COE resolves equal-priority overlaps deterministically by registration order,
    // so every cell became the last-registered metal. Per-metal grids it is.)
    function drillVein(name, output, salt, spacing, drill, ticks, idStem, biome) {
        // nether veins run on lava (abundant there), overworld veins on water.
        var fluid = (biome.indexOf('nether') >= 0) ? 'minecraft:lava' : 'minecraft:water';
        coe.vein('{"text":"' + name + '"}', output)
            .placement(spacing, VEIN_SEPARATION, salt)
            .biomeWhitelist(biome)
            .alwaysInfinite()
            .id('kubejs:vein/' + idStem);
        coe.drilling(output, 'kubejs:vein/' + idStem, ticks)
            .drill(drill)
            .fluid(fluid)
            .stress(16)
            .id('kubejs:drilling/' + idStem);
    }

    var OW = 'minecraft:is_overworld';
    var NETHER = 'minecraft:is_nether';

    // Uniform spacing 128; separation lowered (VEIN_SEPARATION) to scatter. Last arg = biome.
    // ── Tier 1: Copper Drill (custom) ──
    drillVein('Zinc Vein', 'create:raw_zinc', 73101, 128, 'kubejs:copper_drill', 1200, 'zinc', OW);

    // ── Tier 2: mod Iron Drill (createoreexcavation:drill) ──
    drillVein('Copper Vein',   'minecraft:raw_copper',   73102, 128, 'createoreexcavation:drill', 1200, 'copper', OW);
    drillVein('Gold Vein',     'minecraft:raw_gold',     73104, 128, 'createoreexcavation:drill', 1600, 'gold', OW);
    drillVein('Redstone Vein', 'minecraft:redstone',     73105, 128, 'createoreexcavation:drill', 1000, 'redstone', OW);
    drillVein('Lapis Vein',    'minecraft:lapis_lazuli', 73106, 128, 'createoreexcavation:drill', 1000, 'lapis', OW);

    // ── Tier 3: mod Diamond Drill ── (overworld iron + the nether trio)
    drillVein('Iron Vein',      'minecraft:raw_iron',       73103, 128, 'createoreexcavation:diamond_drill', 1200, 'iron', OW);
    drillVein('Sulfur Vein',    'tfmg:sulfur',              73112, 128, 'createoreexcavation:diamond_drill', 1500, 'sulfur', NETHER);
    drillVein('Quartz Vein',    'minecraft:quartz',         73113, 128, 'createoreexcavation:diamond_drill', 1400, 'quartz', NETHER);
    drillVein('Glowstone Vein', 'minecraft:glowstone_dust', 73114, 128, 'createoreexcavation:diamond_drill', 1200, 'glowstone', NETHER);

    // ── Tier 4: mod Netherite Drill ──
    drillVein('Lead Vein',      'tfmg:raw_lead',            73108, 128, 'createoreexcavation:netherite_drill', 2400, 'lead', OW);
    drillVein('Nickel Vein',    'tfmg:raw_nickel',          73109, 128, 'createoreexcavation:netherite_drill', 2400, 'nickel', OW);
    drillVein('Lithium Vein',   'tfmg:raw_lithium',         73110, 128, 'createoreexcavation:netherite_drill', 2400, 'lithium', OW);
    drillVein('Bauxite Vein',   'tfmg:bauxite',             73111, 128, 'createoreexcavation:netherite_drill', 2000, 'bauxite', OW);
    drillVein('Diamond Vein',   'kubejs:raw_diamond',       73107, 128, 'createoreexcavation:netherite_drill', 4000, 'diamond', OW);
    drillVein('Netherite Vein', 'minecraft:ancient_debris', 73115, 128, 'createoreexcavation:netherite_drill', 6000, 'netherite', NETHER);

    // ── Copper Drill recipe — the only custom drill (vertical drill shape). The iron / diamond /
    // netherite tiers use the mod's own drills with their default recipes (kept in drilling_defaults.js). ──
    event.shaped('kubejs:copper_drill', [' C ', ' A ', ' I '], {
        C: 'create:copper_sheet', A: 'create:andesite_alloy', I: 'create:shaft'
    }).id('kubejs:age2/copper_drill');

    // ── Drilling Machine re-gated to COPPER age ──
    // The mod's default recipe is mechanical-crafted and needs brass (brass age). The drilling
    // system belongs to the copper age, so the default is removed (drilling_defaults.js) and replaced
    // with a plain copper-tier crafting recipe: copper casings (copper ingot on a stripped log),
    // fluid pipes, shafts (rotation) and a fluid tank core that buffers the drilling fluid — no
    // brass, no mechanical crafter.
    event.shaped('createoreexcavation:drilling_machine', [
        'CSC',
        'PTP',
        'CSC'
    ], {
        C: 'create:copper_casing',
        P: 'create:fluid_pipe',
        S: 'create:shaft',
        T: 'create:fluid_tank'
    }).id('kubejs:age2/drilling_machine');

    // ── Prospector's Radar (coebetterfinder) re-gated to COPPER age ──
    // Default needs an ender eye (Nether) + redstone (iron tier) — far too late for a tool whose whole
    // job is scouting copper/zinc veins. Removed in drilling_defaults.js; this cheap copper-tier recipe
    // (amethyst sensor crystal + copper body + andesite mechanism) makes it craftable as soon as copper
    // smelting works.
    event.shaped('coebetterfinder:radar_prospecteur', [
        ' A ',
        'CIC',
        ' S '
    ], {
        A: '#c:gems/amethyst',
        C: 'minecraft:copper_ingot',
        I: 'create:andesite_alloy',
        S: '#c:rods/wooden'
    }).id('kubejs:age2/radar_prospecteur');
});
