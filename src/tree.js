import BinaryHeap from './binary_heap';

function createNode(data, dimension, parent = null) {
  return {
    data: data,

    left: null,
    right: null,
    parent: parent,

    dimension: dimension
  };
}

export default class KDTree {

  constructor(points, metric, dimensions) {

    /**
     * @type {Array.<String>}
     */
    this.dimensions = dimensions;

    /**
     * @type {Function}
     */
    this.metric = metric;

    // If points is not an array, assume we're loading a pre-built tree
    if (!Array.isArray(points)) {
      this.loadTree(points);
    } else {

      /**
       * @type {Object}
       */
      this.root = this.buildTree(points, 0, null);
    }


  }

  /**
   * @param  {Array.<Object>} points
   * @param  {Number}         depth
   * @param  {Object=}        parent
   * @return {Node}
   */
  buildTree(points, depth, parent) {
    const dimensions = this.dimensions;
    let dim = depth % dimensions.length;
    let median, node;

    if (points.length === 0) {
      return null;
    }

    if (points.length === 1) {
      return createNode(points[0], dim, parent);
    }

    points.sort(function(a, b) {
      return a[dimensions[dim]] - b[dimensions[dim]];
    });

    median = Math.floor(points.length / 2);
    node = createNode(points[median], dim, parent);

    // divide
    node.left  = this.buildTree(points.slice(0, median), depth + 1, node);
    node.right = this.buildTree(points.slice(median + 1), depth + 1, node);

    return node;
  }

  _buildTree(points, depth, parent) {
    const dimensions = this.dimensions;
    let dim = depth % dimensions.length;

    var Q = [points];
    while (Q.length) {
      var collection = Q.pop();
      collection.sort(function(a, b) {
        return a[dimensions[dim]] - b[dimensions[dim]];
      });
      var median = Math.floor(collection.length / 2);
      var left = points.slice(0, median);
      var right = points.slice(median + 1);
      Q.push(left, right);
    }
    // create root
    while (true) {
      // got points and dimension
      // sort points
      // split again
      left = points.slice(0, median);
      right = points.slice(median + 1);
    }
  }

  /**
   * Reloads a serialied tree by putting back `parent refs`
   * @param  {Object=} data
   */
  loadTree(data) {
    this.root = data;
    KDTree.restoreParent(this.root);
  }


  static restoreParent(root) {
    if (root.left) {
      root.left.parent = root;
      KDTree.restoreParent(root.left);
    }

    if (root.right) {
      root.right.parent = root;
      KDTree.restoreParent(root.right);
    }
  }

  /**
   * Convert to a JSON serializable structure;
   * this just requires removing the `parent` property
   *
   * @param {Object=} src
   */
  toJSON(src) {
    if (!src)
      src = this.root;
    let dest = createNode(src.data, src.dimension, null);
    if (src.left) {
      dest.left = this.toJSON(src.left);
    }
    if (src.right) {
      dest.right = this.toJSON(src.right);
    }
    return dest;
  }

  innerSearch(point, node, parent) {
    if (node === null) {
      return parent;
    }

    let dimension = this.dimensions[node.dimension];
    if (point[dimension] < node.data[dimension]) {
      return this.innerSearch(point, node.left, node);
    } else {
      return this.innerSearch(point, node.right, node);
    }
  }

  /**
   * @param  {*}    point
   * @return {Node}
   */
  insert(point) {
    let insertPosition = this.innerSearch(point, this.root, null);
    let dimensions = this.dimensions;

    if (insertPosition === null) {
      this.root = createNode(point, 0, null);
      return this.root;
    }

    let newNode = createNode(point, (insertPosition.dimension + 1) % dimensions.length,
      insertPosition);
    let dimension = dimensions[insertPosition.dimension];

    if (point[dimension] < insertPosition.data[dimension]) {
      insertPosition.left = newNode;
    } else {
      insertPosition.right = newNode;
    }

    return newNode;
  }

  /**
   * @param  {Node|Null} node
   * @param  {*}         point
   * @return {Node|Null}
   */
  nodeSearch(node, point) {
    if (node === null) {
      return null;
    }

    if (node.data === point) {
      return node;
    }

    var dimension = this.dimensions[node.dimension];

    if (point[dimension] < node.data[dimension]) {
      return this.nodeSearch(node.left, node.data);
    } else {
      return this.nodeSearch(node.right, node.data);
    }
  }

  /**
   * @param  {Node}          node
   * @param  {String|Number} dim
   * @return {Node|Null}
   */
  findMin(node, dim) {
    if (node === null) {
      return null;
    }

    let dimension = this.dimensions[dim];

    if (node.dimension === dim) {
      if (node.left !== null) {
        return this.findMin(node.left, dim);
      }
      return node;
    }

    let own = node.data[dimension];
    let left = this.findMin(node.left, dim);
    let right = this.findMin(node.right, dim);
    let min = node;

    if (left !== null && left.data[dimension] < own) {
      min = left;
    }

    if (right !== null && right.data[dimension] < min.data[dimension]) {
      min = right;
    }
    return min;
  }

