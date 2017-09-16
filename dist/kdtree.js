/**
 * kd-tree-js v0.0.1
 * kd-tree
 *
 * @author Alexander Milevski <info@w8r.name>
 * @license MIT
 * @preserve
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.KDTree = factory());
}(this, (function () { 'use strict';

/**
 * Binary heap implementation from:
 * http://eloquentjavascript.net/appendix2.html
 */
var BinaryHeap = function BinaryHeap(scoreFunction) {

  /**
   * @type {Array}
   */
  this.content = [];

  /**
   * @type {Function}
   */
  this.scoreFunction = scoreFunction;
};

/**
 * @param{*} element
 */
BinaryHeap.prototype.push = function push (element) {
  // Add the new element to the end of the array.
  this.content.push(element);
  // Allow it to bubble up.
  this.bubbleUp(this.content.length - 1);
};

/**
 * @return {*}
 */
BinaryHeap.prototype.pop = function pop () {
  var content = this.content;
  // Store the first element so we can return it later.
  var result = content[0];
  // Get the element at the end of the array.
  var end = content.pop();
  // If there are any elements left, put the end element at the
  // start, and let it sink down.
  if (content.length > 0) {
    content[0] = end;
    this.sinkDown(0);
  }
  return result;
};

/**
 * Non-destructive
 * @return {*}
 */
BinaryHeap.prototype.peek = function peek () {
  return this.content[0];
};

/**
 * @param{*} node
 */
BinaryHeap.prototype.remove = function remove (node) {
    var this$1 = this;

  var len = this.content.length;
  var scoreFunction = this.scoreFunction;
  var content = this.content;

  // To remove a value, we must search through the array to find it.
  for (var i = 0; i < len; i++) {
    if (content[i] === node) {
      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = content.pop();
      if (i !== len - 1) {
        content[i] = end;
        if (scoreFunction(end) < scoreFunction(node)) {
          this$1.bubbleUp(i);
        } else {
          this$1.sinkDown(i);
        }
      }
      return;
    }
  }
  throw new Error("Node not found.");
};

/**
 * @return {Number}
 */
BinaryHeap.prototype.size = function size () {
  return this.content.length;
};

/**
 * @param{Number} n
 */
BinaryHeap.prototype.bubbleUp = function bubbleUp (n) {
  var content = this.content;
  var scoreFunction = this.scoreFunction;
  // Fetch the element that has to be moved.
  var element = content[n];


  // When at 0, an element can not go up any further.
  while (n > 0) {
    // Compute the parent element's index, and fetch it.
    var parentN = Math.floor((n + 1) / 2) - 1;
    var parent = content[parentN];

    // Swap the elements if the parent is greater.
    if (scoreFunction(element) < scoreFunction(parent)) {
      content[parentN] = element;
      content[n] = parent;
      // Update 'n' to continue at the new position.
      n = parentN;
    }
    // Found a parent that is less, no need to move it further.
    else { break; }
  }
};

/**
 * @param{Number} n
 */
BinaryHeap.prototype.sinkDown = function sinkDown (n) {
    var this$1 = this;

  var content = this.content;
  var scoreFunction = this.scoreFunction;
  var length = content.length;

  // Look up the target element and its score.
  var element = content[n];
  var elemScore = scoreFunction(element);

  while (true) {
    // Compute the indices of the child elements.
    var child2N = (n + 1) * 2;
    var child1N = child2N - 1;
    // This is used to store the new position of the element,
    // if any.
    var swap = null;

    var child1Score = (void 0), child2Score = (void 0);
    // If the first child exists (is inside the array)...
    if (child1N < length) {
      // Look it up and compute its score.
      child1Score = scoreFunction(content[child1N]);
      // If the score is less than our element's, we need to swap.
      if (child1Score < elemScore) { swap = child1N; }
    }

    // Do the same checks for the other child.
    if (child2N < length) {
      child2Score = scoreFunction(this$1.content[child2N]);
      if (child2Score < (swap === null ? elemScore : child1Score)) {
        swap = child2N;
      }
    }

    // If the element needs to be moved, swap it, and continue.
    if (swap) {
      content[n] = content[swap];
      content[swap] = element;
      n = swap;
    } else { break; } // Otherwise, we are done.
  }
};

