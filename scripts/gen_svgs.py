# generates brand svgs for the numerus repo (readme banner, logos, section bars)
import os, sys

out = sys.argv[1]
os.makedirs(out, exist_ok=True)

BLACK, OFF, GREEN = "#0A0A0A", "#F2F0E9", "#149E48"
FONT = "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
POLY = "119.7,50.3 120,12 84.8,27 95.6,34.2 71.5,70.4 41.3,32.2 4,106 42.7,59.8 72.5,97.6 108.9,43.1"


def mark(x, y, w, fill=GREEN, sw=4):
    # zigzag n mark, viewbox 0 4 124 108
    s = w / 124
    return (f'<g transform="translate({x},{y}) scale({s}) translate(0,-4)">'
            f'<polygon points="{POLY}" fill="{fill}" stroke="{BLACK}" stroke-width="{sw}" stroke-linejoin="miter"/></g>')


def save(name, body):
    with open(os.path.join(out, name), "w") as f:
        f.write(body)


# banner 1200x340
save("banner.svg", f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="340" viewBox="0 0 1200 340" role="img" aria-label="NUMERUS — assistente financeiro">
<rect width="1200" height="340" fill="{BLACK}"/>
<rect x="10" y="10" width="1180" height="56" fill="{OFF}"/>
<text x="38" y="45" font-family="{FONT}" font-size="15" font-weight="700" letter-spacing="1.2" fill="{BLACK}">[00] NUMERUS / ASSISTENTE FINANCEIRO</text>
<text x="1162" y="45" text-anchor="end" font-family="{FONT}" font-size="15" font-weight="700" letter-spacing="1.2" fill="{BLACK}">WEB · DESKTOP · V0.1</text>
<rect x="10" y="76" width="300" height="254" fill="{GREEN}"/>
{mark(70, 128, 180, fill=OFF, sw=5)}
<rect x="320" y="76" width="870" height="254" fill="{OFF}"/>
<text x="360" y="232" font-family="{FONT}" font-size="128" font-weight="800" letter-spacing="-6" fill="{BLACK}">NUMERUS</text>
<rect x="360" y="256" width="96" height="10" fill="{BLACK}"/>
<text x="360" y="300" font-family="{FONT}" font-size="18" font-weight="700" letter-spacing="1.4" fill="{BLACK}">SEU DINHEIRO, EM NÚMEROS CLAROS.</text>
</svg>''')

# horizontal logo, light and dark
for variant, bg, fg, bar in [("light", OFF, BLACK, BLACK), ("dark", BLACK, OFF, GREEN)]:
    save(f"logo-horizontal-{variant}.svg", f'''<svg xmlns="http://www.w3.org/2000/svg" width="452" height="140" viewBox="0 0 452 140" role="img" aria-label="NUMERUS">
<rect width="452" height="140" fill="{bg}"/>
{mark(24, 26, 100, sw=5)}
<rect x="146" y="28" width="8" height="84" fill="{bar}"/>
<text x="176" y="96" font-family="{FONT}" font-size="64" font-weight="800" letter-spacing="-3" fill="{fg}">NUMERUS</text>
</svg>''')

# standalone mark + favicon
save("mark.svg", f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 4 124 108" role="img" aria-label="NUMERUS">
<polygon points="{POLY}" fill="{GREEN}" stroke="{BLACK}" stroke-width="4" stroke-linejoin="miter"/>
</svg>''')
save("favicon.svg", f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
<rect width="128" height="128" fill="{BLACK}"/>
{mark(14, 14, 100, sw=6)}
</svg>''')

# palette strip for docs
save("palette.svg", f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="150" viewBox="0 0 1200 150" role="img" aria-label="Paleta NUMERUS">
<rect width="1200" height="150" fill="{BLACK}"/>
<rect x="10" y="10" width="386" height="130" fill="{BLACK}" stroke="{OFF}" stroke-width="2"/>
<rect x="406" y="10" width="387" height="130" fill="{OFF}"/>
<rect x="803" y="10" width="387" height="130" fill="{GREEN}"/>
<g font-family="{FONT}" font-size="15" font-weight="700" letter-spacing="1">
<text x="30" y="122" fill="{OFF}">PITCH BLACK</text><text x="376" y="122" text-anchor="end" fill="{OFF}">#0A0A0A</text>
<text x="426" y="122" fill="{BLACK}">OFF WHITE</text><text x="773" y="122" text-anchor="end" fill="{BLACK}">#F2F0E9</text>
<text x="823" y="122" fill="{BLACK}">SIGNAL GREEN</text><text x="1170" y="122" text-anchor="end" fill="{BLACK}">#149E48</text>
</g></svg>''')

# section bars used as readme headings
sections = [
    ("01", "SOBRE", "O QUE É"),
    ("02", "TELAS", "PAINEL · TRANSAÇÕES · METAS · ASSISTENTE"),
    ("03", "STACK", "FERRAMENTAS"),
    ("04", "ESTRUTURA", "ÁRVORE DO REPOSITÓRIO"),
    ("05", "COMEÇAR", "RODAR LOCALMENTE"),
    ("06", "DESIGN", "TOKENS · REGRAS"),
    ("07", "CONTRIBUIR", "BRANCHES · COMMITS · PRS"),
]
for num, title, sub in sections:
    save(f"section-{num}.svg", f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="64" viewBox="0 0 1200 64" role="img" aria-label="[{num}] {title}">
<rect width="1200" height="64" fill="{BLACK}"/>
<rect x="6" y="6" width="64" height="52" fill="{GREEN}"/>
<text x="38" y="40" text-anchor="middle" font-family="{FONT}" font-size="18" font-weight="800" fill="{BLACK}">{num}</text>
<text x="92" y="41" font-family="{FONT}" font-size="22" font-weight="800" letter-spacing="1.5" fill="{OFF}">{title}</text>
<text x="1176" y="40" text-anchor="end" font-family="{FONT}" font-size="13" font-weight="700" letter-spacing="1.2" fill="{OFF}">{sub}</text>
</svg>''')

print("done")
