const METALS = [
    { name: 'copper', color: 0xFF7A59 },
    // Iron melts hotter than copper — brighter yellow-orange
    { name: 'iron', color: 0xFFA020 },
    // Age 5 advanced metals — Advanced IBF only. Tints chosen to read as the cold-metal colour
    // through the orange-hot lava texture: lead = dull blue-grey, lithium = pale pinkish silver,
    // nickel = pale gold-green, aluminum = light bluish silver.
    { name: 'lead', color: 0x6B7A8C },
    { name: 'lithium', color: 0xD4C8D8 },
    { name: 'nickel', color: 0xE0DAA0 },
    { name: 'aluminum', color: 0xD8D8DE }
]

StartupEvents.registry('item', event => {
    // Intermediate smelting blend used before the TFMG foundry line is built
    event.create('unrefined_copper_blend')
        .displayName('Unrefined Copper Blend')
        .texture('minecraft:item/gunpowder')
        .color(0, 0xFF7A59)

    // Millstone product from coal/charcoal; replaces raw charcoal in the copper blend
    // Uses gunpowder's granular texture tinted near-black to suggest carbon/charcoal dust
    event.create('carbon_dust')
        .displayName('Carbon Dust')
        .texture('minecraft:item/gunpowder')
        .color(0, 0x202020)

    // Copper-age crafting tool — consumed (loses durability) when hammering sheets
    event.create('copper_hammer')
        .displayName('Copper Hammer')
        .texture('kubejs:item/copper_hammer')
        .maxDamage(128)
        .tag('forge:hammers')

    // Iron age bootstrap items — each step is a gate that forces machine progression
    // Crushed iron + coal/charcoal, ready for the smoker
    event.create('iron_carbon_mix')
        .displayName('Iron Carbon Mix')
        .texture('minecraft:item/gunpowder')
        .color(0, 0x3D2E28)

    // IBF line intermediates
    // Crushed iron after fan washing — separate item makes washing a required gate
    event.create('washed_crushed_raw_iron')
        .displayName('Washed Crushed Raw Iron')
        .texture('create:item/crushed_raw_zinc')
        .color(0, 0xC0C0C0)


    event.create('iron_dust')
        .displayName('Iron Dust')
        .texture('minecraft:item/gunpowder')
        .color(0, 0x8A8A8A)

    // Iron dust + coal coke dust, pre-sintering
    event.create('purified_iron_carbon_mix')
        .displayName('Purified Iron Carbon Mix')
        .texture('minecraft:item/gunpowder')
        .color(0, 0x2E2E2E)

    // Fan + fire output — sintered and ready for the IBF
    event.create('sintered_iron_mix')
        .displayName('Sintered Iron Mix')
        .texture('minecraft:item/gunpowder')
        .color(0, 0x1A1A1A)

    // Diamond age processing line
    event.create('raw_diamond')
        .displayName('Raw Diamond')
        .texture('minecraft:item/raw_iron')
        .color(0, 0x4AEDD9)

    event.create('diamond_fragments')
        .displayName('Diamond Fragments')
        .texture('minecraft:item/gunpowder')
        .color(0, 0x6CF0E0)

    event.create('washed_diamond_fragments')
        .displayName('Washed Diamond Fragments')
        .texture('minecraft:item/gunpowder')
        .color(0, 0x8CF8F0)

    event.create('rough_diamond')
        .displayName('Rough Diamond')
        .texture('minecraft:item/diamond')
        .color(0, 0x9ABEAA)
})

StartupEvents.registry('fluid', event => {
    METALS.forEach(metal => {
        const displayName = metal.name.charAt(0).toUpperCase() + metal.name.slice(1)
        event.create(`molten_${metal.name}`)
            .displayName(`Molten ${displayName}`)
            .stillTexture('minecraft:block/lava_still')
            .flowingTexture('minecraft:block/lava_flow')
            .tint(metal.color)
    })

    event.create('diamond_slurry')
        .displayName('Diamond Slurry')
        .stillTexture('minecraft:block/lava_still')
        .flowingTexture('minecraft:block/lava_flow')
        .tint(0x5BC0B0)

    // Sweet Syrup — a bee-free stand-in for honey, boiled from sugar water. It exists only
    // to drive the limestone generator (see the FluidEvents.interact below): a renewable,
    // non-bee path to limestone → limesand → steel flux. Water textures tinted amber so it
    // reads as syrup and flows like a normal fluid for the generator.
    event.create('sweet_syrup')
        .displayName('Sweet Syrup')
        .stillTexture('minecraft:block/water_still')
        .flowingTexture('minecraft:block/water_flow')
        .tint(0xE0A030)
})

// Limestone generator for Sweet Syrup — works exactly like the lava+honey one, but bee-free.
// KubeJS can't register fluid interactions on its own; the `fluidjs` mod adds FluidEvents for
// it. When flowing/source Lava meets flowing Sweet Syrup, the lava turns into create:limestone
// (the same block Create's honey interaction produces). Lava is the transformed side (it gets
// consumed into limestone), syrup is the modifier that stays — exactly like water in a cobble
// generator. So: lava source + syrup source side by side -> limestone, refed continuously.
FluidEvents.interact(event => {
    event.createForBlock(
        Fluid.of('minecraft:lava', 1000),
        Fluid.of('kubejs:sweet_syrup', 1000),
        'create:limestone',
        'create:limestone'
    )
})
