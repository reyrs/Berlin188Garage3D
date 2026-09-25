"""Build the /garasi workshop bay in Blender, bake its lighting, export it for the web.

    blender --background --factory-startup --python scripts/blender/build-garage.py -- [steps]

steps (default: preview):
    preview   Cycles stills of the room (with a stand-in car if one is found) → assets-src/garage/preview-*.png
    bake      join the static room, bake diffuse lighting into a second UV set → public/garage/lightmap.png
    env       equirectangular HDR from the car's position (reflections for the car) → public/garage/env.hdr
    export    GLB (geometry, two UV sets, material names only) → public/garage/garage.glb

Room: metres, car bay centred on the origin, the car parked along +X (nose to the right,
like the showroom photos). The web page assigns textures by material name
(public/garage/tex, prepared by scripts/prepare-garage-textures.mjs) and the baked
lightmap on UV set 1. Objects named lift_* move on the page and are not baked.
"""

import json
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TEX = os.path.join(ROOT, "public", "garage", "tex")
OUT = os.path.join(ROOT, "public", "garage")
PREVIEW_DIR = os.path.join(ROOT, "assets-src", "garage")
STAND_IN_CAR = os.path.join(ROOT, "public", "models", "_preview", "ferrari.glb")

ARGS = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
STEPS = set(ARGS) or {"preview"}

# Room extents (inside faces).
X0, X1 = -7.0, 7.0
Y0, Y1 = -8.0, 5.0
H = 4.8

# Metres per texture repeat, shared with the page through garage.json.
TILE = {"floor": 3.0, "wall": 4.0, "shutter": 2.4, "plate": 1.2}

BRAND_BLUE = (0.0, 0.396, 0.753)  # #0065C0
BRAND_RED = (0.976, 0.0, 0.051)  # #F9000D


def srgb_to_linear(c):
    return tuple(x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c)


# --------------------------------------------------------------------------- scene


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    # OptiX kernels fail to compile on this GTX 1660 Ti driver; CUDA works.
    for kind in ("CUDA",):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
            for d in prefs.devices:
                d.use = d.type != "CPU"
            scene.cycles.device = "GPU"
            break
        except Exception:
            continue
    scene.cycles.use_denoising = True
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.004, 0.004, 0.005, 1)
    scene.world = world
    scene.view_settings.view_transform = "AgX"
    try:
        scene.view_settings.look = "AgX - Medium High Contrast"
    except TypeError:
        pass


# ----------------------------------------------------------------------- materials

MATS = {}


def _tex_node(nt, name, colorspace):
    node = nt.nodes.new("ShaderNodeTexImage")
    path = os.path.join(TEX, name)
    node.image = bpy.data.images.load(path, check_existing=True)
    node.image.colorspace_settings.name = colorspace
    return node


def pbr(name, tex=None, color=(0.5, 0.5, 0.5), rough=0.5, metal=0.0, emission=None, strength=0.0, alpha_image=None):
    """Principled material. tex = prepared texture set id (floor, wall, ...), tiled per metre."""
    if name in MATS:
        return MATS[name]
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*srgb_to_linear(color), 1)
    bsdf.inputs["Roughness"].default_value = rough
    bsdf.inputs["Metallic"].default_value = metal
    if tex:
        coord = nt.nodes.new("ShaderNodeTexCoord")
        mapping = nt.nodes.new("ShaderNodeMapping")
        s = 1.0 / TILE[tex]
        mapping.inputs["Scale"].default_value = (s, s, 1)
        nt.links.new(coord.outputs["UV"], mapping.inputs["Vector"])
        diff = _tex_node(nt, f"{tex}_diff.jpg", "sRGB")
        rgh = _tex_node(nt, f"{tex}_rough.jpg", "Non-Color")
        nor = _tex_node(nt, f"{tex}_nor.jpg", "Non-Color")
        nmap = nt.nodes.new("ShaderNodeNormalMap")
        for n in (diff, rgh, nor):
            nt.links.new(mapping.outputs["Vector"], n.inputs["Vector"])
        nt.links.new(diff.outputs["Color"], bsdf.inputs["Base Color"])
        nt.links.new(rgh.outputs["Color"], bsdf.inputs["Roughness"])
        nt.links.new(nor.outputs["Color"], nmap.inputs["Color"])
        nt.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
    if emission is not None:
        bsdf.inputs["Emission Color"].default_value = (*srgb_to_linear(emission), 1)
        bsdf.inputs["Emission Strength"].default_value = strength
    if alpha_image:
        img = nt.nodes.new("ShaderNodeTexImage")
        img.image = bpy.data.images.load(alpha_image, check_existing=True)
        coord = nt.nodes.new("ShaderNodeTexCoord")
        nt.links.new(coord.outputs["UV"], img.inputs["Vector"])
        nt.links.new(img.outputs["Color"], bsdf.inputs["Base Color"])
        nt.links.new(img.outputs["Color"], bsdf.inputs["Emission Color"])
        nt.links.new(img.outputs["Alpha"], bsdf.inputs["Alpha"])
        bsdf.inputs["Emission Strength"].default_value = strength
    MATS[name] = mat
    return mat


