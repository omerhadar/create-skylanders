const METALS = [
    { name: 'copper', color: 0xFF7A59 }
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
})
