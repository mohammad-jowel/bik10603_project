import networkx as nx
import matplotlib.pyplot as plt
import contextily as ctx
import math
import urllib.request
import json
import time

def lnglat_to_meters(lng, lat):
    """Converts WGS84 Longitude/Latitude degrees into native Web Mercator meters."""
    x = 6378137.0 * math.radians(lng)
    y = 6378137.0 * math.log(math.tan(math.pi / 4.0 + math.radians(lat) / 2.0))
    return x, y

def fetch_real_road_geometry(lon1, lat1, lon2, lat2):
    """Fetches the actual street-level highway tracking points from OSRM API."""
    url = f"http://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Project Infrastructure Application)'})
        with urllib.request.urlopen(req, timeout=7) as response:
            data = json.loads(response.read().decode())
            if data.get('routes'):
                raw_coords = data['routes'][0]['geometry']['coordinates']
                meter_coords = [lnglat_to_meters(pt[0], pt[1]) for pt in raw_coords]
                return meter_coords
    except Exception as e:
        print(f" -> Live routing download bypassed. Using vector default fallback. ({e})")
    return None

G = nx.DiGraph()

cities = {
    "Rotterdam": (4.4777, 51.9244), "The Hague": (4.3007, 52.0705), "Amsterdam": (4.9041, 52.3676),
    "Utrecht": (5.1214, 52.0907), "Almere": (5.2236, 52.3718), "Veenendaal": (5.5556, 52.0292),
    "Arnhem": (5.8987, 51.9851), "'s-Hertogenbosch": (5.3042, 51.6978), "Breda": (4.7760, 51.5719),
    "Tilburg": (5.0773, 51.5606), "Eindhoven": (5.4776, 51.4416), "Leeuwarden": (5.7921, 53.2012),
    "Meppel": (6.1912, 52.6942), "Zwolle": (6.0830, 52.5168), "Groningen": (6.5665, 53.2194)
}

for city, coords in cities.items():
    mx, my = lnglat_to_meters(coords[0], coords[1])
    G.add_node(city, x=mx, y=my)

connections = [
    ("Rotterdam", "The Hague", 26), ("Rotterdam", "Breda", 48), ("Rotterdam", "Utrecht", 62),
    ("The Hague", "Amsterdam", 65), ("Breda", "Tilburg", 25), ("Tilburg", "Eindhoven", 35),
    ("Tilburg", "'s-Hertogenbosch", 25), ("Eindhoven", "'s-Hertogenbosch", 33),
    ("'s-Hertogenbosch", "Utrecht", 50), ("'s-Hertogenbosch", "Arnhem", 65),
    ("Utrecht", "Amsterdam", 45), ("Utrecht", "Veenendaal", 33), ("Amsterdam", "Almere", 30),
    ("Almere", "Zwolle", 75), ("Veenendaal", "Arnhem", 30), ("Arnhem", "Zwolle", 80),
    ("Zwolle", "Meppel", 28), ("Meppel", "Leeuwarden", 60), ("Meppel", "Groningen", 75),
    ("Leeuwarden", "Groningen", 60)
]

for source, target, distance in connections:
    G.add_edge(source, target, weight=distance)

nx.write_graphml(G, "netherlands_infrastructure.graphml")

print("Connecting to live routing servers to map real highway shapes...")
road_geometries_cache = {}

for u, v in G.edges():
    lon1, lat1 = cities[u]
    lon2, lat2 = cities[v]
    print(f" Fetching actual highway trace: {u} -> {v}")
    route_pts = fetch_real_road_geometry(lon1, lat1, lon2, lat2)
    if route_pts:
        road_geometries_cache[f"{u}->{v}"] = route_pts
    time.sleep(0.6)

with open("highway_geometries.json", "w") as f:
    json.dump(road_geometries_cache, f)
print("Finished downloading real highway lanes to 'highway_geometries.json'")

pos = {node: (data['x'], data['y']) for node, data in G.nodes(data=True)}
fig, ax = plt.subplots(figsize=(13, 13), facecolor='#0b0f19')
ax.set_facecolor('#0b0f19')

for u, v in G.edges():
    cache_key = f"{u}->{v}"
    if cache_key in road_geometries_cache:
        pts = road_geometries_cache[cache_key]
        x_vals = [p[0] for p in pts]
        y_vals = [p[1] for p in pts]
        ax.plot(x_vals, y_vals, color='#4b5563', linewidth=2.5, alpha=0.8, zorder=1)
        
        # FIX: Replaced 'ms' with 'mutation_scale' to handle arrowhead dimensions properly
        mid_idx = len(pts) // 2
        ax.annotate('', xy=(pts[mid_idx+1][0], pts[mid_idx+1][1]), 
                    xytext=(pts[mid_idx][0], pts[mid_idx][1]),
                    arrowprops=dict(arrowstyle="-|>", color='#4b5563', lw=0, mutation_scale=12), zorder=2)
    else:
        ax.plot([pos[u][0], pos[v][0]], [pos[u][1], pos[v][1]], color='#4b5563', linewidth=2, zorder=1)

# 1. Overlay individual network node points
x_coords = [pos[node][0] for node in G.nodes()]
y_coords = [pos[node][1] for node in G.nodes()]
ax.scatter(x_coords, y_coords, color='#00f2fe', s=100, alpha=0.9, zorder=3)

# 2. Add clear white text labels for each node slightly offset above the point
for node, (x, y) in pos.items():
    ax.text(x, y, str(node), color='#ffffff', fontsize=9, fontweight='bold', 
            va='bottom', ha='center', zorder=4)

for u, v, data in G.edges(data=True):
    cache_key = f"{u}->{v}"
    if cache_key in road_geometries_cache:
        pts = road_geometries_cache[cache_key]
        mid = len(pts) // 2
        mx, my = pts[mid][0], pts[mid][1]
    else:
        mx, my = (pos[u][0] + pos[v][0])/2, (pos[u][1] + pos[v][1])/2
        
    ax.text(mx, my, s=f"{data['weight']}K", color='#f59e0b', fontsize=7.5, fontweight='bold',
            bbox=dict(facecolor='#0b0f19', edgecolor='none', pad=0.1, alpha=0.6),
            horizontalalignment='center', verticalalignment='center', zorder=5)

x_coords = [d['x'] for n, d in G.nodes(data=True)]
y_coords = [d['y'] for n, d in G.nodes(data=True)]
ax.set_xlim(min(x_coords) - 40000, max(x_coords) + 40000)
ax.set_ylim(min(y_coords) - 40000, max(y_coords) + 40000)

ctx.add_basemap(ax, source=ctx.providers.CartoDB.DarkMatterNoLabels, zoom=9)

plt.title("Regional Infrastructure Network Model\nPhysical Highway Geometries (Netherlands)", 
          fontsize=14, fontweight='bold', color='white', pad=15)
plt.axis('off')
plt.tight_layout()

plt.savefig("map_infrastructure.png", dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
print("High-accuracy network layout exported successfully to 'map_infrastructure.png'")