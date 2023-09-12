export default class Edge {
  r: number;
  g: number;
  b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  add(o: Edge): Edge {
    return new Edge(this.r + o.r, this.g + o.g, this.b + o.b);
  }

  sub(o: Edge): Edge {
    return new Edge(this.r - o.r, this.g - o.g, this.b - o.b);
  }

  mul(fac: number): Edge {
    return new Edge(this.r * fac, this.g * fac, this.b * fac);
  }

  get(): [number, number, number] {
    return [this.r, this.g, this.b];
  }
}
