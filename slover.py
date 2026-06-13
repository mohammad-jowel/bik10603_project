import networkx as nx
import matplotlib.pyplot as plt
import contextily as ctx
import json

# --- 1. LOAD DATA ---
try:
    G = nx.read_graphml("netherlands_infrastructure.graphml")
    with open("highway_geometries.json", "r") as f:
        road_geometries_cache = json.load(f)
except FileNotFoundError:
    print("Error: Run step1_build.py first to compile the system shapes!")
    exit()

pos = {node: (float(data['x']), float(data['y'])) for node, data in G.nodes(data=True)}
for u, v, data in G.edges(data=True):
    data['weight'] = int(data['weight'])

# --- 2. MANUAL DIJKSTRA IMPLEMENTATION ---
def get_shortest_path_manual(graph, start, end):
    distances = {node: float('inf') for node in graph.nodes()}
    distances[start] = 0
    previous = {node: None for node in graph.nodes()}
    unvisited = list(graph.nodes())
    
    while unvisited:
        # Linear scan for the node with the smallest distance
        current_node = min(unvisited, key=lambda node: distances[node])
        
        if distances[current_node] == float('inf'): break
        if current_node == end: break
            
        unvisited.remove(current_node)
        
        for neighbor in graph.neighbors(current_node):
            weight = graph[current_node][neighbor]['weight']
            new_dist = distances[current_node] + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                previous[neighbor] = current_node
                
    path = []
    curr = end
    while curr is not None:
        path.append(curr)
        curr = previous[curr]
    return path[::-1], distances[end]

# --- 3. EXECUTE CALCULATION ---
origin = "Rotterdam"
destination = "Groningen"
shortest_path_nodes, total_path_distance = get_shortest_path_manual(G, origin, destination)
solved_path_edges = list(zip(shortest_path_nodes, shortest_path_nodes[1:]))

# --- 4. VISUALIZATION ---
fig, ax = plt.subplots(figsize=(13, 13), facecolor='#0b0f19')
ax.set_facecolor('#0b0f19')

# Background Edges
bg_road_color = '#6b7280' 
for u, v in G.edges():
    if (u, v) not in solved_path_edges and (v, u) not in solved_path_edges:
        cache_key = f"{u}->{v}"
        if cache_key in road_geometries_cache:
            pts = road_geometries_cache[cache_key]
            ax.plot([p[0] for p in pts], [p[1] for p in pts], color=bg_road_color, linewidth=2.2, alpha=0.65, zorder=1)
        else:
            ax.plot([pos[u][0], pos[v][0]], [pos[u][1], pos[v][1]], color=bg_road_color, linewidth=1.8, alpha=0.65, zorder=1)

# Shortest Path Edges
for u, v in solved_path_edges:
    cache_key = f"{u}->{v}"
    if cache_key in road_geometries_cache:
        pts = road_geometries_cache[cache_key]
        ax.plot([p[0] for p in pts], [p[1] for p in pts], color='#ff2e63', linewidth=5.5, alpha=1.0, zorder=2)
        mid_idx = len(pts) // 2
        ax.annotate('', xy=(pts[mid_idx+1][0], pts[mid_idx+1][1]), 
                    xytext=(pts[mid_idx][0], pts[mid_idx][1]),
                    arrowprops=dict(arrowstyle="-|>", color='#ff2e63', lw=0, mutation_scale=15), zorder=2)
    else:
        ax.plot([pos[u][0], pos[v][0]], [pos[u][1], pos[v][1]], color='#ff2e63', linewidth=5.0, zorder=2)

# Nodes
for node in G.nodes():
    is_on_path = node in shortest_path_nodes
    n_color = '#ff2e63' if is_on_path else '#00f2fe'
    n_size = 140 if is_on_path else 80
    ax.scatter(pos[node][0], pos[node][1], color=n_color, s=n_size, alpha=1.0, edgecolors='white', linewidths=0.5, zorder=3)

# Labels
for node, (x, y) in pos.items():
    is_on_path = node in shortest_path_nodes
    ax.text(x, y + 6800, s=node, color='#ffffff', fontsize=8.5, fontweight='bold',
            bbox=dict(facecolor='#ff2e63' if is_on_path else '#111827', 
                      edgecolor='#ff2e63' if is_on_path else '#00f2fe', 
                      boxstyle='round,pad=0.3', alpha=0.95),
            horizontalalignment='center', zorder=4)

# Weight Labels
for u, v, data in G.edges(data=True):
    mx, my = (pos[u][0] + pos[v][0])/2, (pos[u][1] + pos[v][1])/2
    ax.text(mx, my, s=f"{data['weight']} KM", color='#d1d5db', fontsize=8, fontweight='bold',
            bbox=dict(facecolor='#0b0f19', edgecolor='none', pad=0.15, alpha=0.75),
            horizontalalignment='center', verticalalignment='center', zorder=5)

# Map context
x_coords = [float(d['x']) for n, d in G.nodes(data=True)]
y_coords = [float(d['y']) for n, d in G.nodes(data=True)]
ax.set_xlim(min(x_coords) - 40000, max(x_coords) + 40000)
ax.set_ylim(min(y_coords) - 40000, max(y_coords) + 40000)
ctx.add_basemap(ax, source=ctx.providers.CartoDB.DarkMatterNoLabels, zoom=9)

# Final Title & Save
plt.title(f"Dijkstra Shortest Path Analysis: {origin} to {destination}\nTotal Distance: {total_path_distance} KM", 
          fontsize=14, fontweight='bold', color='white', pad=15)
plt.axis('off')
plt.tight_layout()
plt.savefig("shortest_path.png", dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
print("Solution map successfully exported to 'shortest_path.png'")