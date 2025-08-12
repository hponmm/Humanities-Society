// HISHK Humanities Society Website JavaScript
// Tab switching and newsletter management functionality

class HISHKHumanitiesSociety {
    constructor() {
        this.init();
        this.loadNewsletters();
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

    handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newsletter = {
            id: Date.now().toString(),
            title: formData.get('title'),
            date: formData.get('date'),
            content: formData.get('content'),
            timestamp: new Date().toISOString()
        };

        // Validate required fields
        if (!newsletter.title || !newsletter.date || !newsletter.content) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }

        this.saveNewsletter(newsletter);
        this.hideNewsletterForm();
        this.loadNewsletters();
        this.showNotification('Newsletter published successfully!', 'success');
    }

    saveNewsletter(newsletter) {
        let newsletters = this.getNewsletters();
        newsletters.unshift(newsletter); // Add to beginning of array
        localStorage.setItem('hishk_newsletters', JSON.stringify(newsletters));
    }

    getNewsletters() {
        const stored = localStorage.getItem('hishk_newsletters');
        return stored ? JSON.parse(stored) : this.getDefaultNewsletters();
    }

    getDefaultNewsletters() {
        return [
            {
                id: '1',
                title: 'Week of March 4-10, 2024',
                date: '2024-03-10',
                content: `Dear HISHK Humanities Society Members,

Welcome to our latest newsletter! This week has been filled with exciting discoveries in history and politics, plus upcoming intellectual opportunities.

🏛️ ACHIEVEMENTS THIS WEEK:
• Congratulations to our debate team for winning the Inter-School Political Philosophy Championship
• Sarah Chen received recognition for her research on "Hong Kong's Democratic Movement" at the Youth Political Forum
• Our Model UN delegation successfully represented China, UK, and Canada at the Asia-Pacific Youth Summit

📚 UPCOMING EVENTS:
• March 15: International History Olympiad (registration closes March 12)
• March 18: Weekly seminar - "The Rise and Fall of Empires" (Room 204, 4:00 PM)
• March 22: Guest lecture by Professor David Kim on "East Asian Political Systems" (Main Auditorium, 2:00 PM)
• March 25: Historical site visit to the Hong Kong Museum of History

💡 HUMANITIES TIP OF THE WEEK:
When studying historical events, always consider multiple perspectives. Primary sources from different viewpoints will give you a more complete understanding of any historical moment.

📖 RECOMMENDED READING:
• "Sapiens: A Brief History of Humankind" by Yuval Noah Harari
• "The Clash of Civilizations" by Samuel P. Huntington
• "Hong Kong: A Political History" by Steve Tsang

Keep exploring the depths of human experience, and remember - understanding our past illuminates our future!

Best regards,
The Editorial Team`,
                timestamp: '2024-03-10T10:00:00Z'
            },
            {
                id: '2',
                title: 'Week of February 26 - March 3, 2024',
                date: '2024-03-03',
                content: `Dear Humanities Society Members,

Another intellectually stimulating week has passed, and we're excited to share our latest historical and political discoveries with you all.

🎯 HIGHLIGHTS:
• James Park's research paper on "The Impact of Colonial Legacy on Hong Kong's Political Development" has been accepted for publication in the Asian Student Historical Review
• Our political debate team placed 1st in the Regional Political Philosophy Championship
• Emma Liu organized a successful peer discussion on "Women's Suffrage Movements Across Cultures"

🏛️ HISTORY CORNER:
This week we explored the fascinating parallels between ancient Roman governance and modern democratic systems. Did you know that many of our contemporary political concepts can be traced back to Roman innovations in civic organization?

📅 UPCOMING WORKSHOPS:
• March 8: "Primary Source Analysis Techniques" workshop with university historians
• March 10: "Writing Compelling Historical Arguments" masterclass
• March 12: "Understanding Political Ideologies" seminar series

🌟 MEMBER SPOTLIGHT:
This week we feature Alex Chen (Year 11) who recently won the Hong Kong Young Historians Competition with his documentary on "The Evolution of Hong Kong Identity." His passion for connecting past and present exemplifies our society's mission.

📚 STUDY GROUP UPDATES:
• Ancient Civilizations: Tuesdays & Thursdays, 3:30 PM - Room 201
• Modern Politics: Wednesdays & Fridays, 4:00 PM - Conference Room B
• Cultural Studies: Mondays, 3:30 PM - Library Discussion Space

Until next week, keep questioning, exploring, and connecting the threads of human experience!

Editorial Committee
HISHK Humanities Society`,
                timestamp: '2024-03-03T10:00:00Z'
            },
            {
                id: '3',
                title: 'Competition Applications Now Open!',
                date: '2024-02-20',
                content: `Dear Humanities Society Members,

We're thrilled to announce that applications are now open for all our upcoming competitions and events!

🏆 NOW ACCEPTING APPLICATIONS:
• HISHK History Bowl Championship - March 15
• Political Philosophy Debate Tournament - March 22
• HISHK Mini Model United Nations - April 5
• Student Historical Research Symposium - April 12
• Cultural Heritage Essay Competition - May 8
• Humanities Quiz Night - May 15

📝 HOW TO APPLY:
Visit the Competitions & Events tab on our website and click "Apply Now" for any event that interests you. Each competition has its own requirements and format.

💡 APPLICATION TIPS:
• Apply early - some competitions have limited spots
• For team events, make sure all members are committed
• Highlight relevant experience in your application
• Don't be afraid to apply even if you're new to the subject!

🎯 WHY PARTICIPATE:
Our competitions are designed to challenge you intellectually while providing a supportive environment to explore your passions in history and politics. Plus, they look great on university applications!

Questions? Contact any of our founders or email us directly.

Looking forward to seeing your applications!

The HISHK Humanities Society Team`,
                timestamp: '2024-02-20T10:00:00Z'
            }
        ];
    }

    loadNewsletters() {
        const newsletters = this.getNewsletters();
        const container = document.getElementById('newslettersArchive');
        
        if (!container) return;

        if (newsletters.length === 0) {
            container.innerHTML = `
                <div class="no-newsletters">
                    <p>No newsletters published yet. Click "Add New Newsletter" to create the first one!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = newsletters.map(newsletter => this.createNewsletterHTML(newsletter)).join('');
        
        // Bind delete events
        container.querySelectorAll('.delete-newsletter').forEach(btn => {
            btn.addEventListener('click', (e) => this.deleteNewsletter(e.target.dataset.id));
        });
    }

    createNewsletterHTML(newsletter) {
        const date = new Date(newsletter.date);
        const formattedDate = date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <div class="newsletter-item" data-id="${newsletter.id}">
                <div class="newsletter-header">
                    <h3 class="newsletter-title">${this.escapeHtml(newsletter.title)}</h3>
                    <div class="newsletter-date">${formattedDate}</div>
                </div>
                <div class="newsletter-content">${this.escapeHtml(newsletter.content)}</div>
                <div class="newsletter-actions">
                    <button class="btn-small delete delete-newsletter" data-id="${newsletter.id}">Delete</button>
                </div>
            </div>
        `;
    }

    deleteNewsletter(id) {
        if (!confirm('Are you sure you want to delete this newsletter? This action cannot be undone.')) {
            return;
        }

        let newsletters = this.getNewsletters();
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