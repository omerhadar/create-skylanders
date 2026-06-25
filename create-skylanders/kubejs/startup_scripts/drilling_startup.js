// Create: Ore Excavation — the Copper Drill (tier 1).
// Only the copper-tier drill is custom; the iron / diamond / advanced tiers reuse the mod's OWN
// existing drills (createoreexcavation:drill = "Iron Drill", :diamond_drill, :netherite_drill) with
// their default recipes. Which drill a vein's drilling recipe requires is the tier gate — see
// server_scripts/drilling.js.
//
// Reuses the iron pickaxe texture with a copper tint (texture-reuse convention). NOTE: the in-machine
// 3D drill render looks up assets/kubejs/textures/entity/drill/copper_drill.png; without it the
// spinning drill renders as missing-texture (purple) but FUNCTIONS fine — the item icon is correct.

StartupEvents.registry('item', event => {
    event.create('copper_drill')
        .displayName('Copper Drill')
        .texture('minecraft:item/iron_pickaxe')
        .color(0, 0xC87838)
        .maxStackSize(1)
        .tag('createoreexcavation:drills')
})
