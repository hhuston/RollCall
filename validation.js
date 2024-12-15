import { ObjectId } from "mongodb";
import date from "date-and-time";
import xss from "xss";

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

let checkOrgName = (name) => {
    name = checkString(name);
    if (name.length > 255) throw "Org Name is too long";
    return name;
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
    checkOrgName: checkOrgName,
    checkDate: checkDate,
    isObj: isObj,
};
export default validation;
