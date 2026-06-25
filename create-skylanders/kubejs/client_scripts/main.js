// Visit the wiki for more info - https://kubejs.com/
console.info('Hello, World! (Loaded client example script)')

// ── JEI info page: how to get Limestone on the sky islands ──
// create:limestone is worldgen-only (unmineable here) but Create registers a
// NeoForge fluid interaction that works exactly like a cobblestone generator,
// with honey standing in for water: where a flowing Lava stream meets a flowing
// Honey stream side by side, the lava turns into Limestone. It isn't a recipe,
// so JEI can't show it as a recipe panel — we surface it as an info tab instead.
RecipeViewerEvents.addInformation('item', function (event) {
    event.add('create:limestone', [
        'Limestone Generator',
        'Works exactly like a cobblestone generator, but with Honey OR Sweet Syrup in',
        'place of water: set flowing Lava and flowing Honey/Syrup so the streams meet',
        'side by side, and the lava turns into Limestone where they touch.',
        'No bees? Sweet Syrup is the bee-free stand-in — boil 4 Sugar + 1000mb Water',
        'into Syrup in a heated Mixer and use it exactly like honey.',
        'Crush Limestone in Crushing Wheels to get Limesand (steel flux / cement).'
    ]);
    // Sweet Syrup is the bee-free key to limestone (and thus steel flux); point players at
    // it from the syrup bucket and from honey bottle (which they'll look up first).
    event.add('kubejs:sweet_syrup_bucket', [
        'Sweet Syrup — bee-free honey for the Limestone Generator',
        'Boil 4 Sugar + 1000mb Water into Sweet Syrup in a heated Mixer. Used exactly like',
        'honey: flowing Lava meeting flowing Syrup makes Limestone, which crushes into',
        'Limesand — the only flux for Steel. One bucket sets up a permanent generator.'
    ]);
    event.add('minecraft:honey_bottle', [
        'Bee-free Honey Bottle',
        'Craft 3 Sugar + a Glass Bottle into a Honey Bottle — no bees needed for the',
        'edible, poison-curing honey. (For the Limestone Generator, use Sweet Syrup.)'
    ]);
});

