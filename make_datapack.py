import os
import json
import zipfile
import shutil

# --- 1. CONFIGURATION ---

TIERS = [
    # Tier 1 (Global - 100% chance everywhere)
    ("zinc", [], "create:zinc_ore", "create:deepslate_zinc_ore", 0, 1000, 1.0, 12, 10),
    ("coal", ["minecraft:ore_coal_upper", "minecraft:ore_coal_lower"], "minecraft:coal_ore", "minecraft:deepslate_coal_ore", 0, 1000, 1.0, 17, 10),
    
    # Tier 2
    ("copper", ["minecraft:ore_copper", "minecraft:ore_copper_large"], "minecraft:copper_ore", "minecraft:deepslate_copper_ore", 2000, 3000, 0.0, 12, 10),
    ("quartz", [], "minecraft:nether_quartz_ore", "minecraft:nether_quartz_ore", 2000, 3000, 0.0, 14, 10),
    ("gold", ["minecraft:ore_gold", "minecraft:ore_gold_lower"], "minecraft:gold_ore", "minecraft:deepslate_gold_ore", 2000, 3000, 0.0, 9, 10),
    
    # Tier 3
    ("iron", ["minecraft:ore_iron_upper", "minecraft:ore_iron_middle", "minecraft:ore_iron_small"], "minecraft:iron_ore", "minecraft:deepslate_iron_ore", 3500, 4500, 0.0, 12, 10),
    ("lapis", ["minecraft:ore_lapis", "minecraft:ore_lapis_buried"], "minecraft:lapis_ore", "minecraft:deepslate_lapis_ore", 3500, 4500, 0.0, 7, 10),
    
    # Tier 4
    ("lead", ["tfmg:lead_ore"], "tfmg:lead_ore", "tfmg:deepslate_lead_ore", 5000, 6000, 0.0, 10, 10),
    ("bauxite", [], "tfmg:bauxite", None, 5000, 6000, 0.0, 24, 10),
    ("redstone", ["minecraft:ore_redstone", "minecraft:ore_redstone_lower"], "minecraft:redstone_ore", "minecraft:deepslate_redstone_ore", 0, 5000, 0.0, 8, 10),
    ("nickel", ["tfmg:nickel_ore"], "tfmg:nickel_ore", "tfmg:deepslate_nickel_ore", 5000, 6000, 0.0, 10, 10), 
    
    # Tier 5
    ("diamond", ["minecraft:ore_diamond", "minecraft:ore_diamond_large", "minecraft:ore_diamond_buried", "minecraft:ore_diamond_medium"], "minecraft:diamond_ore", "minecraft:deepslate_diamond_ore", 6500, 7500, 0.0, 8, 10),
    ("emerald", ["minecraft:ore_emerald"], "minecraft:emerald_ore", "minecraft:deepslate_emerald_ore", 5500, 6500, 0.0, 6, 10),

    # Create Custom "Strikes" (Massive dense resource blobs)
    ("asurine", [], "create:asurine", "create:asurine", 0, 2000, 0.0, 64, 2),
    ("crimsite", [], "create:crimsite", "create:crimsite", 3500, 4500, 0.0, 64, 2),
    ("ochrum", [], "create:ochrum", "create:ochrum", 2000, 3000, 0.0, 64, 2),
    ("veridium", [], "create:veridium", "create:veridium", 2000, 3000, 0.0, 64, 2)
]

NAMESPACE = "skylanders_ores"
PACK_DIR = "skylanders_distant_ores"

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def write_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

# --- 2. SETUP FOLDERS ---
create_dir(PACK_DIR)
data_dir = os.path.join(PACK_DIR, "data", NAMESPACE)
neo_dir = os.path.join(data_dir, "neoforge", "biome_modifier")
conf_dir = os.path.join(data_dir, "worldgen", "configured_feature")
place_dir = os.path.join(data_dir, "worldgen", "placed_feature")

for d in [neo_dir, conf_dir, place_dir]:
    create_dir(d)

write_json(os.path.join(PACK_DIR, "pack.mcmeta"), {
    "pack": {
        "description": "Sky Island Distant Ores Progression",
        "pack_format": 48
    }
})