def materials():
    pbr("floor", tex="floor", rough=0.35)
    pbr("wall", tex="wall", rough=0.8)
    pbr("ceiling", color=(0.05, 0.05, 0.055), rough=0.9)
    pbr("shutter", tex="shutter", rough=0.6, metal=0.6)
    pbr("plate", tex="plate", rough=0.45, metal=0.9)
    pbr("steel_dark", color=(0.09, 0.09, 0.1), rough=0.35, metal=0.9)
    pbr("chrome", color=(0.8, 0.8, 0.82), rough=0.12, metal=1.0)
    pbr("cabinet", color=(0.08, 0.085, 0.09), rough=0.4, metal=0.3)
    pbr("worktop", color=(0.55, 0.56, 0.58), rough=0.3, metal=1.0)
    pbr("rubber", color=(0.03, 0.03, 0.03), rough=0.85)
    pbr("lift_blue", color=(0.0, 0.396, 0.753), rough=0.35, metal=0.35)
    pbr("paint_red", color=(0.976, 0.0, 0.051), rough=0.5)
    pbr("led", color=(1, 1, 1), emission=(1.0, 0.98, 0.95), strength=14.0)
    pbr("screen", color=(0.02, 0.05, 0.1), emission=(0.55, 0.75, 1.0), strength=2.5)
    pbr("logo", strength=1.1, alpha_image=os.path.join(ROOT, "public", "brand", "logo-dark.png"))
    if hasattr(MATS["logo"], "surface_render_method"):
        MATS["logo"].surface_render_method = "BLENDED"


# ----------------------------------------------------------------------- geometry


def box_uv(obj):
    """UV0 in metres: planar per face along its dominant axis (tiling is done by the material)."""
    me = obj.data
    bm = bmesh.new()
    bm.from_mesh(me)
    uv = bm.loops.layers.uv.verify()
    mw = obj.matrix_world
    for face in bm.faces:
        n = face.normal
        ax = max(range(3), key=lambda i: abs(n[i]))
        for loop in face.loops:
            p = mw @ loop.vert.co
            if ax == 2:
                loop[uv].uv = (p.x, p.y)
            elif ax == 1:
                loop[uv].uv = (p.x, p.z)
            else:
                loop[uv].uv = (p.y, p.z)
    bm.to_mesh(me)
    bm.free()


def finish(obj, name, mat, bevel=0.0):
    obj.name = name
    obj.data.materials.clear()
    obj.data.materials.append(MATS[mat])
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    if bevel > 0:
        # Rounded edges catch the LED strips as thin highlights; sharp CG boxes do not.
        mod = obj.modifiers.new("bevel", "BEVEL")
        mod.width = bevel
        mod.segments = 2
        mod.limit_method = "ANGLE"
        bpy.ops.object.modifier_apply(modifier=mod.name)
    box_uv(obj)
    # One UV set per object, all named alike, so joining keeps a single UV0.
    uvs = obj.data.uv_layers
    keep = uvs.active.name
    for layer in [l for l in uvs if l.name != keep]:
        uvs.remove(layer)
    uvs[0].name = "UVMap"
    return obj


