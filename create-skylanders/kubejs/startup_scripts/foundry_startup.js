// Define all your foundry metals here! 
// You can add Iron, Gold, Lead, etc., later by just adding a new line.
const METALS = [
    { name: 'copper', color: 0xFF7A59 }, // Bright orange
    { name: 'zinc', color: 0xD0DFE5 }    // Pale bluish-gray
]

StartupEvents.registry('item', event => {
    // The Empty Mold (Layer 0)
    event.create('ingot_mold')
         .displayName('Terracotta Ingot Mold')
         .texture('kubejs:item/ingot_mold_empty')

    METALS.forEach(metal => {
        // Capitalize name for display
        let displayName = metal.name.charAt(0).toUpperCase() + metal.name.slice(1)

        // Hot Mold
        event.create(`hot_${metal.name}_mold`)
            .displayName(`Hot ${displayName} Mold`)
            .texture('layer0', 'kubejs:item/ingot_mold_empty') // The terracotta base
            .texture('layer1', 'kubejs:item/ingot_mold_metal') // The liquid metal inside
            .color(1, metal.color) // Tints ONLY layer1 with the metal's color!
            .glow(true) // Makes it look bright and hot

        // Cooled Mold
        event.create(`cooled_${metal.name}_mold`)
            .displayName(`Cooled ${displayName} Mold`)
            .texture('layer0', 'kubejs:item/ingot_mold_empty') 
            .texture('layer1', 'kubejs:item/ingot_mold_metal')
            .color(1, metal.color) // Tints the metal layer
    })
})

StartupEvents.registry('fluid', event => {
    METALS.forEach(metal => {
        let displayName = metal.name.charAt(0).toUpperCase() + metal.name.slice(1)
        
        event.create(`molten_${metal.name}`)
            .displayName(`Molten ${displayName}`)
            .stillTexture('minecraft:block/lava_still')
            .flowingTexture('minecraft:block/lava_flow')
            .tint(metal.color) // Automatically creates lava textures + bucket colored to match
    })
})