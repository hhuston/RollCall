// "funcName": {
//     func: funcPointer,
//     tests: [
//         ["Description", expectedOutput || "error", ...args]
//     ]
// }
const testCases = {
    
}

const isObject = (x) => typeof x === 'object' && !isArray(x) && x !== null

const isArray = Array.isArray;

const arrayEqual = (arr1, arr2) => {
    if (!isArray(arr2))
        return false;
    if (arr1.length !== arr2.length) 
        return false;
    for (let i = 0; i < arr1.length; i++) {
        if ((isArray(arr1[i]) ^ isArray(arr2[i])) ||
        (isObject(arr1[i]) ^ isObject(arr2[i])))
        return false;
        else if (isArray(arr1[i]) && isArray(arr2[i])) {
            if (!arrayEqual(arr1[i], arr2[i]))
                return false;
        }
        else if (isObject(arr1[i]) &&  isObject(arr2[i])) {
            if (!objectLiteralEqual(arr1[i], arr2[i]))
                return false;
        }
        else if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
}

const objectLiteralEqual = (obj1, obj2) => {
    if (!isObject(obj2) || obj1.length !== obj2.length)
        return false;
    for (let key in obj1) {
        if ((isArray(obj1[key]) ^ isArray(obj2[key])) ||
            (isObject(obj1[key]) ^ isObject(obj2[key])) ||
            !(key in obj2))
            return false;
            else if (isArray(obj1[key]) && isArray(obj2[key])) {
            if (!arrayEqual(obj1[key], obj2[key]))
                return false;
        }
        else if (isObject(obj1[key]) &&  isObject(obj2[key])) {
            if (!objectLiteralEqual(obj1[key], obj2[key]))
                return false;
        }
        else if (key === "_id") {
            if (typeof(obj2[key]) !== "string")
                return false
        }
        else if (obj1[key] !== obj2[key])
            return false;
    }
    return true;
}

const test = async (func, description, output, ...args) => {
    let str;
    description = "\u001b[35mDescription ~ " + description + "\u001b[0m"
    try {
        let result = await func(...args);
        if ((isArray(output) ^ isArray(result)) ||
        (isObject(output) ^ isObject(result)) ||
        typeof(output) !== typeof(result))
        str = `\t\u001b[31mFailed\u001b[0m - ${description}\n\t\tIncorrect output type\n\t\t\tArgs: ${JSON.stringify(args)}\n\t\t\tExpected: ${JSON.stringify(output)}\n\t\t\tReceived: ${JSON.stringify(result)}\n` ;
        else if ((isArray(output) && arrayEqual(output, result)) || 
        (isObject(output) && objectLiteralEqual(output, result)) || 
        (!isArray(output) && !isObject(output) && result === output))
        str = `\t\u001b[32mPassed\u001b[0m - ${description}`;
        else if (output === "error")
            str = `\t\u001b[31mFailed\u001b[0m - ${description}\n\t\tDid not throw error\n\t\t\tArgs: ${JSON.stringify(args)}`;
        else
            str = `\t\u001b[31mFailed\u001b[0m - ${description}\n\t\tIncorrect output\n\t\t\tArgs: ${JSON.stringify(args)}\n\t\t\tExpected: ${JSON.stringify(output)}\n\t\t\tReceived: ${JSON.stringify(result)}\n` ;
    } catch (error) {
        if (output === "error")
            str = `\t\u001b[32mPassed\u001b[0m - ${description}`;
        else
        str = `\t\u001b[31mFailed\u001b[0m - ${description}\n\t\tUnexpected error thrown\n\t\t\tArgs: ${JSON.stringify(args)}\n\t\t\t${error}`;
}
return str;
}