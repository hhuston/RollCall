
const yayVote = document.getElementById("yayVote");
const nayVote = document.getElementById("nayVote");
const absVote = document.getElementById("absVote");
const createMotion = document.getElementById("createMotion");
const createAmendment = document.getElementById("createAmendment");
const endSession = document.getElementById("endSession");

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
        const votingPrompt = document.getElementById('votingPrompt')
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