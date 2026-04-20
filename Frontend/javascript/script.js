// API Base URL - local backend for development
const API_BASE_URL = 'http://localhost:5000';

async function parseJSONResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return await response.json();
    }
    const text = await response.text();
    return { message: text || 'Unexpected server response' };
}

const registerForm = document.querySelector(".register-form");
if (registerForm) {
    // Real-time validation
    const inputs = registerForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });

    registerForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const name = document.getElementById("reg-name").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const phone = document.getElementById("reg-phone").value.trim();
        const gender = document.getElementById("reg-gender").value;
        const password = document.getElementById("reg-password").value.trim();
        const confirmPassword = document.getElementById("reg-confirm-password").value.trim();
        const message = document.querySelector(".form-message");
        const submitBtn = registerForm.querySelector('button[type="submit"]');

        // Clear previous messages
        message.textContent = "";
        message.className = "form-message";

        // Validate all fields
        if (!validateForm(registerForm)) return;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Registering...';

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    gender,
                    password
                })
            });

            const data = await parseJSONResponse(response);

            if (response.ok) {
                showToast("Registration successful!", "success");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            message.textContent = error.message || "Error during registration";
            message.className = "form-message error";
            showToast(error.message || "Registration failed. Please try again.", "error");
        } finally {
            // Reset loading state
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Register';
        }
    });
}
// ===== LOGIN LOGIC =====
const loginForm = document.querySelector(".login-form");

if (loginForm) {
    // Real-time validation
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });

    loginForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();
        const message = loginForm.querySelector(".form-message");
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        // Clear previous messages
        message.textContent = "";
        message.className = "form-message";

        // Validate all fields
        if (!validateForm(loginForm)) return;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Logging in...';

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await parseJSONResponse(response);

            if (response.ok) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                showToast("Login successful!", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1500);
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            message.textContent = error.message || "Error during login";
            message.className = "form-message error";
            showToast(error.message || "Login failed. Please try again.", "error");
        } finally {
            // Reset loading state
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Login';
        }
    });
}

// ===== FORM VALIDATION FUNCTIONS =====
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name || field.id.replace('reg-', '').replace('login-', '');
    let isValid = true;
    let errorMessage = '';

    switch(fieldName) {
        case 'name':
            if (!value) {
                errorMessage = 'Name is required';
                isValid = false;
            } else if (value.length < 2) {
                errorMessage = 'Name must be at least 2 characters';
                isValid = false;
            }
            break;
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                errorMessage = 'Email is required';
                isValid = false;
            } else if (!emailRegex.test(value)) {
                errorMessage = 'Please enter a valid email';
                isValid = false;
            }
            break;
        case 'phone':
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!value) {
                errorMessage = 'Phone number is required';
                isValid = false;
            } else if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                errorMessage = 'Please enter a valid phone number';
                isValid = false;
            }
            break;
        case 'password':
            if (!value) {
                errorMessage = 'Password is required';
                isValid = false;
            } else if (value.length < 6) {
                errorMessage = 'Password must be at least 6 characters';
                isValid = false;
            }
            break;
        case 'gender':
            if (!value) {
                errorMessage = 'Please select your gender';
                isValid = false;
            }
            break;
        case 'confirm-password':
            const password = document.getElementById('reg-password').value;
            if (!value) {
                errorMessage = 'Please confirm your password';
                isValid = false;
            } else if (value !== password) {
                errorMessage = 'Passwords do not match';
                isValid = false;
            }
            break;
    }

    showFieldError(field, errorMessage);
    return isValid;
}

function validateForm(form) {
    if (!form) return false;
    const inputs = form.querySelectorAll('input, select');
    let isValid = true;

    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });

    return isValid;
}

function showFieldError(field, message) {
    // Remove existing error
    clearFieldError({target: field});

    if (message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// ===== TOAST NOTIFICATION SYSTEM =====
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    // Add to page
    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return '✓';
        case 'error': return '✕';
        case 'warning': return '⚠';
        default: return 'ℹ';
    }
}
const bookingForm = document.querySelector(".booking-form");

