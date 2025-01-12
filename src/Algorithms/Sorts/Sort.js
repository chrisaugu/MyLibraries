export function sortPricesLowestUp(list) {
  var list2 = [];
  var list3 = [];
  list.each(function (value) {
    list3.push(value);
  });
  while (list.length > 0) {
    var greatestindex = 0;
    var greatestvalue = list[greatestindex];
    list.each(function (value, count) {
      if (value.prices.price > greatestvalue.prices.price) {
        greatestvalue = value;
        greatestindex = count;
      }
    });
    list2.push(greatestvalue);
    list.splice(greatestindex, 1);
  }
  var list4 = list;
  list = [];
  for (var i = list2.length - 1; i >= 0; i--) {
    list.push(list2[i]);
  }
  list3.each(function (value) {
    list4.push(value);
  });
  return list;
}

Array.prototype.sortAsc = function (callback) {
  var list = this;
  var list2 = [];
  var list3 = [];
  list.each(function (value) {
    list3.push(value);
  });
  while (list.length > 0) {
    var greatestindex = 0;
    var greatestvalue = list[greatestindex];
    list.each(function (value, count) {
      if (value > greatestvalue) {
        greatestvalue = value;
        greatestindex = count;
      }
    });
    list2.push(greatestvalue);
    list.splice(greatestindex, 1);
  }
  list = [];
  for (var i = list2.length - 1; i >= 0; i--) {
    list.push(list2[i]);
  }
  var list4 = this;
  list3.each(function (value) {
    list4.push(value);
  });
  return list;
};

Array.prototype.sortDesc = function () {
  var list = this;
  var list2 = [];
  var list = [];
  // clone the original list
  list.each(function (value) {
    list3.push(value);
  });
  while (list.length > 0) {
    var greatestindex = 0;
    var greatestvalue = list[greatestindex];
    // iterate thru the list while it's still has items
    list.each(function (value, count) {
      if (value > greatestvalue) {
        greatestvalue = value;
        greatestindex = count;
      }
    });
    list2.push(greatestvalue);
    // remove the each items on the origianl to reorder it
    list.splice(greatestindex, 1);
  }
  list = [];
  for (var i = 0; i < list2.length; i++) {
    list.push(list2[i]);
  }
  var list4 = this;
  list3.each(function (value) {
    list4.push(value);
  });
  return list;
};

function CArray(numElements) {
  this.dataStore = [];
  this.pos = 0;
  this.numElements = numElements;
  this.insert = insert;
  this.toString = toString;
  this.clear = clear;
  this.setData = setData;
  this.swap = swap;
  this.bubbleSort = bubbleSort;

  for (var i = 0; i < numElements; ++i) {
    this.dataStore[i] = i;
  }
}

function setData() {
  for (var i = 0; i < this.numElements; ++i) {
    this.dataStore[i] = Math.floor(Math.random() * (this.numElements + 1));
  }
}

function clear() {
  for (var i = 0; i < this.dataStore.length; ++i) {
    this.dataStore[i] = 0;
  }
}

function insert(element) {
  this.dataStore[i] = element;
}

function toString() {
  var retstr = "";
  for (var i = 0; i < this.dataStore.length; ++i) {
    retstr += this.dataStore[i] + " ";
    if (i > 0 && i % 10 == 0) {
      retstr += "\n";
    }
  }
  return retstr;
}

function swap(arr, index1, index2) {
  var temp = arr[index1];
  arr[index1] = arr[index2];
  arr[index2] = temp;
}

function bubbleSort() {
  var numElements = this.dataStore.length;
  var temp;
  for (var outer = numElements; outer >= 2; --outer) {
    for (var inner = 0; inner <= outer - 1; ++inner) {
      if (this.dataStore[inner] > this.dataStore[inner + 1]) {
        swap(this.dataStore, inner, inner + 1);
      }
    }
    // console.log(this.toString());
  }
}

export { CArray };
