// priority: 100

ServerEvents.recipes(event => {
    const { shaped, shapeless, smelting, recipes } = event;

    // ── Age 1 (Zinc Age): gate TFMG components behind fireclay/fireproof bricks ──

    // Remove default TFMG crafting so our gated recipes are the only path
    [
        'tfmg:crafting/fireclay_ball',
        'tfmg:crafting/fireproof_bricks',
        'tfmg:crafting/blast_furnace_output',
        'tfmg:crafting/blast_furnace_hatch',
        'tfmg:crafting/casting_basin'
    ].forEach(id => event.remove({ id: id }));

    // Fireclay: hand-mixed (clay + sand + charcoal) or basin-mixed
    shapeless('4x tfmg:fireclay_ball', [
        'minecraft:clay_ball',
        'minecraft:sand',
        'minecraft:sand',
        'minecraft:charcoal'
    ]).id('kubejs:age1/manual_fireclay');

    recipes.create.mixing('4x tfmg:fireclay_ball', [
        'minecraft:clay_ball',
        '2x minecraft:sand',
        'minecraft:charcoal'
    ]).id('kubejs:age1/mixing_fireclay');

    // Fireproof brick → slab assembly
    smelting('tfmg:fireproof_brick', 'tfmg:fireclay_ball').id('kubejs:age1/smelting_firebrick');

    shaped('tfmg:fireproof_bricks', [
        'BB',
        'BB'
    ], { B: 'tfmg:fireproof_brick' }).id('kubejs:age1/fireproof_bricks');

    // Blast furnace components require fireproof bricks + Create andesite
    shaped('tfmg:blast_furnace_hatch', [
        ' B ',
        'BAB',
        ' B '
    ], {
        B: 'tfmg:fireproof_bricks',
        A: 'create:andesite_alloy'
    }).id('kubejs:age1/blast_furnace_hatch');

    shaped('tfmg:blast_furnace_output', [
        ' B ',
        'BZB',
        ' B '
    ], {
        B: 'tfmg:fireproof_bricks',
        Z: '#c:storage_blocks/zinc'
    }).id('kubejs:age1/blast_furnace_output');

    shaped('tfmg:casting_basin', [
        'B B',
        'B B',
        'BAB'
    ], {
        B: 'tfmg:fireproof_bricks',
        A: 'create:andesite_alloy'
    }).id('kubejs:age1/casting_basin');

    // ── Age 2 (Copper Age): hot-air infrastructure for the Industrial Blast Furnace ──

    // Air intake and blast stove default recipes removed — copper-age recipes below require
    // Create fluid handling instead of industrial iron
    event.remove({ id: 'tfmg:crafting/materials/air_intake' });
    event.remove({ id: 'tfmg:crafting/materials/blast_stove' });
    event.remove({ output: 'tfmg:air_intake' });
    event.remove({ output: 'tfmg:blast_stove' });

    // Air intake: wooden propeller + fluid pipe (no fan or industrial iron required)
    shaped('2x tfmg:air_intake', [
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
    shaped('2x tfmg:blast_stove', [
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
    event.remove({ output: 'tfmg:coke_oven' });

    shaped('tfmg:coke_oven', [
        'III',
        'IFI',
        'PCP'
    ], {
        I: 'minecraft:iron_ingot',
        F: 'tfmg:fireproof_bricks',
        P: 'create:fluid_pipe',
        C: 'create:copper_sheet'
    }).id('kubejs:age2/coke_oven');
});

// Helper constructors for TFMG custom recipe JSON
function fluidIngredient(fluid, amount) {
    return { type: 'neoforge:single', fluid: fluid, amount: amount };
}

function fluidResult(fluid, amount) {
    return { id: fluid, amount: amount };
}

ServerEvents.recipes(event => {
    const { shaped, shapeless } = event;

    // ── Age 2 (Copper Age): Industrial Blast Furnace smelting + casting ──

    // Crushed copper ore → molten copper via IBF
    event.custom({
        type: 'tfmg:industrial_blasting',
        ingredients: [{ item: 'create:crushed_raw_copper' }],
        results: [fluidResult('kubejs:molten_copper', 144)],
        processing_time: 200,
        hot_air_usage: 1
    }).id('kubejs:age2/industrial_blasting_copper');

    // Molten copper → ingot via casting basin
    event.custom({
        type: 'tfmg:casting',
        ingredients: [fluidIngredient('kubejs:molten_copper', 144)],
        results: [{ id: 'minecraft:copper_ingot' }],
        processing_time: 100
    }).id('kubejs:age2/casting_copper_ingot');

    // ── Copper Hammer: crafting tool for sheet production ──

    shaped('kubejs:copper_hammer', [
        'CCC',
        'CCC',
        ' S '
    ], {
        C: 'minecraft:copper_ingot',
        S: 'minecraft:stick'
    }).id('kubejs:age2/copper_hammer');

    // Hammer takes 1 durability per sheet; accepts any forge:hammers item in the slot
    shapeless('create:copper_sheet', [
        '2x minecraft:copper_ingot',
        '#forge:hammers'
    ]).damageIngredient('kubejs:copper_hammer', 1)
      .id('kubejs:age2/copper_sheet_hammer');
});
