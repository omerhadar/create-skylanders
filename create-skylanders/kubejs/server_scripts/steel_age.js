// priority: 70

// Age 5 — Advanced Metals
// The Advanced IBF (diamond-gated) is the only path to every late-game metal:
// steel, aluminum, lead, lithium, nickel, silicon.
// Every default smelting / blasting / vat-machine path for these metals is removed
// and re-added as `skylandersmeteors:advanced_industrial_blasting`, which only the
// Advanced IBF block can process. The basic IBF stays useful for copper + iron;
// the Advanced IBF runs basic recipes faster AND exclusively runs the new ones.
//
// Cast iron is iron-age accessible (heated compacting in basin) — intentionally
// left untouched so iron-age machines stay buildable without diamonds.

// Helper: TFMG/NeoForge fluid result shape
function moltenResult(fluid, amount) {
    return { id: fluid, amount: amount };
}

function fluidIngredient(fluid, amount) {
    return { type: 'neoforge:single', fluid: fluid, amount: amount };
}

// Helper: build an advanced_industrial_blasting recipe.
// `results` should be an array of result objects (use moltenResult for fluids).
function advancedBlast(event, id, ingredients, results, processingTime, hotAirUsage) {
    event.custom({
        type: 'skylandersmeteors:advanced_industrial_blasting',
        hot_air_usage: hotAirUsage,
        processing_time: processingTime,
        ingredients: ingredients,
        results: results
    }).id(id);
}

// Helper: build a TFMG casting basin recipe (molten fluid → ingot)
function castIngot(event, id, fluid, ingotId) {
    event.custom({
        type: 'tfmg:casting',
        ingredients: [fluidIngredient(fluid, 144)],
        results: [{ id: ingotId }],
        processing_time: 100
    }).id(id);
}

ServerEvents.recipes(function (event) {
    // ──────────────────────────────────────────────────────────
    // STEEL — already gated; arc furnace bypass also closed.
    // ──────────────────────────────────────────────────────────
    event.remove({ id: 'tfmg:industrial_blasting/steel' });
    event.remove({ id: 'tfmg:industrial_blasting/steel_from_dust' });
    event.remove({ id: 'tfmg:industrial_blasting/steel_from_raw_iron' });
    event.remove({ id: 'tfmg:vat_machine_recipe/arc_furnace_steel' });

    advancedBlast(event, 'kubejs:age5/advanced_blasting_steel',
        [{ item: 'create:crushed_raw_iron' }, { tag: 'tfmg:flux' }],
        [
            moltenResult('tfmg:molten_steel', 144),
            moltenResult('tfmg:molten_slag', 144),
            moltenResult('tfmg:furnace_gas', 200)
        ], 20, 20);

    advancedBlast(event, 'kubejs:age5/advanced_blasting_steel_from_dust',
        [{ tag: 'c:dusts/iron' }, { tag: 'tfmg:flux' }],
        [
            moltenResult('tfmg:molten_steel', 144),
            moltenResult('tfmg:molten_slag', 144),
            moltenResult('tfmg:furnace_gas', 20)
        ], 20, 20);

    advancedBlast(event, 'kubejs:age5/advanced_blasting_steel_from_raw_iron',
        [{ item: 'minecraft:raw_iron' }, { tag: 'tfmg:flux' }],
        [
            moltenResult('tfmg:molten_steel', 288),
            moltenResult('tfmg:molten_slag', 288),
            moltenResult('tfmg:furnace_gas', 200)
        ], 40, 40);

    // ──────────────────────────────────────────────────────────
    // LEAD / LITHIUM / NICKEL — same shape: raw ore + crushed ore variants.
    // Vanilla smelting + blasting + the TFMG "from-crushed blasting" all removed.
    // Crushed → 144mb (1 ingot); raw → 288mb (2 ingots) — the 2× reward over
    // the old smelting yield makes Advanced IBF clearly worth the build.
    // ──────────────────────────────────────────────────────────
    // Crushed-raw namespace quirk: TFMG ships crushed_raw_lithium itself, but lead and
    // nickel come from Create. Don't normalize — these are the actual item IDs.
    var basicMetals = [
        { name: 'lead',    raw: 'tfmg:raw_lead',    crushed: 'create:crushed_raw_lead',    ingot: 'tfmg:lead_ingot',    molten: 'kubejs:molten_lead' },
        { name: 'lithium', raw: 'tfmg:raw_lithium', crushed: 'tfmg:crushed_raw_lithium',   ingot: 'tfmg:lithium_ingot', molten: 'kubejs:molten_lithium' },
        { name: 'nickel',  raw: 'tfmg:raw_nickel',  crushed: 'create:crushed_raw_nickel',  ingot: 'tfmg:nickel_ingot',  molten: 'kubejs:molten_nickel' }
    ];

    basicMetals.forEach(function (m) {
        event.remove({ id: 'tfmg:smelting/' + m.name + '_ingot' });
        event.remove({ id: 'tfmg:smelting/' + m.name + '_ingot_blasting' });
        event.remove({ id: 'tfmg:smelting/' + m.name + '_ingot_from_crushed_blasting' });

        advancedBlast(event, 'kubejs:age5/advanced_blasting_' + m.name + '_from_raw',
            [{ item: m.raw }],
            [moltenResult(m.molten, 288)],
            40, 40);

        advancedBlast(event, 'kubejs:age5/advanced_blasting_' + m.name + '_from_crushed',
            [{ item: m.crushed }],
            [moltenResult(m.molten, 144)],
            20, 20);

        castIngot(event, 'kubejs:age5/casting_' + m.name + '_ingot', m.molten, m.ingot);
    });

    // ──────────────────────────────────────────────────────────
    // ALUMINUM — was a vat machine recipe; moved to Advanced IBF.
    // The recipe type caps at 2 item ingredients, so we use 2× bauxite_powder → 1 ingot
    // (vs the old vat's 4 powder → 1 ingot). The 2× efficiency over the old path is
    // the "Advanced IBF is worth the build" reward.
    // ──────────────────────────────────────────────────────────
    event.remove({ id: 'tfmg:vat_machine_recipe/aluminum' });

    advancedBlast(event, 'kubejs:age5/advanced_blasting_aluminum',
        [
            { item: 'tfmg:bauxite_powder' },
            { item: 'tfmg:bauxite_powder' }
        ],
        [
            moltenResult('kubejs:molten_aluminum', 144),
            moltenResult('tfmg:carbon_dioxide', 250)
        ], 100, 40);

    castIngot(event, 'kubejs:age5/casting_aluminum_ingot',
        'kubejs:molten_aluminum', 'tfmg:aluminum_ingot');

    // ──────────────────────────────────────────────────────────
    // SILICON — already a fluid (`tfmg:liquid_silicon`), no basin step needed.
    // Just move the recipe from normal IBF to Advanced IBF, same yield.
    // ──────────────────────────────────────────────────────────
    event.remove({ id: 'tfmg:industrial_blasting/silicon' });

    advancedBlast(event, 'kubejs:age5/advanced_blasting_silicon',
        [{ item: 'minecraft:quartz' }],
        [moltenResult('tfmg:liquid_silicon', 40)],
        5, 5);
});
