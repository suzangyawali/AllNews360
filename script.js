
    // Global variables
    let notes = [];
    let notesModalOpen = false;
    let newsData = {};

    // Official news website URLs
    const newsUrls = {
      'Economic Times': 'https://economictimes.indiatimes.com/',
      'The Hindu': 'https://www.thehindu.com/',
      'Hindustan Times': 'https://www.hindustantimes.com/',
      'Times of India': 'https://timesofindia.indiatimes.com/',
      'AI Insider': 'https://artificialintelligence-news.com/'
    };

    // Initialize the application
    document.addEventListener('DOMContentLoaded', function() {
      // Hide welcome screen after 3 seconds
      setTimeout(function() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        welcomeScreen.classList.add('fade-out');
        setTimeout(function() {
          welcomeScreen.style.display = 'none';
        }, 500);
      }, 3000);

      // Load news data
      loadNewsData();
      
      // Load saved notes from memory
      loadNotes();
      
      // Start auto-refresh timer
      startAutoRefresh();
      
      // Update statistics
      updateStatistics();
    });

    // Load news data from finalData.json file
    async function loadNewsData() {
      try {
       
        
        // Try to load from finalData.json
        const response = await fetch('finalData.json');
        if (response.ok) {
          newsData = await response.json();
          displayNewsData();
          showNotification('Latest News!');
        } else {
          throw new Error('Could not fetch finalData.json');
        }
      } catch (error) {
        console.log('finalData.json not found, using fallback data');
        showNotification('Using fallback data - place finalData.json in same directory');
        
        displayNewsData();
        showNotification('Fallback news data loaded!');
      }
    }

    // Display news data from JSON - Show only first 3 headlines
    function displayNewsData() {
      const newsMapping = {
        'ET': { container: 'et-news', class: 'ETnews', name: 'Economic Times' },
        'Hindu': { container: 'th-news', class: 'THnews', name: 'The Hindu' },
        'HT': { container: 'ht-news', class: 'HTnews', name: 'Hindustan Times' },
        'TOI': { container: 'toi-news', class: 'TOInews', name: 'Times of India' },
        'AI': { container: 'ai-news', class: 'AInews', name: 'AI Insider' }
      };

      Object.keys(newsData).forEach(source => {
        const mapping = newsMapping[source];
        if (!mapping) return;

        const container = document.getElementById(mapping.container);
        if (!container) return;

        const headlines = [];
        let index = 0;
        
        // Extract only first 3 headlines
        while (newsData[source][index.toString()] && index < 3) {
          headlines.push(newsData[source][index.toString()]);
          index++;
        }

        // Clear existing content and add new headlines + view more button
        container.innerHTML = headlines.map(headline => `
          <div class="headline" onclick="openNewsModal('${source}')">
            ${headline}
            <div class="headline-capture" onclick="event.stopPropagation(); captureNote(this, '${mapping.name}')">📝</div>
          </div>
        `).join('') + `
          <button class="view-more-btn" onclick="openNewsModal('${source}')">
            View All News
          </button>
        `;
      });

      console.log('📰 News data loaded:', Object.keys(newsData).length + ' sources');
    }

    // Open professional news modal
    function openNewsModal(source) {
      const modal = document.getElementById('newsModal');
      const modalTitle = document.getElementById('modalTitle');
      const modalBody = document.getElementById('modalBody');

      const newsMapping = {
        'ET': 'Economic Times',
        'Hindu': 'The Hindu',
        'HT': 'Hindustan Times',
        'TOI': 'Times of India',
        'AI': 'AI Insider'
      };

      const sourceName = newsMapping[source];
      modalTitle.textContent = sourceName.toUpperCase();

      // Get all headlines for this source
      const headlines = [];
      let index = 0;
      while (newsData[source][index.toString()]) {
        headlines.push(newsData[source][index.toString()]);
        index++;
      }

      // Create professional modal content
      modalBody.innerHTML = headlines.map((headline, idx) => `
        <div class="modal-news-item">
          <div class="modal-news-headline">${headline}</div>
          <div class="modal-news-meta">
            <span>Published by ${sourceName}</span>
            <span>Article #${idx + 1}</span>
          </div>
          <div class="modal-news-actions">
            <button class="read-more-btn" onclick="redirectToOfficial('${sourceName}')">
              Read on Official Site
            </button>
            <button class="save-note-btn" onclick="captureNoteFromModal('${headline}', '${sourceName}')">
              Save Note
            </button>
          </div>
        </div>
      `).join('');

      modal.classList.add('show');
    }

    // Close news modal
    function closeNewsModal() {
      const modal = document.getElementById('newsModal');
      modal.classList.remove('show');
    }

    // Redirect to official news website
    function redirectToOfficial(sourceName) {
      const url = newsUrls[sourceName];
      if (url) {
        window.open(url, '_blank');
        showNotification(`Redirecting to ${sourceName}...`);
      } else {
        showNotification('Official website not available');
      }
    }

    // Capture note from modal
    function captureNoteFromModal(headline, source) {
      const timestamp = new Date().toLocaleString();
      
      const note = {
        id: Date.now(),
        headline: headline.trim(),
        source: source,
        timestamp: timestamp,
        content: `Captured from ${source} at ${timestamp}`
      };
      
      notes.push(note);
      saveNotes();
      displayNotes();
      updateStatistics();
      showNotification(`Note saved from ${source}!`);
    }

    // Notes Management Functions
    function captureNote(element, source) {
      const headline = element.parentElement.textContent.replace('📝', '').trim();
      const timestamp = new Date().toLocaleString();
      
      const note = {
        id: Date.now(),
        headline: headline,
        source: source,
        timestamp: timestamp,
        content: `Captured from ${source} at ${timestamp}`
      };
      
      notes.push(note);
      saveNotes();
      displayNotes();
      updateStatistics();
      showNotification(`Note captured from ${source}!`);
      
      // Add visual feedback
      element.style.transform = 'scale(0.95)';
      setTimeout(() => {
        element.style.transform = '';
      }, 150);
    }

    function displayNotes() {
      const notesList = document.getElementById('notesList');
      
      if (notes.length === 0) {
        notesList.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.5); padding: 2rem;">No notes captured yet. Click the 📝 icon on any headline to save it!</div>';
        return;
      }
      
      notesList.innerHTML = notes.map(note => `
        <div class="note-item" onclick="expandNote(${note.id})">
          <div class="note-source">${note.source}</div>
          <div class="note-delete" onclick="event.stopPropagation(); deleteNote(${note.id})">×</div>
          <div class="note-headline">${note.headline}</div>
          <div class="note-content">${note.content}</div>
          <div class="note-timestamp">${note.timestamp}</div>
        </div>
      `).join('');
    }

    function deleteNote(id) {
      notes = notes.filter(note => note.id !== id);
      saveNotes();
      displayNotes();
      updateStatistics();
      showNotification('Note deleted successfully!');
    }

    function clearAllNotes() {
      if (notes.length === 0) {
        showNotification('No notes to clear!');
        return;
      }
      
      if (confirm('Are you sure you want to delete all notes?')) {
        notes = [];
        saveNotes();
        displayNotes();
        updateStatistics();
        showNotification('All notes cleared!');
      }
    }

    function saveNotes() {
      // Store in memory since localStorage is not available
      // In a real application, this would persist to localStorage
    }

    function loadNotes() {
      // Load from memory - in a real app this would load from localStorage
      displayNotes();
    }

    function exportNotes() {
      if (notes.length === 0) {
        showNotification('No notes to export!');
        return;
      }
      
      const dataStr = JSON.stringify(notes, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'newsmania_notes.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Notes exported successfully!');
    }

    // Modal Functions
    function toggleNotesModal() {
      const modal = document.getElementById('notesModal');
      notesModalOpen = !notesModalOpen;
      
      if (notesModalOpen) {
        modal.classList.add('show');
        displayNotes();
      } else {
        modal.classList.remove('show');
      }
    }

    // Screenshot Function
    function captureScreenshot() {
      showNotification('Preparing screenshot...');
      
      const element = document.querySelector('.news-container');
      
      html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true
      }).then(function(canvas) {
        const link = document.createElement('a');
        link.download = 'newsmania_screenshot.png';
        link.href = canvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Screenshot saved successfully!');
      }).catch(function(error) {
        console.error('Screenshot failed:', error);
        showNotification('Screenshot failed. Please try again.');
      });
    }

    // Enhanced refresh with finalData.json fetching
    async function refreshNewsFromAPI() {
      try {
        showNotification('Fetching latest news from finalData.json...');
        
        // Try to reload from finalData.json with cache busting
        const response = await fetch('finalData.json?t=' + Date.now());
        if (response.ok) {
          newsData = await response.json();
          displayNewsData();
          showNotification('Latest news loaded from finalData.json!');
        } else {
          throw new Error('Could not fetch updated finalData.json');
        }
      } catch (error) {
        console.log('Could not fetch updated finalData.json, keeping current data');
        showNotification('Could not load from finalData.json - using current data');
      }
    }

    // Auto-refresh timer
    function startAutoRefresh() {
      setInterval(async () => {
        console.log('Auto-refreshing news...');
        await refreshNewsFromAPI();
      }, 30000); // 30 seconds
    }

    // Statistics Functions
    function updateStatistics() {
      document.getElementById('totalNotes').textContent = notes.length;
      
      const uniqueSources = [...new Set(notes.map(note => note.source))];
      document.getElementById('totalSources').textContent = uniqueSources.length;
    }

    // Notification System
    function showNotification(message) {
      const notification = document.getElementById('notification');
      notification.textContent = message;
      notification.classList.add('show');
      
      setTimeout(() => {
        notification.classList.remove('show');
      }, 3000);
    }

    // Note expansion function
    function expandNote(id) {
      const note = notes.find(n => n.id === id);
      if (note) {
        alert(`Full Note Details:\n\nHeadline: ${note.headline}\n\nSource: ${note.source}\n\nCaptured: ${note.timestamp}\n\nContent: ${note.content}`);
      }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // Ctrl/Cmd + S for screenshot
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        captureScreenshot();
      }
      
      // Ctrl/Cmd + N for notes
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        toggleNotesModal();
      }
      
      // Ctrl/Cmd + R for refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshNewsFromAPI();
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        if (notesModalOpen) {
          toggleNotesModal();
        }
        closeNewsModal();
      }
    });

    // Close modal when clicking outside
    document.getElementById('newsModal').addEventListener('click', function(e) {
      if (e.target === this) {
        closeNewsModal();
      }
    });

    console.log('🚀 Newsmania initialized successfully!');
    console.log('📱 Keyboard shortcuts:');
    console.log('  Ctrl+S - Screenshot');
    console.log('  Ctrl+N - Toggle Notes');
    console.log('  Ctrl+R - Refresh News');
    console.log('  Escape - Close Modal');
