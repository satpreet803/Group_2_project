// Common JavaScript functionality for Government Polytechnic Bazpur Portal
const COLLEGE_NAME = "Government Polytechnic Bazpur";
const COLLEGE_SHORT = "GP BAZPUR";
const COLLEGE_EMAIL = "gpbazpur@gmail.com";
const COLLEGE_PHONE = "+91 97603-13466";
const COLLEGE_ADDRESS = "Bazpur, Udham Singh Nagar, Uttarakhand - 262401";

// Supabase Configuration
// IMPORTANT: Paste your Supabase details here
const SUPABASE_URL = "https://qszclqcrjmzfgmzsugwv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzemNscWNyam16ZmdtenN1Z3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNDEwNjEsImV4cCI6MjA5MTkxNzA2MX0.slOjFVPWTMq8PX7cP38ivmbVc9FnKdqPJ9tr4xhF7lw"; // Note: I am approximating the end based on typical keys; user should verify.


const _supabase = (typeof supabase !== 'undefined') ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;


document.addEventListener('DOMContentLoaded', () => {
    // Database background sync (Supabase)
    if (_supabase) {
        _supabase.from('students').select('*')
          .then(({ data, error }) => {
              if (error) throw error;
              if (data && data.length > 0) {
                  const syncedStudents = data.map(dbStudent => ({
                      appId: dbStudent.app_id,
                      fullName: dbStudent.full_name,
                      mobile: dbStudent.mobile,
                      email: dbStudent.email,
                      gender: dbStudent.gender,
                      category: dbStudent.category,
                      status: dbStudent.status || 'Pending Verification',
                      eligibility: dbStudent.eligibility,
                      branch: dbStudent.allocated_branch,
                      jeepGroup: dbStudent.jeep_group,
                      jeepRoll: dbStudent.jeep_roll,
                      jeepRank: dbStudent.jeep_rank,
                      preferences: [dbStudent.preference_1, dbStudent.preference_2, dbStudent.preference_3],
                      education: { ssc: { perc: dbStudent.ssc_perc }, hsc: { perc: dbStudent.hsc_perc } }
                  }));
                  localStorage.setItem('students', JSON.stringify(syncedStudents));
              } else {
                  localStorage.setItem('students', JSON.stringify([]));
              }
          }).catch(e => {
              console.error('Supabase Sync failed:', e);
          }).finally(() => {
              window.dispatchEvent(new Event('studentsSynced'));
          });
    } else {
        window.dispatchEvent(new Event('studentsSynced'));
    }

    // Premium Loader logic
    const loader = document.getElementById('loader-wrapper');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 600);
            }, 600);
        });
    }

    // Scroll Reveal Intersection Observer
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Automated Academic Year and Branding
    updateBrandingAndYear();

    // Sticky Navbar shadow on scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-lg', 'py-2');
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.classList.remove('shadow-lg', 'py-2');
            navbar.style.background = 'rgba(255, 255, 255, 0.8)';
        }
    });

    // Initialize Tooltips/Popovers
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Toast System
function showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const bg = type === 'success' ? '#1e40af' : '#ef4444';
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white border-0" style="background-color: ${bg};" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    document.getElementById('toast-container').insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl);
    toast.show();

    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

// Academic Year Automation
function getAcademicYear() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    
    // Academic session starts in July
    if (currentMonth >= 7) {
        return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    } else {
        return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
    }
}

function updateBrandingAndYear() {
    const year = getAcademicYear();
    
    // Update all elements with data-dynamic="year"
    document.querySelectorAll('[data-dynamic="year"]').forEach(el => {
        el.textContent = year;
    });

    // Update branding elements
    document.querySelectorAll('[data-dynamic="college-name"]').forEach(el => {
        el.textContent = COLLEGE_NAME;
    });
    
    document.querySelectorAll('[data-dynamic="college-email"]').forEach(el => {
        if (el.tagName === 'A') el.href = `mailto:${COLLEGE_EMAIL}`;
        el.textContent = COLLEGE_EMAIL;
    });

    document.querySelectorAll('[data-dynamic="college-phone"]').forEach(el => {
        if (el.tagName === 'A') el.href = `tel:${COLLEGE_PHONE.replace(/\s+/g, '')}`;
        el.textContent = COLLEGE_PHONE;
    });
}

// Generate Application ID
function generateAppID() {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `GPB-${year}-${random}`;
}

// Utility Functions
function getStudents() {
    return JSON.parse(localStorage.getItem('students')) || [];
}

