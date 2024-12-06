import {ObjectId} from "mongodb"

let is_str = (str, arg) => {
    if (typeof str === 'string') {
      let trim_str = str.trim()
      if (!trim_str) {
        if (str.length > 0) {
          throw `error (${arg} parameter is a string with just spaces)`
        }
        else {
          throw `error (${arg} parameter is an empty string)`
        }
      }
    }
    else {
      throw `error (${arg} parameter isn't a string)`
    }
}
let is_number = (num, arg) => {
    if (typeof num !== 'number' || isNaN(num)) {
      throw `error (${arg} parameter is not a number)`
    }
}
let is_arr = (arr, arg) => {
    if (!Array.isArray(arr)) {
      throw `error (${arg} parameter is not an array)`
    }
    if (arr.length == 0) {
      throw `error (${arg} parameter is an empty array)`
    }
}
let is_obj_id = (id, arg) => {
    id = id.trim()
    if (!ObjectId.isValid(id)) {
      throw `error (${arg} parameter is not a valid ObjectId string)`
    }
    return new ObjectId(id)
}
let trim_obj = (obj) => {
    let new_object = {}
    for (let key in obj) {
      new_object[key.trim()] = obj[key].trim()
    }
    return new_object
}
let exists = (elem, arg) => {
    if (!elem) {
      if (typeof elem === 'undefined'){
        if (arg == "first") {
          throw `error (no input provided)`
        }
        else {
          throw `error (no input provided for the ${arg} parameter)`
        }
      }
  }
}

let str_format = (str) => {
    str = str.split(' ')
    str = str.map(word => { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()})
    str = str.join(' ');
    return str
}

let is_email = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!regex.test(email)) {
        throw 'please provide a valid email'
    }
}

let trim_arr = (arr) => {
    for (let i = 0; i < arr.length; i++) {
        is_str(arr[i], "element in organizations list") 
        is_obj_id(arr[i], "element in organizations list")
        arr[i] = arr[i].trim()
    }
}


export {is_str, is_number, is_arr, is_obj_id, exists, trim_obj, str_format, is_email, trim_arr}