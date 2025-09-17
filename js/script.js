// HISHK Humanities Society Website JavaScript
// Tab switching and newsletter management functionality

class HISHKHumanitiesSociety {
    constructor() {
        this.init();
        this.loadNewsletters();
        this.loadEvents();
        this.initializeDataSync();
    }

    init() {
        this.bindEvents();
        this.initializeMobileMenu();
    }

    initializeDataSync() {
        // Check for pending local data and sync to Firebase when online
        this.syncLocalDataToFirebase();
        
        // Set up periodic sync (every 30 seconds)
        setInterval(() => {
            this.syncLocalDataToFirebase();
        }, 30000);
        
        // Sync when coming back online
        window.addEventListener('online', () => {
            console.log('Connection restored. Syncing data...');
            this.syncLocalDataToFirebase();
            this.showNotification('Connection restored. Syncing data...', 'info');
        });
        
        // Notify when going offline
        window.addEventListener('offline', () => {
            console.log('Connection lost. Data will be saved locally.');
            this.showNotification('Working offline. Changes will sync when reconnected.', 'info');
        });
    }

    async syncLocalDataToFirebase() {
        if (typeof db === 'undefined' || db === null) {
            return; // Firebase not available
        }
        
        try {
            // Sync newsletters
            const localNewsletters = JSON.parse(localStorage.getItem('hishk_newsletters') || '[]');
            if (localNewsletters.length > 0) {
                console.log(`Syncing ${localNewsletters.length} local newsletters to Firebase...`);
                for (const newsletter of localNewsletters) {
                    try {
                        await db.collection('newsletters').doc(newsletter.id).set(newsletter);
                        console.log(`Synced newsletter ${newsletter.id}`);
                    } catch (err) {
                        console.error(`Failed to sync newsletter ${newsletter.id}:`, err);
                    }
                }
                // Clear local storage after successful sync
                localStorage.removeItem('hishk_newsletters');
                this.loadNewsletters();
            }
            
            // Sync events
            const localEvents = JSON.parse(localStorage.getItem('hishk_events') || '[]');
            if (localEvents.length > 0) {
                console.log(`Syncing ${localEvents.length} local events to Firebase...`);
                for (const event of localEvents) {
                    try {
                        await db.collection('events').doc(event.id).set(event);
                        console.log(`Synced event ${event.id}`);
                    } catch (err) {
                        console.error(`Failed to sync event ${event.id}:`, err);
                    }
                }
                // Clear local storage after successful sync
                localStorage.removeItem('hishk_events');
                this.loadEvents();
            }
            
            // Sync comments
            const localComments = JSON.parse(localStorage.getItem('hishk_comments') || '[]');
            if (localComments.length > 0) {
                console.log(`Syncing ${localComments.length} local comments to Firebase...`);
                for (const comment of localComments) {
                    try {
                        await db.collection('comments').doc(comment.id).set(comment);
                        console.log(`Synced comment ${comment.id}`);
                    } catch (err) {
                        console.error(`Failed to sync comment ${comment.id}:`, err);
                    }
                }
                // Clear local storage after successful sync
                localStorage.removeItem('hishk_comments');
                // Reload comments if modal is open
                if (this.currentNewsletterId) {
                    this.loadComments(this.currentNewsletterId);
                }
            }
            
            if (localNewsletters.length > 0 || localEvents.length > 0 || localComments.length > 0) {
                this.showNotification('Data synced successfully!', 'success');
            }
        } catch (error) {
            console.error('Error during data sync:', error);
        }
    }

