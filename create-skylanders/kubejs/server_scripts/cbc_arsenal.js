// priority: 55

// ─────────────────────────────────────────────────────────────────────────────
// Age 6 — CBC Arsenal gating
//
// The dragon fight is mechanically wired (dragon_age.js + MixinEndCrystal), but CBC
// out of the box lets you build working cannons in the iron age and craft every shell
// from iron + paper + gunpowder + redstone. This file makes the dragon-killing arsenal
// land at ENDGAME (Age-5 steel + TFMG oil/chemistry) so reaching the dragon means you
// actually climbed the whole tech tree.
//
// Gates (the big-cannon body/casing metal is deliberately LEFT cheap — cheap casings
// suit mass-produced shells and add late-game factory variety):
//   A. Hardware   — only steel+ cannons buildable.
//   B. Explosive  — HE/AP filler (guncotton) needs TFMG sulfuric acid.
//   C. Propellant — big cannons fire ONLY on Big Cartridges, whose casing needs TFMG naphtha.
//   D. Autocannons gated to the same tier — steel hardware (via A) + naphtha-cased cartridges.
// ─────────────────────────────────────────────────────────────────────────────

// TFMG/NeoForge fluid-ingredient shape (matches the helper in copper_age.js / steel_age.js).
function fluidIngredient(fluid, amount) {
    return { type: 'neoforge:single', fluid: fluid, amount: amount };
}

