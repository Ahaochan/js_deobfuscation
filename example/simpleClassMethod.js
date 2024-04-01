// class M {a() {}}
class M {
    a() {}
    "b"() {}
    [c]() {}
    ["d"]() {}
}


var foo = {
    const: function() {},
    var: function() {},
    "default": 1,
    [a]: 2,
    b: 3,
    ["c"]: 4,
    foo: 1,
};