    bindEvents() {
        // Tab switching
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleTabSwitch(e));
        });
        
        // Competition application buttons
        const applyButtons = document.querySelectorAll('.apply-btn');
        applyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCompetitionApplication(e));
        });

        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Newsletter form
        const addNewsletterBtn = document.getElementById('addNewsletterBtn');
        const cancelNewsletterBtn = document.getElementById('cancelNewsletterBtn');
        const newsletterFormElement = document.getElementById('newsletterFormElement');

        if (addNewsletterBtn) {
            addNewsletterBtn.addEventListener('click', () => this.showNewsletterForm());
        }

        if (cancelNewsletterBtn) {
            cancelNewsletterBtn.addEventListener('click', () => this.hideNewsletterForm());
        }

        if (newsletterFormElement) {
            newsletterFormElement.addEventListener('submit', (e) => this.handleNewsletterSubmit(e));
        }
        
        // Newsletter search functionality
        const newsletterSearch = document.getElementById('newsletterSearch');
        const clearSearch = document.getElementById('clearSearch');
        
        if (newsletterSearch) {
            newsletterSearch.addEventListener('input', (e) => this.handleNewsletterSearch(e.target.value));
        }
        
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                if (newsletterSearch) newsletterSearch.value = '';
                this.loadNewsletters();
            });
        }
        
        // Event form
        const addEventBtn = document.getElementById('addEventBtn');
        const cancelEventBtn = document.getElementById('cancelEventBtn');
        const eventFormElement = document.getElementById('eventFormElement');
        
        if (addEventBtn) {
            addEventBtn.addEventListener('click', () => this.showEventForm());
        }
        
        if (cancelEventBtn) {
            cancelEventBtn.addEventListener('click', () => this.hideEventForm());
        }
        
        if (eventFormElement) {
            eventFormElement.addEventListener('submit', (e) => this.handleEventSubmit(e));
        }
        
        // Competition application modal
        const applicationModal = document.getElementById('applicationModal');
        const modalClose = document.getElementById('modalClose');
        const cancelApplication = document.getElementById('cancelApplication');
        const applicationForm = document.getElementById('applicationForm');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideApplicationModal());
        }
        
        if (cancelApplication) {
            cancelApplication.addEventListener('click', () => this.hideApplicationModal());
        }
        
        if (applicationForm) {
            applicationForm.addEventListener('submit', (e) => this.handleApplicationSubmit(e));
        }
        
        // Close modal when clicking outside
        if (applicationModal) {
            applicationModal.addEventListener('click', (e) => {
                if (e.target === applicationModal) {
                    this.hideApplicationModal();
                }
            });
        }
    }

    initializeMobileMenu() {
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            const navToggle = document.getElementById('navToggle');
            const navMenu = document.getElementById('navMenu');
            
            if (navToggle && navMenu && 
                !navToggle.contains(e.target) && 
                !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }

    handleTabSwitch(e) {
        e.preventDefault();
        
        const clickedTab = e.target.getAttribute('data-tab');
        if (!clickedTab) return;

        // Update active states for navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        e.target.classList.add('active');

        // Update active states for tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetContent = document.getElementById(clickedTab);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        // Close mobile menu if open
        const navMenu = document.getElementById('navMenu');
        if (navMenu) {
            navMenu.classList.remove('active');
        }

        // Smooth scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    showNewsletterForm() {
        const form = document.getElementById('newsletterForm');
        if (form) {
            form.classList.add('active');
            
            // Set today's date as default
            const dateInput = document.getElementById('newsletterDate');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.value = today;
            }

            // Focus on title input
            const titleInput = document.getElementById('newsletterTitle');
            if (titleInput) {
                setTimeout(() => titleInput.focus(), 300);
            }
        }
    }

    hideNewsletterForm() {
        const form = document.getElementById('newsletterForm');
        if (form) {
            form.classList.remove('active');
            
            // Clear form
            const formElement = document.getElementById('newsletterFormElement');
            if (formElement) {
                formElement.reset();
            }
        }
    }

    async handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newsletter = {
            id: Date.now().toString(),
            title: formData.get('title'),
            author: formData.get('author') || 'Anonymous',
            date: formData.get('date'),
            content: formData.get('content'),
            imageUrl: formData.get('imageUrl') || '',
            videoUrl: formData.get('videoUrl') || '',
            timestamp: new Date().toISOString()
        };
        
        // Debug log to check values
        console.log('Newsletter being saved:', newsletter);

        // Validate required fields
        if (!newsletter.title || !newsletter.date || !newsletter.content) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        try {
            await this.saveNewsletter(newsletter);
            this.hideNewsletterForm();
            this.loadNewsletters();
            this.showNotification('Newsletter published successfully!', 'success');
        } catch (error) {
            console.error('Error publishing newsletter:', error);
            this.showNotification('Failed to publish newsletter. Check console for details.', 'error');
        }
    }

    async saveNewsletter(newsletter) {
        try {
            // Check if Firebase is initialized
            if (typeof db === 'undefined' || db === null) {
                console.error('Firebase not initialized. Saving to localStorage only.');
                // Save only to localStorage when Firebase unavailable
                let newsletters = JSON.parse(localStorage.getItem('hishk_newsletters') || '[]');
                newsletters.unshift(newsletter);
                localStorage.setItem('hishk_newsletters', JSON.stringify(newsletters));
                return newsletter;
            }
            
            console.log('Attempting to save to Firebase:', newsletter);
            
            // Save to Firebase Firestore (primary storage)
            await db.collection('newsletters').doc(newsletter.id).set(newsletter);
            console.log('Newsletter saved to Firebase successfully');
            
            // Clear localStorage after successful Firebase save to prevent conflicts
            // Only keep as emergency backup
            localStorage.removeItem('hishk_newsletters');
            
            return newsletter;
        } catch (error) {
            console.error('Failed to save newsletter to Firebase:', error);
            console.error('Error details:', error.message, error.code);
            
            // Fallback to localStorage only if Firebase fails
            let newsletters = JSON.parse(localStorage.getItem('hishk_newsletters') || '[]');
            newsletters.unshift(newsletter);
            localStorage.setItem('hishk_newsletters', JSON.stringify(newsletters));
            
            console.log('Newsletter saved to localStorage as fallback');
            this.showNotification('Saved locally. Will sync when connection restored.', 'info');
            return newsletter;
        }
    }

    async getNewsletters() {
        try {
            // Check if Firebase is initialized
            if (typeof db === 'undefined' || db === null) {
                console.warn('Firebase not initialized. Using local storage only.');
                const localNewsletters = JSON.parse(localStorage.getItem('hishk_newsletters') || '[]');
                return localNewsletters;
            }
            
            console.log('Fetching newsletters from Firebase...');
            
            // Get newsletters from Firebase Firestore (primary source)
            const snapshot = await db.collection('newsletters')
                .orderBy('timestamp', 'desc')
                .get();
            
            const firebaseNewsletters = [];
            snapshot.forEach(doc => {
                firebaseNewsletters.push(doc.data());
            });
            
            console.log(`Found ${firebaseNewsletters.length} newsletters in Firebase`);
            
            // Return only Firebase newsletters when online
            // This prevents conflicts between devices
            return firebaseNewsletters;
            
        } catch (error) {
            console.warn('Failed to fetch from Firebase, using localStorage fallback:', error);
            // Only use localStorage when Firebase is unavailable
            const localNewsletters = JSON.parse(localStorage.getItem('hishk_newsletters') || '[]');
            return localNewsletters;
        }
    }

    getDefaultNewsletters() {
        // Return empty array - no default newsletters
        return [];
    }

    async loadNewsletters(searchTerm = '') {
        let newsletters = await this.getNewsletters();
        const container = document.getElementById('newslettersArchive');
        
        if (!container) return;

        // Filter by search term (author or content) if provided
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            newsletters = newsletters.filter(n => {
                const author = (n.author || 'Anonymous').toLowerCase();
                const title = (n.title || '').toLowerCase();
                const content = (n.content || '').toLowerCase();
                return author.includes(lowerSearchTerm) || 
                       title.includes(lowerSearchTerm) || 
                       content.includes(lowerSearchTerm);
            });
        }

        if (newsletters.length === 0) {
            container.innerHTML = `
                <div class="no-newsletters">
                    <p>${searchTerm ? `No newsletters found matching "${searchTerm}"` : 'No newsletters published yet. Click "Add New Newsletter" to create the first one!'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = newsletters.map(newsletter => this.createNewsletterPreviewHTML(newsletter)).join('');
        
        // Bind read more events
        container.querySelectorAll('.read-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showNewsletterModal(e.target.dataset.id);
            });
        });
        
        // Bind delete events
        container.querySelectorAll('.delete-newsletter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNewsletter(e.target.dataset.id);
            });
        });

        // Bind newsletter preview click events
        container.querySelectorAll('.newsletter-preview').forEach(preview => {
            preview.addEventListener('click', (e) => {
                if (!e.target.classList.contains('read-more-btn') && !e.target.classList.contains('delete-newsletter-btn')) {
                    this.showNewsletterModal(preview.dataset.newsletterId);
                }
            });
        });
        
        // Bind newsletter modal events
        this.bindNewsletterModalEvents();
    }

    createNewsletterPreviewHTML(newsletter) {
        const date = new Date(newsletter.date);
        const formattedDate = date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Create excerpt from content (first 150 characters)
        const excerpt = newsletter.content.length > 150 
            ? newsletter.content.substring(0, 150) + '...' 
            : newsletter.content;

        const author = newsletter.author || 'Anonymous';

        const hasMedia = newsletter.imageUrl || newsletter.videoUrl;
        const mediaIndicator = hasMedia ? `
            <div class="newsletter-media-indicators">
                ${newsletter.imageUrl ? '<span class="media-indicator">📷 Image</span>' : ''}
                ${newsletter.videoUrl ? '<span class="media-indicator">🎥 Video</span>' : ''}
            </div>
        ` : '';

        return `
            <div class="newsletter-preview" data-newsletter-id="${newsletter.id}">
                <div class="newsletter-preview-header">
                    <h3 class="newsletter-preview-title">${this.escapeHtml(newsletter.title)}</h3>
                    <span class="newsletter-preview-date">${formattedDate}</span>
                </div>
                <p class="newsletter-preview-author">By ${this.escapeHtml(author)}</p>
                ${mediaIndicator}
                <p class="newsletter-preview-excerpt">${this.escapeHtml(excerpt)}</p>
                <div class="newsletter-preview-actions">
                    <button class="read-more-btn" data-id="${newsletter.id}">Read Full Article</button>
                    <button class="delete-newsletter-btn" data-id="${newsletter.id}">Delete</button>
                </div>
            </div>
        `;
    }
    
    handleNewsletterSearch(searchTerm) {
        this.loadNewsletters(searchTerm);
    }

    bindNewsletterModalEvents() {
        const newsletterModal = document.getElementById('newsletterModal');
        const newsletterModalClose = document.getElementById('newsletterModalClose');
        
        if (newsletterModalClose) {
            newsletterModalClose.addEventListener('click', () => this.hideNewsletterModal());
        }
        
        // Close modal when clicking outside
        if (newsletterModal) {
            newsletterModal.addEventListener('click', (e) => {
                if (e.target === newsletterModal) {
                    this.hideNewsletterModal();
                }
            });
        }
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && newsletterModal && newsletterModal.classList.contains('active')) {
                this.hideNewsletterModal();
            }
        });
    }

    async showNewsletterModal(newsletterId) {
        const newsletters = await this.getNewsletters();
        const newsletter = newsletters.find(n => n.id === newsletterId);
        
        if (!newsletter) return;
        
        const modal = document.getElementById('newsletterModal');
        const modalTitle = document.getElementById('modalNewsletterTitle');
        const modalDate = document.getElementById('modalNewsletterDate');
        const modalContent = document.getElementById('modalNewsletterContent');
        
        if (!modal || !modalTitle || !modalDate || !modalContent) return;
        
        // Store current newsletter ID for comments
        this.currentNewsletterId = newsletterId;
        
        const date = new Date(newsletter.date);
        const formattedDate = date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        modalTitle.textContent = newsletter.title;
        modalDate.textContent = `${formattedDate} | By ${newsletter.author || 'Anonymous'}`;
        
        // Build content with media
        let contentHTML = '';
        
        // Add image if present
        if (newsletter.imageUrl) {
            contentHTML += `<div class="newsletter-media">
                <img src="${newsletter.imageUrl}" alt="Newsletter image" class="newsletter-image" />
            </div>`;
        }
        
        // Add video if present (support YouTube embeds)
        if (newsletter.videoUrl) {
            let videoEmbed = newsletter.videoUrl;
            // Convert YouTube watch URLs to embed URLs
            if (videoEmbed.includes('youtube.com/watch?v=')) {
                const videoId = videoEmbed.split('v=')[1].split('&')[0];
                videoEmbed = `https://www.youtube.com/embed/${videoId}`;
                contentHTML += `<div class="newsletter-media">
                    <iframe src="${videoEmbed}" class="newsletter-video" frameborder="0" allowfullscreen></iframe>
                </div>`;
            } else if (videoEmbed.includes('youtu.be/')) {
                const videoId = videoEmbed.split('youtu.be/')[1].split('?')[0];
                videoEmbed = `https://www.youtube.com/embed/${videoId}`;
                contentHTML += `<div class="newsletter-media">
                    <iframe src="${videoEmbed}" class="newsletter-video" frameborder="0" allowfullscreen></iframe>
                </div>`;
            } else {
                contentHTML += `<div class="newsletter-media">
                    <a href="${newsletter.videoUrl}" target="_blank" class="video-link">🎥 Watch Video</a>
                </div>`;
            }
        }
        
        // Add text content
        contentHTML += `<div class="newsletter-text">${this.escapeHtml(newsletter.content).replace(/\n/g, '<br>')}</div>`;
        
        modalContent.innerHTML = contentHTML;
        
        // Load comments for this newsletter
        this.loadComments(newsletterId);
        
        // Bind comment form event
        this.bindCommentFormEvents();
        
        modal.classList.add('active');
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }

    hideNewsletterModal() {
        const modal = document.getElementById('newsletterModal');
        
        if (modal) {
            modal.classList.remove('active');
        }
        
        // Restore body scroll
        document.body.style.overflow = '';
    }

    async deleteNewsletter(id) {
        const password = prompt('Please enter the admin password to delete this newsletter:');
        if (!password) {
            return;
        }
        
        if (password !== 'humanitieslmcm') {
            this.showNotification('Incorrect password. Deletion cancelled.', 'error');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this newsletter? This action cannot be undone.')) {
            return;
        }

        try {
            // Check if Firebase is initialized
            if (typeof db !== 'undefined' && db !== null) {
                // Delete from Firebase Firestore
                await db.collection('newsletters').doc(id).delete();
                console.log('Newsletter deleted from Firebase successfully');
            }
        } catch (error) {
            console.error('Failed to delete from Firebase:', error);
        }
        
        // Also delete from localStorage
        let newsletters = JSON.parse(localStorage.getItem('hishk_newsletters') || '[]');
        newsletters = newsletters.filter(newsletter => newsletter.id !== id);
        localStorage.setItem('hishk_newsletters', JSON.stringify(newsletters));
        
        this.loadNewsletters();
        this.showNotification('Newsletter deleted successfully.', 'info');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    handleCompetitionApplication(e) {
        const competitionId = e.target.getAttribute('data-competition');
        const competitionInfo = window.competitionData[competitionId];
        
        if (!competitionInfo) {
            this.showNotification('Competition information not found.', 'error');
            return;
        }
        
        this.showApplicationModal(competitionId, competitionInfo);
    }
    
    showApplicationModal(competitionId, competitionInfo) {
        const modal = document.getElementById('applicationModal');
        const modalTitle = document.getElementById('modalTitle');
        const teamMembersGroup = document.getElementById('teamMembersGroup');
        
        if (!modal || !modalTitle) return;
        
        // Update modal title
        modalTitle.textContent = `Apply for ${competitionInfo.title}`;
        
        // Show/hide team members field based on competition requirements
        if (teamMembersGroup) {
            if (competitionInfo.requiresTeam) {
                teamMembersGroup.style.display = 'block';
                const teamMembersLabel = teamMembersGroup.querySelector('label');
                if (teamMembersLabel) {
                    teamMembersLabel.textContent = `Team Member Names (${competitionInfo.teamSize})`;
                }
            } else {
                teamMembersGroup.style.display = 'none';
            }
        }
        
        // Store competition ID for form submission
        modal.setAttribute('data-competition', competitionId);
        
        // Show modal
        modal.classList.add('active');
        
        // Focus on first input
        setTimeout(() => {
            const nameInput = document.getElementById('applicantName');
            if (nameInput) nameInput.focus();
        }, 300);
    }
    
    hideApplicationModal() {
        const modal = document.getElementById('applicationModal');
        const form = document.getElementById('applicationForm');
        
        if (modal) {
            modal.classList.remove('active');
        }
        
        if (form) {
            form.reset();
        }
    }
    
    handleApplicationSubmit(e) {
        e.preventDefault();
        
        const modal = document.getElementById('applicationModal');
        const competitionId = modal.getAttribute('data-competition');
        const competitionInfo = window.competitionData[competitionId];
        
        const formData = new FormData(e.target);
        const application = {
            competition: competitionId,
            competitionTitle: competitionInfo.title,
            name: formData.get('name'),
            email: formData.get('email'),
            year: formData.get('year'),
            teamMembers: formData.get('teamMembers'),
            experience: formData.get('experience'),
            motivation: formData.get('motivation'),
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        };
        
        // Validate required fields
        if (!application.name || !application.email || !application.year || !application.motivation) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        // Validate team members for team competitions
        if (competitionInfo.requiresTeam && !application.teamMembers.trim()) {
            this.showNotification('Please list your team members for this competition.', 'error');
            return;
        }
        
        // Save application (in a real app, this would send to a server)
        this.saveApplication(application);
        this.hideApplicationModal();
        this.showNotification(`Application submitted successfully for ${competitionInfo.title}!`, 'success');
    }
    
    saveApplication(application) {
        let applications = JSON.parse(localStorage.getItem('hishk_applications') || '[]');
        applications.push(application);
        localStorage.setItem('hishk_applications', JSON.stringify(applications));
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${this.escapeHtml(message)}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
                    z-index: 1000;
                    min-width: 300px;
                    animation: slideInRight 0.3s ease;
                }
                
                .notification-success { border-left: 4px solid #4caf50; }
                .notification-error { border-left: 4px solid #f44336; }
                .notification-info { border-left: 4px solid #2196f3; }
                
                .notification-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #666;
                    margin-left: 16px;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Add to page
        document.body.appendChild(notification);

        // Bind close event
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => notification.remove());

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Event Management Functions
    showEventForm() {
        const form = document.getElementById('eventForm');
        if (form) {
            form.style.display = 'block';
            // Set today's date as default
            const dateInput = document.getElementById('eventDate');
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.value = today;
            }
        }
    }
    
    hideEventForm() {
        const form = document.getElementById('eventForm');
        if (form) {
            form.style.display = 'none';
            const formElement = document.getElementById('eventFormElement');
            if (formElement) {
                formElement.reset();
            }
        }
    }
    
    async handleEventSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const tagsString = formData.get('tags') || '';
        const event = {
            id: Date.now().toString(),
            name: formData.get('name'),
            date: formData.get('date'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            hosts: formData.get('hosts'),
            description: formData.get('description'),
            tags: tagsString ? tagsString.split(',').map(tag => tag.trim()) : [],
            location: formData.get('location') || '',
            capacity: formData.get('capacity') || '',
            formUrl: formData.get('formUrl') || '',
            timestamp: new Date().toISOString()
        };
        
        try {
            // Check if Firebase is initialized
            if (typeof db === 'undefined' || db === null) {
                console.error('Firebase not initialized for events.');
                // Save to localStorage only when Firebase unavailable
                let events = JSON.parse(localStorage.getItem('hishk_events') || '[]');
                events.unshift(event);
                localStorage.setItem('hishk_events', JSON.stringify(events));
                
                this.hideEventForm();
                this.loadEvents();
                this.showNotification('Event saved locally!', 'success');
                return;
            }
            
            // Save to Firebase Firestore (primary storage)
            await db.collection('events').doc(event.id).set(event);
            console.log('Event saved to Firebase successfully');
            
            // Clear localStorage after successful Firebase save to prevent conflicts
            localStorage.removeItem('hishk_events');
            
            this.hideEventForm();
            this.loadEvents();
            this.showNotification('Event created successfully!', 'success');
        } catch (error) {
            console.error('Failed to create event:', error);
            // Save to localStorage only as fallback
            let events = JSON.parse(localStorage.getItem('hishk_events') || '[]');
            events.unshift(event);
            localStorage.setItem('hishk_events', JSON.stringify(events));
            
            this.hideEventForm();
            this.loadEvents();
            this.showNotification('Event saved locally. Will sync when online.', 'info');
        }
    }
    
    async loadEvents() {
        try {
            let events = [];
            
            // Check if Firebase is initialized
            if (typeof db === 'undefined' || db === null) {
                console.warn('Firebase not initialized for events.');
                // Load from localStorage only when Firebase unavailable
                events = JSON.parse(localStorage.getItem('hishk_events') || '[]');
            } else {
                console.log('Fetching events from Firebase...');
                
                // Get events from Firebase Firestore (primary source)
                const snapshot = await db.collection('events')
                    .orderBy('timestamp', 'desc')
                    .get();
                
                snapshot.forEach(doc => {
                    events.push(doc.data());
                });
                
                console.log(`Found ${events.length} events in Firebase`);
                
                // Use only Firebase data when online to prevent conflicts
                // Do not merge with localStorage
            }
            
            this.displayEvents(events);
        } catch (error) {
            console.error('Failed to load events from Firebase:', error);
            // Use localStorage only as fallback when Firebase fails
            const localEvents = JSON.parse(localStorage.getItem('hishk_events') || '[]');
            this.displayEvents(localEvents);
        }
    }
    
    displayEvents(events) {
        const container = document.getElementById('eventsGrid');
        if (!container) return;
        
        // Create dynamic events HTML
        const dynamicEvents = events.map(event => this.createEventCardHTML(event)).join('');
        
        // Add default static events HTML
        const staticEventsHTML = this.getStaticEventsHTML();
        
        container.innerHTML = dynamicEvents + staticEventsHTML;
        
        // Rebind event listeners for new cards
        container.querySelectorAll('.apply-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.dataset.formUrl) {
                    window.open(e.target.dataset.formUrl, '_blank');
                } else {
                    this.handleCompetitionApplication(e);
                }
            });
        });
        
        container.querySelectorAll('.delete-event-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteEvent(e.target.dataset.id));
        });
    }
    
    displayDefaultEvents() {
        const container = document.getElementById('eventsGrid');
        if (!container) return;
        
        container.innerHTML = this.getStaticEventsHTML();
    }
    
    getStaticEventsHTML() {
        // Return empty string - no default events
        return '';
    }
    
    createEventCardHTML(event) {
        const date = new Date(event.date);
        const formattedDate = date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const hostsString = Array.isArray(event.hosts) ? event.hosts.join(', ') : event.hosts;
        const tagsHTML = event.tags && event.tags.length > 0 
            ? event.tags.map(tag => `<span class="detail">${this.escapeHtml(tag)}</span>`).join('')
            : '';
        
        return `
            <div class="competition-card current">
                <div class="competition-status">User Created</div>
                <h3>${this.escapeHtml(event.name)}</h3>
                <p class="competition-date">${formattedDate} | ${event.startTime} - ${event.endTime}</p>
                <p class="competition-desc">${this.escapeHtml(event.description)}</p>
                <div class="event-meta">
                    <p class="event-hosts"><strong>Hosted by:</strong> ${this.escapeHtml(hostsString)}</p>
                    <p class="event-location"><strong>Location:</strong> ${this.escapeHtml(event.location)}</p>
                    ${event.capacity ? `<p class="event-capacity"><strong>Capacity:</strong> ${event.capacity} participants</p>` : ''}
                </div>
                ${tagsHTML ? `<div class="competition-details">${tagsHTML}</div>` : ''}
                <div class="event-actions">
                    ${event.formUrl 
                        ? `<button class="apply-btn" data-form-url="${event.formUrl}">Apply Now</button>`
                        : `<button class="apply-btn" data-competition="${event.id}">Apply Now</button>`
                    }
                    <button class="delete-event-btn" data-id="${event.id}">Delete</button>
                </div>
            </div>
        `;
    }
    
    async deleteEvent(id) {
        const password = prompt('Please enter the admin password to delete this event:');
        if (!password) {
            return;
        }
        
        if (password !== 'humanitieslmcm') {
            this.showNotification('Incorrect password. Deletion cancelled.', 'error');
            return;
        }
        
        if (!confirm('Are you sure you want to delete this event?')) {
            return;
        }
        
        try {
            // Check if Firebase is initialized
            if (typeof db !== 'undefined' && db !== null) {
                // Delete from Firebase Firestore
                await db.collection('events').doc(id).delete();
                console.log('Event deleted from Firebase successfully');
            }
        } catch (error) {
            console.error('Failed to delete event from Firebase:', error);
        }
        
        // Also delete from localStorage
        let events = JSON.parse(localStorage.getItem('hishk_events') || '[]');
        events = events.filter(event => event.id !== id);
        localStorage.setItem('hishk_events', JSON.stringify(events));
        
        this.loadEvents();
        this.showNotification('Event deleted successfully.', 'info');
    }

    // Comment functionality methods
    bindCommentFormEvents() {
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            // Remove any existing event listeners first
            if (this.commentFormHandler) {
                commentForm.removeEventListener('submit', this.commentFormHandler);
            }
            
            // Create bound handler
            this.commentFormHandler = (e) => this.handleCommentSubmit(e);
            
            // Add new event listener
            commentForm.addEventListener('submit', this.commentFormHandler);
        }
    }

    async handleCommentSubmit(e) {
        e.preventDefault();
        
        if (!this.currentNewsletterId) {
            console.error('No newsletter ID found for comment');
            return;
        }
        
        const authorInput = document.getElementById('commentAuthor');
        const contentInput = document.getElementById('commentContent');
        
        if (!contentInput || !contentInput.value.trim()) {
            this.showNotification('Please write a comment before submitting.', 'error');
            return;
        }
        
        const comment = {
            id: Date.now().toString(),
            newsletterId: this.currentNewsletterId,
            author: authorInput.value.trim() || 'Anonymous',
            content: contentInput.value.trim(),
            date: new Date().toISOString()
        };
        
        try {
            await this.saveComment(comment);
            
            // Clear form
            authorInput.value = '';
            contentInput.value = '';
            
            // Reload comments
            this.loadComments(this.currentNewsletterId);
            
            this.showNotification('Comment posted successfully!', 'success');
        } catch (error) {
            console.error('Error posting comment:', error);
            this.showNotification('Failed to post comment. Please try again.', 'error');
        }
    }

    async saveComment(comment) {
        console.log('Attempting to save comment:', comment);
        
        try {
            // Check if Firebase is initialized
            if (typeof db === 'undefined' || db === null) {
                console.warn('Firebase not initialized. Saving comment to localStorage only.');
                // Save only to localStorage when Firebase unavailable
                let comments = JSON.parse(localStorage.getItem('hishk_comments') || '[]');
                comments.push(comment);
                localStorage.setItem('hishk_comments', JSON.stringify(comments));
                console.log('Comment saved to localStorage:', comment);
                return comment;
            }
            
            console.log('Saving comment to Firebase...', comment);
            // Save to Firebase Firestore (primary storage)
            await db.collection('comments').doc(comment.id).set(comment);
            console.log('Comment saved to Firebase successfully:', comment.id);
            
            // Clear localStorage comments after successful Firebase save
            // This prevents duplicate/conflicting data between devices
            localStorage.removeItem('hishk_comments');
            
            return comment;
        } catch (error) {
            console.error('Failed to save comment to Firebase:', error);
            console.error('Error details:', error.message, error.code);
            
            // Fallback to localStorage only if Firebase fails
            let comments = JSON.parse(localStorage.getItem('hishk_comments') || '[]');
            comments.push(comment);
            localStorage.setItem('hishk_comments', JSON.stringify(comments));
            
            console.log('Comment saved to localStorage as fallback');
            this.showNotification('Comment saved locally. Will sync when online.', 'info');
            return comment;
        }
    }

    async getComments(newsletterId) {
        try {
            // Check if Firebase is initialized
            if (typeof db === 'undefined' || db === null) {
                console.warn('Firebase not initialized. Using localStorage for comments.');
                const localComments = JSON.parse(localStorage.getItem('hishk_comments') || '[]');
                return localComments
                    .filter(c => c.newsletterId === newsletterId)
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
            }
            
            // Get comments from Firebase Firestore (primary source)
            const snapshot = await db.collection('comments')
                .where('newsletterId', '==', newsletterId)
                .orderBy('date', 'desc')
                .get();
            
            const firebaseComments = [];
            snapshot.forEach(doc => {
                firebaseComments.push(doc.data());
            });
            
            console.log(`Found ${firebaseComments.length} comments in Firebase for newsletter ${newsletterId}`);
            
            // Return only Firebase comments when online
            // This prevents conflicts between devices
            return firebaseComments;
            
        } catch (error) {
            console.error('Error fetching comments from Firebase:', error);
            
            // Fallback to localStorage only when Firebase fails
            const localComments = JSON.parse(localStorage.getItem('hishk_comments') || '[]');
            return localComments
                .filter(c => c.newsletterId === newsletterId)
                .sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    }

    async loadComments(newsletterId) {
        const commentsList = document.getElementById('commentsList');
        if (!commentsList) return;
        
        const comments = await this.getComments(newsletterId);
        
        if (comments.length === 0) {
            commentsList.innerHTML = `
                <div class="no-comments">
                    <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
            `;
            return;
        }
        
        commentsList.innerHTML = comments.map(comment => this.createCommentHTML(comment)).join('');
        
        // Bind delete comment events
        commentsList.querySelectorAll('.delete-comment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteComment(e.target.dataset.id));
        });
    }

    createCommentHTML(comment) {
        const date = new Date(comment.date);
        const formattedDate = date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="comment-item">
                <div class="comment-header-info">
                    <span class="comment-author">${this.escapeHtml(comment.author)}</span>
                    <span class="comment-date">${formattedDate}</span>
                </div>
                <div class="comment-content">${this.escapeHtml(comment.content)}</div>
                <div class="comment-actions">
                    <button class="delete-comment-btn" data-id="${comment.id}">Delete</button>
                </div>
            </div>
        `;
    }

    async deleteComment(id) {
        const password = prompt('Please enter the admin password to delete this comment:');
        if (!password) {
            return;
        }
        
        if (password !== 'humanitieslmcm') {
            this.showNotification('Incorrect password. Deletion cancelled.', 'error');
            return;
        }
        
        try {
            // Check if Firebase is initialized
            if (typeof db !== 'undefined' && db !== null) {
                // Delete from Firebase Firestore
                await db.collection('comments').doc(id).delete();
                console.log('Comment deleted from Firebase successfully');
            }
        } catch (error) {
            console.error('Failed to delete comment from Firebase:', error);
        }
        
        // Also delete from localStorage
        let comments = JSON.parse(localStorage.getItem('hishk_comments') || '[]');
        comments = comments.filter(comment => comment.id !== id);
        localStorage.setItem('hishk_comments', JSON.stringify(comments));
        
        // Reload comments
        this.loadComments(this.currentNewsletterId);
        this.showNotification('Comment deleted successfully.', 'info');
    }
}

// Initialize the website when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HISHKHumanitiesSociety();
});

// Handle browser back/forward navigation
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.tab) {
        const navLink = document.querySelector(`[data-tab="${e.state.tab}"]`);
        if (navLink) {
            navLink.click();
        }
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('applicationModal');
        if (modal && modal.classList.contains('active')) {
            const society = new HISHKHumanitiesSociety();
            society.hideApplicationModal();
        }
    }
});

// Add some smooth scroll behavior for anchor links
document.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});