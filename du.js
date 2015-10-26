/**
 * D3 utilities
 *
 * Copyright Robert Monfera
 */

function constant(value) {
    return function() {
        return value
    }
}

function identity(x) {
    return x
}

function compose(fun1, fun2) {
    if(arguments.length === 2) {
        return function (/*args*/) {
            return fun1(fun2.apply(null, arguments))
        }
    } else {
        var functions = Array.prototype.slice.call(arguments)
        var len = functions.length
        return function(/*args*/) {
            var value = (functions[len - 1]).apply(null, arguments)
            var i
            for(i = Math.max(0, len - 2); i >= 0; i--) {
                value = (functions[i]).call(null, value)
            }
            return value
        }
    }
}

function property(key) {
    return function(thing) {
        return thing[key]
    }
}

function key(obj) {
    return obj.key
}

function value(obj) {
    return obj.value
}

function window2(a) {
    return a.map(function(value, index, array) {
        return [value, array[index + 1]]
    }).slice(0, a.length - 1)
}

function tuple(/*args*/) {
    var functions = Array.prototype.slice.call(arguments)
    return function (x) {
        return functions.map(function (elem, i, funs) {
            return funs[i](x)
        })
    }
}

function bind0(rootSelection, cssClass, element, dataFlow) {
    cssClass = cssClass || 'boundingBox'
    element = element || 'g'
    dataFlow = typeof dataFlow === 'function' ? dataFlow : (dataFlow === void(0) ? du.repeat : constant(dataFlow))
    var classesToClassAttr = function (classNames) {
            return classNames.join(' ')
        },
        classesToCssSelector = function (classNames) {
            return (['']).concat(classNames).join(' .')
        },
        cssClasses = classesToCssSelector([cssClass]),
        binding = rootSelection.selectAll(cssClasses).data(dataFlow, key)

    binding.entered = binding.enter().append(element)
    binding.entered.attr('class', classesToClassAttr([cssClass]))

    return binding
}

function bind(object, key) {
    var result = bind0.apply(null, arguments)
    object[key] = result
    return result
}

function translate(funX, funY) {
    return function (d, i) {
        return 'translate(' + (typeof funX === 'function' ? funX(d, i) : funX) + ',' + (typeof funY === 'function' ? funY(d, i) : funY) + ')';
    }
}

function translateX(funX) {
    return function (d, i) {
        return 'translate(' + (typeof funX === 'function' ? funX(d, i) : funX) + ', 0)'
    }
}

function translateY(funY) {
    return function (d, i) {
        return 'translate(0, ' + (typeof funY === 'function' ? funY(d, i) : funY) + ')'
    }
}

var du = {

    repeat: tuple(identity),
    descend: identity,
    bind: bind
}