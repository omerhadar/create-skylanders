WorldgenEvents.remove(event => {
    // 1. Forcefully remove Bauxite blobs
    event.removeOres(ores => {
        ores.blocks = ['tfmg:bauxite']
    })
})