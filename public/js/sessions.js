const yayVote = document.getElementById("yayVote");
const nayVote = document.getElementById("nayVote");
const absVote = document.getElementById("absVote");

if (yayVote) {
    yayVote.addEventListener('click', async (event) => {
        const votingPrompt = document.getElementById('votingPrompt')
        const voteCast = document.getElementById('voteCast');
        const data = await fetch('/session/sendvote', {
            method: 'PATCH',
            data: JSON.stringify({
                vote: "Yay",
                actionId: votingPrompt.dataset.actionId,
            }),
        });
       
        if (!data) {
            voteCast.innerHTML = 'Failed to cast vote. Please try again.';
            voteCast.hidden = false;
            return;
        }
        yayVote.hidden = true;
        nayVote.hidden = true;
        absVote.hidden = true;

        voteCast.innerHTML = "Successfully cast yay vote";
        voteCast.hidden = false;
    });
}

if (nayVote) {
    nayVote.addEventListener('click', async (event) => {
        const votingPrompt = document.getElementById('votingPrompt');
        const voteCast = document.getElementById('voteCast');
        const data = await fetch('/session/sendvote', {
            method: 'PATCH',
            data: JSON.stringify({
                vote: "Nay",
                actionId: votingPrompt.dataset.actionId,
            }),
        });
        
        if (!data) {
            voteCast.innerHTML = 'Failed to cast vote. Please try again.';
            voteCast.hidden = false;
            return;
        }

        yayVote.hidden = true;
        nayVote.hidden = true;
        absVote.hidden = true;

        voteCast.innerHTML = "Successfully cast nay vote";
        voteCast.hidden = false;
    });
}

if (absVote) {
    absVote.addEventListener('click', async (event) => {
        const votingPrompt = document.getElementById('votingPrompt')
        const voteCast = document.getElementById('voteCast');
        const data = await fetch('/session/sendvote', {
            method: 'PATCH',
            data: JSON.stringify({
                vote: "Abstain",
                actionId: votingPrompt.dataset.actionId,
            }),
        });
        
        if (!data) {
            voteCast.innerHTML = 'Failed to cast vote. Please try again.';
            voteCast.hidden = false;
            return;
        }

        yayVote.hidden = true;
        nayVote.hidden = true;
        absVote.hidden = true;

        voteCast.innerHTML = "Successfully cast abstain vote";
        voteCast.hidden = false;
    });
}

let onCallActionId = "";
const refreshActionLogs = async () => {
    let response = await fetch(`/session/${sessionId}/api/actions`);
    let data = await response.json();

    const actionQueue = document.getElementById('actionQueue');
    actionQueue.innerHTML = "";
    for (let action of data.queue) {
        const li = document.createElement('li');
        const callVote = document.createElement('form');
        callVote.innerHTML = 
            `<form method="PATCH" action="/action/callvote/${action._id}">
                <input type="submit" value="Call Vote">
            </form>`
        callVote.addEventListener("submit", async (event) => {
            event.preventDefault();
            await fetch(`/action/callvote/${action._id}/${onCallActionId}`, {
                method: 'PATCH',
            });
            refreshActionLogs();
        });

        const deleteAction = document.createElement('form');
        deleteAction.innerHTML = 
            `<form method="PATCH" action="/action/delete/${action._id}">
                <input type="submit" value="Delete ${action.type}">
            </form>`
        deleteAction.addEventListener("submit", async (event) => {
            event.preventDefault();
            await fetch(`/action/delete/${action._id}`, {
                method: 'PATCH',
            });
            refreshActionLogs();
        });
        
        li.innerHTML = 
            `<h5>${action.type}</h5>
            <p>${action.value}</p>
            <h5>By</h5>
            <p>${action.actionOwner}</p>`
        if (isModerator) {
            li.appendChild(callVote);
            li.appendChild(deleteAction);
        }
        actionQueue.appendChild(li);
    }

    const votingPrompt = document.getElementById("votingPrompt");
    votingPrompt.innerHTML = `${data.oncall[0].value}`;
    onCallActionId = data.oncall[0]._id.toString();;

    const sessionLog = document.getElementById("sessionLog");
    for (let action of data.logged) {
        const li = document.createElement('li');
        li.innerHTML = 
        `<div class="action">
            <h5>${action.type}</h5>
            <p>${action.value}</p>
            <h5>By</h5>
            <p>${action.actionOwner}</p>
        </div>`
        sessionLog.appendChild(li);
    }
}

refreshActionLogs();
const MINUTE = 60000;
setInterval(refreshActionLogs, MINUTE);