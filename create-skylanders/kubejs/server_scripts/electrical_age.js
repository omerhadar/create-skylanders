// priority: 65

// Electrical Age (between Advanced Metals and the dragon fight).
// TFMG's electrical tier is the endgame sink for the Age-5 metals: nickel →
// magnetic alloy, silicon → magnetic alloy, aluminum → cables, lithium →
// capacitors (reworked below), plus oil fractions → plastic and engine fuel.
// The arc furnace steel route is left intact in steel_age.js — its vat +
// graphite-electrode + power requirements gate it behind this age naturally.

ServerEvents.recipes(function (event) {
    // ── Lithium capacitors ──
    // Default capacitors are steel + copper plates + paper. Reworked to consume
    // lithium ingots so the Age-5 metal has a real endgame sink — capacitors feed
    // every circuit board and generator. (No lithium_sheet item exists in TFMG.)
    event.remove({ id: 'tfmg:sequenced_assembly/capacitor' });
    event.custom({
        type: 'create:sequenced_assembly',
        ingredient: { tag: 'c:plates/steel' },
        results: [{ count: 4, id: 'tfmg:capacitor_item' }],
        sequence: [
            {
                type: 'create:deploying',
                ingredients: [{ item: 'tfmg:unfinished_capacitor' }, { item: 'tfmg:lithium_ingot' }],
                results: [{ id: 'tfmg:unfinished_capacitor' }]
            },
            {
                type: 'create:deploying',
                ingredients: [{ item: 'tfmg:unfinished_capacitor' }, { item: 'minecraft:paper' }],
                results: [{ id: 'tfmg:unfinished_capacitor' }]
            },
            {
                type: 'create:deploying',
                ingredients: [{ item: 'tfmg:unfinished_capacitor' }, { item: 'tfmg:lithium_ingot' }],
                results: [{ id: 'tfmg:unfinished_capacitor' }]
            }
        ],
        transitional_item: { id: 'tfmg:unfinished_capacitor' }
    }).id('kubejs:electrical/lithium_capacitor');

    // ── Fuze gating: ALL fuzes are electronics now ──
    // Every fuze a shell can carry is forced behind a circuit board (the Electrical Age), the
    // same single-choke-point pattern as guncotton/acid. The cheap default fuzes — Impact,
    // Timed, Wired and Delayed Impact — are removed outright so there is no budget bypass; the
    // only fuzes left are the circuit-board ones below: Inertia, Delayed Inertia, and Proximity.
    [
        'createbigcannons:impact_fuze',
        'createbigcannons:timed_fuze',
        'createbigcannons:wired_fuze',
        'createbigcannons:delayed_impact_fuze'
    ].forEach(function (id) { event.remove({ id: id }); });

    // The reworked reliable fuzes each need a circuit board. (Two recipes can't be byte-
    // identical — one grid maps to one output — so the delayed variant uses a clock for its
    // timer; otherwise it's the same head + circuit board.)
    event.remove({ id: 'createbigcannons:inertia_fuze' });
    event.shaped('4x createbigcannons:inertia_fuze', [
        'T',
        'Z',
        'R'
    ], {
        T: '#createbigcannons:impact_fuze_head',
        Z: 'tfmg:circuit_board',
        R: '#createbigcannons:dusts_redstone'
    }).id('kubejs:electrical/inertia_fuze');

    event.remove({ id: 'createbigcannons:delayed_inertia_fuze' });
    event.shaped('4x createbigcannons:delayed_inertia_fuze', [
        'T',
        'Z',
        'C'
    ], {
        T: '#createbigcannons:impact_fuze_head',
        Z: 'tfmg:circuit_board',
        C: 'minecraft:clock'
    }).id('kubejs:electrical/delayed_inertia_fuze');

    // The PROXIMITY fuze is the ideal anti-air detonator (it bursts near a flying target —
    // perfect against the dragon) yet shipped cheap on a quartz sensor, sidestepping the
    // circuit-board gate the other reliable fuzes carry. It's an electronic sensor fuze, so
    // swap its quartz for a circuit board — same electrical gate as the inertia variants.
    event.replaceInput({ id: 'createbigcannons:proximity_fuze' }, '#createbigcannons:gems_quartz', 'tfmg:circuit_board');
});
