// Frontier age-gates — moved off the skylandersmeteors FrontierTaskHandler onto
// KubeJS (ftb-xmod-compat's FTB Quests integration) so the trigger distances live
// in the pack and track the compressed ore rings instead of being read from the mod.
//
// WHY this coexists with the mod instead of fighting it: FrontierTaskHandler parses
// each custom task's TITLE for "<N> blocks from spawn" and only installs its own
// check when it finds a number (its `if (dist > 0)` guard). The four task titles
// were reworded to drop that exact phrase, so the mod no-ops for them and leaves the
// task's single check slot to us. We bind by FTB Quests task id — the customTask
// event is targeted by CustomTask.toString(), which is the %016X task id.
//
// Each gate completes when a player is >= N blocks from world origin (0,0) — the
// distance where that tier's ore now begins (see the worldgen ring compression).
// To retune a gate, change the number here; nothing else references it.

var FRONTIERS = [
  { task: '7200000000002001', distance: 1000 }, // The Copper Frontier
  { task: '7200000000002012', distance: 2000 }, // The Iron Frontier
  { task: '7300000000002016', distance: 3000 }, // The Diamond Frontier
  { task: '7400000000002009', distance: 4000 }  // The Advanced Frontier
]

FRONTIERS.forEach(function (f) {
  var distSq = f.distance * f.distance
  FTBQuestsEvents.customTask(f.task, function (event) {
    event.setMaxProgress(1)
    event.setEnableButton(false) // travel-gated only — no manual claim button
    event.setCheckTimer(20)      // re-check online players every 20 ticks (1s)
    event.setCheck(function (data, player) {
      if (data.getProgress() >= 1) return
      var x = player.getX(), z = player.getZ()
      if (x * x + z * z >= distSq) data.setProgress(1)
    })
  })
})