def box(name, size, loc, mat, rot_z=0.0, bevel=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    obj = bpy.context.active_object
    obj.scale = size
    obj.rotation_euler.z = rot_z
    if bevel is None:
        bevel = min(0.012, 0.3 * min(size))
    return finish(obj, name, mat, bevel)


def cylinder(name, radius, depth, loc, mat, axis="Z", verts=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth, location=loc, vertices=verts)
    obj = bpy.context.active_object
    if axis == "X":
        obj.rotation_euler.y = math.pi / 2
    elif axis == "Y":
        obj.rotation_euler.x = math.pi / 2
    return finish(obj, name, mat)


def torus(name, major, minor, loc, mat, axis="Y"):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor, location=loc, major_segments=48, minor_segments=16)
    obj = bpy.context.active_object
    if axis == "Y":
        obj.rotation_euler.x = math.pi / 2
    elif axis == "X":
        obj.rotation_euler.y = math.pi / 2
    return finish(obj, name, mat)


def arc_strip(name, center, radius, a0, a1, width, mat, z=0.003, segments=96):
    """Flat painted curve on the floor (brand rule: red accents are curves, never straight)."""
    bm = bmesh.new()
    inner, outer = [], []
    for i in range(segments + 1):
        a = math.radians(a0 + (a1 - a0) * i / segments)
        d = Vector((math.cos(a), math.sin(a), 0))
        inner.append(bm.verts.new(Vector((center[0], center[1], z)) + d * (radius - width / 2)))
        outer.append(bm.verts.new(Vector((center[0], center[1], z)) + d * (radius + width / 2)))
    for i in range(segments):
        bm.faces.new((inner[i], inner[i + 1], outer[i + 1], outer[i]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    return finish(obj, name, mat)


def room():
    t = 0.2
    w, d = X1 - X0, Y1 - Y0
    cy = (Y0 + Y1) / 2
    box("floor", (w + 2 * t, d + 2 * t, t), (0, cy, -t / 2), "floor", bevel=0)
    box("ceiling", (w + 2 * t, d + 2 * t, t), (0, cy, H + t / 2), "ceiling", bevel=0)
    box("wall_back", (w, t, H), (0, Y1 + t / 2, H / 2), "wall", bevel=0)
    box("wall_front", (w, t, H), (0, Y0 - t / 2, H / 2), "wall", bevel=0)
    box("wall_left", (t, d, H), (X0 - t / 2, cy, H / 2), "wall", bevel=0)
    box("wall_right", (t, d, H), (X1 + t / 2, cy, H / 2), "wall", bevel=0)
    # Ceiling: two service ducts and cross beams break up the flat soffit.
    for i, y in enumerate((-5.6, 3.4)):
        cylinder(f"duct_{i}", 0.28, w, (0, y, H - 0.45), "steel_dark", axis="X", verts=40)
    for i, x in enumerate((-4.5, 4.5)):
        box(f"beam_{i}", (0.35, d, 0.45), (x, cy, H - 0.22), "ceiling")

    # Back wall: vertical concrete fins either side of the backlit logo.
    for i, x in enumerate([-6.2, -5.4, -4.6, 4.6, 5.4, 6.2]):
        box(f"fin_{i}", (0.12, 0.18, H), (x, Y1 - 0.09, H / 2), "wall")
    logo_w = 3.6
    logo_h = logo_w * 168 / 354
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, Y1 - 0.02, 2.75))
    logo = bpy.context.active_object
    logo.scale = (logo_w, logo_h, 1)
    logo.rotation_euler.x = math.pi / 2
    logo.name = "logo_sign"
    logo.data.materials.append(MATS["logo"])
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    # Plane UVs stay 0-1 so the whole logo image maps onto it.

    # Right wall: the rolling door (same idea as the intro door) in a steel frame.
    box("shutter", (0.06, 5.0, 3.9), (X1 - 0.03, -1.5, 1.95), "shutter")
    box("shutter_head", (0.3, 5.4, 0.45), (X1 - 0.15, -1.5, 4.12), "steel_dark")
    box("shutter_jamb_a", (0.18, 0.2, 3.9), (X1 - 0.09, -4.1, 1.95), "steel_dark")
    box("shutter_jamb_b", (0.18, 0.2, 3.9), (X1 - 0.09, 1.1, 1.95), "steel_dark")

    # Ceiling: linear LED strips along the car, the long highlights on its roof.
    for i in range(7):
        y = -3.0 + i * 0.9
        box(f"led_{i}", (9.0, 0.06, 0.03), (0.3, y, H - 0.03), "led")
    # Perimeter cove light along the back wall.
    box("led_cove", (13.6, 0.04, 0.03), (0, Y1 - 0.25, H - 0.35), "led")

    # Floor: the bay curve in front of the car.
    arc_strip("bay_arc", (0.3, 0.0), 3.4, 200, 340, 0.07, "paint_red")


