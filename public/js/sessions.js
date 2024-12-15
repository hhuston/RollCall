import { json } from "express";

const yayVote = document.getElementById('yayVote');
const nayVote = document.getElementById('nayVote');
const absVote = document.getElementById('absVote');
const createMotion = document.getElementById('createMotion');
const createAmendment = document.getElementById('createAmendment');
const endSession = document.getElementById('endSession');

if (yayVote) {
    yayVote.addEventListener('click', async (event) => {
        const votingOptions = document.getElementById('votingOptions');
        const voteCast = document.getElementById('voteCast');
        const data = await fetch('Action vote route', {
            method: 'PATCH',
            data: JSON.stringify({
                vote: 'Yay'
            })
        });
        
        // Check if the response is successful

        yayVote.hidden = true;
        nayVote.hidden = true;
        absVote.hidden = true;

        voteCast.innerHTML = 'Successfully cast yay vote';
        voteCast.hidden = false;
    });
}

if (nayVote) {
    nayVote.addEventListener('click', async (event) => {
        const votingOptions = document.getElementById('votingOptions');
        const voteCast = document.getElementById('voteCast');
        const data = await fetch('Action vote route', {
            method: 'PATCH',
            data: JSON.stringify({
                vote: 'Nay'
            })
        });
        
        // Check if the response is successful

        yayVote.hidden = true;
        nayVote.hidden = true;
        absVote.hidden = true;

        voteCast.innerHTML = 'Successfully cast nay vote';
        voteCast.hidden = false;
    });
}

if (absVote) {
    absVote.addEventListener('click', async (event) => {
        const votingOptions = document.getElementById('votingOptions');
        const voteCast = document.getElementById('voteCast');
        const data = await fetch('Action vote route', {
            method: 'PATCH',
            data: JSON.stringify({
                vote: 'Abstain'
            })
        });
        
        // Check if the response is successful

        yayVote.hidden = true;
        nayVote.hidden = true;
        absVote.hidden = true;

        voteCast.innerHTML = 'Successfully cast abstain vote';
        voteCast.hidden = false;
    });
}

if (createMotion) {
    createMotion.addEventListener('click', async (event) => {
        
    });
}

if (createAmendment) {
    createAmendment.addEventListener('click', async (event) => {

    });
}

if (endSession) {
    endSession.addEventListener('click', async (event) => {

    });
}