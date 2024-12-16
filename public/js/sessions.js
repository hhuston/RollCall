let strFormat = (str) => {
    str = str.split(" ");
    str = str.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
    str = str.join(" ");
    return str;
};

const yayVote = document.getElementById("yayVote");
const nayVote = document.getElementById("nayVote");
const absVote = document.getElementById("absVote");

if (yayVote) {
    yayVote.addEventListener('click', async (event) => {
        const votingPrompt = document.getElementById('votingPrompt')
        if (votingPrompt.dataset.actionId === "")
            return
        const voteCast = document.getElementById('voteCast');
        const response = await fetch('/session/sendvote', {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                vote: "Yay",
                actionId: votingPrompt.dataset.actionId,
            }),
        });
       
        if (!response) {
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
        if (votingPrompt.dataset.actionId === "")
            return
        const voteCast = document.getElementById('voteCast');
        const response = await fetch('/session/sendvote', {
            method: 'PATCH',
            body: JSON.stringify({
                vote: "Nay",
                actionId: votingPrompt.dataset.actionId,
            }),
        });
        
        if (!response) {
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
        if (votingPrompt.dataset.actionId === "")
            return
        const voteCast = document.getElementById('voteCast');
        const response = await fetch('/session/sendvote', {
            method: 'PATCH',
            body: JSON.stringify({
                vote: "Abstain",
                actionId: votingPrompt.dataset.actionId,
            }),
        });
        
        if (!response) {
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
    if (onCallActionId === "") {
        yayVote.hidden = true;
        nayVote.hidden = true;
        absVote.hidden = true;
    }
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
            `<p>${strFormat(action.type)}: ${action.value}</p>
            <p>Creator: ${action.actionOwner}</p>`
        if (isModerator) {
            li.appendChild(callVote);
            li.appendChild(deleteAction);
        }
        actionQueue.appendChild(li);
    }

    if (data.onCall !== "") {
        const votingPrompt = document.getElementById("votingPrompt");
        let onCall = data.onCall
        if (onCallActionId !== onCall._id) {
            yayVote.hidden = false;
            nayVote.hidden = false;
            absVote.hidden = false;
            document.getElementById('votingPrompt').hidden = false;
        }
        votingPrompt.innerHTML = 
            `<p>${onCall.value}</p>
            <h5>Voting Record</h5>
            <p>Yay: ${onCall.votingRecord.Yay.length} Nay: ${onCall.votingRecord.Nay.length} Abstain: ${onCall.votingRecord.Abstain.length}</p>`;
        onCallActionId = onCall._id;
        votingPrompt.dataset.actionId = onCall._id;
    }

    const sessionLog = document.getElementById("sessionLog");
    sessionLog.innerHTML = "<h3>Session Log</h3>";
    for (let action of data.logged) {
        const li = document.createElement('li');
        li.innerHTML = 
        `<div class="action">
            <p>${strFormat(action.type)}: ${action.value}</p>
            <h5>Voting Record</h5>
            <p>Yay: ${action.votingRecord.Yay.length} Nay: ${action.votingRecord.Nay.length} Abstain: ${action.votingRecord.Abstain.length}</p>
        </div>`
        sessionLog.appendChild(li);
    }
}

refreshActionLogs();
const MINUTE = 60000;
setInterval(refreshActionLogs, 1000);