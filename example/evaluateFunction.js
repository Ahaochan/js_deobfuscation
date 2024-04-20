var obj = {
  "i": 0,
  j: 1,
  "k": 2,
  "string1": "hello",
  "string2": "world",
  "eq": function eq(arg1, arg2) {
    return arg1 === arg2;
  },
  "neq": function neq(arg1, arg2) {
    return arg1 !== arg2;
  },
  "add": function add(arg1, arg2) {
    return arg1 + arg2;
  },
  "lt": function lt(arg1, arg2) {
    return arg1 < arg2;
  },
  "call0": function call0(fun) {
    return fun();
  },
  "call1": function call1(fun, arg1) {
    return fun(arg1);
  },
  "call2": function call2(fun, arg1, arg2) {
    return fun(arg1, arg2);
  }
};

function now() {
  return new Date();
}

obj.i++;
obj.j = obj.j + 1;
obj.k = 3;
obj.k;
obj.string1 + obj.string2;
test = some[obj.string1];
obj.eq(1, '1');
obj.eq(obj.string1, obj.string2);
obj.neq(1, '1');
obj.add(1, '1');
obj.add($$$0[0], 1)
obj.lt(1, '1');
obj.call0(now);
obj.call1(now, 1);
obj.call2(now, 1, 2);