def workshop_props():
    # Left wall: tall tool cabinets, then a workbench with a wall tool panel.
    for i in range(6):
        y = -6.1 + i * 0.92
        box(f"cabinet_{i}", (0.55, 0.9, 2.1), (X0 + 0.3, y, 1.05), "cabinet")
        box(f"cabinet_handle_{i}", (0.03, 0.02, 0.5), (X0 + 0.59, y + 0.35, 1.2), "chrome")
    box("bench", (0.75, 3.2, 0.06), (X0 + 0.4, 1.4, 0.95), "worktop")
    box("bench_body", (0.7, 3.2, 0.9), (X0 + 0.37, 1.4, 0.46), "cabinet")
    for i in range(4):
        box(f"bench_drawer_{i}", (0.02, 0.7, 0.18), (X0 + 0.73, 0.1 + i * 0.85, 0.72), "chrome")
    box("tool_panel", (0.04, 3.2, 1.2), (X0 + 0.03, 1.4, 1.75), "steel_dark")

    # Back right: tyre rack with eight tyres on edge.
    rx, ry = 4.9, Y1 - 0.9
    for i, z in enumerate((0.45, 1.25)):
        box(f"rack_shelf_{i}", (2.4, 0.5, 0.04), (rx, ry, z - 0.36), "steel_dark")
    for x in (rx - 1.2, rx + 1.2):
        box(f"rack_post_{x:.1f}", (0.05, 0.5, 1.7), (x, ry, 0.85), "steel_dark")
    for row, z in enumerate((0.45, 1.25)):
        for k in range(4):
            torus(f"tyre_{row}_{k}", 0.3, 0.11, (rx - 0.85 + k * 0.57, ry, z), "rubber", axis="X")

    # Diagnostic cart near the front wheel, screen towards the bay.
    cx, cy = 3.9, 2.5
    box("cart_body", (0.6, 0.5, 0.85), (cx, cy, 0.5), "cabinet")
    for i, (dx, dy) in enumerate(((-0.25, -0.2), (0.25, -0.2), (-0.25, 0.2), (0.25, 0.2))):
        cylinder(f"cart_wheel_{i}", 0.05, 0.04, (cx + dx, cy + dy, 0.05), "rubber", axis="Y", verts=16)
    box("cart_pole", (0.05, 0.05, 0.6), (cx, cy + 0.15, 1.2), "steel_dark")
    box("cart_monitor", (0.62, 0.05, 0.4), (cx, cy + 0.14, 1.62), "steel_dark", rot_z=0.35)
    box("cart_screen", (0.56, 0.01, 0.34), (cx - 0.01, cy + 0.11, 1.62), "screen", rot_z=0.35)


