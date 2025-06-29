document.addEventListener('DOMContentLoaded', () => {

     // --- DATA & SERVER SIMULATION ---
    let quotes = [];
    const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Using JSONPlaceholder as a mock server
    const defaultQuotes = [
        { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
        { text: "Strive not to be a success, but rather to be of value.", category: "Wisdom" }
    ];

    // --- DOM ELEMENT REFERENCES ---
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const exportJsonBtn = document.getElementById('exportJson');
    const importFileInput = document.getElementById('importFile');
    const addQuoteContainer = document.getElementById('addQuoteContainer');
    const serverStatus = document.getElementById('serverStatus');
    const notification = document.getElementById('notification');
    const syncNowBtn = document.getElementById('syncNow');
    const categoryFilter = document.getElementById('categoryFilter');

    
    // --- FUNCTIONS ---

     
    /**
     * Populates the category filter dropdown with unique categories from the quotes array.
     */
    function populateCategories() {
        // Extract unique categories, using a Set to avoid duplicates
        const categories = new Set(quotes.map(quote => quote.category));
        
        // Clear existing options, but keep the "All Categories" default
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';

        // Create and append an option for each unique category
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        // Restore the last selected filter from local storage
        const lastFilter = localStorage.getItem('lastFilterCategory');
        if (lastFilter) {
            categoryFilter.value = lastFilter;
        }
    }


    /**
     * Selects a random quote from the array and displays it in the DOM.
     */
    function showRandomQuote() {
        // Get a random index from the quotes array
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const randomQuote = quotes[randomIndex];

        // Clear previous quote
        quoteDisplay.innerHTML = '';

        // Create elements for the new quote
        const quoteTextElement = document.createElement('p');
        quoteTextElement.className = 'text-xl md:text-2xl italic text-gray-700';
        quoteTextElement.textContent = `"${randomQuote.text}"`;

        const quoteCategoryElement = document.createElement('p');
        quoteCategoryElement.className = 'text-right text-md font-semibold text-gray-500 mt-4';
        quoteCategoryElement.textContent = `- ${randomQuote.category}`;
        
        // Append new elements to the display container
        quoteDisplay.appendChild(quoteTextElement);
        quoteDisplay.appendChild(quoteCategoryElement);
    }

     
    /**
     * Triggered on category selection. Saves the preference and updates the display.
     */
    function filterQuotes() {
        const selectedCategory = categoryFilter.value;
        localStorage.setItem('lastFilterCategory', selectedCategory);
        showRandomQuote();
    }

    /**
     * Dynamically creates and appends the "Add Quote" form to the DOM.
     * This demonstrates creating and configuring elements via JavaScript.
     */
    function createAddQuoteForm() {
        // Create form elements dynamically
        const formHeader = document.createElement('h2');
        formHeader.textContent = 'Add a New Quote';
        formHeader.className = 'text-2xl font-bold text-center text-gray-900 mb-4 border-t pt-6';

        const quoteTextInput = document.createElement('input');
        quoteTextInput.id = 'newQuoteText';
        quoteTextInput.type = 'text';
        quoteTextInput.placeholder = 'Enter a new quote';
        quoteTextInput.className = 'w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500';

        const categoryTextInput = document.createElement('input');
        categoryTextInput.id = 'newQuoteCategory';
        categoryTextInput.type = 'text';
        categoryTextInput.placeholder = 'Enter quote category';
        categoryTextInput.className = 'w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500';

        const addButton = document.createElement('button');
        addButton.textContent = 'Add Quote';
        addButton.className = 'w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-transform transform hover:scale-105';
        
        // Add click event listener for the new button
        addButton.addEventListener('click', addQuote);

        // Append all new elements to the container div
        addQuoteContainer.appendChild(formHeader);
        addQuoteContainer.appendChild(quoteTextInput);
        addQuoteContainer.appendChild(categoryTextInput);
        addQuoteContainer.appendChild(addButton);
    }

    /**
     * Handles adding a new quote to the array from the form inputs.
     */
    async function addQuote() {
        const newQuoteText = document.getElementById('newQuoteText').value.trim();
        const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();

        // Basic validation
        if (newQuoteText && newQuoteCategory) {
            // Create a new quote object
             const storedQoute = JSON.parse(localStorage.getItem('addQoute') || '[]');
             localStorage.setItem('storedQoute', JSON.stringify(addQuote));
            const newQuote = {
                text: newQuoteText,
                category: newQuoteCategory
            };

             // Repopulate categories to include the new one if it's unique
            populateCategories(); 
            // Set filter to the newly added category
            categoryFilter.value = newQuoteCategory;
            filterQuotes(); // Save and update view


            // Add the new quote to the array
            quotes.push(newQuote);

            // Clear the input fields
            document.getElementById('newQuoteText').value = '';
            document.getElementById('newQuoteCategory').value = '';

            // Display the newly added quote
            quoteDisplay.innerHTML = ''; // Clear previous content
            const confirmationText = document.createElement('p');
            confirmationText.className = 'text-xl text-green-600 font-semibold';
            confirmationText.textContent = 'Successfully added your quote!';
            quoteDisplay.appendChild(confirmationText);
            
            console.log('Updated quotes array:', quotes);

            //Post the new quote to the server
            await postQuoteToServer(newQuote);
        } else {
            alert('Please fill in both the quote and its category.');
        }

        
    }

    // --- SERVER SYNC & CONFLICT RESOLUTION ---


    /**
     * Posts a single quote to the mock server.
     * @param {object} quote - The quote object with text and category.
     */
    async function postQuoteToServer(quote) {
        try {
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                body: JSON.stringify({
                    title: quote.text,   // Map our 'text' to the 'title' field of the API
                    body: quote.category, // Map our 'category' to the 'body' field of the API
                    userId: 1,            // Mock user ID as required by the API
                }),
                headers: {
                    // Set the Content-Type header to indicate JSON data
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Successfully posted to server:", result);
            // Provide feedback to the user
            showNotification(`Quote "${result.title.slice(0, 20)}..." was posted to the server.`);

        } catch (error) {
            console.error("Error posting to server:", error);
            showNotification("Failed to post quote to the server.");
        }
    }



    /**
     * Fetches quotes from the server simulation.
     */
    async function fetchQuotesFromServer() {
        try {
            const response = await fetch(SERVER_URL);
            const serverPosts = await response.json();
            // Convert server posts to our quote format
            return serverPosts.slice(0, 5).map(post => ({ // Limiting to 5 for demo purposes
                text: post.title, // Using post title as quote text
                category: "From Server" // Assigning a default category
            }));
        } catch (error) {
            console.error("Error fetching from server:", error);
            return [];
        }
    }

    
    /**
     * Posts local quotes to the server (simulation).
     * @param {object} quote - The quote to post.
     */
    async function postQuoteToServer(quote) {
        try {
            const response = await fetch(SERVER_URL, {
                method: 'POST',
                body: JSON.stringify({
                    title: quote.text,
                    body: quote.category,
                    userId: 1, // Mock user ID
                }),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });
            const result = await response.json();
            console.log("Posted to server:", result);
        } catch (error) {
            console.error("Error posting to server:", error);
        }
    }
    
    /**
     * Main sync function: fetches server data, merges it, and handles conflicts.
     */
    async function syncQuotes() {
        console.log("Syncing with server...");
        const serverQuotes = await fetchQuotesFromServer();
        const localQuotes = quotes;
        let updated = false;

        if(serverQuotes.length > 0) {
            // Simple conflict resolution: Server data takes precedence.
            // A more advanced strategy might involve timestamps or diffing.
            const serverQuoteTexts = new Set(serverQuotes.map(q => q.text));
            const newLocalQuotes = localQuotes.filter(q => !serverQuoteTexts.has(q.text));

            const mergedQuotes = [...newLocalQuotes, ...serverQuotes];
            
            if (JSON.stringify(quotes) !== JSON.stringify(mergedQuotes)) {
                quotes = mergedQuotes;
                saveQuotes();
                populateCategories();
                showRandomQuote();
                showNotification("Quotes updated from the server!");
                updated = true;
            }
        }
        
        // Post local quotes that are not on the server (conceptual)
        // In a real app, you'd track which quotes are new and need posting.
        // For this demo, we won't post to avoid flooding the mock API.
        
        updateSyncStatus();
        console.log(updated ? "Sync complete. Data updated." : "Sync complete. No changes.");
    }
    
    function showNotification(message) {
        notification.textContent = message;
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 5000);
    }

    /**
     * Updates the sync status timestamp in the UI.
     */
    function updateSyncStatus() {
        const now = new Date();
        serverStatus.textContent = `Last sync: ${now.toLocaleTimeString()}`;
    }

    
    /**
     * Exports the current quotes array to a JSON file.
     */
    function exportQuotes() {
        const dataStr = JSON.stringify(quotes, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'quotes.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up
    }

    /*
     * Handles the file import process.
     * @param {Event} event - The file input change event.
     */
    function importQuotes(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                // Basic validation
                if (Array.isArray(importedQuotes) && importedQuotes.every(q => q.text && q.category)) {
                    // Replace existing quotes with imported ones
                    quotes.push(...importedQuotes);
                    // Remove duplicates
                    const uniqueQuotes = Array.from(new Set(quotes.map(a => a.text)))
                        .map(text => {
                            return quotes.find(a => a.text === text)
                        });
                    quotes = uniqueQuotes;
                    saveQuotes();
                    alert('Quotes imported successfully!');
                    showRandomQuote();
                } else {
                    alert('Invalid JSON file format. Expected an array of objects with "text" and "category" properties.');
                }
            } catch (error) {
                alert('Error reading or parsing the file.');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }


    // --- INITIALIZATION ---

     function init() {
        loadQuotes();
        populateCategories();
        createAddQuoteForm();
        
        const lastFilter = localStorage.getItem('lastFilterCategory');
        if (lastFilter) {
            categoryFilter.value = lastFilter;
        }
    }

    // Load quotes from storage
    loadQuotes();

    // Attach event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    exportJsonBtn.addEventListener('click', exportQuotes);
    importFileInput.addEventListener('change', importQuotes);
    syncNowBtn.addEventListener('click', syncWithServer);
    

    // --- INITIALIZATION ---
    
    // Dynamically build the form for adding new quotes
    createAddQuoteForm();

    // Show the first random quote when the page loads
    showRandomQuote();
});
