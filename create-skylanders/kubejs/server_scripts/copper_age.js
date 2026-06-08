// priority: 100

// Age 2 — Copper Age
// Two parallel paths exist:
//   1. Bootstrap: crushed copper + carbon dust → smelt → 3 nuggets (1/3 ingot).
//      Intentionally inefficient to push the player toward IBF automation.
//   2. IBF line: crushed copper → molten copper (144 mb) → cast → ingot.
// Plus the infrastructure recipes for getting an IBF online: air intake, blast
// stove, coke oven, copper hammer/sheet, and the Rubberworks compressor.

// Helper constructors for TFMG custom recipe JSON
function copperFluidIngredient(fluid, amount) {
    return { type: 'neoforge:single', fluid: fluid, amount: amount };
}

function copperFluidResult(fluid, amount) {
    return { id: fluid, amount: amount };
}

ServerEvents.recipes(function (event) {
    // ── Block all vanilla bypass paths to copper; bootstrap blend + IBF are the only paths ──
    var copperOres = [
        'minecraft:raw_copper',
        'create:crushed_raw_copper',
        'minecraft:copper_ore',
        'minecraft:deepslate_copper_ore'
    ];
    copperOres.forEach(function (ore) {
        event.remove({ type: 'minecraft:smelting', input: ore });
        event.remove({ type: 'minecraft:blasting', input: ore });
    });

    // Default fan-washing crushed copper gives 9 nuggets (= 1 ingot) — full IBF bypass
    event.remove({ id: 'create:splashing/crushed_raw_copper' });

    // Default pressing copper_ingot → copper_sheet bypasses the hammer.
    // The hammer is the ONLY sheet path so the copper-age investment matters even after press unlocks.
    event.remove({ id: 'create:pressing/copper_ingot' });

    // ── Millstone: fuels and dusts ──
    event.recipes.create.milling(['kubejs:carbon_dust'], 'minecraft:coal')
        .id('kubejs:age2/milling_coal_to_carbon');
    event.recipes.create.milling(['kubejs:carbon_dust'], 'minecraft:charcoal')
        .id('kubejs:age2/milling_charcoal_to_carbon');
    event.recipes.create.milling(['tfmg:coal_coke_dust'], 'tfmg:coal_coke')
        .id('kubejs:age2/milling_coke_to_dust');

    // ── Bootstrap path: crushed copper + carbon dust → 3 copper nuggets ──
    event.shapeless('kubejs:unrefined_copper_blend',
        ['create:crushed_raw_copper', 'kubejs:carbon_dust']
    ).id('kubejs:age2/unrefined_copper_blend');

    event.smelting('3x create:copper_nugget', 'kubejs:unrefined_copper_blend')
        .id('kubejs:age2/smelting_copper_blend');

    // ── IBF infrastructure ──

    // Air intake: drop the iron sheet requirement; uses fluid pipe + propeller
    event.remove({ id: 'tfmg:crafting/materials/air_intake' });
    event.shaped('2x tfmg:air_intake', [
        'SPT',
        'GCG',
        ' B '
    ], {
        S: 'create:shaft',
        P: 'aeronautics:wooden_propeller',
        T: 'create:fluid_pipe',
        G: 'create:cogwheel',
        C: 'create:copper_sheet',
        B: 'create:andesite_bars'
    }).id('kubejs:age2/air_intake');

    // Blast stove: heats air for the IBF; gated behind fluid tank
    event.remove({ id: 'tfmg:crafting/materials/blast_stove' });
    event.shaped('2x tfmg:blast_stove', [
        'PP ',
        'TT ',
        'FF '
    ], {
        P: 'create:fluid_pipe',
        T: 'create:fluid_tank',
        F: 'tfmg:fireproof_bricks'
    }).id('kubejs:age2/blast_stove');

    // Coke oven: produces creosote and coal coke for the IBF + blast stove
    event.remove({ id: 'tfmg:crafting/materials/coke_oven' });
    event.shaped('tfmg:coke_oven', [
        'III',
        'IFI',
        'PCP'
    ], {
        I: 'minecraft:iron_ingot',
        F: 'tfmg:fireproof_bricks',
        P: 'create:fluid_pipe',
        C: 'create:copper_sheet'
    }).id('kubejs:age2/coke_oven');

    // ── IBF + casting: efficient copper path ──
    event.custom({
        type: 'tfmg:industrial_blasting',
        ingredients: [{ item: 'create:crushed_raw_copper' }],
        results: [copperFluidResult('kubejs:molten_copper', 144)],
        processing_time: 200,
        hot_air_usage: 1
    }).id('kubejs:age2/industrial_blasting_copper');

    event.custom({
        type: 'tfmg:casting',
        ingredients: [copperFluidIngredient('kubejs:molten_copper', 144)],
        results: [{ id: 'minecraft:copper_ingot' }],
        processing_time: 100
    }).id('kubejs:age2/casting_copper_ingot');

    // ── Copper hammer: durability-based tool for sheet production ──
    event.shaped('kubejs:copper_hammer', [
        'CCC',
        'CCC',
        ' S '
    ], {
        C: 'minecraft:copper_ingot',
        S: 'minecraft:stick'
    }).id('kubejs:age2/copper_hammer');

    // Hammer takes 1 durability per sheet; accepts any forge:hammers item
    event.shapeless('create:copper_sheet', [
        '2x minecraft:copper_ingot',
        '#forge:hammers'
    ]).damageIngredient('kubejs:copper_hammer', 1)
      .id('kubejs:age2/copper_sheet_hammer');

    // ── Rubberworks compressor: gated behind copper block + andesite alloy ──
    event.remove({ id: 'rubberworks:crafting/compressor' });
    event.shaped('rubberworks:compressor', [
        ' S ',
        ' P ',
        ' F '
    ], {
        P: 'create:andesite_alloy_block',
        S: 'create:shaft',
        F: 'minecraft:copper_block'
    }).id('kubejs:age2/rubberworks_compressor');

    // ── Better Copper unification: collapse bettercopper:copper_nugget into create:copper_nugget ──
    // Both mods ship their own copper_nugget item; this leaves create's as canonical.
    // Duplicate ingot↔nugget conversions (Create already covers this path):
    event.remove({ id: 'bettercopper:copper_ingots' });
    event.remove({ id: 'bettercopper:copper_nugget_from_copper_ingot' });

    // Reroute the 10 armor/tool blasting-recovery recipes to drop create:copper_nugget instead.
    var bcItems = ['axe','boots','chestplate','helmet','hoe','horse','leggings','pickaxe','shovel','sword'];
    bcItems.forEach(function (kind) {
        var oldId = 'bettercopper:copper_nugget_from_blasting_' + kind;
        event.remove({ id: oldId });
        var inputItem = 'bettercopper:copper_' + (kind === 'horse' ? 'horse_armor' : kind);
        event.custom({
            type: 'minecraft:blasting',
            ingredient: { item: inputItem },
            result: { id: 'create:copper_nugget' },
            experience: 0.7,
            cookingtime: 100
        }).id('kubejs:age2/bc_blast_' + kind);
    });

    // Legacy rescue: anyone with bettercopper:copper_nugget in inventory can convert 1:1.
    event.shapeless('create:copper_nugget', ['bettercopper:copper_nugget'])
        .id('kubejs:age2/bc_nugget_legacy_convert');
});
