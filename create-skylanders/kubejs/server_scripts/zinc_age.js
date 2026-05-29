ServerEvents.recipes(event => {
    // ==========================================
    // 1. ANDESITE ALLOY PROGRESSION
    // ==========================================
    event.remove({ output: 'create:andesite_alloy' })
    
    event.shaped('2x create:andesite_alloy', [
        'ZA',
        'AZ'
    ], {
        Z: 'create:zinc_nugget',
        A: 'minecraft:andesite'
    })
    
    event.recipes.create.mixing('2x create:andesite_alloy', [
        'minecraft:andesite', 
        'create:zinc_nugget'
    ])

    // ==========================================
    // 2. ZINC AGE AERONAUTICS GATING
    // ==========================================
    event.remove({ output: 'aeronautics:adjustable_burner' })
    event.remove({ output: 'aeronautics:wooden_propeller' }) 
    event.remove({ output: 'aeronautics:andesite_propeller' }) 

    // Zinc Age Burner: Replaces Iron Sheets with Zinc Ingots, Redstone with Charcoal
    event.shaped('aeronautics:adjustable_burner', [
        'Z Z',
        'ZFZ',
        'ACA'
    ], {
        Z: 'create:zinc_ingot',
        C: 'minecraft:campfire', // Campfire
        F: 'minecraft:charcoal',       // Replaces Redstone
        A: 'create:andesite_alloy'
    })

    // Zinc Age Propeller: Cheaper (Requires Zinc and Wood, skips Andesite Propeller)
    event.shaped('aeronautics:wooden_propeller', [
        ' P ',
        'PZP',
        ' P '
    ], {
        P: '#minecraft:planks',
        Z: 'create:zinc_ingot'
    })
})

ServerEvents.recipes(event => {
    // ==========================================
    // 3. ZINC AGE MACHINES (Basic Farming)
    // ==========================================
    // Remove default recipes that require Iron
    event.remove({ output: 'create:mechanical_saw' })
    event.remove({ output: 'create:mechanical_harvester' })

    // Mechanical Saw: Replaces the Iron Sheet with a Zinc Ingot
    event.shaped('create:mechanical_saw', [
        ' Z ',
        ' C ',
        ' S '
    ], {
        Z: 'create:zinc_ingot',
        C: 'create:andesite_casing',
        S: 'create:shaft'
    })

    // Mechanical Harvester: Replaces the Iron Sheet with Zinc Ingots
    event.shaped('create:mechanical_harvester', [
        ' Z ',
        'ACA',
        ' A '
    ], {
        Z: 'create:zinc_ingot',
        A: 'create:andesite_alloy',
        C: 'create:andesite_casing'
    })
})