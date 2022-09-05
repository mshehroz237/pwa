let db;
const request = indexedDB.open('budget-tracker', 1);

// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
//  OR upon first connection will create the version 1 object store
request.onupgradeneeded = function(event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store (table) called 'item', set it to have an auto incrementing primary key of sorts
    db.createObjectStore('item', {autoIncrement: true} );
};

// upon a successful
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradeneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;

    // if browser is online fetch server transactions and sync local db
    if (navigator.online) {
        uploadItems();
    }
};

// log errors to console
request.onerror = function(event) {
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit a new item and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['item'], 'readwrite');

    // access IndexedDB local object store
    const itemObjectStore = transaction.objectStore('item');

    // add record to IndexedDB local object store with add method
    itemObjectStore.add(record);
};

// load transactions from IndexedDB
function loadLocal() {
    // open a transaction on your db
    const transaction = db.transaction(['item'], 'readwrite');

    // access your object store
    const itemObjectStore = transaction.objectStore('item');

    // get all records from store and set to a variable (note async)
    const getAll = itemObjectStore.getAll();

    // upon success, set transactions to result and populate display
    getAll.onsuccess = function() {
        transactions = getAll.result.sort((a, b) => {
            if (a.date > b.date) {
                return -1;
            }
            if (a.data < b.date) {
                return 1;
            }
            return 0;
        });
        populateTotal();
        populateTable();
        populateChart();
    }
};

// upload any new items from IndexedDB to server
function uploadItems() {
    // open a transaction on your db
    const transaction = db.transaction(['item'], 'readwrite');

    // access your object store
    const itemObjectStore = transaction.objectStore('item');

    // iterate through all local records with a cursor so we can add _id to local object
    const getAll = itemObjectStore.getAll();

    getAll.onerror = function(event) {
        console.log('error fetching data: ', event);
    };

    getAll.onsuccess = function(event) {
        let items = getAll.result.filter(item => !item._id);
        if (items.length) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(items),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(postData => {
                console.log('Sent to server: ',items.length);
                fetch('/api/transaction')
                .then(response => response.json())
                .then(data => {
                    transactions = data;
                    syncItems(data);
                    populateTotal();
                    populateTable();
                    populateChart();
                })
                .catch(err => {
                    console.log(err);
                });
            })
            .catch(err => {
                console.log('Unable to send local items to server: offline or server unavailable');
                console.log(err);
            });
        } else {
            // loadLocal();
            fetch('/api/transaction')
            .then(response => response.json())
            .then(data => {
                transactions = data;
                syncItems(data);
                populateTotal();
                populateTable();
                populateChart();
            })
            .catch(err => {
                console.log(err);
            });
        };
    };
};

// sync local db to server
function syncItems(data) {
    // open a transaction on your db
    const transaction = db.transaction(['item'], 'readwrite');

    // access your object store
    const itemObjectStore = transaction.objectStore('item');

    // clear local store
    const request = itemObjectStore.clear();

    request.onerror = function(event) {
        console.log('error clearing data: ', event)
    };

    // add api items to local store
    request.onsuccess = function(event) {
        data.map(item => itemObjectStore.add(item));
    };
};

// listen for app to come back online
window.addEventListener('online', uploadItems);

