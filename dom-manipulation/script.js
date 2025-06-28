document.addEventListener('DOMContentLoaded', () => {

    // --- DATA ---
    // Initial array of quote objects
    const quotes = [
        { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
        { text: "Strive not to be a success, but rather to be of value.", category: "Wisdom" },
        { text: "The mind is everything. What you think you become.", category: "Philosophy" },
        { text: "An unexamined life is not worth living.", category: "Socrates" },
        { text: "Your time is limited, so don’t waste it living someone else’s life.", category: "Motivation" }
    ];

    // --- DOM ELEMENT REFERENCES ---
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const addQuoteContainer = document.getElementById('addQuoteContainer');
    
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
    function addQuote() {
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

        } else {
            alert('Please fill in both the quote and its category.');
        }
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

    // Load quotes from storage
    loadQuotes();

    // Attach event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    exportJsonBtn.addEventListener('click', exportQuotes);
    importFileInput.addEventListener('change', importQuotes);
    

    // --- INITIALIZATION ---
    
    // Dynamically build the form for adding new quotes
    createAddQuoteForm();

    // Show the first random quote when the page loads
    showRandomQuote();
});
