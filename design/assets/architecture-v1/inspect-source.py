"""Read-only validation of the generated .blend, run with Blender --background FILE --python THIS."""
import bpy
import json
from pathlib import Path

files = [{'name': im.name, 'path': im.filepath, 'exists': Path(bpy.path.abspath(im.filepath)).is_file()} for im in bpy.data.images if im.source == 'FILE' and im.filepath]
assert files and all(im['path'].startswith('//') and im['exists'] for im in files), files
print('UNRAVEL_SOURCE_VERIFIED', json.dumps({'blender': bpy.app.version_string, 'portableImages': files, 'meshes': len([o for o in bpy.data.objects if o.type == 'MESH'])}), flush=True)
