// priority: 60

// ─────────────────────────────────────────────────────────────────────────────
// Age 6 — Dragon Fight (endgame capstone)
//
// The ender dragon is the final gate, killable ONLY with Create Big Cannons (CBC)
// fought from an airship. This script owns the DRAGON SIDE of that fight:
//   1. Hard immunity  — the dragon takes ZERO damage from anything that isn't a
//                       CBC weapon (autocannons + big cannons + shell fragments).
//   2. Effective HP   — allowed CBC damage is divided down so the dragon soaks
//                       ~Nx more shells, making a mass-produced CBC battery worth it.
//   3. High player dmg— so the player must armour up (Age-5 metals) to survive.
//
// Why effective-HP-via-damage-division instead of a bigger max-health attribute:
// the dragon is created/managed by EnderDragonFight, and EntityEvents.spawned only
// fires when the entity is ADDED to the level — a dragon that already exists in a
// loaded chunk never re-fires it, so a spawn-time attribute buff silently no-ops
// (this is exactly what happened in testing: immunity + player-dmg worked, HP didn't).
// Dividing damage runs on every hit in the same beforeHurt hook that's proven to
// fire, so it ALWAYS applies. Trade-off: the boss bar still reads out of 200, it just
// depletes ~N× slower. If a literal 600-HP bar is wanted, see the note at the bottom.
//
// NOT handled here (separate workstreams — see memory project-dragon-fight-phase):
//   • End-crystal gate (big-cannon-shell-ONLY): DONE in skylandersmeteors via
//     MixinEndCrystal#onlyBigCannonShellsDestroyCrystals — it injects EndCrystal.hurt()
//     and cancels every source except createbigcannons:big_cannon_projectile. (end_crystal
//     is not a LivingEntity, so beforeHurt here can't reach it — hence the mixin.)
//   • Cannon-component / ammo recipe gating (oil + TFMG metals): DONE in cbc_arsenal.js
//     (steel hardware, naphtha propellant, sulfuric-acid explosives, circuit-board fuzes).
//   • Airship-block (Sable) protection: likely free (dragon scans the main End level,
//     airship blocks live in a Sable sub-level) — confirm in creative before adding code.
// ─────────────────────────────────────────────────────────────────────────────

// ── Tunables ────────────────────────────────────────────────────────────────
// Effective-HP multiplier. 3.0 = the dragon soaks ~3× its vanilla 200 HP worth of
// CBC fire (every allowed hit deals 1/3 damage). Raise for a longer siege.
var DRAGON_HP_MULTIPLIER = 3.0;
// The dragon must threaten an Age-5-armoured player; 2× its already-stiff melee/charge.
var PLAYER_DAMAGE_MULT = 2.0;

// ── CBC damage types the dragon is allowed to take ───────────────────────────
// Matched against the damage-type REGISTRY id (source.typeHolder()), NOT message_id:
// CBC's big_cannon_projectile and cannon_projectile share one message_id, so msgId
// can't tell big-cannon shells from generic cannon hits. The registry id is exact.
// Both weapon roles hurt the dragon BODY here (autocannons = DPS, big shells = also
// the only crystal-killer, enforced separately by the crystal mixin once it exists).
var DRAGON_ALLOWED_DAMAGE = [
    'createbigcannons:big_cannon_projectile',
    'createbigcannons:cannon_projectile',
    'createbigcannons:machine_gun_fire',
    'createbigcannons:machine_gun_fire_in_water',
    'createbigcannons:flak',
    'createbigcannons:grapeshot',
    'createbigcannons:shrapnel'
];

// Read the exact damage-type registry id (e.g. "createbigcannons:big_cannon_projectile")
// off a DamageSource. Returns '' if the type isn't registered (shouldn't happen).
function damageTypeId(source) {
    var key = source.typeHolder().unwrapKey();
    return key.isPresent() ? key.get().location().toString() : '';
}

// ── 1 + 2. Hard immunity + effective HP ──────────────────────────────────────
// Non-CBC damage is zeroed (LivingDamageEvent.Pre can't be cancelled outright, so
// 0 damage is the equivalent). CBC damage is allowed but divided down to fake extra HP.
EntityEvents.beforeHurt('minecraft:ender_dragon', function (event) {
    if (DRAGON_ALLOWED_DAMAGE.indexOf(damageTypeId(event.source)) == -1) {
        event.setDamage(0.0);
        return;
    }
    event.setDamage(event.getDamage() / DRAGON_HP_MULTIPLIER);
});

// ── 3. High player damage when the dragon is the attacker ────────────────────
EntityEvents.beforeHurt('minecraft:player', function (event) {
    var attacker = event.source.getEntity(); // causing entity (dragon for melee/charge)
    // kjs$getType() returns the registry id STRING; the bean `type` getter returns an
    // EntityType object that won't == a string, so call the explicit accessor.
    if (attacker && attacker.kjs$getType() == 'minecraft:ender_dragon') {
        event.setDamage(event.getDamage() * PLAYER_DAMAGE_MULT);
    }
});

// ── Note: want the boss bar to literally read 600 HP? ────────────────────────
// Setting max_health reliably means catching the dragon lazily on its first hurt
// (persistentData-guarded) rather than at spawn — but whether kjs$setMaxHealth even
// applies to the EnderDragon is unverified. The damage-division above is gameplay-
// equivalent and guaranteed, so it's the default. Revisit only if the literal bar
// number matters.