if (bookingForm) {
    bookingForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        const from = document.getElementById("from").value.trim();
        const to = document.getElementById("to").value.trim();
        const date = document.getElementById("date").value;
        const transport = document.getElementById("transport").value;

        // Validate form
        if (!from || !to || !date || !transport) {
            showToast("Please fill in all fields", "error");
            return;
        }

        // Validate date is not in the past
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            showToast("Please select a future date", "error");
            return;
        }

        // Show loading state
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Booking...';

        try {
            const response = await fetch(`${API_BASE_URL}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from,
                    to,
                    date,
                    transport
                })
            });

            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json')
                ? await response.json()
                : { message: await response.text() };

            if (response.ok) {
                showToast("Booking successful! Your ticket has been booked.", "success");
                bookingForm.reset();

                // Refresh tickets if tickets section is visible
                if (document.getElementById('tickets') && document.getElementById('tickets').style.display !== 'none') {
                    displayTickets();
                }
            } else {
                throw new Error(data.message || 'Booking failed');
            }
        } catch (error) {
            console.error('Error booking:', error);
            showToast(error.message || "Error saving booking. Please try again.", "error");
        } finally {
            // Reset loading state
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Search Now';
        }
    });
}
// ===== INTERACTIVE ELEMENTS =====

// Image Gallery for Destinations
function initImageGallery() {
    const galleryContainer = document.querySelector('.destination-gallery');
    if (!galleryContainer) return;

    const images = [
        { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80', alt: 'Mountain Adventure', title: 'Mountain Hiking' },
        { src: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=400&q=80', alt: 'Beach Paradise', title: 'Beach Resort' },
        { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80', alt: 'City Exploration', title: 'Urban Discovery' },
        { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=400&q=80', alt: 'Forest Retreat', title: 'Nature Escape' },
        { src: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=400&q=80', alt: 'Desert Safari', title: 'Desert Adventure' },
        { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=400&q=80', alt: 'Island Paradise', title: 'Island Getaway' }
    ];

    galleryContainer.innerHTML = images.map((img, index) => `
        <div class="gallery-item" onclick="openLightbox(${index})">
            <img src="${img.src}" alt="${img.alt}" loading="lazy">
            <div class="gallery-overlay">
                <h4>${img.title}</h4>
            </div>
        </div>
    `).join('');

    // Store images globally for lightbox
    window.galleryImages = images;
}

// Lightbox functionality
function openLightbox(index) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay" onclick="closeLightbox()"></div>
        <div class="lightbox-content">
            <img src="${window.galleryImages[index].src}" alt="${window.galleryImages[index].alt}">
            <div class="lightbox-info">
                <h3>${window.galleryImages[index].title}</h3>
                <p>${window.galleryImages[index].alt}</p>
            </div>
            <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
            <button class="lightbox-prev" onclick="changeImage(-1)">&#10094;</button>
            <button class="lightbox-next" onclick="changeImage(1)">&#10095;</button>
        </div>
    `;

    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    window.currentImageIndex = index;
}

function closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    if (lightbox) {
        lightbox.remove();
        document.body.style.overflow = '';
    }
}

function changeImage(direction) {
    const totalImages = window.galleryImages.length;
    window.currentImageIndex = (window.currentImageIndex + direction + totalImages) % totalImages;
    const lightboxImg = document.querySelector('.lightbox-content img');
    const lightboxTitle = document.querySelector('.lightbox-info h3');
    const lightboxDesc = document.querySelector('.lightbox-info p');

    lightboxImg.src = window.galleryImages[window.currentImageIndex].src;
    lightboxTitle.textContent = window.galleryImages[window.currentImageIndex].title;
    lightboxDesc.textContent = window.galleryImages[window.currentImageIndex].alt;
}

