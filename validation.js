import {ObjectId} from "mongodb"

let is_str = (str, arg) => {
    if (typeof str === 'string') {
      let trim_str = str.trim()
      if (!trim_str) {
        if (str.length > 0) {
          throw `${arg} is a string with just spaces`
        }
        else {
          throw `${arg} is an empty string`
        }
      }
    }
    else {
      throw `${arg} isn't a string`
    }
}
let is_number = (num, arg) => {
    if (typeof num !== 'number' || isNaN(num)) {
      throw `${arg} is not a number`
    }
}
let is_arr = (arr, arg) => {
    if (!Array.isArray(arr)) {
      throw `${arg} is not an array`
    }
    if (arr.length == 0) {
      throw `${arg} is an empty array`
    }
}
let is_obj_id = (id, arg) => {
    id = id.trim()
    if (!ObjectId.isValid(id)) {
      throw `${arg} is not a valid ObjectId string`
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
          throw `no input provided`
        }
        else {
          throw `${arg} not provided`
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
let is_password = (password, arg) => {
  password = password.trim()
  let upper = true
  let number = true
  let special = true
  if (password.length < 8) {
      throw `${arg} is shorter than 8 characters`
  }
  if (password.split(' ').length > 1) {
      throw `${arg} contains a space`
  }
  for (let char of password) {
      if (!isNaN(char)) {
          number = false
      }
      else if (char.charCodeAt(0) > 65 && char.charCodeAt(0) < 90) {
          upper = false
      }
      else if (char.charCodeAt(0) < 97 || char.charCodeAt(0) > 122) {
          special = false
      }
  }
  if (upper || number || special) {
      throw `${arg} must contain an uppercase letter, a number, and a special character`
  }
}


export {is_str, is_number, is_arr, is_obj_id, exists, trim_obj, str_format, is_email, trim_arr, is_password}