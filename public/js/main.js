(function ($) {

let is_role = (role) => {
    role = role.trim().toLowerCase()
    if (role != 'member' && role != 'owner' && role != 'moderator') {
      throw `Role is not 'member', 'owner', or 'moderator'`
    }
  }

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

//error check in these event listeners? even if it is just buttons pressed and no user inputs? account for html changes?
document.addEventListener('click', function(event) {
    //for clicking on the name:role of an organization member
    if (event.target.tagName.toLowerCase() === 'a' && event.target.id != 'home' && event.target.id != 'leave' && event.target.id != 'delete' && event.target.id != "back_to_signin") {
        event.preventDefault()
        const delete_item = document.querySelector('h4');
        if (delete_item) {
            delete_item.remove()
        }
        let form = document.getElementById('update_form');
        let form2 = document.getElementById('switch_form');
        let form3 = document.getElementById('kickout_user');
        let form4 = document.getElementById('switch_owner_form')
        let form5 = document.getElementById('delete_org_form')
        form5.hidden = true;
        let title = document.getElementById('members_title')
        let name = event.target.getAttribute('data-name');
        let role = event.target.getAttribute('data-role');
        try{
        exists(role, "data-role")
        is_str(role, "data-role")
        is_role(role)
        exists(name, "data-name")
        is_str(name, "data-name")
        is_user_id(name)
        name = name.trim().toLowerCase()
        role = role.trim().toLowerCase()
        form.setAttribute("data-name", name);
        form.setAttribute("data-role", role);
        form.removeAttribute('hidden');
        form2.hidden = true;
        form3.hidden = true;
        form4.hidden = true;
    }catch (e) {
        const new_item = document.createElement('h4')
        new_item.textContent = e
        title.insertAdjacentElement('afterend', new_item);
    }
    }
    else if (event.target.tagName.toLowerCase() === 'a' && event.target.id == 'delete') {
        event.preventDefault()
        let form = document.getElementById('delete_org_form')
        form.removeAttribute('hidden');
    }
    });

button = document.getElementById('switch_role')
//choose to switch role of a user
if (button) {
    button.addEventListener('click', function(event) {
        event.preventDefault()
        const delete_item = document.querySelector('h4');
        if (delete_item) {
            delete_item.remove()
        }
        let form = document.getElementById('update_form');
        let form2 = document.getElementById('switch_form');
        let form3 = document.getElementById('kickout_user');
        let form4 = document.getElementById('switch_owner_form')
        let form5 = document.getElementById('delete_org_form')
        form5.hidden = true;
        let title = document.getElementById('members_title')
        let name = form.getAttribute('data-name');
        let role = form.getAttribute('data-role');
        try{
        exists(role, "data-role")
        is_str(role, "data-role")
        is_role(role)
        exists(name, "data-name")
        is_str(name, "data-name")
        is_user_id(name)
        name = name.trim().toLowerCase()
        role = role.trim().toLowerCase()
        form2.setAttribute("data-name", name);
        form2.setAttribute("data-role", role);
        form.hidden = true;
        form3.hidden = true;
        form2.removeAttribute('hidden');
        form4.hidden = true;
    }catch (e) {
        const new_item = document.createElement('h4')
        new_item.textContent = e
        title.insertAdjacentElement('afterend', new_item);
    }

    })
}
button2 = document.getElementById('kick_out')
//choose to kick out a user
if (button2) {
    button2.addEventListener('click', function(event) {
        event.preventDefault()
        const delete_item = document.querySelector('h4');
        if (delete_item) {
            delete_item.remove()
        }
        let form = document.getElementById('update_form');
        let form2 = document.getElementById('switch_form');
        let form3 = document.getElementById('kickout_user');
        let form4 = document.getElementById('switch_owner_form')
        let form5 = document.getElementById('delete_org_form')
        form5.hidden = true;
        let title = document.getElementById('members_title')
        let name = form.getAttribute('data-name');
        let role = form.getAttribute('data-role');
        try {
        exists(role, "data-role")
        is_str(role, "data-role")
        is_role(role)
        exists(name, "data-name")
        is_str(name, "data-name")
        is_user_id(name)
        name = name.trim().toLowerCase()
        role = role.trim().toLowerCase()
        form3.setAttribute("data-name", name);
        form3.setAttribute("data-role", role);
        form.hidden = true;
        form2.hidden = true;
        form3.removeAttribute('hidden');
        form4.hidden = true;
        }catch (e) {
            const new_item = document.createElement('h4')
            new_item.textContent = e
            title.insertAdjacentElement('afterend', new_item);
        }
    })
}

button3 = document.getElementById('kickout_yes')
//when you confirm that you wanna kickout a user
if (button3) {
    button3.addEventListener('click', function(event) {
        event.preventDefault()
        const delete_item = document.querySelector('h4');
        if (delete_item) {
            delete_item.remove()
        }
        let form = document.getElementById('update_form');
        let form2 = document.getElementById('switch_form');
        let form3 = document.getElementById('kickout_user');
        let form4 = document.getElementById('switch_owner_form')
        let form5 = document.getElementById('delete_org_form')
        form5.hidden = true;
        let title = document.getElementById('members_title')
        let name = form3.getAttribute('data-name');
        let role = form3.getAttribute('data-role');
        try {
        exists(role, "data-role")
        is_str(role, "data-role")
        is_role(role)
        exists(name, "data-name")
        is_str(name, "data-name")
        is_user_id(name)
        name = name.trim().toLowerCase()
        role = role.trim().toLowerCase()
        form.hidden = true;
        form2.hidden = true;
        form3.hidden = true;
        form4.hidden = true;
        let orgName = document.getElementById('orgTitle').innerHTML;
        const data = {
            userName: name
        };
        requestConfig = {
            method: 'PATCH',
            contenttype: 'application/json',
            datatype: "json",
            url: `/leaveorganization/${orgName}`,
            data: data
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            let orgData = responseMessage
            console.log(orgData)
            let ul = document.getElementById("membersList")
            ul.innerHTML = ""
            for (let member of orgData.members) {
                ul.innerHTML += `<li><a href='javascript:void(0)' data-name='${member.userName}' data-role="${member.role}">${member.userName}:${member.role}</a></li>`
            }
        })
    } catch (e) {
        const new_item = document.createElement('h4')
        new_item.textContent = e
        title.insertAdjacentElement('afterend', new_item);
    }
    
    })
}

button4 = document.getElementById('switch_value')
//when you confirm that you wanna kickout a user
if (button4) {
    button4.addEventListener('click', function(event) {
        event.preventDefault()
        const delete_item = document.querySelector('h4');
        if (delete_item) {
            delete_item.remove()
        }
        let form = document.getElementById('update_form');
        let form2 = document.getElementById('switch_form');
        let form3 = document.getElementById('kickout_user');
        let form4 = document.getElementById('switch_owner_form')
        let form5 = document.getElementById('delete_org_form')
        form5.hidden = true;
        let title = document.getElementById('members_title')
        let name = form2.getAttribute('data-name');
        let role = form2.getAttribute('data-role');
        let updateRole = document.getElementById('update_role').value
        try {
        exists(updateRole, "updated role")
        is_str(updateRole, "updated role")
        is_role(updateRole, "updated role")
        exists(role, "data-role")
        is_str(role, "data-role")
        is_role(role)
        exists(name, "data-name")
        is_str(name, "data-name")
        is_user_id(name)
        updateRole.trim().toLowerCase()
        name = name.trim().toLowerCase()
        role = role.trim().toLowerCase()
        form.hidden = true;
        form2.hidden = true;
        form3.hidden = true;
        form4.hidden = true;
        if (updateRole == role) {
            const new_item = document.createElement('h4')
            new_item.textContent = `${name} already has that role`
            title.insertAdjacentElement('afterend', new_item);
        }
        if (updateRole == 'owner') {
            form4.setAttribute("data-name", name);
            form4.setAttribute("data-role", updateRole);
            form4.removeAttribute('hidden')
        }
        else {
        let orgName = document.getElementById('orgTitle').innerHTML;
        const data = {
            userName: name,
            type: "members",
            role: updatedRole
        };
        requestConfig = {
            method: 'PATCH',
            contenttype: 'application/json',
            datatype: "json",
            url: `/organization/${orgName}`,
            data: data
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            let orgData = responseMessage
            let ul = document.getElementById("membersList")
            ul.innerHTML = ""
            for (let member of orgData.members) {
                ul.innerHTML += `<li><a href='javascript:void(0)' data-name='${member.userName}' data-role="${member.role}">${member.userName}:${member.role}</a></li>`
            }
        })
    }
    }
    catch (e) {
        const new_item = document.createElement('h4')
        new_item.textContent = e
        title.insertAdjacentElement('afterend', new_item);
    }
    })
}
button5 = document.getElementById('switch_owner_value')
//when you confirm that you wanna kickout a user
if (button5) {
    button5.addEventListener('click', function(event) {
        event.preventDefault()
        const delete_item = document.querySelector('h4');
        if (delete_item) {
            delete_item.remove()
        }
        let form = document.getElementById('update_form');
        let form2 = document.getElementById('switch_form');
        let form3 = document.getElementById('kickout_user');
        let form4 = document.getElementById('switch_owner_form')
        let form5 = document.getElementById('delete_org_form')
        form5.hidden = true;
        let title = document.getElementById('members_title')
        let name = form4.getAttribute('data-name');
        let role = form4.getAttribute('data-role');
        let updateRole = document.getElementById('update_owner_role').value
        try {
            console.log(name)
            console.log(role)
        exists(updateRole, "updated role")
        is_str(updateRole, "updated role")
        is_role(updateRole, "updated role")
        exists(role, "data-role")
        is_str(role, "data-role")
        is_role(role)
        exists(name, "data-name")
        is_str(name, "data-name")
        is_user_id(name)
        updateRole.trim().toLowerCase()
        name = name.trim().toLowerCase()
        role = role.trim().toLowerCase()
        form.hidden = true;
        form2.hidden = true;
        form3.hidden = true;
        form4.hidden = true;
        if (updateRole == role) {
            const new_item = document.createElement('h4')
            new_item.textContent = `${name} already has that role`
            title.insertAdjacentElement('afterend', new_item);
        }
        if (updateRole == 'owner') {
            const new_item = document.createElement('h4')
            new_item.textContent = `The input cannot be 'owner'`
            title.insertAdjacentElement('afterend', new_item);
            form4.removeAttribute('hidden')
        }
        else {
        let orgName = document.getElementById('orgTitle').innerHTML;
        const data = {
            userName: name,
            type: "members",
            role: role 
        };
        requestConfig = {
            method: 'PATCH',
            contenttype: 'application/json',
            datatype: "json",
            url: `/organization/${orgName}`,
            data: data
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            let orgData = responseMessage
            let ul = document.getElementById("membersList")
            ul.innerHTML = ""
            for (let member of orgData.members) {
                ul.innerHTML += `<li><a href='javascript:void(0)' data-name='${member.userName}' data-role="${member.role}">${member.userName}:${member.role}</a></li>`
            }
        })
        const data_owner = {
            type: "members_owner",
            role: updateRole 
        };
        requestConfig = {
            method: 'PATCH',
            contenttype: 'application/json',
            datatype: "json",
            url: `/organization/${orgName}`,
            data: data_owner
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            let orgData = responseMessage
            let ul = document.getElementById("membersList")
            ul.innerHTML = ""
            for (let member of orgData.members) {
                ul.innerHTML += `<li><a href='javascript:void(0)' data-name='${member.userName}' data-role="${member.role}">${member.userName}:${member.role}</a></li>`
            }
        })
    }
    }
    catch (e) {
        const new_item = document.createElement('h4')
        new_item.textContent = e
        title.insertAdjacentElement('afterend', new_item);
    }
    })
}

})(window.jQuery);