function selectKth(arr, k, f) {
  if (arr.length <= k) { throw new Error('Wrong input'); }

  var from = 0, to = arr.length - 1;

  // if from == to we reached the kth element
  while (from < to) {
    var r = from, w = to;
    var mid = arr[Math.floor((r + w) / 2)];

    // stop if the reader and writer meets
    while (r < w) {
      if (arr[r][f] >= mid[f]) { // put the large values at the end
        var tmp = arr[w];
        arr[w] = arr[r];
        arr[r] = tmp;
        w--;
      } else { r++; } // the value is smaller than the pivot, skip
    }

    // if we stepped up (r++) we need to step one down
    if (arr[r][f] > mid[f]) { r--; }

    // the r pointer is on the end of the first k elements
    if (k <= r) { to = r; }
    else        { from = r + 1; }
  }

  return arr[k];
}

function createNode(data, dimension, parent) {
  if ( parent === void 0 ) parent = null;

  return {
    data: data, parent: parent, dimension: dimension,

    left:  null,
    right: null
  };
}

var KDTree = function KDTree(points, metric, dimensions) {

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
};

KDTree.prototype.load = function load (points) {
  this.root = this.buildTree(points, 0, this.root);
};

/**
 * Non-recursive bulk-insert
 * @param{Array.<Object>} points
 * @param{Number}       depth
 * @param{Object=}      parent
 * @return {Node}
 */
