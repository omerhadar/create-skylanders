// priority: 80

// Diamond ore drops raw_diamond instead of vanilla diamonds (requires LootJS)
LootJS.modifiers(function(event) {
    event.addBlockModifier('minecraft:diamond_ore')
        .removeLoot('minecraft:diamond')
        .addLoot('kubejs:raw_diamond');
    event.addBlockModifier('minecraft:deepslate_diamond_ore')
        .removeLoot('minecraft:diamond')
        .addLoot('kubejs:raw_diamond');
});

ServerEvents.recipes(function(event) {
    // ── Remove vanilla diamond smelting — forces the processing line ──
    var diamondOres = [
        'minecraft:diamond_ore',
        'minecraft:deepslate_diamond_ore'
    ];
    diamondOres.forEach(function(ore) {
        event.remove({ type: 'minecraft:smelting', input: ore });
        event.remove({ type: 'minecraft:blasting', input: ore });
    });

    // ── Diamond processing line (6 steps) ──

    // 1. Mechanical saw: raw diamond → fragments
    event.custom({
        type: 'create:cutting',
        ingredients: [{ item: 'kubejs:raw_diamond' }],
        processing_time: 300,
        results: [{ id: 'kubejs:diamond_fragments' }]
    }).id('kubejs:age4/cutting_raw_diamond');

    // 2. Heated mixing: fragments + water → washed fragments (requires blaze burner)
    event.recipes.create.mixing(
        'kubejs:washed_diamond_fragments',
        ['kubejs:diamond_fragments', Fluid.of('minecraft:water', 500)]
    ).heated().id('kubejs:age4/washing_diamond_fragments');

    // 3. Mixing: washed fragments + lava → diamond slurry fluid
    event.recipes.create.mixing(
        Fluid.of('kubejs:diamond_slurry', 500),
        ['kubejs:washed_diamond_fragments', Fluid.of('minecraft:lava', 1000)]
    ).id('kubejs:age4/mixing_diamond_slurry');

    // 4. Rubberworks compressor (heated): slurry → rough diamond
    event.custom({
        type: 'rubberworks:compressing',
        ingredients: [{
            type: 'neoforge:single',
            amount: 500,
            fluid: 'kubejs:diamond_slurry'
        }],
        results: [{ id: 'kubejs:rough_diamond' }],
        heat_requirement: 'heated'
    }).id('kubejs:age4/compressing_diamond_slurry');

    // 5. Sandpaper polishing (deployer with sandpaper): rough diamond → diamond
    event.custom({
        type: 'create:sandpaper_polishing',
        ingredients: [{ item: 'kubejs:rough_diamond' }],
        results: [{ id: 'minecraft:diamond' }]
    }).id('kubejs:age4/polishing_rough_diamond');

    // TFMG oil machines are gated naturally: their default recipes require
    // steel components, and steel is locked behind the Advanced IBF (age 5).
});
