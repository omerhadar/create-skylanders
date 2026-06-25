// priority: 85

// Brass Age (between iron and diamond) — Nether access unlocks the blaze burner,
// brass, and the smart-machine tier. Recipes here cover the skylandersmeteors
// airship-logistics blocks that have no data-gen recipes of their own.
// (Brass itself, deployer, crafter etc. are Create defaults — naturally gated
// by the blaze burner heat requirement, nothing to override.)
ServerEvents.recipes(function (event) {
    // Station: the named docking/route target for airship logistics.
    event.shaped('skylandersmeteors:station', [
        ' T ',
        'BCB',
        'SSS'
    ], {
        T: 'create:electron_tube',
        B: 'create:brass_ingot',
        C: 'create:brass_casing',
        S: 'minecraft:smooth_stone'
    }).id('kubejs:brass/station');

    // Route card: programmed by right-clicking it in hand; cheap and repeatable.
    event.shapeless('skylandersmeteors:route_card', [
        'minecraft:paper',
        'create:brass_nugget'
    ]).id('kubejs:brass/route_card');

    // ── Precision mechanism on brass instead of gold ──
    // Default sequenced assembly starts from a gold plate. Re-base it on a brass
    // plate so the precision mechanism is fed by this age's signature metal, and
    // swap the gold "botched mechanism" byproducts for their brass counterparts so
    // a brass input never trickles gold back out. Loops/deploying steps unchanged.
    event.remove({ id: 'create:sequenced_assembly/precision_mechanism' });
    event.custom({
        type: 'create:sequenced_assembly',
        ingredient: { tag: 'c:plates/brass' },
        loops: 5,
        results: [
            { chance: 120.0, id: 'create:precision_mechanism' },
            { chance: 8.0, id: 'create:brass_sheet' },
            { chance: 8.0, id: 'create:andesite_alloy' },
            { chance: 5.0, id: 'create:cogwheel' },
            { chance: 3.0, id: 'create:brass_nugget' },
            { chance: 2.0, id: 'create:shaft' },
            { chance: 2.0, id: 'create:brass_ingot' },
            { id: 'minecraft:iron_ingot' },
            { id: 'minecraft:clock' }
        ],
        sequence: [
            {
                type: 'create:deploying',
                ingredients: [{ item: 'create:incomplete_precision_mechanism' }, { item: 'create:cogwheel' }],
                results: [{ id: 'create:incomplete_precision_mechanism' }]
            },
            {
                type: 'create:deploying',
                ingredients: [{ item: 'create:incomplete_precision_mechanism' }, { item: 'create:large_cogwheel' }],
                results: [{ id: 'create:incomplete_precision_mechanism' }]
            },
            {
                type: 'create:deploying',
                ingredients: [{ item: 'create:incomplete_precision_mechanism' }, { tag: 'c:nuggets/iron' }],
                results: [{ id: 'create:incomplete_precision_mechanism' }]
            }
        ],
        transitional_item: { id: 'create:incomplete_precision_mechanism' }
    }).id('kubejs:brass/precision_mechanism');
});
