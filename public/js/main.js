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

document.addEventListener('click', function(event) {
    //for clicking on the name:role of an organization member
    if (event.target.tagName.toLowerCase() === 'a' && event.target.id != 'home' && event.target.id != 'leave') {
        event.preventDefault()
        let form = document.getElementById('update_form');
        let form2 = document.getElementById('switch_form');
        let form3 = document.getElementById('kickout_user');
        let name = event.target.getAttribute('data-name');
        let role = event.target.getAttribute('data-role');
        name = name.trim().toLowerCase()
        role = role.trim().toLowerCase()
        form.setAttribute("data-name", name);
        form.setAttribute("data-role", role);
        form.removeAttribute('hidden');
        form2.hidden = true;
        form3.hidden = true;
    }
    });

button = document.getElementById('switch_role')
//choose to switch role of a user
if (button) {
    button.addEventListener('click', function(event) {
        event.preventDefault()
        let form = document.getElementById('update_form');
        let form2 = document.getElementById('switch_form');
        let form3 = document.getElementById('kickout_user');
        let name = form.getAttribute('data-name');
        let role = form.getAttribute('data-role');
        name = name.trim().toLowerCase()
        role = role.trim().toLowerCase()
        form2.setAttribute("data-name", name);
        form2.setAttribute("data-role", role);
        form.hidden = true;
        form3.hidden = true;
        form2.removeAttribute('hidden');

    })
}
button2 = document.getElementById('kick_out')
//choose to kick out a user
if (button2) {
    button2.addEventListener('click', function(event) {
        event.preventDefault()
        let form = document.getElementById('update_form');
        let form2 = document.getElementById('switch_form');
        let form3 = document.getElementById('kickout_user');
        let name = form.getAttribute('data-name');
        let role = form.getAttribute('data-role');
        name = name.trim().toLowerCase()
        role = role.trim().toLowerCase()
        form3.setAttribute("data-name", name);
        form3.setAttribute("data-role", role);
        form.hidden = true;
        form2.hidden = true;
        form3.removeAttribute('hidden');
    })
}

button3 = document.getElementById('kickout_user')
//when you confirm that you wanna kickout a user
if (button3) {
    button3.addEventListener('click', function(event) {
        event.preventDefault()
        let form = document.getElementById('update_form');
        let form2 = document.getElementById('switch_form');
        let form3 = document.getElementById('kickout_user');
        let name = form.getAttribute('data-name');
        let role = form.getAttribute('data-role');
        name = name.trim().toLowerCase()
        role = role.trim().toLowerCase()
        form.hidden = true;
        form2.hidden = true;
        form3.hidden = true;
        let orgName = document.getElementById('orgTitle').innerHTML;
        const data = {
            userName: name
        };
        requestConfig = {
            method: 'PATCH',
            contenttype: 'application/json',
            datatype: "json",
            url: `/leaveorganization/${orgName}`,
            body: JSON.stringify(data)
        };
        $.ajax(requestConfig).then(function (responseMessage) {
            let orgData = responseMessage
            let ul = document.getElementById("membersList")
            ul.innerHTML = ""
            for (let member of orgData.members) {
                ul.innerHTML += `<li><a href='javascript:void(0)' data-name='${member.userName}' data-role="${member.role}">${member.userName}:${member.role}</a></li>`
            }
        })
    })
}
})(window.jQuery);