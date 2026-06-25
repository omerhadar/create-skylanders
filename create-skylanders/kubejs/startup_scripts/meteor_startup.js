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
    { name: 'lithium', color: 0xD4C8D8 },
    // Zinc meteor (starts at copper-age distance) — silver-blue node
    { name: 'zinc', color: 0xB8C4CC },
    // Sulfur meteor — Nether-only, gates CBC explosives (sulfuric acid). Sulfur-yellow node.
    { name: 'sulfur', color: 0xE8D24A },
    // Bauxite meteor — the only Age-5 metal (aluminum) without a renewable source; reddish-brown node.
    { name: 'bauxite', color: 0xC06B3E },
    // Redstone meteor — heavy CBC-fuze + Create consumer, band-limited with no other renewable source.
    { name: 'redstone', color: 0xD42A2A },
    // Lapis meteor — iron-band companion to redstone; enchanting + brass-age circuitry dye.
    { name: 'lapis', color: 0x2E5FD4 }
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

// NOTE: the diamond_catalyst item registration was REMOVED 2026-06-14 — the catalyst/deposit-regrow
// renewable system is retired in favour of Create: Ore Excavation drills. The deposit blocks above
// stay (inert meteor-floor decoration referenced by the worldgen JSONs). See meteor_age.js.