// Weather Widget
async function initWeatherWidget() {
    const weatherContainer = document.querySelector('.weather-widget');
    if (!weatherContainer) return;

    try {
        // Using a free weather API (you might want to use your own API key)
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=28.6139&longitude=77.2090&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m');
        const data = await response.json();

        const weather = data.current_weather;
        const temperature = Math.round(weather.temperature);
        const windspeed = Math.round(weather.windspeed);

        weatherContainer.innerHTML = `
            <div class="weather-card">
                <div class="weather-header">
                    <h4>Delhi Weather</h4>
                    <span class="weather-icon">${getWeatherIcon(weather.weathercode)}</span>
                </div>
                <div class="weather-details">
                    <div class="temp">${temperature}°C</div>
                    <div class="conditions">
                        <span>Wind: ${windspeed} km/h</span>
                        <span>Humidity: ${data.hourly.relativehumidity_2m[0]}%</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        weatherContainer.innerHTML = '<p>Weather data unavailable</p>';
    }
}

function getWeatherIcon(code) {
    // WMO Weather interpretation codes
    if (code === 0) return '☀️'; // Clear sky
    if (code >= 1 && code <= 3) return '⛅'; // Partly cloudy
    if (code >= 45 && code <= 48) return '🌫️'; // Fog
    if (code >= 51 && code <= 55) return '🌦️'; // Drizzle
    if (code >= 56 && code <= 57) return '🌨️'; // Freezing drizzle
    if (code >= 61 && code <= 65) return '🌧️'; // Rain
    if (code >= 66 && code <= 67) return '🌨️'; // Freezing rain
    if (code >= 71 && code <= 75) return '❄️'; // Snow
    if (code >= 77) return '🌨️'; // Snow grains
    if (code >= 80 && code <= 82) return '🌦️'; // Rain showers
    if (code >= 85 && code <= 86) return '🌨️'; // Snow showers
    if (code >= 95) return '⛈️'; // Thunderstorm
    return '☀️'; // Default
}

// Initialize all interactive elements when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initImageGallery();
    initWeatherWidget();

    // Set minimum date for booking form
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // Hero button scroll to booking
    const planBtn = document.getElementById('planBtn');
    if (planBtn) {
        planBtn.addEventListener('click', function() {
            const bookingSection = document.getElementById('booking');
            if (bookingSection) {
                bookingSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Initialize tickets section (hide by default)
    const ticketsSection = document.getElementById('tickets');
    if (ticketsSection) {
        ticketsSection.style.display = 'none';
    }
});

// ===== TICKETS DISPLAY FUNCTIONALITY =====
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.booking-section, .tickets-section');
    sections.forEach(section => section.style.display = 'none');

    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    // Add active class to clicked tab
    const activeTab = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }

    // Load tickets if tickets section is shown
    if (sectionName === 'tickets') {
        displayTickets();
    }
}

async function fetchBookings() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`);
        const data = await parseJSONResponse(response);
        if (!response.ok) {
            throw new Error(data.message || 'Unable to fetch bookings');
        }
        return data;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }
}

async function displayTickets() {
    const ticketsList = document.getElementById('tickets-list');
    const noTickets = document.getElementById('no-tickets');

    if (!ticketsList) return;

    const bookings = await fetchBookings();

    if (!bookings || bookings.length === 0) {
        ticketsList.innerHTML = '';
        noTickets.style.display = 'block';
        return;
    }

    noTickets.style.display = 'none';

    bookings.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

    ticketsList.innerHTML = bookings.map(booking => `
        <div class="ticket-card" data-booking-id="${booking._id}">
            <div class="ticket-header">
                <div class="ticket-route">
                    <span class="from-city">${booking.from}</span>
                    <span class="arrow">→</span>
                    <span class="to-city">${booking.to}</span>
                </div>
                <div class="ticket-transport">${booking.transport}</div>
            </div>

            <div class="ticket-details">
                <div class="ticket-info">
                    <div class="info-item">
                        <span class="label">Travel Date:</span>
                        <span class="value">${new Date(booking.date).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Booked On:</span>
                        <span class="value">${new Date(booking.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Booking ID:</span>
                        <span class="value">#${booking._id.slice(-6).toUpperCase()}</span>
                    </div>
                </div>
            </div>

            <div class="ticket-actions">
                <button onclick="printTicket('${booking._id}')" class="print-ticket-btn">Print Ticket</button>
                <button onclick="cancelBooking('${booking._id}')" class="cancel-booking-btn">Cancel</button>
            </div>
        </div>
    `).join('');
}

async function printTicket(bookingId) {
    const bookings = await fetchBookings();
    const booking = bookings.find(b => b._id === bookingId);

    if (!booking) {
        showToast('Booking not found', 'error');
        return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TripVerse Ticket - #${booking._id.slice(-6).toUpperCase()}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .ticket { border: 2px solid #007bff; padding: 20px; max-width: 600px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .route { font-size: 24px; font-weight: bold; margin: 10px 0; }
                .details { margin: 15px 0; }
                .detail-row { display: flex; justify-content: space-between; margin: 5px 0; }
                .booking-id { background: #f8f9fa; padding: 10px; text-align: center; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="header">
                    <h1>TripVerse</h1>
                    <p>Travel Ticket</p>
                </div>

                <div class="route">
                    ${booking.from} → ${booking.to}
                </div>

                <div class="details">
                    <div class="detail-row">
                        <strong>Transport:</strong>
                        <span>${booking.transport}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Travel Date:</strong>
                        <span>${new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Booked On:</strong>
                        <span>${new Date(booking.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div class="booking-id">
                    <strong>Booking ID: #${booking._id.slice(-6).toUpperCase()}</strong>
                </div>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE'
        });

        const data = await parseJSONResponse(response);
        if (!response.ok) {
            throw new Error(data.message || 'Unable to cancel booking');
        }

        showToast(data.message || 'Booking cancelled successfully', 'success');
        displayTickets();
    } catch (error) {
        console.error('Error cancelling booking:', error);
        showToast(error.message || 'Error cancelling booking. Please try again.', 'error');
    }
}