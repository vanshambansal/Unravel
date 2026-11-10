"""Blender 4.2 asset source. Run from the repository root; no add-ons required.

Builds an authored architectural arrangement, explicit PBR UVs, a separate bake
atlas, indirect-light/AO maps and a GLB. Original CC0 maps stay beside this file.
"""
import bpy
import math
import json
import time
import os
from array import array
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[3]
SOURCE = Path(__file__).resolve().parent
OUTPUT = ROOT / 'prototypes/landing-motion/public/architecture'
OUTPUT.mkdir(parents=True, exist_ok=True)
started = time.time()
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'CPU'
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 4
scene.cycles.diffuse_bounces = 3
scene.render.threads_mode = 'FIXED'
scene.render.threads = 6
scene.world.color = (.025, .035, .045)
scene.view_settings.view_transform = 'AgX'
world = scene.world
world.use_nodes = True
world.node_tree.nodes['Background'].inputs['Color'].default_value = (.08, .12, .17, 1)
world.node_tree.nodes['Background'].inputs['Strength'].default_value = .22

def local(v):
    """Three.js Y-up to Blender Z-up; glTF reverses this on export."""
    return Vector((v[0], -v[2], v[1]))

def processed_image(asset, map_name, tint=None, floor=False):
    image = bpy.data.images.load(str(SOURCE / 'textures' / f'{asset}-{map_name}.jpg'), check_existing=True)
    if map_name != 'Diffuse':
        image.colorspace_settings.name = 'Non-Color'
    pixels = array('f', [0]) * (image.size[0] * image.size[1] * 4)
    image.pixels.foreach_get(pixels)
    if tint is not None or map_name == 'Rough':
        for i in range(0, len(pixels), 4):
            if tint:
                for c in range(3):
                    pixels[i+c] *= tint[c]
            else:
                value = max(.16, min(.95, (.08 + pixels[i] * .55) if floor else (.48 + pixels[i] * .45)))
                pixels[i] = pixels[i+1] = pixels[i+2] = value
    image.pixels.foreach_set(pixels)
    image.update()
    image.filepath_raw = str(OUTPUT / f'{asset}-{map_name}.jpg')
    image.file_format = 'JPEG'
    image.save()
    print('Material map:', image.name, tuple(image.size), flush=True)
    return image

def pbr(name, asset, tint, floor=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    bsdf = nodes.get('Principled BSDF')
    bsdf.inputs['Metallic'].default_value = 0
    uv = nodes.new('ShaderNodeUVMap'); uv.uv_map = 'Surface'
    for map_name in ['Diffuse', 'nor_gl', 'Rough']:
        tex = nodes.new('ShaderNodeTexImage')
        tex.image = processed_image(asset, map_name, tint if map_name == 'Diffuse' else None, floor)
        links.new(uv.outputs['UV'], tex.inputs['Vector'])
        if map_name == 'Diffuse':
            links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
        elif map_name == 'Rough':
            links.new(tex.outputs['Color'], bsdf.inputs['Roughness'])
        else:
            normal = nodes.new('ShaderNodeNormalMap'); normal.inputs['Strength'].default_value = .6 if floor else .8
            links.new(tex.outputs['Color'], normal.inputs['Color']); links.new(normal.outputs['Normal'], bsdf.inputs['Normal'])
    return mat

wall = pbr('Charcoal concrete | scanned PBR', 'concrete_wall_006', (.65, .74, .84))
floor = pbr('Worn basalt concrete | scanned PBR', 'concrete_floor_worn_02', (.42, .49, .57), True)

def plain(name, color, roughness, metallic=0, emission=None):
    mat = bpy.data.materials.new(name); mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*color, 1)
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    if emission:
        bsdf.inputs['Emission Color'].default_value = (*emission, 1)
        bsdf.inputs['Emission Strength'].default_value = 3
    return mat

metal = plain('Blackened steel', (.025, .032, .04), .3, .85)
crimson = plain('Recessed crimson emitter', (.18, .002, .012), .5, emission=(1, .001, .025))
edge = plain('Atrium edge emitter', (.1, .001, .008), .5, emission=(.7, .001, .018))
cool = plain('Cold ceiling aperture', (.23, .32, .38), .5, emission=(.55, .75, .9))
architecture = []

