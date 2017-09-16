export default function selectKth(arr, k, f) {
  if (arr.length <= k) throw new Error('Wrong input');

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
      } else r++; // the value is smaller than the pivot, skip
    }

    // if we stepped up (r++) we need to step one down
    if (arr[r][f] > mid[f]) r--;

    // the r pointer is on the end of the first k elements
    if (k <= r) to = r;
    else        from = r + 1;
  }

  return arr[k];
}
