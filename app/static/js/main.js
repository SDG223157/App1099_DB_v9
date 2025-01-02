document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('analysis-form');
    const tickerInput = document.getElementById('ticker');
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'suggestions';
    tickerInput.parentNode.appendChild(suggestionsDiv);
    
    let debounceTimeout;

    function formatCompanyName(name) {
        return name.replace(/\\'/g, "'");
    }
    
    // Clear input on double click
    tickerInput.addEventListener('dblclick', function() {
        if (this.value) {
            this.value = '';
            suggestionsDiv.style.display = 'none';
        }
    });
    
    tickerInput.addEventListener('input', function() {
        clearTimeout(debounceTimeout);
        const query = this.value.trim();
        
        if (query.length < 1) {
            suggestionsDiv.style.display = 'none';
            return;
        }
        
        debounceTimeout = setTimeout(() => {
            fetch(`/search_ticker?query=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    suggestionsDiv.innerHTML = '';
                    
                    if (data.length > 0) {
                        // Filter out results where symbol equals name
                        const filteredData = data.filter(item => 
                            item.symbol.toUpperCase() !== item.name.toUpperCase()
                        );
                        
                        if (filteredData.length > 0) {
                            filteredData.forEach(item => {
                                const div = document.createElement('div');
                                div.className = 'suggestion-item';
                                const formattedName = formatCompanyName(item.name);
                                
                                // Create separate spans for symbol and name
                                const symbolSpan = document.createElement('span');
                                symbolSpan.className = 'symbol';
                                symbolSpan.textContent = item.symbol;
                                
                                const nameSpan = document.createElement('span');
                                nameSpan.className = 'name';
                                nameSpan.textContent = formattedName;
                                
                                div.appendChild(symbolSpan);
                                div.appendChild(nameSpan);
                                
                                div.addEventListener('click', function() {
                                    // Set input value to both symbol and name
                                    tickerInput.value = `${item.symbol}    ${formattedName}`;
                                    suggestionsDiv.style.display = 'none';
                                });
                                
                                suggestionsDiv.appendChild(div);
                            });
                            suggestionsDiv.style.display = 'block';
                        } else {
                            suggestionsDiv.style.display = 'none';
                        }
                    } else {
                        suggestionsDiv.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Search error:', error);
                    suggestionsDiv.style.display = 'none';
                });
        }, 300);
    });
    
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!tickerInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });


    // Prevent suggestions from closing when clicking inside the input
    tickerInput.addEventListener('click', function(e) {
        e.stopPropagation();
        if (this.value.trim().length > 0) {
            suggestionsDiv.style.display = 'block';
        }
    });

    // Form submission (if needed)
    const analyzeForm = document.getElementById('analyze-form');
    if (analyzeForm) {
        analyzeForm.addEventListener('submit', function(e) {
            if (!tickerInput.value.trim()) {
                e.preventDefault();
                alert('Please enter a ticker symbol');
            }
        });
    }
});

// Password toggle functionality
function togglePassword(button) {
    const input = button.closest('.input-with-icon').querySelector('input');
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    
    const icon = button.querySelector('i');
    icon.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
}

// Make togglePassword globally available
window.togglePassword = togglePassword;