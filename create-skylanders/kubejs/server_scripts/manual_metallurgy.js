// priority: 101

// Age 1 bootstrap: copper smelting before the TFMG foundry line is available.
// Yields only 3 nuggets (vs 9 per ingot) to strongly incentivise IBF automation.
// Zinc keeps its default smelting throughout — it is the starting metal.
ServerEvents.recipes(event => {
    // Block vanilla/Create smelting of copper so the blend recipe is the only path
    const copperOres = [
        'minecraft:raw_copper',
        'create:crushed_raw_copper',
        'minecraft:copper_ore',
        'minecraft:deepslate_copper_ore'
    ]

    copperOres.forEach(function(ore) {
        event.remove({ type: 'minecraft:smelting', input: ore })
        event.remove({ type: 'minecraft:blasting', input: ore })
    })

    // Coal or charcoal → carbon dust via millstone
    event.recipes.create.milling(['kubejs:carbon_dust'], 'minecraft:coal')
        .id('kubejs:age1/milling_coal_to_carbon')
    event.recipes.create.milling(['kubejs:carbon_dust'], 'minecraft:charcoal')
        .id('kubejs:age1/milling_charcoal_to_carbon')

    // Coal coke → coke dust via millstone
    event.recipes.create.milling(['tfmg:coal_coke_dust'], 'tfmg:coal_coke')
        .id('kubejs:age2/milling_coke_to_dust')

    // Crushed copper + carbon dust → blend → smelt → 3 copper nuggets (inefficient by design)
    event.shapeless('kubejs:unrefined_copper_blend', ['create:crushed_raw_copper', 'kubejs:carbon_dust'])
        .id('kubejs:age1/unrefined_copper_blend')

    event.smelting('3x create:copper_nugget', 'kubejs:unrefined_copper_blend')
        .id('kubejs:age1/smelting_copper_blend')
})
