// HISHK Humanities Society Website JavaScript
// Tab switching and newsletter management functionality

class HISHKHumanitiesSociety {
    constructor() {
        this.init();
        this.loadNewsletters();
        this.loadEvents();
    }

    init() {
        this.bindEvents();
        this.initializeMobileMenu();
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
        const newsletterForm = document.getElementById('newsletterForm');
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
        
        // Author search functionality
        const authorSearch = document.getElementById('authorSearch');
        const clearSearch = document.getElementById('clearSearch');
        
        if (authorSearch) {
            authorSearch.addEventListener('input', (e) => this.handleAuthorSearch(e.target.value));
        }
        
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                if (authorSearch) authorSearch.value = '';
                this.loadNewsletters();
            });
        }
        
        // Event form
        const addEventBtn = document.getElementById('addEventBtn');
        const eventForm = document.getElementById('eventForm');
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
                console.error('Firebase not initialized. Using localStorage fallback.');
                throw new Error('Firebase not initialized');
            }
            
            console.log('Attempting to save to Firebase:', newsletter);
            
            // Save to Firebase Firestore
            await db.collection('newsletters').doc(newsletter.id).set(newsletter);
            console.log('Newsletter saved to Firebase successfully');
            
            // Also save to localStorage as backup
            let newsletters = JSON.parse(localStorage.getItem('hishk_newsletters') || '[]');
            newsletters.unshift(newsletter);
            localStorage.setItem('hishk_newsletters', JSON.stringify(newsletters));
            
            return newsletter;
        } catch (error) {
            console.error('Failed to save newsletter to Firebase:', error);
            console.error('Error details:', error.message, error.code);
            
            // Fallback to localStorage if Firebase is offline
            let newsletters = JSON.parse(localStorage.getItem('hishk_newsletters') || '[]');
            newsletters.unshift(newsletter);
            localStorage.setItem('hishk_newsletters', JSON.stringify(newsletters));
            
            // Still show success if saved locally
            console.log('Newsletter saved to localStorage as fallback');
            return newsletter;
        }
    }

    async getNewsletters() {
        try {
            // Check if Firebase is initialized
            if (typeof db === 'undefined' || db === null) {
                console.warn('Firebase not initialized. Using local storage.');
                const localNewsletters = JSON.parse(localStorage.getItem('hishk_newsletters') || '[]');
                const allNewsletters = [...localNewsletters, ...this.getDefaultNewsletters()];
                // Remove duplicates based on id
                const uniqueNewsletters = allNewsletters.filter((newsletter, index, self) =>
                    index === self.findIndex((n) => n.id === newsletter.id)
                );
                return uniqueNewsletters;
            }
            
            console.log('Fetching newsletters from Firebase...');
            
            // Get newsletters from Firebase Firestore
            const snapshot = await db.collection('newsletters')
                .orderBy('timestamp', 'desc')
                .get();
            
            const firebaseNewsletters = [];
            snapshot.forEach(doc => {
                firebaseNewsletters.push(doc.data());
            });
            
            console.log(`Found ${firebaseNewsletters.length} newsletters in Firebase`);
            
            // Combine Firebase, localStorage, and default newsletters
            const localNewsletters = JSON.parse(localStorage.getItem('hishk_newsletters') || '[]');
            const allNewsletters = [...firebaseNewsletters, ...localNewsletters, ...this.getDefaultNewsletters()];
            
            // Remove duplicates based on id
            const uniqueNewsletters = allNewsletters.filter((newsletter, index, self) =>
                index === self.findIndex((n) => n.id === newsletter.id)
            );
            
            return uniqueNewsletters;
        } catch (error) {
            console.warn('Failed to fetch from Firebase, using fallback:', error);
            // Try localStorage fallback
            const localNewsletters = JSON.parse(localStorage.getItem('hishk_newsletters') || '[]');
            const allNewsletters = [...localNewsletters, ...this.getDefaultNewsletters()];
            // Remove duplicates based on id
            const uniqueNewsletters = allNewsletters.filter((newsletter, index, self) =>
                index === self.findIndex((n) => n.id === newsletter.id)
            );
            return uniqueNewsletters;
        }
    }

    getDefaultNewsletters() {
        return [
            {
                id: '1',
                title: 'Historical Perspectives on Democracy',
                date: '2024-03-08',
                author: 'The Editorial Committee',
                content: `Dear HISHK Humanities Society Members,

This week, we delve deep into the fascinating evolution of democratic ideals, tracing their journey from the ancient agora of Athens to the modern parliamentary chambers of today.

DEMOCRACY THROUGH THE AGES

Ancient Athens gave us the foundational concept of democracy - "rule by the people." However, their version was quite different from our modern understanding. Only free male citizens could participate, excluding women, slaves, and foreigners. This limited participation raises important questions about inclusivity that remain relevant today.

The Roman Republic introduced representative elements that would later influence modern democratic systems. Their concept of checks and balances, with consuls, senate, and popular assemblies, provided a framework that inspired the American founding fathers centuries later.

MEDIEVAL AND RENAISSANCE DEVELOPMENTS

During the medieval period, democratic ideals seemed to fade, replaced by feudalism and absolute monarchy. However, institutions like the English Parliament (established in 1066) began to limit royal power, creating precedents for constitutional government.

The Renaissance brought renewed interest in classical texts and democratic theory. Thinkers like Machiavelli examined the nature of political power, while others explored concepts of natural rights and social contracts.

MODERN DEMOCRATIC EVOLUTION

The Enlightenment marked a turning point. John Locke's theories on government by consent, Montesquieu's separation of powers, and Rousseau's social contract theory laid intellectual groundwork for modern democracy.

The American and French Revolutions put these theories into practice, though with mixed results. The American system balanced federal and state powers, while the French Revolution showed both the promise and perils of rapid democratic change.

CONTEMPORARY CHALLENGES

Today, democracy faces new challenges: social media's impact on public discourse, the rise of populism, and questions about direct versus representative democracy. Understanding historical precedents helps us navigate these modern dilemmas.

Our next seminar will explore these themes further. Join us Monday, March 11th, at 4:00 PM in Conference Room A.

Best regards,
The Editorial Committee`,
                timestamp: '2024-03-08T10:00:00Z'
            },
            {
                id: '2',
                title: 'Cultural Exchange in the Silk Road Era',
                date: '2024-03-01',
                author: 'Michelle Ko',
                content: `Dear Members,

The Silk Road was far more than a trade route - it was history's greatest cultural exchange network, connecting civilizations and shaping the world as we know it.

THE NETWORK OF NETWORKS

Spanning over 4,000 miles from China to the Mediterranean, the Silk Road wasn't a single road but a complex network of trade routes. Merchants, pilgrims, diplomats, and scholars traveled these paths, carrying not just goods but ideas, technologies, and beliefs.

ECONOMIC FOUNDATIONS

While silk gave the route its name, the trade was incredibly diverse. From China came silk, tea, and porcelain. Central Asia contributed horses and jade. The Middle East offered spices and precious metals. This economic foundation made possible the cultural exchange that followed.

TECHNOLOGICAL TRANSFER

Perhaps the most significant aspect was technological diffusion. Paper-making spread from China to the Islamic world and eventually to Europe. The magnetic compass revolutionized navigation. Mathematical concepts, including the numeral system we use today, traveled along these routes.

RELIGIOUS AND PHILOSOPHICAL EXCHANGE

Buddhism spread along the Silk Road from India to China, adapting to local cultures along the way. Islamic scholarship preserved and transmitted Greek philosophical works. Christian communities established themselves in Central Asia, creating unique cultural syntheses.

ARTISTIC FUSION

The artistic legacy is remarkable. Gandhara sculptures show Greek influence on Buddhist art. Persian miniatures reflect Chinese techniques. Musical instruments traveled across continents, creating new forms of cultural expression.

LINGUISTIC IMPACT

Languages borrowed extensively from each other. Chinese adopted Sanskrit terms for Buddhist concepts. Persian vocabulary entered numerous languages. This linguistic exchange enriched human communication across cultures.

LESSONS FOR TODAY

The Silk Road demonstrates that globalization isn't new - cultural exchange has always driven human progress. However, it also shows that successful exchange requires mutual respect and understanding, something we must remember in our interconnected world.

Our upcoming field trip to the Hong Kong Museum of History will explore these themes through their Silk Road exhibition. Sign up by March 5th!

Academically yours,
Michelle Ko, Newsletter Editor`,
                timestamp: '2024-03-01T10:00:00Z'
            },
            {
                id: '3',
                title: 'Modern Political Movements in Asia',
                date: '2024-02-23',
                author: 'Carmilla Wang',
                content: `Dear Humanities Society,

Asia's political landscape has undergone remarkable transformation in recent decades. Understanding these changes provides crucial insight into contemporary global politics.

DEMOCRATIC TRANSITIONS

South Korea's transition from military dictatorship to vibrant democracy exemplifies successful democratization. The 1987 pro-democracy movements, led largely by students and civil society, created foundations for today's robust democratic institutions.

Taiwan's democratization followed a similar pattern, with the lifting of martial law in 1987 marking the beginning of political liberalization. The Sunflower Student Movement of 2014 showed how younger generations continue to shape democratic discourse.

CHALLENGES TO DEMOCRACY

However, democratic backsliding concerns many observers. Thailand's cycle of coups and constitutional crises illustrates how fragile democratic institutions can be. Military interventions in 2006 and 2014 disrupted democratic processes, leading to ongoing political polarization.

Myanmar's return to military rule in 2021 represents one of the most dramatic reversals, undoing a decade of democratic progress and highlighting the persistent influence of military institutions in politics.

YOUTH MOVEMENTS

Young people have been at the forefront of political change across Asia. Hong Kong's Umbrella Movement and more recent protests demonstrated how students can mobilize for political reform. Similar youth-led movements in Thailand and Myanmar show this pattern extending across the region.

These movements often use social media and innovative protest tactics, adapting traditional forms of political action to digital age realities.

ECONOMIC AND POLITICAL DEVELOPMENT

The relationship between economic growth and political development remains complex. While South Korea and Taiwan democratized alongside economic development, China's economic success hasn't led to similar political liberalization.

Singapore's model of economic success with limited political competition offers another variant, challenging simple relationships between prosperity and democracy.

REGIONAL ORGANIZATIONS

ASEAN's role in regional politics reflects tensions between sovereignty and cooperation. The organization's non-interference principle sometimes conflicts with democratic values, as seen in responses to Myanmar's coup.

IMPLICATIONS FOR GLOBAL POLITICS

Asia's political developments have global significance. The region's economic importance means political stability here affects worldwide prosperity. Democratic movements inspire similar efforts globally, while authoritarian responses provide cautionary examples.

Understanding these dynamics helps us analyze not just Asian politics, but broader patterns of political change in our interconnected world.

Next week, we'll host Dr. Sarah Kim from HKU for a lecture on "Youth Politics in Contemporary Asia." Tuesday, February 27th, 3:30 PM in the Main Auditorium.

Analytically yours,
Carmilla Wang, Society President`,
                timestamp: '2024-02-23T10:00:00Z'
            }
        ];
    }

    async loadNewsletters(filterAuthor = '') {
        let newsletters = await this.getNewsletters();
        const container = document.getElementById('newslettersArchive');
        
        if (!container) return;

        // Filter by author if search term provided
        if (filterAuthor) {
            newsletters = newsletters.filter(n => 
                (n.author || 'Anonymous').toLowerCase().includes(filterAuthor.toLowerCase())
            );
        }

        if (newsletters.length === 0) {
            container.innerHTML = `
                <div class="no-newsletters">
                    <p>${filterAuthor ? `No newsletters found by author "${filterAuthor}"` : 'No newsletters published yet. Click "Add New Newsletter" to create the first one!'}</p>
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
    
    handleAuthorSearch(searchTerm) {
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
            // Delete from Firebase Firestore
            await db.collection('newsletters').doc(id).delete();
            console.log('Newsletter deleted from Firebase successfully');
        } catch (error) {
            console.error('Failed to delete from Firebase:', error);
            // Fallback to localStorage if Firebase is offline
            let newsletters = await this.getNewsletters();
            newsletters = newsletters.filter(newsletter => newsletter.id !== id);
            localStorage.setItem('hishk_newsletters', JSON.stringify(newsletters));
        }
        
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
            form.classList.add('active');
        }
    }
    
    hideEventForm() {
        const form = document.getElementById('eventForm');
        if (form) {
            form.classList.remove('active');
            const formElement = document.getElementById('eventFormElement');
            if (formElement) {
                formElement.reset();
            }
        }
    }
    
    async handleEventSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const event = {
            id: Date.now().toString(),
            name: formData.get('name'),
            date: formData.get('date'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            hosts: formData.get('hosts'),
            description: formData.get('description'),
            tags: formData.get('tags') || '',
            location: formData.get('location') || '',
            capacity: formData.get('capacity') || '',
            formUrl: formData.get('formUrl') || '',
            timestamp: new Date().toISOString()
        };
        
        try {
            // Save to Firebase Firestore
            await db.collection('events').doc(event.id).set(event);
            console.log('Event saved to Firebase successfully');
            
            this.hideEventForm();
            this.loadEvents();
            this.showNotification('Event created successfully!', 'success');
        } catch (error) {
            console.error('Failed to create event:', error);
            this.showNotification('Failed to create event. Please try again.', 'error');
        }
    }
    
    async loadEvents() {
        try {
            // Get events from Firebase Firestore
            const snapshot = await db.collection('events')
                .orderBy('timestamp', 'desc')
                .get();
            
            const events = [];
            snapshot.forEach(doc => {
                events.push(doc.data());
            });
            
            this.displayEvents(events);
        } catch (error) {
            console.error('Failed to load events from Firebase:', error);
            // Display default events if Firebase is offline
            this.displayDefaultEvents();
        }
    }
    
    displayEvents(events) {
        const container = document.getElementById('eventsGrid');
        if (!container) return;
        
        // Keep existing static events and add dynamic ones
        const staticEvents = container.innerHTML;
        const dynamicEvents = events.map(event => this.createEventCardHTML(event)).join('');
        
        container.innerHTML = dynamicEvents + staticEvents;
        
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
        // Just keep the existing HTML events
        const container = document.getElementById('eventsGrid');
        if (!container) return;
        // Events are already in HTML, no need to add anything
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
            // Delete from Firebase Firestore
            await db.collection('events').doc(id).delete();
            console.log('Event deleted from Firebase successfully');
            
            this.loadEvents();
            this.showNotification('Event deleted successfully.', 'info');
        } catch (error) {
            console.error('Failed to delete event from Firebase:', error);
            this.showNotification('Failed to delete event. Please try again.', 'error');
        }
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