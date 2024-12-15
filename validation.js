import { ObjectId } from "mongodb";
import date from "date-and-time";
import xss from "xss";

let is_str = (str, arg) => {
    if (typeof str === "string") {
        let trim_str = str.trim();
        if (!trim_str) {
            if (str.length > 0) {
                throw `${arg} is a string with just spaces`;
            } else {
                throw `${arg} is an empty string`;
            }
        }
    } else {
        throw `${arg} isn't a string`;
    }
};
let is_number = (num, arg) => {
    if (typeof num !== "number" || isNaN(num)) {
        throw `${arg} is not a number`;
    }
};
let is_arr = (arr, arg) => {
    if (!Array.isArray(arr)) {
        throw `${arg} is not an array`;
    }
    if (arr.length == 0) {
        throw `${arg} is an empty array`;
    }
};
let is_obj_id = (id, arg) => {
    id = id.trim();
    if (!ObjectId.isValid(id)) {
        throw `${arg} is not a valid ObjectId string`;
    }
    return new ObjectId(id);
};
let trim_obj = (obj) => {
    let new_object = {};
    for (let key in obj) {
        new_object[key.trim()] = obj[key].trim();
    }
    return new_object;
};
let exists = (elem, arg) => {
    if (!elem) {
        if (typeof elem === "undefined") {
            if (arg == "first") {
                throw `no input provided`;
            } else {
                throw `${arg} not provided`;
            }
        }
    }
};

let str_format = (str) => {
    str = str.split(" ");
    str = str.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    str = str.join(" ");
    return str;
};

let is_email = (email) => {
    email = email.trim();
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!regex.test(email)) {
        throw "please provide a valid email";
    }
};

let trim_arr = (arr, arg) => {
    for (let i = 0; i < arr.length; i++) {
        is_str(arr[i], `element in ${arg} list`);
        if (arg != "updateMembers") {
            is_obj_id(arr[i], `element in ${arg} list`);
        }
        arr[i] = arr[i].trim();
    }
    return arr;
};

let is_password = (password, arg) => {
    password = password.trim();
    let upper = true;
    let number = true;
    let special = true;
    if (password.length < 8) {
        throw `${arg} is shorter than 8 characters`;
    }
    if (password.split(" ").length > 1) {
        throw `${arg} contains a space`;
    }
    for (let char of password) {
        if (!isNaN(char)) {
            number = false;
        } else if (char.charCodeAt(0) > 65 && char.charCodeAt(0) < 90) {
            upper = false;
        } else if (char.charCodeAt(0) < 97 || char.charCodeAt(0) > 122) {
            special = false;
        }
    }
    if (upper || number || special) {
        throw `${arg} must contain an uppercase letter, a number, and a special character`;
    }
};

let is_name = (str, arg) => {
    let name = str.trim();
    if (name.length < 2) {
        throw `${arg} is too short`;
    }
    if (name.length > 25) {
        throw `${arg} is too long`;
    }
    for (let char of name) {
        if (char == " ") {
            continue;
        } else if (!isNaN(char)) {
            throw `${arg} contains a number`;
        }
    }
};

let is_user_id = (str) => {
    let name = str.trim();
    if (name.length < 5) {
        throw `${arg} is too short`;
    }
    if (name.length > 25) {
        throw `${arg} is too long`;
    }
    if (name.split(" ").length > 1) {
        throw `${arg} contains a space`;
    }
};
let is_role = (role) => {
    role = role.trim().toLowerCase();
    if (role != "member" && role != "owner" && role != "moderator") {
        throw `Role is not 'member', 'owner', or 'moderator'`;
    }
};

let is_session_role = (role) => {
    role = role.trim().toLowerCase();
    if (role != "observer" && role != "guest" && role != "voter") {
        throw `Role is not 'observer', 'guest', or 'voter'`;
    }
};

// Fix/Get rid of everything above
// Next to do: password

let isNumber = (num, arg) => {
    if (typeof num !== "number" || isNaN(num)) {
        throw `${arg} is not a number`;
    }
};

let isArr = (arr, arg) => {
    if (!Array.isArray(arr)) {
        throw `${arg} is not an array`;
    }
    if (arr.length == 0) {
        throw `${arg} is an empty array`;
    }

    return trimArr(arr, arg);
};

//Not used anywhere
let trimObj = (obj) => {
    let new_object = {};
    for (let key in obj) {
        new_object[key.trim()] = obj[key].trim();
    }
    return new_object;
};

