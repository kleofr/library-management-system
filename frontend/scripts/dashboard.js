document.addEventListener("DOMContentLoaded", function() {
    const menuItems = document.querySelectorAll('.menu ul li');
    const forms = document.querySelectorAll('.content form');

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all menu items
            menuItems.forEach(item => item.classList.remove('active'));
            // Add active class to clicked menu item
            this.classList.add('active');
            // Hide all forms
            forms.forEach(form => form.classList.add('hidden'));
            // Show corresponding form based on data-target attribute
            const targetFormId = this.querySelector('a').getAttribute('data-target');
            document.getElementById(targetFormId).classList.remove('hidden');
        });
    });
});
