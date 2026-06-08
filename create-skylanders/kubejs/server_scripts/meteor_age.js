// priority: 75

// Age-4 renewable meteor system.
// Ore meteors (worldgen, datapack skylanders_ores) carry a glowing "deposit" floor block.
// The player energises a diamond into a catalyst, right-clicks a deposit, and one catalyst
// is consumed to grow fresh ore into the air/stone around the deposit. The deposit itself
// persists, so a single meteor is a long-lived renewable source — diamonds are the limiter.

// Each deposit block hard-codes which ore it renews.
const DEPOSIT_ORES = {
    'kubejs:copper_deposit': 'minecraft:copper_ore',
    'kubejs:iron_deposit': 'minecraft:iron_ore',
    'kubejs:diamond_deposit': 'minecraft:diamond_ore',
    'kubejs:lead_deposit': 'tfmg:lead_ore',
    'kubejs:nickel_deposit': 'tfmg:nickel_ore',
    'kubejs:lithium_deposit': 'tfmg:lithium_ore'
}

const CATALYST = 'kubejs:diamond_catalyst'
// Only grow into air and the plain terrain the meteor is embedded in — never the themed
// shell blocks or the existing ore filling, so the meteor's structure stays intact.
const REPLACEABLE = ['minecraft:air', 'minecraft:stone', 'minecraft:deepslate']
const YIELD = 6   // ore blocks grown per catalyst
const RADIUS = 2  // search cube half-extent around the deposit

ServerEvents.recipes(function (event) {
    // "Activate" a diamond into a catalyst. Small process by design — glowstone is the
    // activation energy. Tune to a Create deployer/press later if a heavier gate is wanted.
    event.shapeless('kubejs:diamond_catalyst', ['minecraft:diamond', 'minecraft:glowstone_dust'])
})

Object.keys(DEPOSIT_ORES).forEach(function (depositId) {
    const ore = DEPOSIT_ORES[depositId]

    BlockEvents.rightClicked(depositId, function (event) {
        const level = event.block.level
        if (level.isClientSide()) return

        const held = event.item
        if (!held || held.id != CATALYST) return

        // Gather every replaceable spot in the cube around the deposit.
        const spots = []
        for (var dx = -RADIUS; dx <= RADIUS; dx++) {
            for (var dy = -RADIUS; dy <= RADIUS; dy++) {
                for (var dz = -RADIUS; dz <= RADIUS; dz++) {
                    if (dx == 0 && dy == 0 && dz == 0) continue
                    var b = event.block.offset(dx, dy, dz)
                    if (REPLACEABLE.indexOf(b.id) != -1) spots.push(b)
                }
            }
        }
        if (spots.length == 0) return

        // Fisher-Yates shuffle so the growth looks organic instead of filling a corner.
        for (var i = spots.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1))
            var t = spots[i]; spots[i] = spots[j]; spots[j] = t
        }

        var n = Math.min(YIELD, spots.length)
        for (var k = 0; k < n; k++) spots[k].set(ore)

        held.shrink(1)
        event.cancel()
    })
})
