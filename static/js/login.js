        // Enhanced form submission with loading state
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            
            const matricule = document.getElementById('matricule').value;
            const password = document.getElementById('password').value;
            
            if (matricule && password) {
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
                    document.getElementById('loginForm').reset();
                    
                    // Redirect after 2 seconds
                    setTimeout(() => {
                        window.location.href = '/dashboard'; // Change this to your desired redirect
                    }, 2000);
                }, 1500);
            }
        });

        // Password toggle
        document.getElementById('togglePassword').addEventListener('click', function() {
            const password = document.getElementById('password');
            const icon = this;
            
            if (password.type === 'password') {
                password.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                password.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
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
                
                btn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 700);
            }
        });

        // Create particle system
        function createParticles() {
            const particleCount = 15;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 20 + 's';
                particle.style.animationDuration = (Math.random() * 10 + 20) + 's';
                document.body.appendChild(particle);
            }
        }

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

        // Input focus animations
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.01)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            createParticles();
            
            // Focus first input
            document.getElementById('matricule').focus();
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
            
            @keyframes float {
                0%, 100% {
                    transform: translateY(0px) rotate(0deg);
                }
                50% {
                    transform: translateY(-20px) rotate(180deg);
                }
            }
            
            .particle {
                animation: float linear infinite;
            }
        `;
        document.head.appendChild(style);