def lift():
    """Two-post lift around the bay. Columns and beam are static; carriages + arms (lift_*) move."""
    for side, y, s in (("l", 1.55, 1), ("r", -1.55, -1)):
        box(f"lift_post_{side}", (0.34, 0.3, 3.6), (0.3, y + s * 0.02, 1.8), "lift_blue", bevel=0.03)
        # Carriage track on the inner face, cap, foot and the hydraulic ram.
        box(f"lift_track_{side}", (0.2, 0.04, 3.3), (0.3, y - s * 0.14, 1.75), "steel_dark")
        box(f"lift_cap_{side}", (0.42, 0.38, 0.1), (0.3, y + s * 0.02, 3.65), "steel_dark", bevel=0.02)
        box(f"lift_foot_{side}", (0.72, 0.6, 0.05), (0.3, y + s * 0.05, 0.025), "plate", bevel=0.01)
        cylinder(f"lift_ram_{side}", 0.045, 2.4, (0.53, y + s * 0.06, 1.3), "chrome", verts=24)
    # Floor cover plate between the posts (a base-plate lift: no overhead beam).
    box("lift_cover", (0.62, 2.8, 0.035), (0.3, 0, 0.0175), "plate", bevel=0.012)

    moving = []
    for side, y, s in (("l", 1.55, -1), ("r", -1.55, 1)):
        parts = [box(f"_carriage_{side}", (0.26, 0.14, 0.6), (0.3, y + s * 0.2, 0.42), "steel_dark")]
        for k, dx in enumerate((-0.9, 1.1)):
            # Arms swing from the carriage under the car's sills.
            ang = math.atan2(s * 0.75, dx)
            length = math.hypot(dx, 0.75)
            mid = (0.3 + dx / 2, y + s * (0.2 + 0.375), 0.16)
            parts.append(box(f"_arm_{side}_{k}", (length, 0.12, 0.07), mid, "steel_dark", rot_z=ang))
            parts.append(cylinder(f"_pad_{side}_{k}", 0.07, 0.05, (0.3 + dx, y + s * 0.95, 0.215), "rubber"))
        bpy.ops.object.select_all(action="DESELECT")
        for p in parts:
            p.select_set(True)
        bpy.context.view_layer.objects.active = parts[0]
        bpy.ops.object.join()
        obj = bpy.context.active_object
        obj.name = f"lift_{side}"
        moving.append(obj)
    return moving


def lights():
    """Fill for the bake/preview on top of the emissive LEDs: one big soft box over the bay."""
    data = bpy.data.lights.new("softbox", "AREA")
    data.shape = "RECTANGLE"
    data.size, data.size_y = 7.0, 3.5
    data.energy = 900
    obj = bpy.data.objects.new("softbox", data)
    obj.location = (0.3, -0.4, H - 0.1)
    bpy.context.collection.objects.link(obj)
    for name, loc, energy in (("fill_left", (-5.5, -5.5, 3.2), 250), ("fill_right", (5.5, -5.5, 3.2), 180)):
        d = bpy.data.lights.new(name, "AREA")
        d.size = 2.0
        d.energy = energy
        o = bpy.data.objects.new(name, d)
        o.location = loc
        o.rotation_euler = (math.radians(70), 0, math.atan2(-loc[0], loc[1]) + math.pi)
        bpy.context.collection.objects.link(o)


def build():
    reset()
    materials()
    room()
    workshop_props()
    moving = lift()
    lights()
    return moving


# ------------------------------------------------------------------------- steps


def import_stand_in_car():
    if not os.path.exists(STAND_IN_CAR):
        return None
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=STAND_IN_CAR)
    new = [o for o in bpy.data.objects if o not in before]
    root = bpy.data.objects.new("stand_in_car", None)
    bpy.context.collection.objects.link(root)
    for o in new:
        if o.parent is None:
            o.parent = root
    bpy.context.view_layer.update()
    pts = [o.matrix_world @ Vector(c) for o in new if o.type == "MESH" for c in o.bound_box]
    lo = Vector((min(p.x for p in pts), min(p.y for p in pts), min(p.z for p in pts)))
    hi = Vector((max(p.x for p in pts), max(p.y for p in pts), max(p.z for p in pts)))
    size = hi - lo
    if size.y > size.x:
        root.rotation_euler.z = math.pi / 2
        size.x, size.y = size.y, size.x
        lo, hi = Vector((-hi.y, lo.x, lo.z)), Vector((-lo.y, hi.x, hi.z))
    k = 4.6 / size.x
    root.scale = (k, k, k)
    centre = (lo + hi) / 2
    # The stand-in faces -X; turn it round so the nose points +X like the real cars will.
    root.rotation_euler.z += math.pi
    root.location = (0.3 + centre.x * k, centre.y * k, -lo.z * k)
    return root


