// Lightweight Diagram class for directed graphs
// Features:
// - add/remove nodes and edges
// - export/import JSON
// - export DOT (Graphviz) for visualization
// - BFS path search, cycle detection, topological sort (Kahn)

export default class Diagram {
  constructor({ directed = true } = {}) {
    this.directed = !!directed;
    // nodes: Map<id, data>
    this.nodes = new Map();
    // adjacency: Map<id, Set<neighborId>>
    this.adjacency = new Map();
    // optional edge metadata: Map<from, Map<to, meta>>
    this.edgesMeta = new Map();
  }

  // Nodes
  addNode(id, data = {}) {
    if (id === undefined || id === null) throw new Error('node id required');
    if (!this.nodes.has(id)) {
      this.nodes.set(id, data);
      this.adjacency.set(id, new Set());
    } else {
      // merge data
      const prev = this.nodes.get(id) || {};
      this.nodes.set(id, Object.assign({}, prev, data));
    }
    return this.nodes.get(id);
  }

  removeNode(id) {
    if (!this.nodes.has(id)) return false;
    this.nodes.delete(id);
    this.adjacency.delete(id);
    // remove incoming edges
    for (const [from, nbrs] of this.adjacency.entries()) {
      if (nbrs.has(id)) nbrs.delete(id);
    }
    // remove edge meta
    this.edgesMeta.delete(id);
    for (const m of this.edgesMeta.values()) m.delete(id);
    return true;
  }

  getNode(id) {
    return this.nodes.has(id) ? this.nodes.get(id) : null;
  }

  // Edges
  addEdge(from, to, meta = {}) {
    if (!this.nodes.has(from)) this.addNode(from);
    if (!this.nodes.has(to)) this.addNode(to);
    this.adjacency.get(from).add(to);
    if (!this.edgesMeta.has(from)) this.edgesMeta.set(from, new Map());
    this.edgesMeta.get(from).set(to, meta);
    if (!this.directed) {
      this.adjacency.get(to).add(from);
      if (!this.edgesMeta.has(to)) this.edgesMeta.set(to, new Map());
      this.edgesMeta.get(to).set(from, Object.assign({}, meta));
    }
  }

  removeEdge(from, to) {
    if (!this.nodes.has(from) || !this.nodes.has(to)) return false;
    this.adjacency.get(from).delete(to);
    this.edgesMeta.get(from)?.delete(to);
    if (!this.directed) {
      this.adjacency.get(to).delete(from);
      this.edgesMeta.get(to)?.delete(from);
    }
    return true;
  }

  getNeighbors(id) {
    if (!this.adjacency.has(id)) return [];
    return Array.from(this.adjacency.get(id));
  }

  // Serialization
  toJSON() {
    const nodes = Array.from(this.nodes.entries()).map(([id, data]) => ({ id, data }));
    const edges = [];
    for (const [from, nbrs] of this.adjacency.entries()) {
      for (const to of nbrs) {
        const meta = this.edgesMeta.get(from)?.get(to) ?? null;
        edges.push({ from, to, meta });
      }
    }
    return { directed: this.directed, nodes, edges };
  }

  static fromJSON(obj) {
    const d = new Diagram({ directed: !!obj?.directed });
    for (const n of obj?.nodes ?? []) d.addNode(n.id, n.data);
    for (const e of obj?.edges ?? []) d.addEdge(e.from, e.to, e.meta ?? {});
    return d;
  }

  // Export Graphviz DOT (directed or undirected)
  toDOT({ graphName = 'G' } = {}) {
    const lines = [];
    const head = this.directed ? 'digraph' : 'graph';
    const sep = this.directed ? '->' : '--';
    lines.push(`${head} ${graphName} {`);
    // node labels
    for (const [id, data] of this.nodes.entries()) {
      const safeLabel = String(data?.label ?? id).replace(/"/g, '\\"');
      lines.push(`  "${id}" [label="${safeLabel}"];`);
    }
    for (const [from, nbrs] of this.adjacency.entries()) {
      for (const to of nbrs) {
        const meta = this.edgesMeta.get(from)?.get(to);
        const label = meta?.label ? ` [label="${String(meta.label).replace(/"/g, '\\"')}"]` : '';
        lines.push(`  "${from}" ${sep} "${to}"${label};`);
      }
    }
    lines.push('}');
    return lines.join('\n');
  }

  // BFS path from start to goal (returns array of node ids) or null
  findPath(start, goal) {
    if (!this.nodes.has(start) || !this.nodes.has(goal)) return null;
    const q = [start];
    const prev = new Map();
    prev.set(start, null);
    while (q.length) {
      const cur = q.shift();
      if (cur === goal) break;
      for (const nb of this.getNeighbors(cur)) {
        if (!prev.has(nb)) {
          prev.set(nb, cur);
          q.push(nb);
        }
      }
    }
    if (!prev.has(goal)) return null;
    const path = [];
    let cur = goal;
    while (cur !== null) {
      path.push(cur);
      cur = prev.get(cur);
    }
    return path.reverse();
  }

  // Detect cycles (directed) using DFS
  hasCycle() {
    const visited = new Set();
    const stack = new Set();

    const dfs = (u) => {
      visited.add(u);
      stack.add(u);
      for (const v of this.getNeighbors(u)) {
        if (!visited.has(v)) {
          if (dfs(v)) return true;
        } else if (stack.has(v)) {
          return true;
        }
      }
      stack.delete(u);
      return false;
    };

    for (const node of this.nodes.keys()) {
      if (!visited.has(node)) if (dfs(node)) return true;
    }
    return false;
  }

  // Topological sort (Kahn). Returns array or throws on cycle.
  topologicalSort() {
    if (!this.directed) throw new Error('topologicalSort only valid for directed graphs');
    const inDegree = new Map();
    for (const id of this.nodes.keys()) inDegree.set(id, 0);
    for (const [u, nbrs] of this.adjacency.entries()) {
      for (const v of nbrs) inDegree.set(v, (inDegree.get(v) || 0) + 1);
    }
    const q = [];
    for (const [id, deg] of inDegree.entries()) if (deg === 0) q.push(id);
    const out = [];
    while (q.length) {
      const u = q.shift();
      out.push(u);
      for (const v of this.getNeighbors(u)) {
        inDegree.set(v, inDegree.get(v) - 1);
        if (inDegree.get(v) === 0) q.push(v);
      }
    }
    if (out.length !== this.nodes.size) throw new Error('Graph has at least one cycle');
    return out;
  }
}
