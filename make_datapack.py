import os
import json
import zipfile
import shutil

# --- 1. CONFIGURATION ---

TIERS = [
    # Tier 1 (Global - 100% chance everywhere)
    ("zinc", [], "create:zinc_ore", "create:deepslate_zinc_ore", 0, 1500, 1.0, 12, 10),
    ("coal", ["minecraft:ore_coal_upper", "minecraft:ore_coal_lower"], "minecraft:coal_ore", "minecraft:deepslate_coal_ore", 0, 1500, 1.0, 17, 10),
    
    # Tier 2
    ("copper", ["minecraft:ore_copper", "minecraft:ore_copper_large"], "minecraft:copper_ore", "minecraft:deepslate_copper_ore", 1000, 2000, 0.0, 12, 10),
    ("quartz", [], "minecraft:nether_quartz_ore", "minecraft:nether_quartz_ore", 1000, 2000, 0.0, 14, 10),
    ("gold", ["minecraft:ore_gold", "minecraft:ore_gold_lower"], "minecraft:gold_ore", "minecraft:deepslate_gold_ore", 1000, 2000, 0.0, 9, 10),
    
    # Tier 3
    ("iron", ["minecraft:ore_iron_upper", "minecraft:ore_iron_middle", "minecraft:ore_iron_small"], "minecraft:iron_ore", "minecraft:deepslate_iron_ore", 2500, 3500, 0.0, 12, 10),
    ("lapis", ["minecraft:ore_lapis", "minecraft:ore_lapis_buried"], "minecraft:lapis_ore", "minecraft:deepslate_lapis_ore", 2500, 3500, 0.0, 7, 10),
    
    # Tier 4
    ("lead", ["tfmg:lead_ore"], "tfmg:lead_ore", "tfmg:deepslate_lead_ore", 4000, 5000, 0.0, 10, 10),
    ("bauxite", [], "tfmg:bauxite", None, 4000, 5000, 0.0, 24, 10),
    ("redstone", ["minecraft:ore_redstone", "minecraft:ore_redstone_lower"], "minecraft:redstone_ore", "minecraft:deepslate_redstone_ore", 0, 5000, 0.0, 8, 10),
    ("nickel", ["tfmg:nickel_ore"], "tfmg:nickel_ore", "tfmg:deepslate_nickel_ore", 4000, 5000, 0.0, 10, 10), 
    
    # Tier 5
    ("diamond", ["minecraft:ore_diamond", "minecraft:ore_diamond_large", "minecraft:ore_diamond_buried"], "minecraft:diamond_ore", "minecraft:deepslate_diamond_ore", 5500, 6500, 0.0, 8, 10),
    ("emerald", ["minecraft:ore_emerald"], "minecraft:emerald_ore", "minecraft:deepslate_emerald_ore", 5500, 6500, 0.0, 6, 10),

    # Create Custom "Strikes" (Massive dense resource blobs)
    ("asurine", [], "create:asurine", "create:asurine", 0, 2000, 0.0, 64, 2),
    ("crimsite", [], "create:crimsite", "create:crimsite", 2500, 3500, 0.0, 64, 2),
    ("ochrum", [], "create:ochrum", "create:ochrum", 1000, 5000, 0.0, 64, 2),
    ("veridium", [], "create:veridium", "create:veridium", 1000, 2000, 0.0, 64, 2)
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
            "features": feats_to_remove,
            "steps": "underground_ores"
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
    "steps": "underground_ores" 
})

# --- 5. GENERATE CUSTOM FLOATING OIL GEODES ---
write_json(os.path.join(neo_dir, "add_custom_oil.json"), {
    "type": "neoforge:add_features",
    "biomes": "#minecraft:is_overworld",
    "features": [f"{NAMESPACE}:custom_oil_geode_sky"],
    "step": "underground_ores"
})

write_json(os.path.join(conf_dir, "custom_oil_geode.json"), {
  "type": "minecraft:geode",
  "config": {
    "blocks": {
      "filling_provider": {
        "type": "minecraft:weighted_state_provider",
        "entries": [
          {
            "weight": 90, 
            "data": { "Name": "tfmg:crude_oil" } 
          },
          {
            "weight": 10,
            "data": { "Name": "tfmg:oil_deposit" } 
          }
        ]
      },
      "inner_layer_provider": {
        "type": "minecraft:simple_state_provider",
        "state": { "Name": "minecraft:blackstone" }
      },
      "alternate_inner_layer_provider": {
        "type": "minecraft:simple_state_provider",
        "state": { "Name": "minecraft:magma_block" }
      },
      "middle_layer_provider": {
        "type": "minecraft:simple_state_provider",
        "state": { "Name": "minecraft:smooth_basalt" }
      },
      "outer_layer_provider": {
        "type": "minecraft:simple_state_provider",
        "state": { "Name": "minecraft:tuff" }
      },
      
      # FIXED: Uses exact JSON objects instead of strings
      "inner_placements": [ { "Name": "tfmg:oil_deposit" }, { "Name": "tfmg:crude_oil" } ], 
      
      "cannot_replace": "#minecraft:features_cannot_replace",
      "invalid_blocks": "#minecraft:geode_invalid_blocks"
    },
    
    "layers": {
      "filling": 6.0,
      "inner_layer": 7.0,
      "middle_layer": 8.0,
      "outer_layer": 9.0
    },
    "crack": {
      "generate_crack_chance": 0.0, 
      "base_crack_size": 2.0,
      "crack_point_offset": 2
    },
    "noise_multiplier": 0.05,
    "use_potential_placements_chance": 0.0,
    "use_alternate_layer0_chance": 0.1,
    "placements_require_layer0_alternate": False, 
    
    # FIXED: Re-included the "value" wrapper for the IntProviders
    "outer_wall_distance": {
      "type": "minecraft:uniform",
      "value": { "min_inclusive": 8, "max_inclusive": 16 }
    },
    "distribution_points": {
      "type": "minecraft:uniform",
      "value": { "min_inclusive": 3, "max_inclusive": 6 }
    },
    "point_offset": {
      "type": "minecraft:uniform",
      "value": { "min_inclusive": 1, "max_inclusive": 3 }
    },
    
    "min_gen_offset": -16,
    "max_gen_offset": 16,
    
    "invalid_blocks_threshold": 100000 
  }
})

write_json(os.path.join(place_dir, "custom_oil_geode_sky.json"), {
  "feature": f"{NAMESPACE}:custom_oil_geode",
  "placement": [
    { "type": "minecraft:rarity_filter", "chance": 250 }, 
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
print(f"Successfully created {zip_filename} with correct Geode syntax!")