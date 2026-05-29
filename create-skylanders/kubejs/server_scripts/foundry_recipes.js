// We expand the array here to include the exact item IDs for inputs/outputs
const FOUNDRY_METALS = [
    { name: 'copper', crushed: 'create:crushed_raw_copper', ingot: 'minecraft:copper_ingot' },
    { name: 'zinc', crushed: 'create:crushed_raw_zinc', ingot: 'create:zinc_ingot' }
]

ServerEvents.recipes(event => {
    // The empty mold recipe
    event.shaped('kubejs:ingot_mold', [
        'T T',
        ' T '
    ], {
        T: 'minecraft:terracotta'
    })

    FOUNDRY_METALS.forEach(metal => {
        // 1. CBC Melting (Crushed Ore -> Molten Fluid)
        event.custom({
            type: 'createbigcannons:melting',
            ingredients: [{ item: metal.crushed }],
            results: [{ id: `kubejs:molten_${metal.name}`, amount: 90 }],
            processingTime: 120,
            heatRequirement: 'heated'
        })

        // 2. Spout Pouring (Molten Fluid + Empty Mold -> Hot Mold)
        event.recipes.create.filling(`kubejs:hot_${metal.name}_mold`, [
            'kubejs:ingot_mold',
            Fluid.of(`kubejs:molten_${metal.name}`, 90)
        ])

        // 3. Spout Quenching (Water + Hot Mold -> Cooled Mold)
        event.recipes.create.filling(`kubejs:cooled_${metal.name}_mold`, [
            `kubejs:hot_${metal.name}_mold`,
            Fluid.water(100)
        ])

        // 4. Saw Extraction (Slices cooled mold open, yielding Ingot + Empty Mold)
        event.recipes.create.cutting(
            [metal.ingot, 'kubejs:ingot_mold'], // Outputs
            `kubejs:cooled_${metal.name}_mold`  // Input
        ).processingTime(50)
    })
})