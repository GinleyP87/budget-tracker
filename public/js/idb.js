//create variable to hold db connection
let db;
//establish a connection to IndexedDB database called 
const request = indexedDB.open('budget_tracker', 1)

request.onupgradeneeded = function (e) {
    const db = e.target.result;
    db.createObjectStore('new_budget', { autoIncrement: true });
};

//request succesful
request.onsuccess = function (e) {
    db = e.target.result;
    if (navigator.onLine) {
        uploadBudget()
    }
};

request.onerror = function (e) {
    //log error
    console.log(e.target.errorCode)
};
function saveRecord(record) {
    // This function will be executed if we attempt to submit a new bank transaction and there's no internet connection
    const transaction = db.transaction(['new_budget'], 'readwrite');
    //access object store for 'new_budget'
    const budgetObjectStore = transaction.objectStore('new_budget');
    //add record to your store with add method
    budgetObjectStore.add(record);
    alert('Your transaction has been saved without a connection to the internet!');
};

function uploadBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_budget');

    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_budget'], 'readwrite');
                    const budgetObjectStore = transaction.objectStore('new_budget');
                    budgetObjectStore.clear();

                    alert('All saved transactions have been uploaded!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

window.addeListener('online', uploadBudget);