def camera(name, loc, target, lens=30):
    data = bpy.data.cameras.new(name)
    data.lens = lens
    obj = bpy.data.objects.new(name, data)
    obj.location = loc
    direction = Vector(target) - Vector(loc)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    bpy.context.collection.objects.link(obj)
    return obj


def render_still(cam, path, w=1600, h=900, samples=160):
    scene = bpy.context.scene
    scene.camera = cam
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.render.resolution_percentage = 100
    scene.cycles.samples = samples
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print("wrote", path)


def step_preview():
    import_stand_in_car()
    shots = {
        "hero": camera("cam_hero", (5.4, -5.6, 1.35), (0.2, 0.3, 0.75), lens=32),
        "wide": camera("cam_wide", (5.8, -7.4, 2.6), (-1.5, 1.0, 1.1), lens=22),
        "low": camera("cam_low", (3.6, -3.4, 0.45), (0.0, 0.4, 0.9), lens=24),
    }
    for key, cam in shots.items():
        render_still(cam, os.path.join(PREVIEW_DIR, f"preview-{key}.png"))


def static_objects(moving):
    skip = {o.name for o in moving} | {"logo_sign", "floor"}
    return [o for o in bpy.context.scene.objects if o.type == "MESH" and o.name not in skip]


def bake_to_png(objs, name, size, samples):
    """Bake diffuse lighting (direct + indirect, no albedo) of objs through their active
    UV set into public/garage/<name>.png. Stored as (irradiance / peak) ^ (1/2.2);
    returns peak so the page can scale it back (lightMapIntensity)."""
    import numpy as np

    img = bpy.data.images.new(name, size, size, float_buffer=True)
    touched = []
    for obj in objs:
        for slot in obj.material_slots:
            nt = slot.material.node_tree
            node = nt.nodes.new("ShaderNodeTexImage")
            node.image = img
            node.select = True
            nt.nodes.active = node
            touched.append((nt, node))
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objs:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    scene = bpy.context.scene
    scene.cycles.samples = samples
    bpy.ops.object.bake(type="DIFFUSE", pass_filter={"DIRECT", "INDIRECT"}, margin=12, use_clear=True)
    for nt, node in touched:
        nt.nodes.remove(node)

    px = np.empty(size * size * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    rgb = px.reshape(size, size, 4)[..., :3]
    # Light 3x3 blur: evens out the last of the sampling noise, lighting is smooth anyway.
    pad = np.pad(rgb, ((1, 1), (1, 1), (0, 0)), mode="edge")
    k = np.array([1, 2, 1], dtype=np.float32)
    blur = sum(k[i] * k[j] * pad[i : i + size, j : j + size] for i in range(3) for j in range(3)) / 16.0
    lit = blur[blur.max(axis=2) > 0.0005]
    peak = float(np.percentile(lit.max(axis=1), 99.5)) if lit.size else 1.0
    ldr = np.concatenate([np.clip(blur / peak, 0, 1) ** (1 / 2.2), np.ones((size, size, 1), np.float32)], axis=2)
    out = bpy.data.images.new(name + "_ldr", size, size)
    out.pixels.foreach_set(ldr.astype(np.float32).ravel())
    out.filepath_raw = os.path.join(OUT, name + ".png")
    out.file_format = "PNG"
    out.save()
    print("baked", name, "peak", round(peak, 4))
    return peak


def step_bake(moving):
    # 1) Everything static except the floor, joined, smart-unwrapped into UV set 1.
    objs = static_objects(moving)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    static = bpy.context.active_object
    static.name = "garage_static"
    me = static.data
    lm = me.uv_layers.new(name="Lightmap")
    me.uv_layers.active = lm
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.004, area_weight=0.0, scale_to_bounds=True)
    bpy.ops.object.mode_set(mode="OBJECT")
    me.uv_layers[0].active_render = True
    peak_room = bake_to_png([static], "lightmap", 2048, 384)

    # 2) The floor on its own: planar UV over the room, so the page can put the bake
    #    on a plain 14 x 13 m plane (with a real-time reflection) and match it 1:1.
    floor = bpy.data.objects["floor"]
    fme = floor.data
    fl = fme.uv_layers.new(name="Lightmap")
    fme.uv_layers.active = fl
    bm = bmesh.new()
    bm.from_mesh(fme)
    uv = bm.loops.layers.uv[fl.name]
    for face in bm.faces:
        for loop in face.loops:
            p = floor.matrix_world @ loop.vert.co
            loop[uv].uv = ((p.x - X0) / (X1 - X0), (p.y - Y0) / (Y1 - Y0))
    bm.to_mesh(fme)
    bm.free()
    fme.uv_layers[0].active_render = True
    peak_floor = bake_to_png([floor], "floor_lightmap", 1024, 512)

    meta = {
        "room": {"lightmap": "lightmap.png", "intensity": round(peak_room, 4)},
        "floor": {
            "lightmap": "floor_lightmap.png",
            "intensity": round(peak_floor, 4),
            "size": [X1 - X0, Y1 - Y0],
            "centre": [(X0 + X1) / 2, (Y0 + Y1) / 2],
        },
        "encoding": "(irradiance / intensity) ^ (1 / 2.2)",
        "tile": TILE,
    }
    with open(os.path.join(OUT, "garage.json"), "w") as f:
        json.dump(meta, f, indent=2)
    # Same numbers for the page, as a module (src/garasi/garageMeta.ts).
    with open(os.path.join(ROOT, "src", "garasi", "garageMeta.ts"), "w") as f:
        f.write("// Generated by scripts/blender/build-garage.py (bake step). Do not edit by hand.
")
        f.write("export const GARAGE_META = " + json.dumps(meta, indent=2) + " as const;
")


def step_env(samples=256):
    data = bpy.data.cameras.new("env")
    data.type = "PANO"
    data.panorama_type = "EQUIRECTANGULAR"
    cam = bpy.data.objects.new("env", data)
    cam.location = (0.3, 0.0, 0.9)
    cam.rotation_euler = (math.pi / 2, 0, -math.pi / 2)
    bpy.context.collection.objects.link(cam)
    scene = bpy.context.scene
    scene.camera = cam
    scene.render.resolution_x, scene.render.resolution_y = 1024, 512
    scene.cycles.samples = samples
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.render.image_settings.file_format = "HDR"
    scene.render.filepath = os.path.join(OUT, "env.hdr")
    bpy.ops.render.render(write_still=True)
    print("wrote env.hdr")


def step_export():
    for o in list(bpy.context.scene.objects):
        # The floor is rebuilt on the page as a reflective plane with its own lightmap.
        if o.type in {"LIGHT", "CAMERA", "EMPTY"} or o.name == "floor":
            bpy.data.objects.remove(o, do_unlink=True)
    kwargs = dict(
        filepath=os.path.join(OUT, "garage.glb"),
        export_format="GLB",
        export_texcoords=True,
        export_normals=True,
        export_apply=True,
        export_yup=True,
        export_cameras=False,
        export_lights=False,
        export_materials="EXPORT",
    )
    try:
        bpy.ops.export_scene.gltf(export_image_format="NONE", **kwargs)
    except TypeError:
        bpy.ops.export_scene.gltf(**kwargs)
    print("wrote garage.glb")


os.makedirs(OUT, exist_ok=True)
moving = build()
if "preview" in STEPS:
    step_preview()
if "bake" in STEPS or "export" in STEPS or "env" in STEPS:
    if "stand_in_car" in bpy.data.objects:
        raise SystemExit("run preview on its own; bake/env/export need the scene without the stand-in car")
if "env" in STEPS:
    step_env()
if "bake" in STEPS:
    step_bake(moving)
if "export" in STEPS:
    step_export()
