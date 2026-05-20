# Auto Sable Physics Datapack

This datapack provides reusable block tags for support and structural logic.

Tags included:

- autosablephysics:support_blocks
  Blocks that can act as anchors/supports.

- autosablephysics:structural_blocks
  Blocks that transfer structural support during BFS traversal.

- autosablephysics:non_physics_blocks
  Decorative/utility blocks ignored by physics assembly.

Example Java usage:

state.is(TagKey.create(
    Registries.BLOCK,
    ResourceLocation.fromNamespaceAndPath(
        "autosablephysics",
        "support_blocks"
    )
));

Install:
1. Put the ZIP into your world's datapacks folder.
2. Run /reload
3. Your mod can now query these tags.