"""Download cover / sample-input assets and prompts for selected templates.
Reads public/raw/templates/catalog.json (exported from the canvas template
panel) and writes public/raw/templates/<type>/<slug>/ + cases.json."""
import json, os, re, urllib.request, concurrent.futures as cf
ROOT = os.path.join(os.path.dirname(__file__), '..', 'public', 'raw', 'templates')
d = json.load(open(os.path.join(ROOT, 'catalog.json')))
EXTRA = {'image': ['美妆人像广告', '戴耳机棕熊海报', '樱花蓝眼极近特写', '白底剪贴贴纸肖像', '数字笔触插画海报', '降噪耳机红底海报', '肌肉跑车红字海报', '车内自拍Q版人偶'],
         'video': ['K-POP 字体动效片头', '可可秘境微缩巧克力世界', '影院大白鲨惊吓观众', 'FPV穿越古印度王国', '糖果积木饮料罐', '黏土雨天变晴天']}
TOP = {'image': 18, 'video': 22}
def url(u): return 'https://api.oiioii.ai/res/read_file?uri=' + u
def get(u, path):
    if os.path.exists(path) and os.path.getsize(path) > 0: return
    req = urllib.request.Request(url(u), headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=120) as r, open(path, 'wb') as f: f.write(r.read())
cases, jobs = [], []
for t in ['image', 'video']:
    a = sorted(d[t], key=lambda x: -(x.get('usageCount') or 0))
    pick, seen = [], set()
    for x in a[:TOP[t]] + [x for x in a if x['title'] in EXTRA[t]]:
        if x['title'] in seen: continue
        seen.add(x['title']); pick.append(x)
    for i, x in enumerate(pick):
        slug = f"{i:02d}-" + re.sub(r'[\\/:*?"<>|\s]+', '_', x['title'])
        dir_ = os.path.join(ROOT, t, slug); os.makedirs(dir_, exist_ok=True)
        files = {}
        if x.get('coverAssetId'):
            p = os.path.join(dir_, 'cover' + os.path.splitext(x['coverAssetId'])[1]); jobs.append((x['coverAssetId'], p)); files['cover'] = os.path.relpath(p, ROOT)
        for j, u in enumerate(x.get('inputImageUris') or []):
            p = os.path.join(dir_, f'input{j+1}' + os.path.splitext(u)[1]); jobs.append((u, p)); files.setdefault('inputs', []).append(os.path.relpath(p, ROOT))
        for j, u in enumerate(x.get('exampleAssetIds') or []):
            p = os.path.join(dir_, f'example{j+1}' + os.path.splitext(u)[1]); jobs.append((u, p)); files.setdefault('examples', []).append(os.path.relpath(p, ROOT))
        open(os.path.join(dir_, 'prompt.txt'), 'w').write(x.get('prompt') or '')
        cases.append({'type': t, 'title': x['title'], 'usageCount': x.get('usageCount'), 'aspectRatio': x.get('aspectRatio'), 'categories': x.get('categories'), 'creator': x.get('creatorNickname'), 'id': x['id'], 'dir': os.path.relpath(dir_, ROOT), **files})
with cf.ThreadPoolExecutor(8) as ex:
    for (u, p), r in zip(jobs, ex.map(lambda j: (lambda: (get(*j), None))() if True else None, jobs)): pass
json.dump(cases, open(os.path.join(ROOT, 'cases.json'), 'w'), ensure_ascii=False, indent=1)
print(len(cases), 'cases', len(jobs), 'files')
