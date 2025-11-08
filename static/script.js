document.addEventListener('DOMContentLoaded', function () {
    // Get the resizer element and the sidebar
    const resizer = document.getElementById('dragMe');
    const sidebar = document.getElementById('sidebar');

    // This function will be called when the mouse is moved
    const mouseMoveHandler = function (e) {
        // Calculate the new width based on the mouse's horizontal position
        const newWidth = e.clientX - sidebar.getBoundingClientRect().left;
        sidebar.style.width = `${newWidth}px`;
    };

    // This function will be called when the mouse button is released
    const mouseUpHandler = function () {
        // Stop listening for mouse movement
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    // This function is called when the user first clicks on the resizer
    const mouseDownHandler = function () {
        // Start listening for mouse movement and release
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };

    // Attach the mousedown event listener to the resizer
    resizer.addEventListener('mousedown', mouseDownHandler);
});

// Toggle DTC codes list
function toggleDTCList() {
    const dtcSection = document.getElementById('dtc-codes-section');
    if (dtcSection) {
        dtcSection.classList.toggle('is-visible');
    }
}

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');
    const currentTheme = body.getAttribute('data-theme');
    
    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const themeIcon = document.querySelector('.theme-icon');
    
    document.body.setAttribute('data-theme', savedTheme);
    
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'light' ? '☀️' : '🌙';
    }
});