// priority: 60

// Wipe Create: Ore Excavation's default content so our tiered drill system (drilling.js,
// priority 50 — runs AFTER this) is the ONLY ore source. Otherwise the mod's default
// vanilla-ore veins could be mined with default drills, bypassing every age/band gate.
//
// Runs at higher priority (60 > 50) so these removals apply to the mod's loaded defaults
// first; drilling.js then adds our veins afterward, untouched by the by-type removal above.
ServerEvents.recipes(event => {
    // All default ore/fluid veins and the drilling recipes that pair with them.
    // NOTE: if the type ids differ these silently no-op (remove nothing) — verify in the load
    // test that default veins are gone from JEI / the Vein Finder; tell me if any remain.
    event.remove({ type: 'createoreexcavation:vein' });
    event.remove({ type: 'createoreexcavation:drilling' });

    // The mod's own Iron / Diamond / Netherite drills are KEPT craftable with their default recipes —
    // they serve as the tier-2/3/4 drills; only the Copper Drill is custom (drilling.js). So we do NOT
    // remove their crafting recipes here.

    // The mod's Drilling Machine recipe is mechanical-crafted + brass-gated (brass age). Remove it;
    // drilling.js (priority 50, runs after) re-adds a plain copper-tier crafting recipe so the system
    // is buildable in the copper age. (Fluid Extractor + other block recipes are left intact.)
    event.remove({ output: 'createoreexcavation:drilling_machine' });

    // The Prospector's Radar (coebetterfinder) ships under the recipe id 'createoreexcavation:vein_finder'
    // (it overrides COE's finder, changing the output to coebetterfinder:radar_prospecteur) and needs an
    // ender eye + redstone — ender eye is Nether/brass age, so the radar is locked well past when you
    // actually need to scout copper/zinc veins. Remove it by id; drilling.js re-adds a copper-tier recipe.
    event.remove({ id: 'createoreexcavation:vein_finder' });
});
