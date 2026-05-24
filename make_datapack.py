import os
import json
import zipfile
import shutil

# --- FIXED Configuration ---
TIERS = [
    ("zinc", ["create:zinc_ore"], "create:zinc_ore", "create:deepslate_zinc_ore", 0, 1500, 1.0),
    ("copper", ["minecraft:ore_copper", "minecraft:ore_copper_large"], "minecraft:copper_ore", "minecraft:deepslate_copper_ore", 1000, 2000, 0.0),
    ("quartz", [], "minecraft:nether_quartz_ore", "minecraft:nether_quartz_ore", 1000, 2000, 0.0),
    ("iron", ["minecraft:ore_iron_upper", "minecraft:ore_iron_middle", "minecraft:ore_iron_small"], "minecraft:iron_ore", "minecraft:deepslate_iron_ore", 2500, 3500, 0.0),
    ("lead", ["tfmg:lead_ore"], "tfmg:lead_ore", "tfmg:deepslate_lead_ore", 4000, 5000, 0.0),
    ("bauxite", [], "tfmg:bauxite", None, 4000, 5000, 0.0),
    ("diamond", ["minecraft:ore_diamond", "minecraft:ore_diamond_large", "minecraft:ore_diamond_buried"], "minecraft:diamond_ore", "minecraft:deepslate_diamond_ore", 5500, 6500, 0.0)
]

NAMESPACE = "skylanders_ores"
PACK_DIR = "skylanders_distant_ores"

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

def write_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)

# 1. Setup Folders
create_dir(PACK_DIR)
data_dir = os.path.join(PACK_DIR, "data", NAMESPACE)
neo_dir = os.path.join(data_dir, "neoforge", "biome_modifier")
conf_dir = os.path.join(data_dir, "worldgen", "configured_feature")
place_dir = os.path.join(data_dir, "worldgen", "placed_feature")

for d in [neo_dir, conf_dir, place_dir]:
    create_dir(d)

# 2. Write pack.mcmeta
write_json(os.path.join(PACK_DIR, "pack.mcmeta"), {
    "pack": {
        "description": "Sky Island Distant Ores Progression",
        "pack_format": 48
    }
})

# 3. Generate Files for Each Tier
for ore_name, feats_to_remove, stone_block, deepslate_block, min_dist, max_dist, chance in TIERS:
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
        "target": {
          "predicate_type": "minecraft:tag_match",
          "tag": "minecraft:stone_ore_replaceables"
        }
      }
    ]
    if deepslate_block:
        targets.append({
            "state": { "Name": deepslate_block },
            "target": {
              "predicate_type": "minecraft:tag_match",
              "tag": "minecraft:deepslate_ore_replaceables"
            }
        })

    write_json(os.path.join(conf_dir, f"{ore_name}.json"), {
      "type": "minecraft:ore",
      "config": {
        "discard_chance_on_air_exposure": 0.0,
        "size": 24 if ore_name == "bauxite" else 12,
        "targets": targets
      }
    })

    # --- FIXED: Only apply distance math if the ore isn't Zinc ---
    placement_rules = [
        { "type": "minecraft:count", "count": 10 },
        { "type": "minecraft:in_square" },
        {
          "type": "minecraft:height_range",
          "height": {
            "type": "minecraft:uniform",
            "min_inclusive": { "absolute": 60 },
            "max_inclusive": { "absolute": 350 }
          }
        }
    ]

    if ore_name != "zinc":
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

# 3.5 Remove TFMG Oil completely
write_json(os.path.join(neo_dir, "remove_tfmg_oil.json"), {
    "type": "neoforge:remove_features",
    "biomes": "#minecraft:is_overworld",
    "features": [
        "tfmg:oil_deposit" 
    ],
    "steps": "underground_ores" 
})

# 4. Zip the Datapack
zip_filename = f"{PACK_DIR}.zip"
with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(PACK_DIR):
        for file in files:
            file_path = os.path.join(root, file)
            zipf.write(file_path, os.path.relpath(file_path, PACK_DIR))

shutil.rmtree(PACK_DIR)
print(f"Successfully created {zip_filename} with global Zinc generation!")