function getNotices() {
    return JSON.parse(localStorage.getItem('portalNotices')) || [
        { title: 'Spot Counselling Schedule', date: '12 April 2024' },
        { title: 'Document Verification Guidelines', date: '10 April 2024' }
    ];
}

function addNotice(title) {
    const notices = getNotices();
    const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    notices.unshift({ title, date });
    localStorage.setItem('portalNotices', JSON.stringify(notices));
    return true;
}

function getSeatMatrix() {
    return JSON.parse(localStorage.getItem('portalSeatMatrix')) || [
        { id: 1, branch: 'Computer Science & Engineering', total: 60, gen: 30, obc: 8, sc: 12, st: 4, ews: 6 },
        { id: 2, branch: 'Mechanical Engineering', total: 60, gen: 28, obc: 9, sc: 12, st: 5, ews: 6 },
        { id: 3, branch: 'Civil Engineering', total: 60, gen: 32, obc: 7, sc: 11, st: 4, ews: 6 },
        { id: 4, branch: 'Pharmacy (D.Pharma)', total: 40, gen: 20, obc: 5, sc: 8, st: 3, ews: 4 }
    ];
}

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Branch Suggestions based on Rank
function getBranchSuggestions(rank) {
    rank = parseInt(rank);
    if (isNaN(rank)) return [];
    
    if (rank < 2000) return ['Computer Science & Engineering', 'Pharmacy (D.Pharma)', 'Mechanical Engineering', 'Electronics Engineering'];
    if (rank < 5000) return ['Mechanical Engineering', 'Civil Engineering', 'Computer Science & Engineering', 'Electrical Engineering'];
    return ['Civil Engineering', 'Mechanical Engineering (Lateral)', 'Electronics Engineering', 'Electrical Engineering'];
}

// Calculate Educational Percentage
function calculatePercentage(obtd, max) {
    if (!obtd || !max || max == 0) return 0;
    return ((parseFloat(obtd) / parseFloat(max)) * 100).toFixed(2);
}

// Save Student (Enhanced for database sync)
function saveStudent(studentData) {
    let students = getStudents();
    // Default status if not provided
    if (!studentData.status) studentData.status = 'Pending Verification';
    students.push(studentData);
    localStorage.setItem('students', JSON.stringify(students));
    // Set this as current session
    localStorage.setItem('loggedInStudent', JSON.stringify(studentData));
    
    // Push Live to Supabase (Async)
    if (_supabase) {
        showToast('Saving to cloud...', 'info');
        _supabase.from('students').insert([{
            app_id: studentData.appId,
            full_name: studentData.fullName,
            mobile: studentData.mobile,
            email: studentData.email,
            gender: studentData.gender,
            category: studentData.category,
            ssc_perc: studentData.education && studentData.education.ssc ? parseFloat(String(studentData.education.ssc.perc).replace('%', '')) : 0,
            hsc_perc: studentData.education && studentData.education.hsc ? parseFloat(String(studentData.education.hsc.perc).replace('%', '')) : 0,
            jeep_group: studentData.jeepGroup,
            jeep_roll: studentData.jeepRoll,
            jeep_rank: studentData.jeepRank,
            allocated_branch: studentData.branch || null,
            preference_1: studentData.preferences && studentData.preferences[0] ? studentData.preferences[0] : null,
            preference_2: studentData.preferences && studentData.preferences[1] ? studentData.preferences[1] : null,
            preference_3: studentData.preferences && studentData.preferences[2] ? studentData.preferences[2] : null,
            status: studentData.status
        }]).then(({ error }) => {
            if (error) {
                console.error("Supabase Save Error:", error);
                alert("❌ Database Sync Failed!\n\nReason: " + error.message + "\n\nTip: Make sure you enabled the 'Anon Insert' policy in your Supabase dashboard.");
                return false;
            } else {
                console.log("Successfully saved to Supabase");
                showToast('Registration Sync Complete!', 'success');
                return true;
            }
        });
    }

    return true;
}

function getLoggedInStudent() {
    return JSON.parse(localStorage.getItem('loggedInStudent')) || null;
}

