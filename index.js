let toolboxColors = document.querySelectorAll('.color');
let addBtn = document.querySelector('.add-btn');
let removeBtn = document.querySelector('.remove-btn');

let modalContainer = document.querySelector('.modal-container');
let allPriorityColors = document.querySelectorAll('.priority-color');
let textAreaContainer = document.querySelector('.textArea-container');

let mainContainer = document.querySelector('.main-container');
//nothing for ticket because we are using innerHTML to tickets

let addTaskFlag = false;
let removeTaskFlag = false;//delete mode
let modalPriorityColor = 'tomato';//selected by default
let lockIconClass = 'fa-lock';
let unlockIconClass = 'fa-lock-open';
let colors = ['tomato', 'dodgerblue', 'green', 'black'];//for changing ticket color on a click
let ticketArray = [];

addBtn.addEventListener('click', (event) => {
    addTaskFlag = !addTaskFlag;//toggle flag

    if (addTaskFlag) {
        //show modal to create a new task
        modalContainer.style.display = 'flex';
        //blur background when modal is present
        mainContainer.style = "filter:blur(10px);";
        // Focus the textarea to capture key events
        textAreaContainer.focus();
    } else {
        //hide modal
        modalContainer.style.display = 'none';
        //set blur to 0 i.e. revert background to as it was
        mainContainer.style = "filter:blur(0px);"
    }
})

//on modal, there are priority colors. Add event listeners on all priority colors
allPriorityColors.forEach(color => {
    //when a color is clicked, it should be set active
    color.addEventListener('click', event => {
        //first remove active class from all divs
        allPriorityColors.forEach(priorityColor => {
            priorityColor.classList.remove('active');
        })

        //then add active class on div that is clicked
        color.classList.add('active');
        //set selected color in a variable modalPriorityColor. Will be used while ticket creation
        modalPriorityColor = color.classList[0];
        textAreaContainer.focus();
    })

})

//ticket creation if 'Control' key is pressed
modalContainer.addEventListener('keyup', event => {
    let keyPressed = event.key;
    // console.log(keyPressed);
    if (keyPressed === 'Control') {
        let ticketDesc = textAreaContainer.value;
        createTicket(modalPriorityColor, ticketDesc);

        // Once ticket is created, reset background from blur to normal and close modal
        mainContainer.style = "filter:blur(0px);";
        modalContainer.style.display = 'none';
        addTaskFlag = !addTaskFlag;
        //clear textarea
        textAreaContainer.value = '';
    }
})

function createTicket (ticketColor, ticketDesc, ticketId) {
    let id = ticketId || shortid();

    //create new element i.e. ticket container and add ticket's HTML using innerHTML
    let ticketCont = document.createElement('div');
    ticketCont.classList.add('ticket-container');
    ticketCont.innerHTML = `<div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">${id}</div>
    <div class="task-area">${ticketDesc}</div>
    <div class="ticket-lock"><i class="fa-solid fa-lock"></i></div>`;

    mainContainer.appendChild(ticketCont);//insert new ticket into main container
    //store new tickets metadata into an object and push this object into ticketArray
    let ticketMetadata = {
        ticketColor,
        ticketId: id,
        ticketDesc
    }
    // if freshly created ticket, then only push to ticketArray
    // otherwise, dont push (case of ticket recreation) i.e. ticketId aleady exists
    if (!ticketId) {
        ticketArray.push(ticketMetadata);
        localStorage.setItem('tickets', JSON.stringify(ticketArray));//to get tickets across diff sessions
    }
    
    //when a new ticket is created, then and then only add event handlers for remove, lock and ticket color click
    handleRemove(ticketCont)
    handleLock(ticketCont)
    handleColor(ticketCont)
}

// remove tasks logic
removeBtn.addEventListener('click', (event) => {
    removeTaskFlag = !removeTaskFlag;

    //tilt-shake animation to all tickets
    let tickets = document.querySelectorAll(".ticket-container");
    tickets.forEach(ticket => {
        ticket.classList.toggle("tilt-shake");
    })

    if (removeTaskFlag) {
        // show alert
        alert("DELETE MODE ACTIVATED");
        // change icon color to red
        removeBtn.style.color = 'red';
    } else {
        // change icon color to white
        removeBtn.style.color = 'white';
    }
})

