// priority: 75
//
// RETIRED 2026-06-14 — the diamond-catalyst + deposit-regrow renewable system has been replaced
// by Create: Ore Excavation tiered drills (server_scripts/drilling.js + startup_scripts/drilling_startup.js).
//
// Meteors still generate as first-contact ore. Their glowing `kubejs:<metal>_deposit` floor blocks
// stay registered (meteor_startup.js) as INERT decoration — the worldgen meteor JSONs still
// reference them as the `floor`, so removing them would break generation. The right-click ore-regrow
// handler and the `kubejs:diamond_catalyst` item are gone; deposits no longer do anything on use.