  /**
   * @param  {Node} node
   */
  removeNode(node) {
    let nextNode, nextObj;

    if (node.left === null && node.right === null) {
      if (node.parent === null) {
        this.root = null;
        return;
      }

      let pDimension = dimensions[node.parent.dimension];

      if (node.data[pDimension] < node.parent.data[pDimension]) {
        node.parent.left = null;
      } else {
        node.parent.right = null;
      }
      return;
    }

    // If the right subtree is not empty, swap with the minimum element on the
    // node's dimension. If it is empty, we swap the left and right subtrees and
    // do the same.
    if (node.right !== null) {
      nextNode = this.findMin(node.right, node.dimension);
      nextObj = nextNode.data;
      this.removeNode(nextNode);
      node.data = nextObj;
    } else {
      nextNode = this.findMin(node.left, node.dimension);
      nextObj = nextNode.data;
      this.removeNode(nextNode);
      node.right = node.left;
      node.left = null;
      node.data = nextObj;
    }
  }

  /**
   * Find and remove node
   * @param  {*} point
   * @return {*}
   */
  remove(point) {
    let node = this.nodeSearch(this.root, point);
    if (node) {
      this.removeNode(node);
    }
    return point;
  }

  /**
   * @param  {Node}       node
   * @param  {Number}     distance
   * @param  {BinaryHeap} bestNodes
   * @param  {Number}     maxNodes
   */
  static saveNode(node, distance, bestNodes, maxNodes) {
    bestNodes.push([node, distance]);
    if (bestNodes.size() > maxNodes) {
      bestNodes.pop();
    }
  }

  /**
   * @param  {Node}       node
   * @param  {*}          point
   * @param  {BinaryHeap} bestNodes
   * @param  {Number}     maxNodes
   */
  nearestSearch(node, point, bestNodes, maxNodes) {
    var bestChild;
    const dimensions = this.dimensions;
    let dimension = dimensions[node.dimension];
    let ownDistance = this.metric(point, node.data);
    let linearPoint = {};
    let otherChild, i;

    for (let i = 0, len = dimensions.length; i < len; i++) {
      if (i === node.dimension) {
        linearPoint[dimensions[i]] = point[dimensions[i]];
      } else {
        linearPoint[dimensions[i]] = node.data[dimensions[i]];
      }
    }

    let linearDistance = this.metric(linearPoint, node.data);

    if (node.right === null && node.left === null) {
      if (bestNodes.size() < maxNodes || ownDistance < bestNodes.peek()[1]) {
        KDTree.saveNode(node, ownDistance, bestNodes, maxNodes);
      }
      return;
    }

    if (node.right === null) {
      bestChild = node.left;
    } else if (node.left === null) {
      bestChild = node.right;
    } else {
      if (point[dimension] < node.data[dimension]) {
        bestChild = node.left;
      } else {
        bestChild = node.right;
      }
    }

    this.nearestSearch(bestChild, point, bestNodes, maxNodes);

    if (bestNodes.size() < maxNodes ||
      ownDistance < bestNodes.peek()[1]) {
      KDTree.saveNode(node, ownDistance, bestNodes, maxNodes);
    }

    if (bestNodes.size() < maxNodes ||
      Math.abs(linearDistance) < bestNodes.peek()[1]) {
      if (bestChild === node.left) {
        otherChild = node.right;
      } else {
        otherChild = node.left;
      }
      if (otherChild !== null) {
        this.nearestSearch(otherChild, point, bestNodes, maxNodes);
      }
    }
  }

  /**
   * @param  {*} point
   * @param  {Number} maxNodes
   * @param  {Number}
   * @return {Array.<*>} [data, distance]
   */
  nearest(point, maxNodes = 1, maxDistance = 0) {
    let bestNodes = new BinaryHeap((e) => -e[1]);

    if (maxDistance) {
      for (let i = 0; i < maxNodes; i++) {
        bestNodes.push([null, maxDistance]);
      }
    }

    if (this.root) {
      this.nearestSearch(this.root, point, bestNodes, maxNodes);
    }

    let result = [];

    for (let i = 0, len = Math.min(maxNodes, bestNodes.content.length); i < len; i++) {
      if (bestNodes.content[i][0]) {
        result.push([bestNodes.content[i][0].data, bestNodes.content[i][1]]);
      }
    }
    return result;
  }

  /**
   * @return {Number}
   */
  balanceFactor() {
    function height(node) {
      if (node === null) return 0;
      return Math.max(height(node.left), height(node.right)) + 1;
    }

    function count(node) {
      if (node === null) return 0;
      return count(node.left) + count(node.right) + 1;
    }

    return height(this.root) / (Math.log(count(this.root)) / Math.log(2));
  }

}