# --- 3. GENERATE ALL ORES AND STRIKES ---
for ore_name, feats_to_remove, stone_block, deepslate_block, min_dist, max_dist, chance, vein_size, chunk_count in TIERS:
    if feats_to_remove:
        write_json(os.path.join(neo_dir, f"remove_{ore_name}.json"), {
            "type": "neoforge:remove_features",
            "biomes": "#minecraft:is_overworld",
            "features": feats_to_remove
            #"step": "underground_ores" # FIXED: Removed the 's' so it correctly parses in 1.21.1
        })

    write_json(os.path.join(neo_dir, f"add_{ore_name}.json"), {
        "type": "neoforge:add_features",
        "biomes": "#minecraft:is_overworld",
        "features": [f"{NAMESPACE}:{ore_name}_sky"],
        "step": "underground_ores"
    })

    targets = [
      {
        "state": { "Name": stone_block },
        "target": { "predicate_type": "minecraft:tag_match", "tag": "minecraft:stone_ore_replaceables" }
      }
    ]
    if deepslate_block:
        targets.append({
            "state": { "Name": deepslate_block },
            "target": { "predicate_type": "minecraft:tag_match", "tag": "minecraft:deepslate_ore_replaceables" }
        })

    write_json(os.path.join(conf_dir, f"{ore_name}.json"), {
      "type": "minecraft:ore",
      "config": {
        "discard_chance_on_air_exposure": 0.0,
        "size": vein_size,
        "targets": targets
      }
    })

    placement_rules = [
        { "type": "minecraft:count", "count": chunk_count },
        { "type": "minecraft:in_square" },
        {
          "type": "minecraft:height_range",
          "height": {
            "type": "minecraft:uniform",
            "min_inclusive": { "absolute": -64 },
            "max_inclusive": { "absolute": 319 }
          }
        }
    ]

    if chance < 1.0:
        placement_rules.append({
          "type": "distantores:distance_from_origin",
          "min_distance": min_dist,
          "max_distance": max_dist,
          "base_chance": chance
        })
        
    placement_rules.append({ "type": "minecraft:biome" })

    write_json(os.path.join(place_dir, f"{ore_name}_sky.json"), {
      "feature": f"{NAMESPACE}:{ore_name}",
      "placement": placement_rules
    })

# --- 4. REMOVE DEFAULT TFMG OIL ---
write_json(os.path.join(neo_dir, "remove_tfmg_oil.json"), {
    "type": "neoforge:remove_features",
    "biomes": "#minecraft:is_overworld",
    "features": ["tfmg:oil_deposit"],
    "step": "underground_ores"  # FIXED: Removed the 's' here too!
})

# --- 5. GENERATE THE NEW CUSTOM OIL METEORS ---
write_json(os.path.join(neo_dir, "add_custom_oil.json"), {
    "type": "neoforge:add_features",
    "biomes": "#minecraft:is_overworld",
    "features": [f"{NAMESPACE}:custom_oil_meteor_sky"],
    "step": "underground_ores"
})

write_json(os.path.join(conf_dir, "custom_oil_meteor.json"), {
  "type": "skylandersmeteors:meteor",
  "config": {
    "outer_shell": {
      "type": "minecraft:simple_state_provider",
      "state": { "Name": "minecraft:tuff" }
    },
    "middle_shell": {
      "type": "minecraft:simple_state_provider",
      "state": { "Name": "minecraft:smooth_basalt" }
    },
    "inner_shell": {
      "type": "minecraft:simple_state_provider",
      "state": { "Name": "minecraft:blackstone" }
    },
    "filling": {
      "type": "minecraft:simple_state_provider",
      "state": { "Name": "tfmg:crude_oil" } 
    },
    "floor": {
      "type": "minecraft:simple_state_provider",
      "state": { "Name": "tfmg:oil_deposit" }
    },
    "radius": {
      "type": "minecraft:uniform",
      "min_inclusive": 10,
      "max_inclusive": 16 
    }
  }
})

write_json(os.path.join(place_dir, "custom_oil_meteor_sky.json"), {
  "feature": f"{NAMESPACE}:custom_oil_meteor",
  "placement": [
    { "type": "minecraft:rarity_filter", "chance": 1000 }, 
    { "type": "minecraft:in_square" },
    {
      "type": "minecraft:height_range",
      "height": {
        "type": "minecraft:uniform",
        "min_inclusive": { "absolute": -64 },
        "max_inclusive": { "absolute": 319 }
      }
    },
    {
      "type": "minecraft:block_predicate_filter",
      "predicate": {
        "type": "minecraft:matching_blocks",
        "blocks": ["minecraft:air"]
      }
    },
    {
      "type": "distantores:distance_from_origin",
      "min_distance": 5000,
      "max_distance": 15000,
      "base_chance": 0.0
    },
    { "type": "minecraft:biome" }
  ]
})

# --- 6. ZIP DATAPACK ---
zip_filename = f"{PACK_DIR}.zip"
with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(PACK_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            zipf.write(file_path, os.path.relpath(file_path, PACK_DIR))

shutil.rmtree(PACK_DIR)
print(f"Successfully created {zip_filename} with fixed removal syntax!")