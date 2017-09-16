/**
 * Binary heap implementation from:
 * http://eloquentjavascript.net/appendix2.html
 */
export default class BinaryHeap {

  /**
   * @constructor
   * @param  {Function} scoreFunction
   */
  constructor(scoreFunction) {

    /**
     * @type {Array}
     */
    this.content = [];

    /**
     * @type {Function}
     */
    this.scoreFunction = scoreFunction;
  }

  /**
   * @param  {*} element
   */
  push(element) {
    // Add the new element to the end of the array.
    this.content.push(element);
    // Allow it to bubble up.
    this.bubbleUp(this.content.length - 1);
  }

  /**
   * @return {*}
   */
  pop() {
    let content = this.content;
    // Store the first element so we can return it later.
    let result = content[0];
    // Get the element at the end of the array.
    let end = content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it sink down.
    if (content.length > 0) {
      content[0] = end;
      this.sinkDown(0);
    }
    return result;
  }

  /**
   * Non-destructive
   * @return {*}
   */
  peek() {
    return this.content[0];
  }

  /**
   * @param  {*} node
   */
  remove(node) {
    const len = this.content.length;
    const scoreFunction = this.scoreFunction;
    const content = this.content;

    // To remove a value, we must search through the array to find it.
    for (let i = 0; i < len; i++) {
      if (content[i] === node) {
        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        let end = content.pop();
        if (i !== len - 1) {
          content[i] = end;
          if (scoreFunction(end) < scoreFunction(node)) {
            this.bubbleUp(i);
          } else {
            this.sinkDown(i);
          }
        }
        return;
      }
    }
    throw new Error("Node not found.");
  }

  /**
   * @return {Number}
   */
  size() {
    return this.content.length;
  }

  /**
   * @param  {Number} n
   */
  bubbleUp(n) {
    const content = this.content;
    const scoreFunction = this.scoreFunction;
    // Fetch the element that has to be moved.
    let element = content[n];


    // When at 0, an element can not go up any further.
    while (n > 0) {
      // Compute the parent element's index, and fetch it.
      let parentN = Math.floor((n + 1) / 2) - 1;
      let parent = content[parentN];

      // Swap the elements if the parent is greater.
      if (scoreFunction(element) < scoreFunction(parent)) {
        content[parentN] = element;
        content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to move it further.
      else break;
    }
  }

  /**
   * @param  {Number} n
   */
  sinkDown(n) {
    const content = this.content;
    const scoreFunction = this.scoreFunction;
    const length = content.length;

    // Look up the target element and its score.
    let element = content[n];
    let elemScore = scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      let child2N = (n + 1) * 2;
      let child1N = child2N - 1;
      // This is used to store the new position of the element,
      // if any.
      let swap = null;

      let child1Score, child2Score;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        child1Score = scoreFunction(content[child1N]);
        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) swap = child1N;
      }

      // Do the same checks for the other child.
      if (child2N < length) {
        child2Score = scoreFunction(this.content[child2N]);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap) {
        content[n] = content[swap];
        content[swap] = element;
        n = swap;
      } else break; // Otherwise, we are done.
    }
  }
}
