const button = document.getElementById('orgSubmit');
button.addEventListener('click', function(event) {
    event.preventDefault()
    const text = document.getElementById("org_search_term")
    let stuff = text.value
    stuff = stuff.trim()
    const delete_item = document.querySelector('h2');
    if (delete_item) {
        delete_item.remove()
    }
    if (!stuff) {
        const h1 = document.querySelector('h1');
        const new_item = document.createElement('h2')
        new_item.textContent = `Must Provide an input`
        h1.insertAdjacentElement('afterend', new_item);
        text.value = ""
    }
    else {
        text.value = ""

        let list = document.getElementById('searchResult')
        list.innerHTML = `<a href="/organization/${stuff}">${stuff}</a>`;

        list.removeAttribute('hidden');
    }
});