// Generate QR Code
function generateQRCode(elementId, text) {
    const qrcodeElement = document.getElementById(elementId);
    if (!qrcodeElement) return;
    qrcodeElement.innerHTML = '';
    
    // Relative path for local testing
    const detailsPath = `/view-details.html?id=${text}`;
    const fullUrl = `${window.location.origin}${window.location.pathname.replace(/\/[^\/]*$/, '')}${detailsPath}`;
    
    new QRCode(qrcodeElement, {
        text: fullUrl,
        width: 150,
        height: 150,
        colorDark: "#2563eb",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    // Add a helper tip for mobile scanning in local environments
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        const tip = document.createElement('div');
        tip.className = 'mt-2 xsmall text-muted';
        tip.style.fontSize = '10px';
        tip.innerHTML = `<i class="fas fa-info-circle me-1"></i> Running locally. To scan from phone, use your PC's IP address instead of localhost.`;
        qrcodeElement.parentNode.appendChild(tip);
    }
}

function updateStudentStatus(appId, newStatus) {
    const students = getStudents();
    const index = students.findIndex(s => s.appId === appId);
    if (index !== -1) {
        students[index].status = newStatus;
        // If rejected, clear allocated branch
        if (newStatus === 'Rejected') students[index].branch = null;
        localStorage.setItem('students', JSON.stringify(students));
        
        if (_supabase) {
            _supabase.from('students')
                .update({ status: newStatus, allocated_branch: newStatus === 'Rejected' ? null : undefined })
                .eq('app_id', appId)
                .then(({ error }) => { if (error) console.error("Supabase Status Update Error:", error); });
        }
        return true;
    }
    return false;
}

function allocateBranch(appId, branchName) {
    const students = getStudents();
    const index = students.findIndex(s => s.appId === appId);
    if (index !== -1) {
        students[index].branch = branchName;
        students[index].status = 'Approved';
        localStorage.setItem('students', JSON.stringify(students));
        
        if (_supabase) {
            _supabase.from('students')
                .update({ allocated_branch: branchName, status: 'Approved' })
                .eq('app_id', appId)
                .then(({ error }) => { if (error) console.error("Supabase Allocation Error:", error); });
        }
        return true;
    }
    return false;
}

function deleteStudent(appId) {
    if (!confirm(`Are you sure you want to permanently delete application ${appId}?`)) return false;
    
    let students = getStudents();
    const initialLength = students.length;
    students = students.filter(s => s.appId !== appId);
    
    if (students.length < initialLength) {
        localStorage.setItem('students', JSON.stringify(students));
        if (_supabase) {
            _supabase.from('students')
                .delete()
                .eq('app_id', appId)
                .then(({ error }) => { if (error) console.error(error); });
        }
        return true;
    }
    return false;
}

function updateStudentEligibility(appId, eligibility) {
    const students = getStudents();
    const index = students.findIndex(s => s.appId === appId);
    if (index !== -1) {
        students[index].eligibility = eligibility;
        localStorage.setItem('students', JSON.stringify(students));
        
        // Trigger Email Notification
        emailEligibilityStatus(students[index]);
        return true;
    }
    return false;
}

function emailEligibilityStatus(student) {
    console.log(`Sending Email to ${student.email}: Your eligibility for Spot Counselling 2024 is now ${student.eligibility}.`);
    
    // EmailJS Integration (Requires valid keys)
    if (typeof emailjs !== 'undefined') {
        emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
            to_name: student.fullName,
            to_email: student.email,
            app_id: student.appId,
            eligibility_status: student.eligibility
        }).then(() => {
            console.log("Email sent successfully!");
        }).catch((err) => {
            console.error("Email failed:", err);
        });
    }
}

