module.exports = {
	"env": {
		"browser": true,
		"commonjs": true,
		"es6": true
	},
	"extends": "airbnb-base",
	"globals": {
		"Atomics": "readonly",
		"SharedArrayBuffer": "readonly"
	},
	"parserOptions": {
		"ecmaVersion": 2018
	},
	"rules": {
		"prefer-const": ["error", {
			"destructuring": "all",
			"ignoreReadBeforeAssign": false
		}],
		"consistent-return": 0,
		"no-use-before-define": 0,
		"max-len": 0,
		"no-cond-assign": 0,
		"no-inner-declarations": 0,
		"no-plusplus": 0,
		"no-unreachable": 0,
	}
};