def block(name, size, position, material=wall, angle=0, bevel=.07):
    bpy.ops.mesh.primitive_cube_add(size=1, location=local(position))
    obj = bpy.context.object; obj.name = name
    obj.dimensions = (size[0], size[2], size[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.rotation_euler.z = angle
    obj.data.materials.append(material)
    uv = obj.data.uv_layers.active; uv.name = 'Surface'
    for poly in obj.data.polygons:
        normal = obj.matrix_world.to_3x3() @ poly.normal
        nx, ny, nz = abs(normal.x), abs(normal.z), abs(normal.y)
        for index in poly.loop_indices:
            v = obj.matrix_world @ obj.data.vertices[obj.data.loops[index].vertex_index].co
            x, y, z = v.x, v.z, -v.y
            uv.data[index].uv = ((x if ny > nx and ny > nz else z if nx > nz else x) / 2.8, (z if ny > nx and ny > nz else y) / 2.8)
    if bevel and min(size) > .12:
        modifier = obj.modifiers.new('Small architectural edge radius', 'BEVEL'); modifier.width = min(bevel, min(size) * .12); modifier.segments = 3
        bpy.ops.object.modifier_apply(modifier=modifier.name)
        obj.modifiers.new('Weighted architectural normals', 'WEIGHTED_NORMAL')
        bpy.ops.object.modifier_apply(modifier=obj.modifiers[-1].name)
    architecture.append(obj)
    return obj

# One substantial threshold, with deep returns and a genuinely recessed emitter.
block('Entrance / left monolith', (29, 26, 3.8), (-15, 13, 0))
block('Entrance / right monolith', (20, 26, 4.5), (16.5, 13, -.3), angle=-.025)
block('Entrance / spanning lintel', (7, 10, 4.2), (3, 21, 0))
block('Door reveal / inner return', (.65, 16, 2.8), (6.82, 8, -.8), metal)
block('Door reveal / crimson recess', (.075, 16, .12), (6.49, 8, .82), crimson, bevel=0)
block('Door reveal / cold rim', (.025, 16, .05), (-.48, 8, 1.94), cool, bevel=0)

# Unequal bays, overlapping wall planes and varied heights replace a repeated corridor.
for name, size, position in [
    ('Left foreground return', (2.4, 23, 18), (-14, 11.5, -12)),
    ('Left middle terrace', (4, 15, 12), (-11.4, 7.5, -29)),
    ('Left rear terrace', (3.2, 18, 18), (-9.4, 9, -49)),
    ('Right foreground pier', (3.4, 24, 14), (19, 12, -15)),
    ('Right recessed wall', (2.5, 21, 18), (21.8, 10.5, -31)),
    ('Right middle pier', (3.2, 19, 12), (16.9, 9.5, -40)),
    ('Right rear wall', (4, 22, 20), (18.2, 11, -58)),
    ('Far termination', (36, 24, 2.5), (3, 12, -77)),
]: block(name, size, position)

for i, (width, height, z, skew) in enumerate([(29, 14.7, -12, -.035), (24, 13.5, -27, .025), (20, 15.2, -43, -.018), (17, 14.9, -61, .025)]):
    block(f'Suspended lintel {i+1}', (width, 1.1, 3.2), (3, height, z), angle=skew)
    for x in [-width * .36 + 3, width * .36 + 3]:
        block(f'Suspension rod {i+1}/{x}', (.035, 9, .035), (x, height + 5, z), metal, bevel=0)

for i, (x, z, height) in enumerate([(17.24, -9, 20), (15.27, -35, 17), (16.17, -49, 20)]):
    block(f'Crimson wall recess {i+1}', (.06, height, .06), (x, height/2, z), edge, bevel=0)
block('Atrium overhead aperture', (.35, .03, 52), (-9.5, 24.5, -24), cool, bevel=0)
block('Continuous rough floor', (88, .32, 155), (3, -.2, -28), floor, bevel=.03)
for x in [-13.6, 18.6]:
    block('Floor perimeter reveal', (.11, .06, 60), (x, .012, -35), metal, bevel=.01)

def area(name, position, target, energy, color, size, size_y=None):
    light = bpy.data.lights.new(name, 'AREA'); light.energy = energy; light.color = color
    light.shape = 'RECTANGLE'; light.size = size; light.size_y = size_y or size
    obj = bpy.data.objects.new(name, light); scene.collection.objects.link(obj); obj.location = local(position)
    obj.rotation_euler = (local(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()

area('Cold ceiling / indirect source', (-7, 23, 3), (1, 0, -20), 6500, (.58, .77, 1), 10, 16)
area('Atrium cold fill', (-13, 19, -36), (3, 0, -40), 4000, (.55, .72, 1), 8, 12)
area('Crimson wall bounce', (17.1, 9, -23), (3, 4, -32), 3200, (1, .005, .025), 6, 13)
area('Crimson threshold spill', (6.1, 8, -.8), (1, 4, 5), 1600, (1, .002, .018), .5, 12)

bpy.ops.object.select_all(action='DESELECT')
for obj in architecture: obj.select_set(True)
bpy.context.view_layer.objects.active = architecture[0]
bpy.ops.object.join()
model = bpy.context.object; model.name = 'Unravel architectural shell'
model.data.uv_layers.new(name='Lightmap')
model.data.uv_layers.active_index = 1
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=.012)
bpy.ops.object.mode_set(mode='OBJECT')

def bake(name, bake_type, size):
    image = bpy.data.images.new(name, width=size, height=size, alpha=False, float_buffer=False)
    image.colorspace_settings.name = 'Non-Color'
    image.filepath_raw = str(OUTPUT / f'{name}.png'); image.file_format = 'PNG'
    targets = []
    for mat in model.data.materials:
        node = mat.node_tree.nodes.new('ShaderNodeTexImage'); node.image = image
        mat.node_tree.nodes.active = node; node.select = True; targets.append((mat, node))
    scene.render.bake.margin = 12
    print('Baking', name, flush=True)
    if bake_type == 'DIFFUSE': bpy.ops.object.bake(type='DIFFUSE', pass_filter={'INDIRECT'}, use_clear=True)
    else: bpy.ops.object.bake(type=bake_type, use_clear=True)
    image.save()
    for mat, node in targets: mat.node_tree.nodes.remove(node)
    return image

indirect = bake('indirect-light', 'DIFFUSE', 1024)
ao = bake('ambient-occlusion', 'AO', 1024)
model.data.uv_layers.active_index = 0
model['source'] = 'Blender 4.2 authored asset; CC0 scanned materials; separate indirect/AO atlas'
bpy.ops.export_scene.gltf(filepath=str(OUTPUT / 'atrium.glb'), export_format='GLB', use_selection=True, export_extras=True, export_lights=False, export_cameras=False)

for name, position, target in [('opening', (-3.5, 3.7, 23), (3, 5.5, -55)), ('hero', (3, 3.7, -18), (3, 4.4, -55))]:
    camera_data = bpy.data.cameras.new(name); camera = bpy.data.objects.new(name, camera_data); scene.collection.objects.link(camera)
    camera.location = local(position); camera.rotation_euler = (local(target) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera_data.sensor_fit = 'VERTICAL'; camera_data.sensor_height = 24; camera_data.lens = 12 / math.tan(math.radians(53)/2)
    scene.camera = camera
    scene.render.resolution_x = 960; scene.render.resolution_y = 600; scene.render.resolution_percentage = 100
    scene.render.filepath = str(SOURCE / f'blender-{name}.png')
    bpy.ops.render.render(write_still=True)

for image in bpy.data.images:
    if image.source == 'FILE' and image.filepath:
        image.filepath = '//' + os.path.relpath(bpy.path.abspath(image.filepath), SOURCE).replace(os.sep, '/')
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE / 'unravel-architecture.blend'), relative_remap=False)
report = {'blender': bpy.app.version_string, 'seconds': round(time.time()-started, 2), 'vertices': len(model.data.vertices), 'polygons': len(model.data.polygons), 'materials': len(model.data.materials), 'bakes': ['indirect-light.png', 'ambient-occlusion.png'], 'output': 'prototypes/landing-motion/public/architecture/atrium.glb', 'scope': 'Opening and atrium asset study; browser integration requires visual verification'}
(SOURCE / 'build-report.json').write_text(json.dumps(report, indent=2) + '\n')
print('UNRAVEL_ASSET_COMPLETE', json.dumps(report), flush=True)
