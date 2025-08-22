  // Enhanced particles animation
  function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 6 + 3;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = Math.random() * 6 + 6 + 's';
      particlesContainer.appendChild(particle);
    }
  }

  // Password visibility toggle
  function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId === 'password' ? 'togglePassword' : 'toggleConfirmPassword');
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    }
  }

  // Password strength checker
  function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('strengthBar');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (password.length === 0) {
      strengthIndicator.classList.remove('show');
      return;
    }
    
    strengthIndicator.classList.add('show');
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Character variety
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    // Remove previous classes
    strengthBar.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
    
    if (strength <= 2) {
      strengthBar.classList.add('strength-weak');
    } else if (strength <= 4) {
      strengthBar.classList.add('strength-medium');
    } else {
      strengthBar.classList.add('strength-strong');
    }
  }

  // Form validation
  function validateForm() {
    const matricule = document.getElementById('matricule').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    let isValid = true;


  // fetch("/api/student")
  //   .then(response => response.json())
  //   .then(data => {
  //         data.forEach(student => {
  //           if(student.ID == matricule){
  //             showError('Ce matricule est déjà inscrit.')
  //           }
  //           isValid = false 
  //         }
  //         )
  //       }
  //   )


    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(error => {
      error.classList.remove('show');
    });
    
    // Validate matricule
    if (!matricule || matricule.length < 1) {
      showError('matriculeError', 'Le matricule est obligatoire');
      isValid = false;
    }
    
    // Validate password
    if (password.length < 6) {
      showError('passwordError', 'Le mot de passe doit contenir au moins 6 caractères');
      isValid = false;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      showError('confirmPasswordError', 'Les mots de passe ne correspondent pas');
      isValid = false;
    }
    
    return isValid;
  }

  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('show');
  }

  // Form submission
  document.getElementById('registerForm').addEventListener('submit', async function(e) {
    
    if (!validateForm()) {
      return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    
    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-block';
    
    // Simulate form submission (replace with actual form submission)
    setTimeout(() => {
      // Reset button state
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      
      // Show success message
      document.getElementById('successMessage').classList.add('show');
      
      // Reset form
      document.getElementById('registerForm').reset();
      document.getElementById('passwordStrength').classList.remove('show');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }, 1500);
  });

  // Real-time validation
  document.getElementById('password').addEventListener('input', function() {
    checkPasswordStrength(this.value);
  });

  document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    
    if (this.value && this.value !== password) {
      showError('confirmPasswordError', 'Les mots de passe ne correspondent pas');
    } else {
      confirmPasswordError.classList.remove('show');
    }
  });

  // Enhanced ripple effect for buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn') || e.target.closest('.btn')) {
      const btn = e.target.classList.contains('btn') ? e.target : e.target.closest('.btn');
      
      if (btn.disabled) return;
      
      const ripple = document.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255,255,255,0.4);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.7s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        z-index: 10;
      `;

      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);

      setTimeout(() => ripple.remove(), 700);
    }
  });

  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    
    // Focus first input
    document.getElementById('matricule').focus();
  });

  // Enhanced particle system with mouse interaction
  document.addEventListener('mousemove', (e) => {
    const particles = document.querySelectorAll('.particle');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;

    particles.forEach((particle, index) => {
      const speed = (index % 3 + 1) * 0.3;
      const x = mouseX * speed * 8;
      const y = mouseY * speed * 8;

      particle.style.transform = `translate(${x}px, ${y}px)`;
    });
  });

  // Add CSS for ripple animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(2.5);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