KDTree.prototype.buildTree = function buildTree (points, depth, root) {
  var d = this.dimensions.length;
  var sorters = this._sorters;

  if (root === null) { root = this.root = createNode(null, depth % d, null); }

  var Q = [root], node;
  var parts = [points];

  while (node = Q.pop()) {
    var range = parts.pop();
    var N   = range.length;

    if (N === 1) {
      node.data = range[0];
    } else {
      var median  = Math.floor(N / 2);
      var dimension = node.dimension;
      var dim     = dimension % d;
      //quickselect(range, median, undefined, undefined, (a, b) => a[dim] - b[dim]);
      //insertionSort(range, dim);
      // range.sort((a, b) => a[dim] - b[dim]);
      node.data = selectKth(range, median, dim); // range[median];

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
};


/**
 * Reloads a serialied tree by putting back `parent refs`
 * @param{Object=} data
 */
KDTree.prototype.loadTree = function loadTree (data) {
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
};


/**
 * Convert to a JSON serializable structure;
 * this just requires removing the `parent` property
 *
 * @param {Object=} src
 */
KDTree.prototype.toJSON = function toJSON (src) {
  if (!src)
    { src = this.root; }
  var dest = createNode(src.data, src.dimension, null);
  if (src.left) {
    dest.left = this.toJSON(src.left);
  }
  if (src.right) {
    dest.right = this.toJSON(src.right);
  }
  return dest;
};


KDTree.prototype._findNode = function _findNode (point) {
  var Q = [this.root], node = null, D;
  while (Q.length !== 0) {
    node = Q.pop();
    D = node.dimension;
    if (point[D] < node.data[D] && node.left) { Q.push(node.left); }
    else if (node.right)                    { Q.push(node.right); }
  }
  return node;
};

/**
 * @param{*}  point
 * @return {Node}
 */
KDTree.prototype.insert = function insert (point) {
  var dimensions = this.dimensions;

  if (this.root === null) {
    this.root = createNode(point, 0, null);
    return this.root;
  }

  var node = this._findNode(point);
  var dim= node.dimension;
  var newNode = createNode(point, (dim + 1) % dimensions.length, node);
  var D = dimensions[dim];

  if (point[D] < node.data[D]) { node.left= newNode; }
  else                       { node.right = newNode; }
  return newNode;
};


/**
 * @param{Node}        node
 * @param{String|Number} dim
 * @return {Node|Null}
 */
KDTree.prototype.findMin = function findMin (node, dim) {
  if (node === null) { return null; }

  var D = this.dimensions[dim];

  if (node.dimension === dim) {
    if (node.left) {
      return this.findMin(node.left, dim);
    }
    return node;
  }

  var own = node.data[D];
  var left= this.findMin(node.left, dim);
  var right = this.findMin(node.right, dim);
  var min = node;

  if (left!== null && left.data[D]< own)       { min = left; }
  if (right !== null && right.data[D] < min.data[D]) { min = right; }

  return min;
};

/**
 * @param{Node} node
 */
KDTree.prototype.removeNode = function removeNode (node) {
  var nextNode, nextObj;

  if (node.left === null && node.right === null) {
    if (node.parent === null) {
      this.root = null;
      return;
    }

    var pDimension = dimensions[node.parent.dimension];

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
};

/**
 * Find and remove node
 * @param{*} point
 * @return {*}
 */
KDTree.prototype.remove = function remove (point) {
  var node = this._findNode(point);
  if (node) { this.removeNode(node); }
  return point;
};

/**
 * @param{Node}     node
 * @param{Number}   distance
 * @param{BinaryHeap} bestNodes
 * @param{Number}   maxNodes
 */
KDTree.saveNode = function saveNode (node, distance, bestNodes, maxNodes) {
  bestNodes.push([node, distance]);
  if (bestNodes.size() > maxNodes) {
    bestNodes.pop();
  }
};

/**
 * @param{Node}     node
 * @param{*}        point
 * @param{BinaryHeap} bestNodes
 * @param{Number}   maxNodes
 */
KDTree.prototype.nearestSearch = function nearestSearch (node, point, bestNodes, maxNodes) {
  var bestChild;
  var dimensions = this.dimensions;
  var dimension  = dimensions[node.dimension];
  var ownDistance= this.metric(point, node.data);
  var linearPoint= [];
  var otherChild, i, d;

  for (var i$1 = 0, len = dimensions.length; i$1 < len; i$1++) {
    d = dimensions[i$1];
    if (i$1 === node.dimension) { linearPoint[d] = point[d]; }
    else                    { linearPoint[d] = node.data[d]; }
  }

  var linearDistance = this.metric(linearPoint, node.data);

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
    if (bestChild === node.left) { otherChild = node.right; }
    else                       { otherChild = node.left; }

    if (otherChild !== null) {
      this.nearestSearch(otherChild, point, bestNodes, maxNodes);
    }
  }
};

/**
 * @param{*} point
 * @param{Number} maxNodes
 * @param{Number}
 * @return {Array.<*>} [data, distance]
 */
KDTree.prototype.nearest = function nearest (point, maxNodes, maxDistance) {
    if ( maxNodes === void 0 ) maxNodes = 1;
    if ( maxDistance === void 0 ) maxDistance = 0;

  var bestNodes = new BinaryHeap(function (e) { return -e[1]; });

  if (maxDistance) {
    for (var i = 0; i < maxNodes; i++) { bestNodes.push([null, maxDistance]); }
  }

  if (this.root) { this.nearestSearch(this.root, point, bestNodes, maxNodes); }

  var result = [], content = bestNodes.content;

  for (var i$1 = 0, len = Math.min(maxNodes, content.length); i$1 < len; i$1++) {
    if (content[i$1][0]) { result.push([content[i$1][0].data, content[i$1][1]]); }
  }
  return result;
};

/**
 * @return {Number}
 */
KDTree.prototype.balanceFactor = function balanceFactor () {
  function height(node) {
    if (node === null) { return 0; }
    return Math.max(height(node.left), height(node.right)) + 1;
  }

  function count(node) {
    if (node === null) { return 0; }
    return count(node.left) + count(node.right) + 1;
  }

  return height(this.root) / (Math.log(count(this.root)) / Math.log(2));
};

return KDTree;

})));
//# sourceMappingURL=kdtree.js.map
