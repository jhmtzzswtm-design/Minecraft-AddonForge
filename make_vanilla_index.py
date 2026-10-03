#!/usr/bin/env python3
"""resource_pack フォルダ内のテクスチャ一覧 vanilla_index.json を作ります。
index.html と同じ場所に置いて実行: python3 make_vanilla_index.py
(フォルダを削って軽くしたあとに実行すると、残っている画像だけが一覧に載ります)"""
import os, json, re
ROOT = 'resource_pack'
SKIP = re.compile(r'_(mer|normal|heightmap)\.png$', re.I)
EXCLUDE_DIRS = ('persona_thumbnails',)   # 検索に不要な画像
files = []
base = os.path.join(ROOT, 'textures')
for d, dirs, fs in os.walk(base):
    dirs[:] = [x for x in dirs if x not in EXCLUDE_DIRS]
    for f in fs:
        if f.lower().endswith('.png') and not SKIP.search(f):
            files.append(os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, '/'))
files.sort()
json.dump({'root': ROOT, 'files': files}, open('vanilla_index.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(len(files), 'files -> vanilla_index.json')
