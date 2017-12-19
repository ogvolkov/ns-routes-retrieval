class GraphTraversal {
  constructor(vertexCount, edges) {
    this.edges = new Map();
    edges.forEach(edge => this.addEdge(edge.from, edge.to));

    this.vertexCount = vertexCount;
    this.currentFrom = 0;
    this.currentTo = 0;
  }

  getNextUnvisitedEdge() {
    for (let from = this.currentFrom; from < this.vertexCount; from += 1) {
      for (let to = this.currentTo; to < this.vertexCount; to += 1) {
        if (from !== to && !this.hasEdge(from, to)) {
          this.currentFrom = from;
          this.currentTo = to + 1;
          return { from, to };
        }
      }
      this.currentTo = 0;
    }

    return null;
  }

  hasEdge(from, to) {
    return this.edges.get(from) !== undefined
      && this.edges.get(from).get(to) !== undefined;
  }

  addEdge(from, to) {
    let edgesFrom = this.edges.get(from);
    if (edgesFrom === undefined) {
      edgesFrom = new Map();
      this.edges.set(from, edgesFrom);
    }
    edgesFrom.set(to, 1);
  }
}

module.exports = { GraphTraversal };