//Not used anywhere
let strFormat = (str) => {
    str = str.split(" ");
    str = str.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    str = str.join(" ");
    return str;
};

let checkEmail = (email) => {
    email = checkString(email, "Email").toLowerCase();
    const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    if (!regex.test(email)) {
        throw "please provide a valid email";
    }

    return email;
};

let trimArr = (arr, arg) => {
    isArr(arr, arg);
    for (let i = 0; i < arr.length; i++) {
        if (arg != "updateMembers") {
            arr[i] = checkString(arr[i], `element in ${arg} list`);
        } else {
            arr[i] = checkId(arr[i], `element in ${arg} list`);
        }
    }
    return arr;
};

let checkPassword = (password, arg) => {
    if (!password) throw `${arg} must be provided`;
    if (typeof password !== "string") throw `${arg} must be of type string`;

    //Password max length?
    if (password.length < 8 || /^[0-9] | ^[A-Z] | [0-9a-zA-Z]+/.test(password)) throw `${arg} must be 8+ characters and contain an uppercase letter, a number, and a special character`;

    return password;
};

let checkName = (str, arg) => {
    str = str.trim();
    if (str.length < 2) {
        throw `${arg} must be at least 2 characters`;
    }
    if (str.length > 25) {
        throw `${arg} may not be longer than 25 characters`;
    }

    if (str.includes("  ")) throw ``;
    if (!str.test(/[a-zA-Z ]/)) throw `${arg} must only contain letters`;
    return str;
};

let checkUserName = (str) => {
    str = checkString(str, "Username");
    if (str.length < 5) {
        throw `Username must be at least 5 characters`;
    }
    if (str.length > 25) {
        throw `Username may not be longer than 25 characters`;
    }
    if (str.includes(" ")) {
        throw `Username must not contain a space`;
    }
    return str;
};

let checkOrgRole = (role) => {
    role = checkString(role, "Org Role").toLowerCase();
    if (role !== "member" && role !== "owner" && role !== "moderator") {
        throw `Role must be 'member', 'owner', or 'moderator'`;
    }
    return role;
};

let checkSessionRole = (role) => {
    role = checkString(role, "Session Role").toLowerCase();
    if (role != "observer" && role != "guest" && role != "voter") {
        throw `Role must be 'observer', 'guest', or 'voter'`;
    }
    return role;
};

let checkId = (id) => {
    id = checkString(id, "id");
    if (!ObjectId.isValid(id)) throw "Invalid Object ID";

    return new ObjectId(id);
};

let checkString = (str, arg) => {
    if (!str) throw `${arg} must be provided`;
    if (typeof str !== "string") throw `${arg} must be of type string`;
    str = xss(str);
    str = str.trim();

    if (str.length === 0) throw `${arg} must not be all whitespace`;

    return str;
};

let checkDate = (dateStr) => {
    dateStr = checkString(dateStr, "Date");

    if (!date.isValid(dateStr, "MM/DD/YYYY")) throw "Date is not valid";
    return date;
};

let isObj = (obj) => {
    if (!obj) throw `Object must be provided`;
    if (typeof obj !== "object") throw `variable must be of type object`;

    return trimObj(obj);
};

/*
let validation = {
    is_str: is_str,
    is_number: is_number,
    is_arr: is_arr,
    is_obj_id: is_obj_id,
    exists: exists,
    trim_obj: trim_obj,
    str_format: str_format,
    is_email: is_email,
    trim_arr: trim_arr,
    is_password: is_password,
    checkId: checkId,
    checkString: checkString,
    checkDate: checkDate,
    is_name: is_name,
    is_user_id: is_user_id,
    is_role: is_role,
    is_session_role: is_session_role,
}; */

let is_action_type = (type) => {
  type = checkString(type)
  if (type != 'motion' && type != 'amendment') {
    throw `Type is not 'motion' or 'amendment'`
  }
}

let validation = {
    isNumber: isNumber,
    isArr: isArr,
    trimObj: trimObj,
    strFormat: strFormat,
    checkEmail: checkEmail,
    trimArr: trimArr,
    checkPassword: checkPassword,
    checkName: checkName,
    checkUserName: checkUserName,
    checkSessionRole: checkSessionRole,
    checkOrgRole: checkOrgRole,
    checkId: checkId,
    checkString: checkString,
    checkDate: checkDate,
    isObj: isObj,
};
export default validation;
