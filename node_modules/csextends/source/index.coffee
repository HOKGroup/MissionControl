module.exports = ->
	if arguments.length is 2
		oldKlass = arguments[0]
		proto = arguments[1]
	else
		oldKlass = @
		proto = arguments[0]
	newKlass = class extends oldKlass
		constructor: ->
			if proto?.hasOwnProperty('constructor')
				proto.constructor.apply(@, arguments)
			else
				super
	if proto?
		for own key,value of proto
			newKlass::[key] = value
	return newKlass