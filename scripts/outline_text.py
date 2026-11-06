# converts <text> elements in the brand svgs into outlined jetbrains mono paths
# so they render identically inside github readmes (no webfonts in <img> svgs)
import re, sys, glob, html
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

font_dir, svg_dir = sys.argv[1], sys.argv[2]
fonts = {w: TTFont(f"{font_dir}/jetbrains-mono-latin-{w}-normal.woff") for w in ("400", "700", "800")}

TEXT_RE = re.compile(r"<text([^>]*)>(.*?)</text>", re.S)
ATTR_RE = re.compile(r'([\w-]+)="([^"]*)"')


def outline(attrs, content, inherited):
    a = {**inherited, **dict(ATTR_RE.findall(attrs))}
    f = fonts[a.get("font-weight", "400")]
    upm = f["head"].unitsPerEm
    cmap, gs, hmtx = f.getBestCmap(), f.getGlyphSet(), f["hmtx"]
    size = float(a.get("font-size", 16))
    ls = float(a.get("letter-spacing", 0))
    s = size / upm
    text = html.unescape(content)
    glyphs = [cmap.get(ord(ch), ".notdef") for ch in text]
    widths = [hmtx[g][0] * s + ls for g in glyphs]
    total = sum(widths) - ls
    x, y = float(a.get("x", 0)), float(a.get("y", 0))
    anchor = a.get("text-anchor", "start")
    if anchor == "end":
        x -= total
    elif anchor == "middle":
        x -= total / 2
    d = []
    for g, w in zip(glyphs, widths):
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, x, y)))
        d.append(pen.getCommands())
        x += w
    return f'<path fill="{a.get("fill", "#0A0A0A")}" d="{" ".join(d)}"/>'


for path in glob.glob(f"{svg_dir}/*.svg"):
    src = open(path).read()
    if "<text" not in src:
        continue

    # handle <g font-...> wrappers by inlining their attributes
    def expand_group(m):
        gattrs = dict(ATTR_RE.findall(m.group(1)))
        inner = TEXT_RE.sub(lambda t: outline(t.group(1), t.group(2), gattrs), m.group(2))
        return f"<g>{inner}</g>"

    src = re.sub(r"<g([^>]*font-[^>]*)>(.*?)</g>", expand_group, src, flags=re.S)
    src = TEXT_RE.sub(lambda t: outline(t.group(1), t.group(2), {}), src)
    open(path, "w").write(src)
    print("outlined", path.split("/")[-1])