function handleRemove(ticket) {
    ticket.addEventListener('click', event => {
        //if 'delete mode activated', then remove ticket from array, localStorage and DOM
        if (removeTaskFlag) {
            let ticketId = ticket.children[1].innerText;//this is id of the ticket
            //we need to remove ticket metadata from ticketArray. To do that, we need index of that ticket object
            let ticketIndex = ticketArray.findIndex(t => {
                return t.ticketId == ticketId;
            })
            ticketArray.splice(ticketIndex, 1);//string from ticketIndex, delete 1 element
            // ticketArray is updated now so update it in local storage accordingly
            localStorage.setItem('tickets', JSON.stringify(ticketArray))
            // remove ticket from DOM
            ticket.remove();
        }
    })
}

// handling lock mechanism
function handleLock(ticket) {
    //running querySelector on ticket here, NOT DOM.
    let ticketLockEle = ticket.querySelector('.ticket-lock')
    //getting i element using children[0] and task-area
    let ticketLockIcon = ticketLockEle.children[0];
    let taskArea = ticket.querySelector('.task-area')

    ticketLockIcon.addEventListener('click', () => {
        //if we are clicking on lock icon and now it should unlock
        if (ticketLockIcon.classList.contains(lockIconClass)) {
            ticketLockIcon.classList.remove(lockIconClass)
            ticketLockIcon.classList.add(unlockIconClass)
            // make the ticket task-area editable
            taskArea.setAttribute('contenteditable', 'true')
        } else {
            // we are clicking on unlock icon and now it should lock
            ticketLockIcon.classList.remove(unlockIconClass)
            ticketLockIcon.classList.add(lockIconClass)
            // make ticket uneditable
            taskArea.setAttribute('contenteditable', 'false')

            // updating ticketArray state with new text i.e. we should store updated desc in ticketArray
            let ticketId = ticket.children[1].innerText;
            ticketArray.forEach(t => {
                if (t.ticketId == ticketId) {
                    t.ticketDesc = taskArea.innerText
                }
            })
            // update local storage. Always store array in string format
            localStorage.setItem('tickets', JSON.stringify(ticketArray))
        }       
    })
}

//change ticket priority on click
function handleColor(ticket) {
    let ticketColorBand = ticket.querySelector('.ticket-color')

    ticketColorBand.addEventListener('click', () => {
        let currentColor = ticketColorBand.classList[1];
        let currentColorIndex = colors.findIndex(color => {
            return color == currentColor
        })
        currentColorIndex++
        let newColorIndex = currentColorIndex % colors.length;//avoid our of range issue
        let newColor = colors[newColorIndex];
        // remove current color
        ticketColorBand.classList.remove(currentColor);
        // add new color
        ticketColorBand.classList.add(newColor);
        // updating ticketArray state with new color as well as local storage
        let ticketId = ticket.children[1].innerText;

        ticketArray.forEach(t => {
            if (t.ticketId == ticketId){
                t.ticketColor = newColor;
            }
        })
        // update local storage
        localStorage.setItem('tickets', JSON.stringify(ticketArray));
    })
}

// implementing filters
toolboxColors.forEach(toolboxColor => {
    toolboxColor.addEventListener('click', () => {
        toolboxColor.classList.add("selected");

        let selectedToolBoxColor = toolboxColor.classList[0]

        let filteredTickets = ticketArray.filter(ticket => {
            return selectedToolBoxColor == ticket.ticketColor
        })
        //get all tickets present in DOM
        let allTickets = document.querySelectorAll('.ticket-container')
        // remove all tickets
        allTickets.forEach(ticket => {
            ticket.remove();
        })
        // recreate tickets using filtered array
        filteredTickets.forEach(filteredTicket => {
            createTicket(filteredTicket.ticketColor, filteredTicket.ticketDesc, filteredTicket.ticketId)
        })
    })

    toolboxColor.addEventListener('dblclick', () => {
        toolboxColor.classList.remove("selected");
        // remove all the existing tickets from DOM
        let allTickets = document.querySelectorAll('.ticket-container')
        allTickets.forEach(ticket => {
            ticket.remove()
        })
        // create all tickets from ticketArray
        ticketArray.forEach(ticket => {
            createTicket(ticket.ticketColor, ticket.ticketDesc, ticket.ticketId)
        })
    })
})

// get ticketArray from local storage and create tickets when JS is loaded/ page reloaded
let ticketsLocalStorage = localStorage.getItem('tickets')
if (ticketsLocalStorage) {
    ticketArray = JSON.parse(ticketsLocalStorage)
    ticketArray.forEach(ticket => {
        createTicket(ticket.ticketColor, ticket.ticketDesc, ticket.ticketId);
    })
}
