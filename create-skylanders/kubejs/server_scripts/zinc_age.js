// priority: 110

// Age 1 — Zinc Age
// Zinc is the starting metal; vanilla zinc smelting/crushing is untouched.
// Andesite alloy is reworked to use zinc, aeronautics is gated to zinc-only,
// basic Create farming machines drop their iron requirement, and the TFMG
// foundry shell (fireclay → fireproof bricks → blast furnace components) is
// the gate into the copper age.
ServerEvents.recipes(function (event) {
    // ── Andesite alloy ──
    // Remove only the crafting/mixing recipes — not by output, which would also nuke
    // the precision mechanism (andesite alloy is one of its junk results).
    event.remove({ id: 'create:crafting/materials/andesite_alloy' });
    event.remove({ id: 'create:crafting/materials/andesite_alloy_from_zinc' });
    event.remove({ id: 'create:mixing/andesite_alloy' });
    event.remove({ id: 'create:mixing/andesite_alloy_from_zinc' });

    event.shaped('2x create:andesite_alloy', [
        'ZA',
        'AZ'
    ], {
        Z: 'create:zinc_nugget',
        A: 'minecraft:andesite'
    });

    event.recipes.create.mixing('2x create:andesite_alloy', [
        'minecraft:andesite',
        'create:zinc_nugget'
    ]);

    // ── Aeronautics: gate behind zinc instead of iron ──
    // (`wooden_propeller_from_andesite` is the actual default recipe ID — TFMG-style suffix.)
    event.remove({ id: 'aeronautics:adjustable_burner' });
    event.remove({ id: 'aeronautics:wooden_propeller_from_andesite' });
    event.remove({ id: 'aeronautics:andesite_propeller' });
    event.remove({ id: 'aeronautics:andesite_propeller_from_andesite' });

    event.shaped('aeronautics:adjustable_burner', [
        'Z Z',
        'ZFZ',
        'ACA'
    ], {
        Z: 'create:zinc_ingot',
        C: 'minecraft:campfire',
        F: 'minecraft:charcoal',
        A: 'create:andesite_alloy'
    });

    event.shaped('aeronautics:wooden_propeller', [
        ' P ',
        'PZP',
        ' P '
    ], {
        P: '#minecraft:planks',
        Z: 'create:zinc_ingot'
    });

    // ── Basic farming machines: drop iron sheet for zinc ingot ──
    event.remove({ id: 'create:crafting/kinetics/mechanical_saw' });
    event.remove({ id: 'create:crafting/kinetics/mechanical_harvester' });

    event.shaped('create:mechanical_saw', [
        ' Z ',
        ' C ',
        ' S '
    ], {
        Z: 'create:zinc_ingot',
        C: 'create:andesite_casing',
        S: 'create:shaft'
    });

    event.shaped('create:mechanical_harvester', [
        ' Z ',
        'ACA',
        ' A '
    ], {
        Z: 'create:zinc_ingot',
        A: 'create:andesite_alloy',
        C: 'create:andesite_casing'
    });

    // ── Ore-stones in the millstone ──
    // Create's ore-bearing stones (crimsite/veridium/asurine/ochrum) normally need
    // crushing wheels, which are mechanical-crafted — brass age. The islands carry
    // these stones from the start, so let the millstone work them too: same primary
    // ore chance, but the bonus nugget stays crushing-wheel-only so the wheels are
    // still the upgrade.
    event.recipes.create.milling([
        CreateItem.of('create:crushed_raw_iron', 0.4)
    ], 'create:crimsite').id('kubejs:age1/crimsite_milling');

    event.recipes.create.milling([
        CreateItem.of('create:crushed_raw_copper', 0.8)
    ], 'create:veridium').id('kubejs:age1/veridium_milling');

    event.recipes.create.milling([
        CreateItem.of('create:crushed_raw_zinc', 0.3)
    ], 'create:asurine').id('kubejs:age1/asurine_milling');

    event.recipes.create.milling([
        CreateItem.of('create:crushed_raw_gold', 0.2)
    ], 'create:ochrum').id('kubejs:age1/ochrum_milling');

    // ── TFMG foundry shell: fireclay → fireproof bricks → blast furnace + casting basin ──
    // Default TFMG paths use cast-iron components. Remove them so our gated recipes
    // (no cast iron required in age 1) are the only paths.
    [
        'tfmg:crafting/materials/fireproof_bricks',
        'tfmg:crafting/materials/blast_furnace_output',
        'tfmg:crafting/materials/blast_furnace_hatch',
        'tfmg:crafting/materials/casting_basin'
    ].forEach(function (id) { event.remove({ id: id }); });

    // Fireclay: hand-mixed or basin-mixed
    event.shapeless('4x tfmg:fireclay_ball', [
        'minecraft:clay_ball',
        'minecraft:sand',
        'minecraft:sand',
        'minecraft:charcoal'
    ]).id('kubejs:age1/manual_fireclay');

    event.recipes.create.mixing('4x tfmg:fireclay_ball', [
        'minecraft:clay_ball',
        '2x minecraft:sand',
        'minecraft:charcoal'
    ]).id('kubejs:age1/mixing_fireclay');

    event.smelting('tfmg:fireproof_brick', 'tfmg:fireclay_ball')
        .id('kubejs:age1/smelting_firebrick');

    event.shaped('tfmg:fireproof_bricks', [
        'BB',
        'BB'
    ], { B: 'tfmg:fireproof_brick' }).id('kubejs:age1/fireproof_bricks');

    // Blast furnace components — Create andesite + fireproof bricks
    event.shaped('tfmg:blast_furnace_hatch', [
        ' B ',
        'BAB',
        ' B '
    ], {
        B: 'tfmg:fireproof_bricks',
        A: 'create:andesite_alloy'
    }).id('kubejs:age1/blast_furnace_hatch');

    event.shaped('tfmg:blast_furnace_output', [
        ' B ',
        'BZB',
        ' B '
    ], {
        B: 'tfmg:fireproof_bricks',
        Z: '#c:storage_blocks/zinc'
    }).id('kubejs:age1/blast_furnace_output');

    event.shaped('tfmg:casting_basin', [
        'B B',
        'B B',
        'BAB'
    ], {
        B: 'tfmg:fireproof_bricks',
        A: 'create:andesite_alloy'
    }).id('kubejs:age1/casting_basin');

    // ── Deployer re-tiered to the zinc age ──
    // Default deployer is naturally brass/nether-gated: its hand needs brass plates
    // and its body needs an electron tube (rose quartz). Re-tier both to zinc so the
    // deployer is an early automation tool. This bypasses no metal gate — copper/iron
    // sheets (hammer/press), the precision mechanism (iron+gold) and the diamond polish
    // (rough_diamond → nether-gated line) are all still locked by their own materials.
    // The brass_hand item is renamed "Zinc Hand" via the create lang override.
    event.remove({ id: 'create:crafting/kinetics/brass_hand' });
    event.shaped('create:brass_hand', [
        ' A ',
        'ZZZ',
        ' Z '
    ], {
        Z: '#c:ingots/zinc',
        A: 'create:andesite_alloy'
    }).id('kubejs:age1/zinc_hand');

    event.remove({ id: 'create:crafting/kinetics/deployer' });
    event.shaped('create:deployer', [
        'S',
        'C',
        'H'
    ], {
        S: 'create:shaft',
        C: 'create:andesite_casing',
        H: 'create:brass_hand'
    }).id('kubejs:age1/deployer');

    // ── Super glue + cheaper slime (zinc age) ──
    // Super glue is the glue that holds contraptions together — and airships/contraptions are
    // core to a sky pack — but Create gates it behind iron plates, an age too late. Re-tier it
    // to zinc (drop the iron). Slime gates super glue AND stickers, sticky pistons and the
    // frogport, yet slimes barely spawn on floating islands, so make the Create slime recipe
    // far cheaper: same dough + lime dye, but 4 balls per craft instead of 1.
    event.remove({ id: 'create:crafting/kinetics/super_glue' });
    event.shapeless('create:super_glue', [
        '#c:slimeballs',
        '#c:slimeballs',
        'create:zinc_nugget'
    ]).id('kubejs:age1/super_glue');

    event.remove({ id: 'create:crafting/appliances/slime_ball' });
    event.shapeless('4x minecraft:slime_ball', [
        'create:dough',
        '#c:dyes/lime'
    ]).id('kubejs:age1/cheap_slime');

    // Green dye by milling grass — green is the gate for lime dye (→ slime), and cactus is
    // scarce on floating islands. Grass is everywhere and renewable, so the millstone turns
    // it into green pigment. Tall grass is two plants, so it gives two.
    event.recipes.create.milling(['minecraft:green_dye'], 'minecraft:short_grass')
        .id('kubejs:age1/green_dye_from_grass');
    event.recipes.create.milling(['2x minecraft:green_dye'], 'minecraft:tall_grass')
        .id('kubejs:age1/green_dye_from_tall_grass');
});

// ── Zinc ore mining tier: stone, not iron ──
// Zinc is the STARTING metal, but Create ships its ores in #minecraft:needs_iron_tool —
// a chicken-and-egg gate (you'd need iron to mine the metal that comes before iron).
// Drop the zinc blocks to stone-tier (like vanilla iron ore) so a stone pickaxe works.
ServerEvents.tags('block', function (event) {
    [
        'create:zinc_ore',
        'create:deepslate_zinc_ore',
        'create:raw_zinc_block',
        'create:zinc_block'
    ].forEach(function (block) {
        event.remove('minecraft:needs_iron_tool', block);
        event.add('minecraft:needs_stone_tool', block);
    });
});
