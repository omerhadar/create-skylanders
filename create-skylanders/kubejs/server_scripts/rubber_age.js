// priority: 100

// Copper age: compressor for processing resin into rubber
ServerEvents.recipes(event => {
    event.remove({ id: 'rubberworks:crafting/compressor' })

    // Gated behind copper block + andesite alloy (no industrial iron)
    event.shaped('rubberworks:compressor', [
        ' S ',
        ' P ',
        ' F '
    ], {
        P: 'create:andesite_alloy_block',
        S: 'create:shaft',
        F: 'minecraft:copper_block'
    }).id('kubejs:age2/rubberworks_compressor')
})