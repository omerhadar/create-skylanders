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
});
