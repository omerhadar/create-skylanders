// priority: 90

// Iron age: gate bulk item storage behind iron plates
ServerEvents.recipes(event => {
    event.remove({ id: 'create:crafting/kinetics/item_vault' })

    // Simpler recipe than default — requires iron plates instead of iron blocks
    event.shaped('create:item_vault', [
        'P',
        'C',
        'P'
    ], {
        P: '#c:plates/iron',
        C: '#c:barrels/wooden'
    }).id('kubejs:age3/item_vault')
})