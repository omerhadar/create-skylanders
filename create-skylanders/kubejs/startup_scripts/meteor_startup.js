// Age-4 meteor renewable-resource system: per-metal "deposit" blocks (the renewable
// floor of each ore meteor) plus the diamond catalyst that activates them.
// One deposit block per meteor metal so the block identity alone encodes which ore it
// produces — no NBT/block-entity needed, which keeps the whole thing KubeJS-only.
// See server_scripts/meteor_age.js for the right-click behaviour.

const DEPOSITS = [
    // tint is multiplied over the calcite base; glow marks the node as "active"
    { name: 'copper', color: 0xE0703A },
    { name: 'iron', color: 0xC8C8C8 },
    { name: 'diamond', color: 0x4AEDD9 },
    { name: 'lead', color: 0x6B7A8C },
    { name: 'nickel', color: 0xE0DAA0 },
    { name: 'lithium', color: 0xD4C8D8 }
]

StartupEvents.registry('block', event => {
    DEPOSITS.forEach(function (d) {
        const disp = d.name.charAt(0).toUpperCase() + d.name.slice(1)
        // Tough but breakable; glows so it reads as an active node inside the meteor.
        event.create(d.name + '_deposit')
            .displayName(disp + ' Deposit')
            .texture('minecraft:block/calcite')
            .color(0, d.color)
            .hardness(4.0)
            .resistance(6.0)
            .requiresTool()
            .lightLevel(0.6)
            .tagBlock('minecraft:mineable/pickaxe')
    })
})

StartupEvents.registry('item', event => {
    // Energised diamond — consumed one-per-use on a deposit to renew ore around it.
    event.create('diamond_catalyst')
        .displayName('Diamond Catalyst')
        .texture('minecraft:item/diamond')
        .color(0, 0xFFE08A)
        .maxStackSize(16)
})
