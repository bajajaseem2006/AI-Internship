// Certificate Authenticity Validator - Complete Fix with Visible Content
class CertificateValidator {
    constructor() {
        this.certificates = [];
        this.verificationStats = {};
        this.recentVerifications = [];
        this.currentTab = 'dashboard';
        this.isProcessing = false;
        this.currentSessionId = null;
        this.ocrTemplates = this.createOCRTemplates();
        this.initialized = false;
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Certificate Validator...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupApplication();
            });
        } else {
            // DOM is already ready
            setTimeout(() => this.setupApplication(), 50);
        }
    }

    setupApplication() {
        console.log('🔧 Setting up application...');
        
        // Load data first
        this.loadData();
        
        // Force show all tab content initially
        this.ensureTabContentVisibility();
        
        // Setup navigation with proper event handling
        this.setupRobustNavigation();
        
        // Render initial content
        this.renderDashboard();
        this.renderAdminPanel();
        
        // Setup all other event listeners
        this.setupAllEventListeners();
        
        // Initialize dashboard view with content visible
        this.switchTab('dashboard');
        
        // Setup charts after a short delay
        setTimeout(() => {
            this.setupCharts();
            this.initialized = true;
            console.log('✅ Certificate Validator fully initialized with visible content!');
        }, 300);
    }

    ensureTabContentVisibility() {
        console.log('👁️ Ensuring tab content visibility...');
        
        // Force all tab content sections to be visible in DOM
        const tabContents = document.querySelectorAll('.tab-content');
        console.log('Found tab contents:', tabContents.length);
        
        tabContents.forEach((tab, index) => {
            // Ensure basic visibility
            tab.style.position = 'relative';
            tab.style.zIndex = '1';
            tab.style.minHeight = '200px';
            
            // Only hide non-active tabs
            if (!tab.classList.contains('active')) {
                tab.style.display = 'none';
            } else {
                tab.style.display = 'block';
                tab.style.visibility = 'visible';
                tab.style.opacity = '1';
            }
            
            console.log(`Tab ${index} (${tab.id}):`, {
                display: tab.style.display,
                visibility: tab.style.visibility,
                active: tab.classList.contains('active')
            });
        });
    }

    setupRobustNavigation() {
        console.log('🧭 Setting up robust navigation...');
        
        // Get all navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        console.log('Found navigation buttons:', navButtons.length);

        // Setup each navigation button with proper event handling
        navButtons.forEach((btn, index) => {
            const tabName = btn.getAttribute('data-tab');
            console.log(`Setting up nav button ${index}: "${btn.textContent.trim()}" -> ${tabName}`);
            
            // Ensure button is fully functional
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto';
            btn.style.userSelect = 'none';
            
            // Remove any existing listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // Add robust click handler
            const handleNavClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🔄 Navigation clicked:', tabName);
                
                if (tabName && tabName !== this.currentTab) {
                    this.switchTab(tabName);
                } else if (tabName === this.currentTab) {
                    console.log('Same tab clicked, refreshing content...');
                    this.refreshCurrentTab();
                }
            };

            // Multiple event handlers for maximum compatibility
            newBtn.addEventListener('click', handleNavClick);
            newBtn.addEventListener('mousedown', (e) => e.preventDefault());
            newBtn.addEventListener('touchstart', handleNavClick, { passive: false });
        });
    }

    switchTab(tabName) {
        console.log('🔀 Switching to tab:', tabName);
        
        if (!tabName) {
            console.error('❌ No tab name provided');
            return;
        }

        // Update navigation buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-tab') === tabName) {
                btn.classList.add('active');
                console.log('✅ Activated nav button:', btn.textContent.trim());
            }
        });

        // Hide all tab content first
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
            content.style.visibility = 'hidden';
            content.style.opacity = '0';
        });
        
        // Show the active tab content
        const activeTab = document.getElementById(tabName);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.display = 'block';
            activeTab.style.visibility = 'visible';
            activeTab.style.opacity = '1';
            activeTab.style.minHeight = '500px'; // Ensure content area is visible
            
            console.log('✅ Activated tab content:', tabName);
            
            // Force content to be visible
            setTimeout(() => {
                activeTab.style.transform = 'none';
                activeTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        } else {
            console.error('❌ Tab content not found:', tabName);
            return;
        }

        // Update current tab
        const previousTab = this.currentTab;
        this.currentTab = tabName;
        console.log(`Tab switched: ${previousTab} → ${tabName}`);

        // Tab-specific initialization with forced content rendering
        this.initializeTabContent(tabName);

        // Success feedback
        this.showToast(`Switched to ${tabName.charAt(0).toUpperCase() + tabName.slice(1)} 📋`, 'success');
    }

    initializeTabContent(tabName) {
        console.log('🎯 Initializing content for tab:', tabName);
        
        if (tabName === 'verify') {
            console.log('📄 Setting up verify tab...');
            this.clearResults();
            this.setupUploadListeners();
            
            // Ensure upload area is visible
            const uploadArea = document.getElementById('uploadArea');
            if (uploadArea) {
                uploadArea.style.display = 'block';
                uploadArea.style.visibility = 'visible';
            }
            
        } else if (tabName === 'dashboard') {
            console.log('📊 Setting up dashboard tab...');
            this.renderDashboard();
            setTimeout(() => this.setupCharts(), 200);
            
        } else if (tabName === 'admin') {
            console.log('👤 Setting up admin tab...');
            this.renderAdminPanel();
            
        } else if (tabName === 'blockchain') {
            console.log('⛓️ Setting up blockchain tab...');
            // Blockchain is static, ensure it's visible
            const blockchainSection = document.querySelector('#blockchain .blockchain-section');
            if (blockchainSection) {
                blockchainSection.style.display = 'block';
                blockchainSection.style.visibility = 'visible';
            }
        }
    }

    refreshCurrentTab() {
        console.log('🔄 Refreshing current tab:', this.currentTab);
        this.initializeTabContent(this.currentTab);
    }

    setupAllEventListeners() {
        console.log('🎧 Setting up all event listeners...');

        // File upload functionality
        this.setupUploadListeners();
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchCertificates(e.target.value);
            });
        }

        // Admin panel buttons
        this.setupAdminButtons();
        
        // Modal handling
        this.setupModalListeners();
        
        // Table actions
        this.setupTableActions();

        console.log('✅ All event listeners setup complete');
    }

    setupUploadListeners() {
        const fileInput = document.getElementById('fileInput');
        const selectFileBtn = document.getElementById('selectFileBtn');
        const uploadArea = document.getElementById('uploadArea');
        
        console.log('📤 Setting up upload listeners...', {
            fileInput: !!fileInput,
            selectFileBtn: !!selectFileBtn,
            uploadArea: !!uploadArea
        });

        // Select file button
        if (selectFileBtn) {
            const newBtn = selectFileBtn.cloneNode(true);
            selectFileBtn.parentNode.replaceChild(newBtn, selectFileBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📁 Select file button clicked');
                
                if (!this.isProcessing) {
                    const input = document.getElementById('fileInput');
                    if (input) {
                        input.click();
                    }
                } else {
                    this.showToast('Please wait, file is being processed...', 'warning');
                }
            });
        }

        // File input change
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('📁 File input changed:', e.target.files.length);
                if (e.target.files && e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files);
                }
            });
        }

        // Drag and drop functionality
        if (uploadArea) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            uploadArea.addEventListener('dragover', (e) => {
                if (!this.isProcessing) {
                    uploadArea.classList.add('dragover');
                }
            });

            uploadArea.addEventListener('dragleave', (e) => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                uploadArea.classList.remove('dragover');
                
                if (this.isProcessing) {
                    this.showToast('Please wait, file is being processed...', 'warning');
                    return;
                }

                console.log('📁 Files dropped:', e.dataTransfer.files.length);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    this.handleFileSelect(e.dataTransfer.files);
                }
            });
        }
    }

    setupAdminButtons() {
        const exportBtn = document.getElementById('exportBtn');
        const addCertBtn = document.getElementById('addCertBtn');

        if (exportBtn) {
            exportBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportData();
            });
        }

        if (addCertBtn) {
            addCertBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAddCertificateModal();
            });
        }
    }

    setupModalListeners() {
        const closeModal = document.getElementById('closeModal');
        const certModal = document.getElementById('certModal');

        if (closeModal) {
            closeModal.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal();
            });
        }

        if (certModal) {
            certModal.addEventListener('click', (e) => {
                if (e.target === certModal) {
                    this.closeModal();
                }
            });
        }
    }

    setupTableActions() {
        // Use event delegation for dynamically created table buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('#certificatesTable')) {
                if (e.target.textContent.includes('Edit')) {
                    const row = e.target.closest('tr');
                    if (row && row.cells[0]) {
                        const id = parseInt(row.cells[0].textContent);
                        this.editCertificate(id);
                    }
                } else if (e.target.textContent.includes('Delete')) {
                    const row = e.target.closest('tr');
                    if (row && row.cells[0]) {
                        const id = parseInt(row.cells[0].textContent);
                        this.deleteCertificate(id);
                    }
                }
            }
        });
    }

    loadData() {
        console.log('📊 Loading application data...');
        
        // Load comprehensive certificate database
        this.certificates = [
            { id: 1, student_name: "MARCELINE ANDERSON", roll_number: null, course: "High School Program", institution: "High School", year_of_passing: 2024, grade: "Excellence", certificate_id: "HS2024MA", type: "Graduation" },
            { id: 2, student_name: "KATHLEEN WHITE", roll_number: null, course: "Journalism", institution: "Indiana State University Faculty of Journalism", year_of_passing: 2024, grade: "Outstanding Achievement", certificate_id: "94052827560", type: "Academic Certificate" },
            { id: 3, student_name: "JOSEPH SPENCER", roll_number: null, course: "Master's Degree in Environmental Engineering", institution: "University of Wisconsin Environmental Studies", year_of_passing: 2024, grade: "Completed", certificate_id: "46820485834", type: "Graduation" },
            { id: 4, student_name: "JULIANA SILVA", roll_number: null, course: "Graduation", institution: "Class Of 2025", year_of_passing: 2025, grade: "Graduated", certificate_id: "GRAD2025JS", type: "Graduation" },
            { id: 5, student_name: "MICHAEL BROWN", roll_number: "2023-EE-012", course: "Bachelor of Electrical Engineering", institution: "Springfield University", year_of_passing: 2023, grade: "Completed", certificate_id: "SU2023EE012", type: "Graduation" },
            { id: 6, student_name: "SOPHIA SMITH", roll_number: null, course: "Academic Performance Recognition", institution: "Borcelle Academy", year_of_passing: 2026, grade: "Outstanding", certificate_id: "BA2026SS", type: "Recognition" },
            { id: 7, student_name: "GRETA MAE EVANS", roll_number: null, course: "Bachelor of Arts in English Literature", institution: "University of Borcelle", year_of_passing: 2024, grade: "Completed", certificate_id: "UOB2024GME", type: "Graduation" },
            { id: 8, student_name: "SAMUEL GRAY", roll_number: null, course: "Bachelor of Science in Human Biology", institution: "Michigan State University College of Human Medicine", year_of_passing: 2024, grade: "Completed", certificate_id: "3859374948", type: "Graduation" },
            { id: 9, student_name: "KORINA VILLANUEVA", roll_number: null, course: "Junior High School Graduation", institution: "Rimberio Junior High School", year_of_passing: 2024, grade: "Excellence", certificate_id: "RJHS2024KV", type: "Graduation" },
            { id: 10, student_name: "SHREYAS K", roll_number: "1BG19C5098", usn: "1BG19C5098", course: "B.E. Computer Science & Engineering", institution: "VISVESVARAYA TECHNOLOGICAL UNIVERSITY", college: "B.N.M. INSTITUTE OF TECHNOLOGY, BANGALORE", year_of_passing: 2021, grade: "CGPA: 9.00", certificate_id: "1BG19C5098", type: "Grade Card" },
            { id: 11, student_name: "ASEEM BAJAJ", roll_number: null, course: "Bharatiya Antariksh Hackathon 2025", institution: "ISRO - Indian Space Research Organisation", year_of_passing: 2025, grade: "Participant", certificate_id: "2025H2S06BAH25-P07254", type: "Hackathon Certificate" },
            { id: 12, student_name: "ASEEM BAJAJ", roll_number: null, course: "Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate", institution: "Oracle University", year_of_passing: 2025, grade: "Certified", certificate_id: "321734998OCI25AICFA", type: "Professional Certification" },
            { id: 13, student_name: "ASEEM BAJAJ", roll_number: null, course: "Oracle Cloud Infrastructure 2025 Certified Generative AI Professional", institution: "Oracle University", year_of_passing: 2025, grade: "Certified", certificate_id: "321734998OCI25GAIOCP", type: "Professional Certification" },
            { id: 14, student_name: "AVERY DAVIS", roll_number: null, course: "Academic Performance Recognition", institution: "Borcelle Academy", year_of_passing: 2026, grade: "Outstanding", certificate_id: "BA2026001", type: "Recognition" }
        ];

        this.verificationStats = {
            total_verifications: 1547,
            successful_verifications: 1423,
            failed_verifications: 124,
            fraud_detected: 18,
            success_rate: "92%",
            fraud_rate: "1.2%"
        };

        this.recentVerifications = [
            { id: 1, student_name: "KATHLEEN WHITE", certificate_id: "94052827560", status: "verified", timestamp: "2025-09-21 14:30:25", institution: "Indiana State University" },
            { id: 2, student_name: "MICHAEL BROWN", certificate_id: "SU2023EE012", status: "verified", timestamp: "2025-09-21 14:15:18", institution: "Springfield University" },
            { id: 3, student_name: "UNKNOWN", certificate_id: "FAKE123", status: "not_found", timestamp: "2025-09-21 14:08:45", institution: "Unknown" },
            { id: 4, student_name: "JOHN DOE", certificate_id: "FORGE001", status: "forged", timestamp: "2025-09-21 13:55:32", institution: "Fake Institution" },
            { id: 5, student_name: "SHREYAS K", certificate_id: "1BG19C5098", status: "verified", timestamp: "2025-09-21 13:45:12", institution: "VTU" },
            { id: 6, student_name: "ASEEM BAJAJ", certificate_id: "321734998OCI25AICFA", status: "verified", timestamp: "2025-09-21 13:30:45", institution: "Oracle University" }
        ];

        console.log('✅ Data loaded:', {
            certificates: this.certificates.length,
            recentVerifications: this.recentVerifications.length
        });
    }

    createOCRTemplates() {
        return {
            'shreyas': {
                student_name: "SHREYAS K",
                certificate_id: "1BG19C5098", 
                institution: "VISVESVARAYA TECHNOLOGICAL UNIVERSITY",
                course: "B.E. Computer Science & Engineering", 
                year_of_passing: "2021",
                grade: "CGPA: 9.00",
                roll_number: "1BG19C5098"
            },
            'kathleen': {
                student_name: "KATHLEEN WHITE",
                certificate_id: "94052827560",
                institution: "Indiana State University Faculty of Journalism",
                course: "Journalism",
                year_of_passing: "2024", 
                grade: "Outstanding Achievement",
                roll_number: null
            },
            'oracle': {
                student_name: "ASEEM BAJAJ",
                certificate_id: "321734998OCI25AICFA",
                institution: "Oracle University",
                course: "Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate",
                year_of_passing: "2025",
                grade: "Certified",
                roll_number: null
            },
            'michael': {
                student_name: "MICHAEL BROWN", 
                certificate_id: "SU2023EE012",
                institution: "Springfield University",
                course: "Bachelor of Electrical Engineering",
                year_of_passing: "2023",
                grade: "Completed",
                roll_number: "2023-EE-012"
            },
            'avery': {
                student_name: "AVERY DAVIS",
                certificate_id: "BA2026001",
                institution: "Borcelle Academy",
                course: "Academic Performance Recognition",
                year_of_passing: "2026",
                grade: "Outstanding",
                roll_number: null
            }
        };
    }

    clearResults() {
        const resultsSection = document.getElementById('resultsSection');
        const resultCard = document.getElementById('resultCard');
        const extractedData = document.getElementById('extractedData');
        const uploadProgress = document.getElementById('uploadProgress');
        const fileInput = document.getElementById('fileInput');

        if (resultsSection) resultsSection.style.display = 'none';
        if (resultCard) {
            resultCard.innerHTML = '';
            resultCard.className = 'result-card';
        }
        if (extractedData) extractedData.innerHTML = '';
        if (uploadProgress) uploadProgress.style.display = 'none';
        if (fileInput) fileInput.value = '';

        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) uploadArea.classList.remove('disabled');

        this.isProcessing = false;
        this.currentSessionId = null;
        
        console.log('✅ Results cleared');
    }

    async handleFileSelect(files) {
        if (files.length === 0 || this.isProcessing) {
            console.log('File selection ignored - processing:', this.isProcessing);
            return;
        }

        const file = files[0];
        console.log('📁 Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        if (!this.validateFile(file)) return;

        const sessionId = Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.currentSessionId = sessionId;
        this.isProcessing = true;

        console.log('🔄 Starting processing session:', sessionId);

        this.clearPreviousResults();

        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) uploadArea.classList.add('disabled');

        this.showProgress(true);

        try {
            await this.simulateProcessingWithProgress(file);

            if (this.currentSessionId !== sessionId) {
                console.log('Session cancelled - new upload started');
                return;
            }

            const extractedData = await this.simulateSmartOCR(file);
            console.log('🔍 OCR extracted:', extractedData);

            const verificationResult = this.verifyCertificate(extractedData);
            console.log('✅ Verification result:', verificationResult);

            this.displayResults(verificationResult, extractedData);
            this.updateRecentVerifications(verificationResult, extractedData);

            this.showToast('Certificate processed successfully! 🎉', 'success');

        } catch (error) {
            console.error('❌ Processing error:', error);
            if (this.currentSessionId === sessionId) {
                this.showToast('Error processing certificate: ' + error.message, 'error');
            }
        } finally {
            if (this.currentSessionId === sessionId) {
                this.showProgress(false);
                this.isProcessing = false;
                if (uploadArea) uploadArea.classList.remove('disabled');
                console.log('✅ Processing session complete:', sessionId);
            }
        }
    }

    clearPreviousResults() {
        const resultsSection = document.getElementById('resultsSection');
        const resultCard = document.getElementById('resultCard');
        const extractedData = document.getElementById('extractedData');

        if (resultsSection) resultsSection.style.display = 'none';
        if (resultCard) {
            resultCard.innerHTML = '';
            resultCard.className = 'result-card';
        }
        if (extractedData) extractedData.innerHTML = '';
    }

    async simulateProcessingWithProgress(file) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        const steps = [
            { progress: 20, text: `Reading ${file.name}...` },
            { progress: 40, text: 'Extracting text with OCR...' },
            { progress: 60, text: 'Parsing certificate data...' },
            { progress: 80, text: 'Verifying against database...' },
            { progress: 100, text: 'Processing complete!' }
        ];

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (progressFill) progressFill.style.width = step.progress + '%';
            if (progressText) progressText.textContent = step.text;
            
            await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
        }
    }

    validateFile(file) {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            this.showToast('Please select a valid file format (PDF, JPG, PNG)', 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showToast('File size must be less than 10MB', 'error');
            return false;
        }

        return true;
    }

    async simulateSmartOCR(file) {
        const fileName = file.name.toLowerCase();
        console.log('🔍 Smart OCR processing file:', fileName);

        // Smart matching based on filename
        for (const [key, template] of Object.entries(this.ocrTemplates)) {
            if (fileName.includes(key)) {
                console.log('✅ Found template match for:', key);
                return { ...template };
            }
        }

        // Random selection for demonstration
        const templates = Object.values(this.ocrTemplates);
        const allTemplates = [
            ...templates,
            // Add some forged examples
            {
                student_name: "FAKE NAME",
                certificate_id: "1BG19C5098", // Real ID, wrong name = FORGED
                institution: "VISVESVARAYA TECHNOLOGICAL UNIVERSITY",
                course: "B.E. Computer Science & Engineering",
                year_of_passing: "2021",
                grade: "CGPA: 9.00",
                roll_number: "1BG19C5098"
            },
            // Add not found example
            {
                student_name: "UNKNOWN PERSON",
                certificate_id: "FAKE" + Math.floor(Math.random() * 10000),
                institution: "Unknown University",
                course: "Unknown Course", 
                year_of_passing: "2024",
                grade: "Unknown",
                roll_number: null
            }
        ];

        const randomIndex = Math.floor(Math.random() * allTemplates.length);
        const selectedTemplate = allTemplates[randomIndex];
        
        console.log('📄 OCR extracted data:', selectedTemplate);
        return { ...selectedTemplate };
    }

    verifyCertificate(extractedData) {
        console.log('🔐 Verifying certificate:', extractedData);

        const certificate = this.certificates.find(cert => 
            cert.certificate_id === extractedData.certificate_id
        );

        if (!certificate) {
            return {
                status: 'NOT_FOUND',
                confidence: 0,
                message: 'Certificate ID not found in database. This certificate may be fraudulent.',
                extractedData
            };
        }

        // Check name match
        const extractedName = extractedData.student_name.toUpperCase().trim();
        const dbName = certificate.student_name.toUpperCase().trim();
        
        if (extractedName === dbName) {
            return {
                status: 'VERIFIED',
                confidence: 95 + Math.random() * 5,
                message: 'Certificate successfully verified! All details match our database records.',
                certificate,
                extractedData
            };
        } else {
            return {
                status: 'FORGED',
                confidence: 85 + Math.random() * 10,
                message: 'SECURITY ALERT: Certificate ID exists but student name does not match. This appears to be a forged certificate.',
                certificate,
                extractedData
            };
        }
    }

    displayResults(result, extractedData) {
        console.log('📺 Displaying results:', result);
        
        const resultsSection = document.getElementById('resultsSection');
        const resultCard = document.getElementById('resultCard');
        const extractedDataDiv = document.getElementById('extractedData');

        if (!resultsSection || !resultCard || !extractedDataDiv) {
            console.error('❌ Results elements not found');
            return;
        }

        // Force results section to be visible
        resultsSection.style.display = 'block';
        resultsSection.style.visibility = 'visible';
        resultsSection.style.opacity = '1';

        const statusClass = result.status.toLowerCase().replace('_', '-');
        const statusIcon = result.status === 'VERIFIED' ? '✅' : 
                          result.status === 'FORGED' ? '🚨' : '❓';
        const statusText = result.status.replace('_', ' ');

        resultCard.className = `result-card result-${statusClass}`;
        resultCard.innerHTML = `
            <div class="result-header">
                <div class="result-icon">${statusIcon}</div>
                <div class="result-info">
                    <h3>Certificate ${statusText}</h3>
                    <p>${result.message}</p>
                    ${result.confidence > 0 ? `<p><strong>Confidence Score:</strong> ${result.confidence.toFixed(1)}%</p>` : ''}
                    ${result.certificate ? `<p><strong>Database Match:</strong> ${result.certificate.student_name}</p>` : ''}
                </div>
            </div>
        `;

        extractedDataDiv.innerHTML = `
            <h4>🔍 Extracted Certificate Data</h4>
            <div class="data-grid">
                <div class="data-item">
                    <label>Student Name:</label>
                    <span>${extractedData.student_name}</span>
                </div>
                <div class="data-item">
                    <label>Certificate ID:</label>
                    <span>${extractedData.certificate_id}</span>
                </div>
                <div class="data-item">
                    <label>Institution:</label>
                    <span>${extractedData.institution}</span>
                </div>
                <div class="data-item">
                    <label>Course:</label>
                    <span>${extractedData.course}</span>
                </div>
                <div class="data-item">
                    <label>Year of Passing:</label>
                    <span>${extractedData.year_of_passing}</span>
                </div>
                <div class="data-item">
                    <label>Grade:</label>
                    <span>${extractedData.grade}</span>
                </div>
                ${extractedData.roll_number ? `
                <div class="data-item">
                    <label>Roll Number:</label>
                    <span>${extractedData.roll_number}</span>
                </div>` : ''}
            </div>
            <div class="result-actions">
                <button class="btn btn--secondary" onclick="certificateValidator.showCertificateDetails('${extractedData.certificate_id}')">
                    📋 View Details
                </button>
                <button class="btn btn--primary" onclick="certificateValidator.generateQRCode('${extractedData.certificate_id}')">
                    📱 Generate QR Code
                </button>
            </div>
        `;

        resultsSection.scrollIntoView({ behavior: 'smooth' });
        console.log('✅ Results displayed successfully');
    }

    updateRecentVerifications(result, extractedData) {
        const newVerification = {
            id: Date.now(),
            student_name: extractedData.student_name,
            certificate_id: extractedData.certificate_id,
            status: result.status.toLowerCase(),
            timestamp: new Date().toLocaleString(),
            institution: extractedData.institution
        };

        this.recentVerifications.unshift(newVerification);
        if (this.recentVerifications.length > 10) {
            this.recentVerifications.pop();
        }

        // Update stats
        this.verificationStats.total_verifications++;
        if (result.status === 'VERIFIED') {
            this.verificationStats.successful_verifications++;
        } else if (result.status === 'FORGED') {
            this.verificationStats.fraud_detected++;
        } else {
            this.verificationStats.failed_verifications++;
        }

        // Recalculate rates
        this.verificationStats.success_rate = 
            Math.round((this.verificationStats.successful_verifications / this.verificationStats.total_verifications) * 100) + '%';
        this.verificationStats.fraud_rate = 
            Math.round((this.verificationStats.fraud_detected / this.verificationStats.total_verifications) * 100 * 10) / 10 + '%';

        if (this.currentTab === 'dashboard') {
            this.renderDashboard();
        }
    }

    showProgress(show) {
        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        
        if (uploadProgress) {
            if (show) {
                uploadProgress.style.display = 'block';
                uploadProgress.style.visibility = 'visible';
                if (progressFill) progressFill.style.width = '0%';
            } else {
                setTimeout(() => {
                    uploadProgress.style.display = 'none';
                    if (progressFill) progressFill.style.width = '0%';
                }, 500);
            }
        }
    }

    renderDashboard() {
        console.log('📊 Rendering dashboard...');
        
        // Update stats with forced visibility
        const totalElement = document.getElementById('total-verifications');
        const successElement = document.getElementById('success-rate');
        const fraudElement = document.getElementById('fraud-detected');
        const fraudRateElement = document.getElementById('fraud-rate');

        if (totalElement) {
            totalElement.textContent = this.verificationStats.total_verifications.toLocaleString();
            totalElement.style.visibility = 'visible';
        }
        if (successElement) {
            successElement.textContent = this.verificationStats.success_rate;
            successElement.style.visibility = 'visible';
        }
        if (fraudElement) {
            fraudElement.textContent = this.verificationStats.fraud_detected;
            fraudElement.style.visibility = 'visible';
        }
        if (fraudRateElement) {
            fraudRateElement.textContent = this.verificationStats.fraud_rate;
            fraudRateElement.style.visibility = 'visible';
        }

        // Update recent verifications with forced visibility
        const recentContainer = document.getElementById('recentVerifications');
        if (recentContainer) {
            recentContainer.innerHTML = this.recentVerifications.map(verification => `
                <div class="verification-item">
                    <div class="verification-info">
                        <strong>${verification.student_name}</strong>
                        <br>
                        <small>${verification.certificate_id} - ${verification.institution}</small>
                        <br>
                        <small>${verification.timestamp}</small>
                    </div>
                    <div class="verification-status ${verification.status}">
                        ${verification.status.replace('_', ' ').toUpperCase()}
                    </div>
                </div>
            `).join('');
            
            recentContainer.style.visibility = 'visible';
            recentContainer.style.display = 'block';
        }

        // Ensure dashboard grid is visible
        const dashboardGrid = document.querySelector('.dashboard-grid');
        if (dashboardGrid) {
            dashboardGrid.style.display = 'grid';
            dashboardGrid.style.visibility = 'visible';
        }

        console.log('✅ Dashboard rendered successfully');
    }

    setupCharts() {
        const chartElement = document.getElementById('verificationChart');
        if (!chartElement) {
            console.log('📈 Chart element not found, retrying...');
            setTimeout(() => this.setupCharts(), 500);
            return;
        }

        if (this.chart) {
            this.chart.destroy();
        }

        const ctx = chartElement.getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                datasets: [{
                    label: 'Verified',
                    data: [120, 140, 160, 180, 170, 190, 200, 220, 210],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Forged',
                    data: [5, 8, 12, 6, 9, 4, 7, 8, 5],
                    borderColor: '#DB4545',
                    backgroundColor: 'rgba(219, 69, 69, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    },
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: 'rgba(255, 255, 255, 0.8)' }
                    }
                }
            }
        });

        // Ensure chart container is visible
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.style.display = 'block';
            chartContainer.style.visibility = 'visible';
        }

        console.log('✅ Chart setup complete');
    }

    renderAdminPanel() {
        console.log('👤 Rendering admin panel...');
        
        const tbody = document.getElementById('certificatesTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.certificates.map(cert => `
            <tr>
                <td>${cert.id}</td>
                <td>${cert.student_name}</td>
                <td>${cert.certificate_id}</td>
                <td>${cert.institution}</td>
                <td>${cert.course}</td>
                <td>${cert.year_of_passing}</td>
                <td>${cert.grade}</td>
                <td>
                    <button class="btn btn--secondary btn--sm">Edit</button>
                    <button class="btn btn--outline btn--sm" style="margin-left: 8px;">Delete</button>
                </td>
            </tr>
        `).join('');

        // Ensure admin panel is visible
        const adminPanel = document.querySelector('.admin-panel');
        if (adminPanel) {
            adminPanel.style.display = 'block';
            adminPanel.style.visibility = 'visible';
        }

        console.log('✅ Admin panel rendered successfully');
    }

    searchCertificates(query) {
        const filteredCerts = this.certificates.filter(cert =>
            cert.student_name.toLowerCase().includes(query.toLowerCase()) ||
            cert.certificate_id.toLowerCase().includes(query.toLowerCase()) ||
            cert.institution.toLowerCase().includes(query.toLowerCase())
        );

        const tbody = document.getElementById('certificatesTableBody');
        if (!tbody) return;

        tbody.innerHTML = filteredCerts.map(cert => `
            <tr>
                <td>${cert.id}</td>
                <td>${cert.student_name}</td>
                <td>${cert.certificate_id}</td>
                <td>${cert.institution}</td>
                <td>${cert.course}</td>
                <td>${cert.year_of_passing}</td>
                <td>${cert.grade}</td>
                <td>
                    <button class="btn btn--secondary btn--sm">Edit</button>
                    <button class="btn btn--outline btn--sm" style="margin-left: 8px;">Delete</button>
                </td>
            </tr>
        `).join('');

        this.showToast(`Found ${filteredCerts.length} certificates 🔍`, 'info');
    }

    showCertificateDetails(certificateId) {
        const certificate = this.certificates.find(cert => cert.certificate_id === certificateId);
        if (!certificate) {
            this.showToast('Certificate not found in database', 'error');
            return;
        }

        const modal = document.getElementById('certModal');
        const modalBody = document.getElementById('modalBody');

        if (!modal || !modalBody) return;

        modalBody.innerHTML = `
            <div class="certificate-details">
                <div class="detail-row">
                    <strong>Student Name:</strong>
                    <span>${certificate.student_name}</span>
                </div>
                <div class="detail-row">
                    <strong>Certificate ID:</strong>
                    <span>${certificate.certificate_id}</span>
                </div>
                <div class="detail-row">
                    <strong>Institution:</strong>
                    <span>${certificate.institution}</span>
                </div>
                <div class="detail-row">
                    <strong>Course:</strong>
                    <span>${certificate.course}</span>
                </div>
                <div class="detail-row">
                    <strong>Year:</strong>
                    <span>${certificate.year_of_passing}</span>
                </div>
                <div class="detail-row">
                    <strong>Grade:</strong>
                    <span>${certificate.grade}</span>
                </div>
                ${certificate.roll_number ? `
                <div class="detail-row">
                    <strong>Roll Number:</strong>
                    <span>${certificate.roll_number}</span>
                </div>` : ''}
            </div>
            <div class="blockchain-info">
                <h4>🔗 Blockchain Information</h4>
                <div class="detail-row">
                    <strong>Block Hash:</strong>
                    <code>0x${Math.random().toString(16).slice(2, 34)}</code>
                </div>
                <div class="detail-row">
                    <strong>Transaction ID:</strong>
                    <code>0x${Math.random().toString(16).slice(2, 34)}</code>
                </div>
                <div class="detail-row">
                    <strong>Timestamp:</strong>
                    <span>${new Date().toLocaleString()}</span>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        modal.classList.add('show');
    }

    generateQRCode(certificateId) {
        this.showToast('📱 QR Code generated successfully!', 'success');
        console.log('📱 QR Code generated for:', certificateId);
    }

    exportData() {
        const data = {
            certificates: this.certificates,
            statistics: this.verificationStats,
            recent_verifications: this.recentVerifications,
            export_timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificate_database_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast('📊 Database exported successfully!', 'success');
    }

    editCertificate(id) {
        const cert = this.certificates.find(cert => cert.id === id);
        if (cert) {
            this.showToast(`✏️ Edit ${cert.student_name} - Demo Mode`, 'info');
        }
    }

    deleteCertificate(id) {
        const cert = this.certificates.find(cert => cert.id === id);
        if (!cert) return;

        if (confirm(`Delete certificate for ${cert.student_name}?`)) {
            this.certificates = this.certificates.filter(cert => cert.id !== id);
            this.renderAdminPanel();
            this.showToast('🗑️ Certificate deleted!', 'success');
        }
    }

    showAddCertificateModal() {
        this.showToast('➕ Add Certificate - Demo Mode', 'info');
    }

    closeModal() {
        const modal = document.getElementById('certModal');
        if (modal) {
            modal.classList.remove('show');
            modal.classList.add('hidden');
        }
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        // Prevent duplicate toasts
        const existingToasts = Array.from(container.children);
        const duplicateToast = existingToasts.find(toast => 
            toast.querySelector('p')?.textContent === message
        );
        
        if (duplicateToast) return;

        // Limit to 3 toasts max
        if (existingToasts.length >= 3) {
            container.removeChild(existingToasts[0]);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <strong>${type === 'error' ? '❌ Error' : type === 'warning' ? '⚠️ Warning' : type === 'info' ? 'ℹ️ Info' : '✅ Success'}</strong>
                <p>${message}</p>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 100);

        setTimeout(() => {
            if (container.contains(toast)) {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (container.contains(toast)) {
                        container.removeChild(toast);
                    }
                }, 300);
            }
        }, 4000);
    }
}

// Initialize application
const certificateValidator = new CertificateValidator();
window.certificateValidator = certificateValidator;

console.log('🎉 Certificate Validator with fully visible content loaded!');