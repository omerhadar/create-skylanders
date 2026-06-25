// priority: 90

ServerEvents.recipes(event => {
    var shaped = event.shaped;
    var shapeless = event.shapeless;

    // ── Remove vanilla iron smelting — forces the processing line ──
    var ironOres = [
        'minecraft:raw_iron',
        'create:crushed_raw_iron',
        'minecraft:iron_ore',
        'minecraft:deepslate_iron_ore'
    ];
    ironOres.forEach(function(ore) {
        event.remove({ type: 'minecraft:smelting', input: ore });
        event.remove({ type: 'minecraft:blasting', input: ore });
    });

    // ── Iron age: gate bulk item storage behind iron plates ──
    event.remove({ id: 'create:crafting/kinetics/item_vault' });

    // Simpler recipe than default — requires iron plates instead of iron blocks
    shaped('create:item_vault', [
        'P',
        'C',
        'P'
    ], {
        P: '#c:plates/iron',
        C: '#c:barrels/wooden'
    }).id('kubejs:age3/item_vault');

    // ── Bootstrap path: get first iron ingots before IBF is set up ──
    // Crushed raw iron comes from the millstone (see milling recipe below)

    // Crushed iron + carbon dust → IBF-ready mix (bootstrap path, inefficient yield)
    shapeless('kubejs:iron_carbon_mix', [
        'create:crushed_raw_iron',
        'kubejs:carbon_dust'
    ]).id('kubejs:age3/iron_carbon_mix');

    // ── IBF line ──

    // Washed crushed iron → iron dust (event.custom bypasses the KubeJS binding's ingredient parser)
    event.recipes.create.milling('kubejs:iron_dust', 'kubejs:washed_crushed_raw_iron')
//    event.custom({
//        type: 'create:milling',
//        ingredients: [{ item: 'kubejs:washed_crushed_raw_iron' }],
//        results: [{ item: 'kubejs:iron_dust' }],
//        processingTime: 200
//    }).id('kubejs:age3/milling_washed_iron');

    // Iron dust + coal coke dust → purified mix, ready for sintering
    shapeless('kubejs:purified_iron_carbon_mix', [
        'kubejs:iron_dust',
        'tfmg:coal_coke_dust'
    ]).id('kubejs:age3/purified_iron_carbon_mix');
});

// Millstone: raw iron ore → crushed raw iron (bootstrap + IBF line share this step)
ServerEvents.recipes(event => {
    event.recipes.create.milling(['create:crushed_raw_iron'], 'minecraft:raw_iron')
        .id('kubejs:age3/milling_raw_iron');
});

// Helper constructors for TFMG custom recipe JSON (mirrors copper age)
function ironFluidResult(fluid, amount) {
    return { id: fluid, amount: amount };
}

function ironFluidIngredient(fluid, amount) {
    return { type: 'neoforge:single', fluid: fluid, amount: amount };
}

ServerEvents.recipes(event => {
    // Fan + water: crushed iron → washed (required gate) + 25% bonus nugget.
    // Default splashing recipe (9 iron nuggets = 1 full ingot bypass) MUST be removed.
    // Recipe type is `create:splashing`, not `create:fan_washing` — see feedback-kubejs-create-api.
    event.remove({ id: 'create:splashing/crushed_raw_iron' });
    event.recipes.create.splashing(
        ['kubejs:washed_crushed_raw_iron', CreateItem.of('minecraft:iron_nugget', 0.25)],
        'create:crushed_raw_iron'
    ).id('kubejs:age3/washing_crushed_iron');

    // Gravel washing drops iron nuggets by default — a free-iron leak around the
    // IBF gate. Re-add it flint-only.
    event.remove({ id: 'create:splashing/gravel' });
    event.recipes.create.splashing(
        [CreateItem.of('minecraft:flint', 0.25)],
        'minecraft:gravel'
    ).id('kubejs:age3/washing_gravel');

    // Sintering via vanilla smoker — create.smoking() doesn't work in 1.21.1
    event.custom({
        type: 'minecraft:smoking',
        result: { id: 'kubejs:sintered_iron_mix' },
        ingredient: { item: 'kubejs:purified_iron_carbon_mix' },
        cookingTime: 600
    });

    // IBF: crude iron carbon mix → 48mb molten iron (1/3 ingot — bootstrap path, inefficient by design)
    event.custom({
        type: 'tfmg:industrial_blasting',
        ingredients: [{ item: 'kubejs:iron_carbon_mix' }],
        results: [ironFluidResult('kubejs:molten_iron', 48)],
        processing_time: 200,
        hot_air_usage: 1
    }).id('kubejs:age3/industrial_blasting_iron_crude');

    // IBF: sintered iron mix → molten iron
    event.custom({
        type: 'tfmg:industrial_blasting',
        ingredients: [{ item: 'kubejs:sintered_iron_mix' }],
        results: [ironFluidResult('kubejs:molten_iron', 144)],
        processing_time: 200,
        hot_air_usage: 1
    }).id('kubejs:age3/industrial_blasting_iron');

    // Casting: molten iron → iron ingot
    event.custom({
        type: 'tfmg:casting',
        ingredients: [ironFluidIngredient('kubejs:molten_iron', 144)],
        results: [{ id: 'minecraft:iron_ingot' }],
        processing_time: 100
    }).id('kubejs:age3/casting_iron_ingot');

    // Obsidian: mix lava + water in a basin — gates Nether portal behind fluid infrastructure
    event.recipes.create.mixing(
        'minecraft:obsidian',
        [
            Fluid.of('minecraft:lava', 1000),
            Fluid.of('minecraft:water', 1000)
        ]
    ).id('kubejs:age3/mixing_obsidian');
});