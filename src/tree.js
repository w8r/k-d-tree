import BinaryHeap  from './binary_heap';
import quickselect from './quickselect';

function createNode(data, dimension, parent = null) {
  return {
    data, parent, dimension,

    left:  null,
    right: null
  };
}

function insertionSort(arr, f) {
  for(var i = 1, len = arr.length; i < len; i++) {
    var el = arr[i], j = i;
    while (j > 0 && arr[j - 1][f] > el[f]){
      arr[j] = arr[j - 1];
      j--;
    }

    arr[j] = el;
  }

  return arr;
}


export default class KDTree {

  constructor(points, metric, dimensions) {

    /**
     * @type {Array.<String>}
     */
    this.dimensions = dimensions;

    var sorters = [];
    for (var i = 0, len = dimensions.length; i < len; i++) {
      var dimension = dimensions[i];
      sorters.push(function (a, b) {
        return a[dimension] - b[dimension];
      });
    }

    this._sorters = sorters;

    /**
     * @type {Function}
     */
    this.metric = metric;

    /**
     * @type {Node}
     */
    this.root = null;

    if (points) {
      if (Array.isArray(points) && points.length > 0) {
        this.load(points);
      } else if (points.dimension) {
        // If points is not an array, assume
        // we're loading a pre-built tree
        this.loadTree(points);
      }
    }
  }

  load(points) {
    this.root = this.buildTree(points, 0, this.root);
  }

  /**
   * Non-recursive bulk-insert
   * @param  {Array.<Object>} points
   * @param  {Number}         depth
   * @param  {Object=}        parent
   * @return {Node}
   */
  buildTree(points, depth, root) {
    var d = this.dimensions.length;
    var sorters = this._sorters;

    if (root === null) root = this.root = createNode(null, depth % d, null);

    var Q = [root], node;
    var parts = [points];

    while (node = Q.pop()) {
      var range = parts.pop();
      var N     = range.length;

      if (N === 1) {
        node.data = range[0];
      } else {
        var median    = Math.floor(N / 2);
        var dimension = node.dimension;
        var dim       = dimension % d;
        //quickselect(range, median, undefined, undefined, (a, b) => a[dim] - b[dim]);
        //insertionSort(range, dim);
        // range.sort((a, b) => a[dim] - b[dim]);
        node.data = quickselect(range, median, dim); // range[median];

        if (median < N - 1) {
          parts.push(range.slice(median + 1));
          node.right = createNode(null, dimension + 1, node);
          Q.push(node.right);
        }

        // split
        if (median > 0) {
          parts.push(range.slice(0, median));
          node.left = createNode(null, dimension + 1, node);
          Q.push(node.left);
        }
      }
    }

    return root;
  }


  /**
   * Reloads a serialied tree by putting back `parent refs`
   * @param  {Object=} data
   */
  loadTree(data) {
    var root = data;
    var Q = [root], node;

    while (node = Q.pop()) {
      if (node.left) {
        node.left.parent = node;
        Q.push(node.left);
      }
      if (node.right) {
        node.right.parent = node;
        Q.push(node.right);
      }
    }

    this.root = root;
    return this;
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


  _findNode(point) {
    var Q = [this.root], node = null, D;
    while (Q.length !== 0) {
      node = Q.pop();
      D = node.dimension;
      if (point[D] < node.data[D] && node.left) Q.push(node.left);
      else if (node.right)                      Q.push(node.right);
    }
    return node;
  }

  /**
   * @param  {*}    point
   * @return {Node}
   */
  insert(point) {
    const dimensions = this.dimensions;

    if (this.root === null) {
      this.root = createNode(point, 0, null);
      return this.root;
    }

    const node = this._findNode(point);
    const dim  = node.dimension;
    const newNode = createNode(point, (dim + 1) % dimensions.length, node);
    const D = dimensions[dim];

    if (point[D] < node.data[D]) node.left  = newNode;
    else                         node.right = newNode;
    return newNode;
  }


  /**
   * @param  {Node}          node
   * @param  {String|Number} dim
   * @return {Node|Null}
   */
  findMin(node, dim) {
    if (node === null) return null;

    let D = this.dimensions[dim];

    if (node.dimension === dim) {
      if (node.left) {
        return this.findMin(node.left, dim);
      }
      return node;
    }

    let own   = node.data[D];
    let left  = this.findMin(node.left, dim);
    let right = this.findMin(node.right, dim);
    let min   = node;

    if (left  !== null && left.data[D]  < own)         min = left;
    if (right !== null && right.data[D] < min.data[D]) min = right;

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
    let node = this._findNode(point);
    if (node) this.removeNode(node);
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
    let bestChild;
    const dimensions = this.dimensions;
    let dimension    = dimensions[node.dimension];
    let ownDistance  = this.metric(point, node.data);
    let linearPoint  = [];
    let otherChild, i, d;

    for (let i = 0, len = dimensions.length; i < len; i++) {
      d = dimensions[i];
      if (i === node.dimension) linearPoint[d] = point[d];
      else                      linearPoint[d] = node.data[d];
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
      if (bestChild === node.left) otherChild = node.right;
      else                         otherChild = node.left;

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
      for (let i = 0; i < maxNodes; i++) bestNodes.push([null, maxDistance]);
    }

    if (this.root) this.nearestSearch(this.root, point, bestNodes, maxNodes);

    const result = [], content = bestNodes.content;

    for (let i = 0, len = Math.min(maxNodes, content.length); i < len; i++) {
      if (content[i][0]) result.push([content[i][0].data, content[i][1]]);
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
