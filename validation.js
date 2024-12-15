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
    email = email.trim()
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!regex.test(email)) {
        throw 'please provide a valid email'
    }
}

let trim_arr = (arr, arg) => {
    for (let i = 0; i < arr.length; i++) {
        is_str(arr[i], `element in ${arg} list`)
        if (arg != "updateMembers") {
          is_obj_id(arr[i], `element in ${arg} list`)
        }
        arr[i] = arr[i].trim()
    }
    return arr
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
let is_name = (str, arg) => {
  let name = str.trim()
  if (name.length < 2) {
      throw `${arg} is too short`
  }
  if (name.length > 25) {
      throw `${arg} is too long`
  }
  for (let char of name) {
    if (char == ' ') {
      continue
  }
  else if (!isNaN(char)) {
      throw `${arg} contains a number`
  }
  }
}

let is_user_id = (str) => {
  let name = str.trim()
  if (name.length < 5) {
    throw `${arg} is too short`
  }
  if (name.length > 25) {
    throw `${arg} is too long`
  }
  if (name.split(' ').length > 1) {
      throw `${arg} contains a space`
  }
}
let is_role = (role) => {
  role = role.trim().toLowerCase()
  if (role != 'member' && role != 'owner' && role != 'moderator') {
    throw `Role is not 'member', 'owner', or 'moderator'`
  }
}

let checkId = (id) => {
    if (!id) throw "Must provide an Id"
    if (typeof id !== "string") throw "id must be a string"
    id = id.trim()

    if (id.length === 0) throw "id must not be an empty string"
    if (!ObjectId.isValid(id)) throw "invalid Object ID"

    return id
}

let checkString = (str) => {
    if (!str) throw "Must provide a string"
    if (typeof str !== "string") throw "Must provide a string"
    str = str.trim()

    // We may decide to get rid of this
    if (str.length === 0) throw "string must not be empty"
    
    return str
}

let checkDate = (date) => {
    date = checkString(date)

    //TODO: Check if its a valid MM/DD/YYYY
    return date
}
let is_session_role = (role) => {
  role = role.trim().toLowerCase()
  if (role != 'observer' && role != 'guest' && role != "voter") {
    throw `Role is not 'observer', 'guest', or 'voter'`
  }
}

let is_vote = (vote) => {
  vote = vote.trim().toLowerCase()
  if (vote != 'yay' && vote != 'nay' && vote != 'abstain') {
    throw `Vote is not 'yay', 'nay', or 'abstain'`
  }
}

let validation = {
  is_str: is_str, 
  is_number: is_number, 
  is_arr: is_arr, 
  is_obj_id: is_obj_id, 
  exists:exists, 
  trim_obj:trim_obj, 
  str_format:str_format, 
  is_email:is_email, 
  trim_arr:trim_arr, 
  is_password:is_password, 
  checkId:checkId, 
  checkString:checkString, 
  checkDate:checkDate,
  is_name:is_name,
  is_user_id:is_user_id,
  is_role:is_role,
  is_session_role:is_session_role,
  is_vote:is_vote
}
export default validation