ServerEvents.recipes(function (event) {
    // ──────────────────────────────────────────────────────────────────────
    // PART A — Hardware gate: remove every cannon component below steel.
    //
    // Barrels/chambers/ends are CAST from a molten-metal fluid in a CannonCast block;
    // those cast recipes are code-registered (no JSON) so we can't remove them directly.
    // Instead we STARVE them: the molten fluid's only source is CBC's JSON melting recipe,
    // so removing the cast-iron + bronze melts means there's no fluid to cast those tiers.
    // Steel + nethersteel melts are kept (Age-5 metals = the intended minimum).
    // ──────────────────────────────────────────────────────────────────────
    var starvedMelts = [
        'createbigcannons:melting/melt_cast_iron_ingot',
        'createbigcannons:melting/melt_cast_iron_block',
        'createbigcannons:melting/melt_cast_iron_nugget',
        'createbigcannons:melting/melt_bronze_ingot',
        'createbigcannons:melting/melt_bronze_block',
        'createbigcannons:melting/melt_bronze_nugget'
    ];

    // Directly-crafted low-tier parts (breeches + the primitive log/wrought-iron cannons).
    // These are plain crafting / sequenced_assembly recipes, removable by id.
    var lowTierParts = [
        'createbigcannons:cast_iron_sliding_breechblock',
        'createbigcannons:bronze_sliding_breechblock',
        'createbigcannons:sequenced_assembly/cast_iron_autocannon_breech_extractor',
        'createbigcannons:sequenced_assembly/bronze_autocannon_breech_extractor',
        'createbigcannons:log_cannon_chamber',
        'createbigcannons:log_cannon_end',
        'createbigcannons:wrought_iron_cannon_chamber',
        'createbigcannons:wrought_iron_cannon_end',
        'createbigcannons:wrought_iron_drop_mortar_end'
    ];

    starvedMelts.concat(lowTierParts).forEach(function (id) {
        event.remove({ id: id });
    });

    // ──────────────────────────────────────────────────────────────────────
    // PART B — Explosive chemistry: guncotton needs TFMG sulfuric acid.
    //
    // guncotton → packed_guncotton (the #high_explosive_materials filler for HE + AP shells),
    // and the no-nether nitro path also consumes guncotton — so acid-gating guncotton gates
    // every explosive shell in one cut. We drop the vanilla redstone acidifier + plain water
    // and replace them with sulfuric acid as the nitrating agent. Then we close the two
    // remaining explosive holes: congealed_nitro's NETHER recipe (skips guncotton) is
    // removed, and the explosive machine gun round is re-gated onto guncotton too.
    // ──────────────────────────────────────────────────────────────────────
    event.remove({ id: 'createbigcannons:mixing/guncotton' });
    event.custom({
        type: 'create:mixing',
        ingredients: [
            { tag: 'createbigcannons:can_be_nitrated' }, // paper
            { tag: 'createbigcannons:gunpowder' },
            fluidIngredient('tfmg:sulfuric_acid', 250)
        ],
        processing_time: 300,
        results: [{ id: 'createbigcannons:guncotton' }]
    }).id('kubejs:age6/guncotton_acid_nitrated');

    // Close the nitro bypass: congealed_nitro has a NETHER recipe (blaze powder + magma
    // cream + gunpowder) that skips guncotton entirely. Remove it so the only route is the
    // no-nether one, which consumes guncotton (acid-gated above). hardened_nitro/nitropowder
    // therefore inherit the acid gate.
    event.remove({ id: 'createbigcannons:mixing/congealed_nitro' });

    // Machine gun rounds are explosive (machine_gun_fire) — gate them on guncotton like the
    // shells. Both production paths swap their gunpowder charge for guncotton (acid-gated):
    // the direct craft and the sequenced-assembly deploying step.
    event.remove({ id: 'createbigcannons:machine_gun_round' });
    event.shaped('createbigcannons:machine_gun_round', [
        'B',
        'G',
        'C'
    ], {
        B: '#c:nuggets/copper',
        G: '#createbigcannons:guncotton',
        C: 'createbigcannons:empty_machine_gun_round'
    }).id('kubejs:age6/machine_gun_round_guncotton');

    event.remove({ id: 'createbigcannons:sequenced_assembly/assembling_machine_gun_round' });
    event.custom({
        type: 'create:sequenced_assembly',
        ingredient: { item: 'createbigcannons:empty_machine_gun_round' },
        results: [{ id: 'createbigcannons:machine_gun_round' }],
        sequence: [
            {
                type: 'create:deploying',
                ingredients: [
                    { item: 'createbigcannons:partially_assembled_machine_gun_round' },
                    { tag: 'createbigcannons:guncotton' }
                ],
                results: [{ id: 'createbigcannons:partially_assembled_machine_gun_round' }]
            },
            {
                type: 'create:deploying',
                ingredients: [
                    { item: 'createbigcannons:partially_assembled_machine_gun_round' },
                    { tag: 'c:nuggets/copper' }
                ],
                results: [{ id: 'createbigcannons:partially_assembled_machine_gun_round' }]
            }
        ],
        transitional_item: { id: 'createbigcannons:partially_assembled_machine_gun_round' }
    }).id('kubejs:age6/machine_gun_round_guncotton_assembly');

    // Flak autocannon rounds are an explosive burst too — swap their gunpowder charge for
    // guncotton, matching the machine gun round and shrapnel shell (acid-gated). Their steel
    // shot_balls (Part E) already gate the metal; this closes the loose-gunpowder hole.
    event.replaceInput({ id: 'createbigcannons:flak_autocannon_round' }, '#createbigcannons:gunpowder', '#createbigcannons:guncotton');

    // ──────────────────────────────────────────────────────────────────────
    // PART C — Propellant: big cannons fire ONLY on Big Cartridges, gated by naphtha.
    //
    // Powder Charges are retired as a propellant (recipes removed here + dropped from the
    // propellant tag in the tags handler below), leaving the Big Cartridge as the sole
    // big-cannon propellant — the refillable, variable-power one we want. Its POWER still
    // comes from filling it with raw gunpowder in the cannon, but ASSEMBLING each casing
    // now presses in one packed_gunpowder, and packed_gunpowder is naphtha-gated, so every
    // cartridge still routes through the oil refinery. Naphtha = the "smokeless powder".
    // ──────────────────────────────────────────────────────────────────────

    // Powder charge path retired — Big Cartridges only.
    event.remove({ id: 'createbigcannons:powder_charge' });
    event.remove({ id: 'createbigcannons:empty_powder_charge' });

    // packed_gunpowder: naphtha-gated, now the treated powder pressed into each cartridge.
    event.remove({ id: 'createbigcannons:compacting/packed_gunpowder' });
    event.custom({
        type: 'create:compacting',
        ingredients: [
            { tag: 'createbigcannons:gunpowder' },
            { tag: 'createbigcannons:gunpowder' },
            { tag: 'createbigcannons:gunpowder' },
            fluidIngredient('tfmg:naphtha', 100)
        ],
        results: [{ id: 'createbigcannons:packed_gunpowder' }]
    }).id('kubejs:age6/packed_gunpowder_naphtha');

    // Big Cartridge assembly: press the brass sheet, then deploy one naphtha-treated
    // packed_gunpowder so the casing itself is the oil gate. Result keeps power 0 — you
    // still fill it with raw gunpowder in-cannon to set the power level (up to 4).
    event.remove({ id: 'createbigcannons:pressing_big_cartridge' });
    event.custom({
        type: 'create:sequenced_assembly',
        ingredient: { item: 'createbigcannons:big_cartridge_sheet' },
        loops: 1,
        results: [
            { components: { 'createbigcannons:power': 0 }, id: 'createbigcannons:big_cartridge' }
        ],
        sequence: [
            {
                type: 'create:pressing',
                ingredients: [{ item: 'createbigcannons:partially_formed_big_cartridge' }],
                results: [{ id: 'createbigcannons:partially_formed_big_cartridge' }]
            },
            {
                type: 'create:deploying',
                ingredients: [
                    { item: 'createbigcannons:partially_formed_big_cartridge' },
                    { item: 'createbigcannons:packed_gunpowder' }
                ],
                results: [{ id: 'createbigcannons:partially_formed_big_cartridge' }]
            }
        ],
        transitional_item: { id: 'createbigcannons:partially_formed_big_cartridge' }
    }).id('kubejs:age6/big_cartridge_naphtha_gated');

    // ──────────────────────────────────────────────────────────────────────
    // PART D — Autocannons gated like big cannons (not removed).
    //
    // Hardware is already steel: autocannon barrels/breeches/recoil springs are CAST from
    // molten metal, and Part A starves the cast-iron + bronze melts, so only molten STEEL
    // can cast them. Propellant was the remaining hole — autocannon cartridges fill with
    // raw gunpowder. Mirror the Big Cartridge: the cartridge CASING now presses in one
    // naphtha-gated packed_gunpowder, so every cartridge routes through the oil refinery.
    // Cartridges are reusable (the breech extractor ejects spent ones to refill), so this
    // is a once-per-casing cost, not per-shot. Filling stays raw gunpowder, and the AP/flak
    // PROJECTILE rounds are left cheap — same call as the cheap big-cannon shell casings.
    // ──────────────────────────────────────────────────────────────────────
    event.remove({ id: 'createbigcannons:sequenced_assembly/pressing_autocannon_cartridge' });
    event.custom({
        type: 'create:sequenced_assembly',
        ingredient: { item: 'createbigcannons:autocannon_cartridge_sheet' },
        loops: 1,
        results: [{ id: 'createbigcannons:empty_autocannon_cartridge' }],
        sequence: [
            {
                type: 'create:pressing',
                ingredients: [{ item: 'createbigcannons:partially_formed_autocannon_cartridge' }],
                results: [{ id: 'createbigcannons:partially_formed_autocannon_cartridge' }]
            },
            {
                type: 'create:deploying',
                ingredients: [
                    { item: 'createbigcannons:partially_formed_autocannon_cartridge' },
                    { item: 'createbigcannons:packed_gunpowder' }
                ],
                results: [{ id: 'createbigcannons:partially_formed_autocannon_cartridge' }]
            }
        ],
        transitional_item: { id: 'createbigcannons:partially_formed_autocannon_cartridge' }
    }).id('kubejs:age6/autocannon_cartridge_naphtha_gated');

    // ──────────────────────────────────────────────────────────────────────
    // PART E — Munitions audit: close the projectile bypasses.
    //
    // Hardware (steel) and propellant (naphtha cartridges) are gated, but the PROJECTILES
    // had cheap-iron holes that let you hurt the dragon without the explosive (acid) chain:
    //   • shrapnel_shell skipped the explosive filler (loose gunpowder) — re-based on
    //     high_explosive_materials (packed_guncotton → acid), like the HE/AP shells.
    //   • solid_shot / ap_shot / shot_balls were raw iron / cast iron — bumped to STEEL so
    //     all kinetic ammo needs the steel chain. This also makes iron-cased explosive shells
    //     the CHEAPER option, pulling players onto the acid/TFMG line. bag_of_grapeshot and
    //     flak rounds inherit the steel gate through shot_balls.
    //   • drop_mortar_shell referenced the retired powder_charge — repointed to big_cartridge.
    //   • nethersteel could be alloyed from iron-age cast iron, skipping steel entirely — that
    //     path is removed so the premium cannon tier also routes through the steel chain.
    // ──────────────────────────────────────────────────────────────────────

    // shrapnel_shell: explosive filler instead of loose gunpowder (Mechanical Crafter).
    event.remove({ id: 'createbigcannons:shrapnel_shell' });
    event.custom({
        type: 'create:mechanical_crafting',
        accept_mirrored: true,
        key: {
            I: { tag: 'c:ingots/iron' },
            L: { item: 'createbigcannons:shot_balls' },
            T: { tag: 'createbigcannons:high_explosive_materials' },
            S: { tag: 'minecraft:wooden_slabs' }
        },
        pattern: [
            ' I ',
            'ILI',
            'ITI',
            ' S '
        ],
        result: { count: 1, id: 'createbigcannons:shrapnel_shell' }
    }).id('kubejs:age6/shrapnel_shell_explosive');

    // Kinetic projectiles → steel (close the cheap-iron dragon bypass; grapeshot/flak
    // inherit the gate via shot_balls).
    event.replaceInput({ id: 'createbigcannons:solid_shot' }, '#c:ingots/iron', '#c:ingots/steel');
    event.replaceInput({ id: 'createbigcannons:ap_shot' }, '#c:ingots/cast_iron', '#c:ingots/steel');
    event.replaceInput({ id: 'createbigcannons:shot_balls' }, '#c:ingots/iron', '#c:ingots/steel');

    // drop_mortar_shell used the retired powder_charge — repoint to a big cartridge.
    event.replaceInput({ id: 'createbigcannons:drop_mortar_shell' }, 'createbigcannons:powder_charge', 'createbigcannons:big_cartridge');

    // Nethersteel must route through steel, not iron-age cast iron.
    event.remove({ id: 'createbigcannons:mixing/alloy_nethersteel_cast_iron' });
});

// ── Big Cartridge is the only valid big-cannon propellant ──
// big_cannon_propellant = #big_cannon_propellant_bags (powder_charge) + #big_cannon_cartridges
// (big_cartridge). Emptying the bags tag drops powder charges from the umbrella, so a loaded
// Powder Charge is no longer recognised and only Big Cartridges propel a big cannon.
ServerEvents.tags('item', function (event) {
    event.remove('createbigcannons:big_cannon_propellant_bags', 'createbigcannons:powder_charge');
});
