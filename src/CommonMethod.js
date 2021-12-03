// validate variable is number and return
module.exports.validateNumber = (value) => {
    if (typeof value === 'number' && isFinite(value)) {
      return [value, true];
    }

    if (typeof value === 'string') {
      return [parseInt(value), true];
    }

    return [undefined, false];
}

module.exports.validateString = (value) => {
    if (typeof value === 'string') {
      return [value.trim(), true];
    }

    return [undefined, false];
}

module.exports.validateStringNotEmpty = (value) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      return [value.trim(), true];
    }

    return [undefined, false];
}

module.exports.validateObject = (value) => {
    if (typeof value === 'object') {
      return [value, true];
    }

    return [undefined, false];
}

module.exports.validateArray = (value) => {
    if (Array.isArray(value)) {
      return [value, true];
    }

    return [undefined, false];
}