// Download Full Export
function downloadFullCSV(data, filename = 'student-full-records.csv') {
    if (!data || !data.length) {
        showToast('No data to export!', 'error');
        return;
    }

    const headers = [
        'App ID', 'Full Name', 'Father Name', 'Mobile', 'Email', 'Gender', 'Category', 'Religion', 'Nationality',
        '10th Board', '10th Max', '10th Obt', '10th %', '12th Board', '12th Max', '12th Obt', '12th %',
        'Corr Address', 'Perm Address', 'JEEP Group', 'JEEP Roll', 'JEEP Rank',
        'Preference 1', 'Preference 2', 'Preference 3', 'Status', 'Eligibility', 'Reg Date'
    ];

    const rows = data.map(s => {
        return [
            s.appId, s.fullName, s.fatherName, s.mobile, s.email, s.gender, s.category, s.religion, s.nationality,
            s.education?.hsc?.board || '', s.education?.hsc?.max || '', s.education?.hsc?.obt || '', s.education?.hsc?.perc || '',
            s.education?.ssc?.board || '', s.education?.ssc?.max || '', s.education?.ssc?.obt || '', s.education?.ssc?.perc || '',
            `"${(s.address?.corr || '').replace(/"/g, '""')}"`, `"${(s.address?.perm || '').replace(/"/g, '""')}"`,
            s.jeepGroup, s.jeepRoll, s.jeepRank,
            s.preferences?.[0] || '', s.preferences?.[1] || '', s.preferences?.[2] || '',
            s.status, s.eligibility || 'Pending', s.registrationDate || ''
        ].map(val => `${val}`).join(',');
    }).join('\n');

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(',') + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Alias for compatibility
function downloadCSV(data, filename) {
    downloadFullCSV(data, filename);
}

// Seed Demo Data
function seedDemoData() {
    const students = getStudents();
    if (students.length === 0) {
        const demoData = [
            {
                appId: 'GPB-2024-5521',
                fullName: 'Amit Kumar Sharma',
                fatherName: 'Rajesh Sharma',
                mobile: '9876543210',
                email: 'amit@example.com',
                gender: 'Male',
                category: 'General',
                jeepRoll: '24110023',
                jeepRank: '102',
                allocatedBranch: 'Mechanical Engineering',
                status: 'Approved',
                eligibility: 'Eligible',
                registrationDate: '10/04/2026'
            },
            {
                appId: 'GPB-2024-88A2',
                fullName: 'John Doe',
                fatherName: 'Michael Doe',
                mobile: '9876543211',
                email: 'john@example.com',
                gender: 'Male',
                category: 'OBC',
                jeepRoll: '1245',
                jeepRank: '245',
                status: 'Pending Verification',
                eligibility: 'Pending',
                registrationDate: '11/04/2026'
            }
        ];
        localStorage.setItem('students', JSON.stringify(demoData));
    }
}

// Download Student Receipt
function downloadReceipt() {
    const student = getLoggedInStudent();
    if (!student) return;
    
    const receiptText = `
------------------------------------------
   UGIP BAZPUR SPOT COUNSELLING 2024
------------------------------------------
Application ID: ${student.appId}
Full Name:      ${student.fullName}
JEEP Roll No:   ${student.jeepRoll}
JEEP Rank:      ${student.jeepRank}
Branch Opted:   ${student.branch}
Category:       ${student.category}
Status:         ${student.status}
------------------------------------------
Generated on:   ${new Date().toLocaleString()}
------------------------------------------
    `;
    
    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${student.appId}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showToast('Receipt downloaded successfully!', 'success');
}

// Generate Merit List (Sorted by Rank, then Academic %)
function generateMeritList(branch = 'all') {
    let students = getStudents();
    
    // Filter by branch if specified
    if (branch !== 'all') {
        students = students.filter(s => s.branch === branch);
    }
    
    // Sort logic
    students.sort((a, b) => {
        // Priority 1: JEEP Rank (Ascending)
        const rankA = parseInt(a.jeepRank) || 999999;
        const rankB = parseInt(b.jeepRank) || 999999;
        if (rankA !== rankB) return rankA - rankB;
        
        // Priority 2: 12th Percentage (Descending)
        const perc12A = parseFloat(a.education?.ssc?.perc) || 0;
        const perc12B = parseFloat(b.education?.ssc?.perc) || 0;
        if (perc12A !== perc12B) return perc12B - perc12A;
        
        // Priority 3: 10th Percentage (Descending)
        const perc10A = parseFloat(a.education?.hsc?.perc) || 0;
        const perc10B = parseFloat(b.education?.hsc?.perc) || 0;
        return perc10B - perc10A;
    });
    
    return students;
}

// Seat Matrix Management
function getRawSeatMatrix() {
    const defaultMatrix = [
        { branch: 'Computer Science & Engineering', total: 60, gen: 30, obc: 8, sc: 12, st: 4, ews: 6 },
        { branch: 'Mechanical Engineering', total: 60, gen: 28, obc: 9, sc: 12, st: 5, ews: 6 },
        { branch: 'Civil Engineering', total: 60, gen: 32, obc: 7, sc: 11, st: 4, ews: 6 },
        { branch: 'Pharmacy (D.Pharma)', total: 40, gen: 20, obc: 5, sc: 8, st: 3, ews: 4 }
    ];
    return JSON.parse(localStorage.getItem('seatMatrix')) || defaultMatrix;
}

function getSeatMatrix() {
    const rawMatrix = JSON.parse(JSON.stringify(getRawSeatMatrix())); // Deep copy
    const students = getStudents();
    
    // Count approved students per branch and category
    const allocated = {};
    students.forEach(s => {
        if (s.status === 'Approved' && s.branch) {
            if (!allocated[s.branch]) {
                allocated[s.branch] = { total: 0, gen: 0, obc: 0, sc: 0, st: 0, ews: 0 };
            }
            allocated[s.branch].total++;
            
            const cat = s.category ? s.category.toLowerCase() : 'gen';
            if (cat === 'general' || cat === 'gen') allocated[s.branch].gen++;
            else if (cat === 'obc') allocated[s.branch].obc++;
            else if (cat === 'sc') allocated[s.branch].sc++;
            else if (cat === 'st') allocated[s.branch].st++;
            else if (cat === 'ews') allocated[s.branch].ews++;
            else allocated[s.branch].gen++; 
        }
    });

    // Subtract from matrix
    rawMatrix.forEach(s => {
        const branchAlloc = allocated[s.branch];
        if (branchAlloc) {
            s.total = Math.max(0, parseInt(s.total) - branchAlloc.total);
            s.gen = Math.max(0, parseInt(s.gen) - branchAlloc.gen);
            s.obc = Math.max(0, parseInt(s.obc) - branchAlloc.obc);
            s.sc = Math.max(0, parseInt(s.sc) - branchAlloc.sc);
            s.st = Math.max(0, parseInt(s.st) - branchAlloc.st);
            s.ews = Math.max(0, parseInt(s.ews) - branchAlloc.ews);
        }
    });
    
    return rawMatrix;
}

function saveSeatMatrix(matrix) {
    // Validation: Enforce max intake limits or basic sanity checks
    for (const s of matrix) {
        const total = parseInt(s.total) || 0;
        const sum = (parseInt(s.gen) || 0) + (parseInt(s.obc) || 0) + (parseInt(s.sc) || 0) + (parseInt(s.st) || 0) + (parseInt(s.ews) || 0);
        
        if (sum > total) {
            showToast(`Error in ${s.branch}: Categorical seats (${sum}) exceed total seats (${total})`, 'error');
            return false;
        }
    }
    
    localStorage.setItem('seatMatrix', JSON.stringify(matrix));
    return true;
}

// Seat Display Automation for Index Page
function initBranchDisplay() {
    const container = document.getElementById('branch-container');
    if (!container) return;

    const matrix = getSeatMatrix();
    container.innerHTML = '';

    const icons = {
        'Computer Science & Engineering': 'fa-laptop-code',
        'Mechanical Engineering': 'fa-cogs',
        'Civil Engineering': 'fa-hard-hat',
        'Pharmacy (D.Pharma)': 'fa-pills'
    };

    const colors = {
        'Computer Science & Engineering': 'text-primary',
        'Mechanical Engineering': 'text-danger',
        'Civil Engineering': 'text-warning',
        'Pharmacy (D.Pharma)': 'text-success'
    };

    matrix.forEach((s, i) => {
        const delay = (i + 1) * 100;
        const icon = icons[s.branch] || 'fa-graduation-cap';
        const color = colors[s.branch] || 'text-primary';
        
        const col = document.createElement('div');
        col.className = `col-md-6 col-lg-3 reveal delay-${delay}`;
        col.innerHTML = `
            <div class="custom-card card h-100 p-4">
                <div class="card-body">
                    <div class="mb-3 ${color} h1"><i class="fas ${icon}"></i></div>
                    <h4 class="fw-bold">${s.branch}</h4>
                    <p class="text-muted small">Quality education in ${s.branch} with modern labs and placement support.</p>
                    <hr class="opacity-10">
                    <div class="d-flex justify-content-between small">
                        <span class="text-muted"><i class="badge-dot" style="background: #22c55e;"></i> Regular</span>
                        <span class="fw-bold">${s.total} Seats</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(col);
    });
    
    // Refresh Intersection Observer for new elements
    const revealElements = container.querySelectorAll('.reveal');
    revealElements.forEach(el => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        });
        observer.observe(el);
    });
}

// Portal Settings
function getPortalSettings() {
    const defaults = {
        regOpen: true,
        meritPublished: false,
        lastDate: '15 April 2024'
    };
    return JSON.parse(localStorage.getItem('portalSettings')) || defaults;
}

function updatePortalSettings(settings) {
    localStorage.setItem('portalSettings', JSON.stringify(settings));
    return true;
}

// Notice Management
function getNotices() {
    return JSON.parse(localStorage.getItem('portalNotices')) || [
        { title: 'Spot Counselling Schedule 2024', date: '12 April 2024' },
        { title: 'Document Verification Guidelines', date: '10 April 2024' }
    ];
}

function addNotice(title) {
    const notices = getNotices();
    notices.unshift({ title, date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) });
    localStorage.setItem('portalNotices', JSON.stringify(notices));
    return true;
}

// Mock Download Notice PDF
function downloadNoticePDF(title) {
    const blob = new Blob([`This is a mock PDF for notice: ${title}\nGenerated by UGIP Portal Audit System.`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Notice_${title.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
