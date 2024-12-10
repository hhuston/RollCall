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
          throw `no input provided for ${arg}`
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

let trim_arr = (arr) => {
    for (let i = 0; i < arr.length; i++) {
        is_str(arr[i], "element in organizations list") 
        is_obj_id(arr[i], "element in organizations list")
        arr[i] = arr[i].trim()
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

let is_obj = (obj) => {
    if (typeof obj !== 'object') {
          throw `themePreferences is not an object`
    }
    if (Array.isArray(obj)) {
          throw `themePreferences is an array`
    }
    let key_list = Object.keys(obj)

    if (key_list.length != 2) {
        throw 'themePreferences has missing or additional keys'
    }
    for (let key of key_list) {
        if (key.trim() != 'backgroundColor' && key.trim() != 'fontColor') {
            throw `themePreferences has a key that isn't equal to either backgroundColor or fontColor`
        }
       if (is_color(obj[key], key.trim())) {
            throw `${key.trim()} in themePreferences is not a valid hex color code`
       }
    }
    let new_obj = {
        backgroundColor: obj[key_list[0]].trim(),
        fontColor: obj[key_list[1]].trim()
    }
    let key_1 = standard_format(new_obj.backgroundColor, 'backgroundColor')
    let key_2 = standard_format(new_obj.fontColor, 'fontColor')
    if (key_1 == key_2) {
        throw `backgroundColor and fontColor are the same`
    }
    return new_obj
}

let is_user_id = (str, arg) => {
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

const button = document.getElementById('submitButton');
if (button) {
button.addEventListener('click', function(event) {
    event.preventDefault()
    const delete_item = document.querySelector('h2');
    if (delete_item) {
        delete_item.remove()
    }
    let userName = document.getElementById("userName").value
    let firstName = document.getElementById("firstName").value
    let lastName = document.getElementById("lastName").value
    let password = document.getElementById("password").value
    let confirmPassword = document.getElementById("confirmPassword").value
    let email = document.getElementById("email").value
    try {
        exists(userName, "UserName")
      exists(password, "Password")
      exists(confirmPassword, "Confirm Password")
      exists(firstName, "First Name")
      exists(lastName, "Last Name")
      exists(email, "Email")
      is_str(userName, "UserName")
      is_user_id(userName, "UserName")
      is_str(password, "Password")
      is_str(confirmPassword, "Confirm Password")
      is_str(firstName, "First Name")
      is_str(lastName, "Last Name")
      is_str(email, "Email")
      is_email(email)
      is_name(firstName, "First Name")
      is_name(lastName, "Last Name")
      is_password(password, "Password")
      is_password(confirmPassword, "Confirm Password")
      password = password.trim()
      confirmPassword = confirmPassword.trim()
      if (password != confirmPassword) {
        throw 'passwords must match'
      }
        let form = document.getElementById('signup-form');
        form.submit()
      } catch(e) {
        const h1 = document.querySelector('h1');
        const new_item = document.createElement('h2')
        new_item.textContent = e
        h1.insertAdjacentElement('afterend', new_item);
      }
});

}

let button2 = document.getElementById('submit_button');
if (button2) {
button2.addEventListener('click', function(event) {
    event.preventDefault()
    const delete_item = document.querySelector('h2');
    if (delete_item) {
        delete_item.remove()
    }
    let userName = document.getElementById("user_name").value
    let password = document.getElementById("password").value
    try {
        exists(userName, "UserName")
      exists(password, "Password")
      is_str(userName, "UserName")
      is_str(password, "Password")
      is_user_id(userName, "UserName")
      is_password(password, "Password")
        let form = document.getElementById('signin-form');
        form.submit()
      } catch(e) {
        const h1 = document.querySelector('h1');
        const new_item = document.createElement('h2')
        new_item.textContent = e
        h1.insertAdjacentElement('afterend', new_item);
      }
});
}