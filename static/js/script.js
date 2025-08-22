// A global variable to track the currently active navigation element
let currentActiveEl = null;

// The global timeout ID to be able to cancel pending animations/loads
let loadingTimeout = null;

// Define the semesters data once globally to avoid duplication
const semesters = {
    'S1': {"FR": 8, "ENG": 13, "PPP": 18, "ALGEBRE": 25, "ANALYSE": 30, "PIX": 35, "C++": 42, "BD": 47, "TWEB": 52, "BI": 59, "BR": 64},
    'S2': {"FR": 8, "ENG": 13, "PPP": 18, "PYTHON": 25, "PHP": 30, "ALGEBRE II": 37, "PROBABILITE": 42, "PIX II": 47, "SL": 54, "SE": 59},
};

// ================= UI Utilities =================

/**
 * Creates particles for the background animation.
 */
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;

  for (let i = 0; i < 25; i++) {
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

/**
 * Toggles the mobile navigation menu.
 */
function toggleNav() {
  const nav = document.getElementById('navMenu');
  if (nav) {
    nav.classList.toggle('show');
  }
}

/**
 * Updates the main content section based on the selected navigation item.
 * @param {string} section The name of the section to load ('accueil', 'resultats', etc.).
 * @param {HTMLElement} el The clicked navigation element.
 */
function loadSection(section, el) {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
  }

  const content = document.getElementById("mainContent");
  if (!content) return;

  content.innerHTML = '<div style="text-align: center; padding: 3rem;"><div class="loading"></div></div>';

  loadingTimeout = setTimeout(() => {
    if (el && el !== currentActiveEl) {
      document.querySelectorAll('.nav span').forEach(s => s.classList.remove('active'));
      el.classList.add('active');
      currentActiveEl = el;
    }

    const username = document.getElementById("username") ? document.getElementById("username").textContent : '';
    let sectionContent = '';

    const contentMap = {
      'accueil': `
        <section class="section">
          <h2>✨ Bienvenue${username ? ' ' + username : ''} !</h2>
          <p style="color: var(--clr-text-muted); margin-bottom: 2rem;">
            ${username ? 'Votre portail de résultats académiques' : 'Connectez-vous pour accéder à vos données'}
          </p>
          ${!username ? `
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <a href="/register" class="btn btn-auth">
              <i class="fas fa-user-plus"></i> S'inscrire
            </a>
            <a href="/login" class="btn btn-auth">
              <i class="fas fa-sign-in-alt"></i> Se connecter
            </a>
          </div>` : ''}
        </section>`,
      'Resultats': `
        <section class="section">
          <h2>📚 Mes Notes</h2>
          <p style="color: var(--clr-text-muted); margin-bottom: 2rem;">
            Consultez vos notes par semestre
          </p>
          <div class="btn-grid">
            <button class="btn btn-semester" onclick="fetchSemesterData(1, this)">
              <i class="fas fa-calendar-alt"></i> Semestre 1
            </button>
            <button class="btn btn-semester" onclick="fetchSemesterData(2, this)">
              <i class="fas fa-calendar-alt"></i> Semestre 2
            </button>
            <button class="btn btn-semester" onclick="fetchSemesterData(3, this)">
              <i class="fas fa-calendar-alt"></i> Semestre 3
            </button>
            <button class="btn btn-semester" onclick="fetchSemesterData(4, this)">
              <i class="fas fa-calendar-alt"></i> Semestre 4
            </button>
            <button class="btn btn-semester" onclick="fetchSemesterData(5, this)">
              <i class="fas fa-calendar-alt"></i> Semestre 5
            </button>
          </div>
          <br>
          <div id="notesContainer"></div>
          <br>
          <div id="download"><button id="telecharger" class="btn btn-download" style="display:none" onclick="fetchPDFData()">
            <i class="fa-solid fa-download"></i> Télécharger le PDF
          </button></div>
        </section>`,
      'meilleurs': `
    <section class="section">
        <form method="post" id="rankingForm">
            <div class="header2">
                <i class="fas fa-trophy trophy-icon"></i>
                <h1 class="title2">Meilleurs Étudiants</h1>
                <div class="title-underline2"></div>
            </div>
            <p class="subtitle2">
                Découvrez le classement des meilleurs étudiants de l'établissement
            </p>
            
            <div class="form-container2">
                <div class="dropdown-wrapper">
                    <select class="dropdown-select" id="firstSelectRanking" name="categorie">
                        <option value="" disabled selected>Choisissez une catégorie</option>
                        <option value="moyenne_generale">Trier par moyenne générale</option>
                        <option value="moyenne_du_matiere">Trier par moyenne du matière</option>
                    </select>
                </div>
            </div>
            
            <div class="select-container" id="selectContainerRanking"></div>
            
            <button type="submit" class="submit-btn">Afficher le classement</button>
            
            <div class="results-container" id="resultsContainerRanking" style="display: none;">
                </div>
        </form>
    </section>`,
      'statistiques': `
        <section class="section">
          <form id="statForm">

                <div class="header2">
            <i class="fas fa-chart-pie" style="color:orange;font-size:2rem"></i>
                <h1 class="title2">Statistiques</h1>
                <div class="title-underline2"></div>
            </div>
            <p class="subtitle2">Visualisez les statistiques de l'établissement</p>

            <select class="dropdown-select" id="firstSelectStat" name="statType">
              <option value="" disabled selected>Choisissez une statistique</option>
              <option value="moyenne">Répartition générale des admis</option>
              <option value="matiere">Répartition des admis par matière</option>
            </select>

            <div class="select-container" id="selectContainerStat"></div>
            <button type="submit" class="submit-btn">Afficher</button>
            <br> <br>
            <div  id="statResults" style="display: none;"></div>
          </form>
        </section>`
    };

    sectionContent = contentMap[section] || '<h2>Section non trouvée</h2>';
    content.innerHTML = sectionContent;

    setupPageSpecificListeners();
    
    observeNewElements();
    smoothScrollToSection();
    setLoadingState(false);
  }, 300);
}

/**
 * Fetches and displays notes for a specific semester.
 * @param {number} semester The semester number.
 */
function fetchSemesterData(semester, buttonEl) {
    const notesContainer = document.getElementById('notesContainer');
    const telechargerBtn = document.getElementById('telecharger');

    document.querySelectorAll('.btn-semester').forEach(btn => btn.classList.remove('active'));
    buttonEl.classList.add('active');

    notesContainer.innerHTML = '<div class="loading"></div>';
    telechargerBtn.style.display = 'none';

    localStorage.setItem('selectedSemester', semester);

    fetch(`/api/semestre${semester}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Erreur réseau ou non autorisé.');
            }
            return res.json();
        })
        .then(data => {
            if (data.error) {
                notesContainer.innerHTML = `<p style="color: var(--clr-danger);">${data.error}</p>`;
            } else {
                notesContainer.innerHTML = data.html;
                telechargerBtn.style.display = 'block';
            }
        })
        .catch(err => {
            console.error('Erreur:', err);
            notesContainer.innerHTML = `<p style="color: var(--clr-danger);">Erreur lors du chargement des notes, Ton matricle introuvable ou Ton note n'est pas valable.</p>`;
        });
}

/**
 * Fetches and downloads the PDF for the selected semester.
 */
function fetchPDFData() {
    const semester = localStorage.getItem('selectedSemester');
    if (!semester) {
        alert("Veuillez d'abord sélectionner un semestre.");
        return;
    }

    const telechargerBtn = document.getElementById('telecharger');
    const originalBtnText = telechargerBtn.innerHTML;
    telechargerBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Chargement...`;
    telechargerBtn.disabled = true;

    fetch(`/api/pdf_S${semester}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Erreur réseau ou non autorisé.');
            }
            return res.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `Relevé_Semestre_${semester}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(err => {
            console.error('Erreur lors du téléchargement du PDF:', err);
            alert("Une erreur s'est produite lors du téléchargement du PDF. Veuillez réessayer.");
        })
        .finally(() => {
            telechargerBtn.innerHTML = originalBtnText;
            telechargerBtn.disabled = false;
        });
}

/**
 * Redirects to the login page after a confirmation.
 */
function logout() {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    window.location.href = "/logout";
  }
}

// ================= Animation & Effects =================

/**
 * Handles the ripple effect on button clicks.
 */
function addRippleEffect() {
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn');
    if (btn) {
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
}

/**
 * Adds enhanced hover effects for navigation items.
 */
function addNavHoverEffects() {
  document.querySelectorAll('.nav span').forEach(navItem => {
    navItem.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px) scale(1.05)';
    });
    navItem.addEventListener('mouseleave', function() {
      if (!this.classList.contains('active')) {
        this.style.transform = 'translateY(0) scale(1)';
      }
    });
  });
}

/**
 * Smoothly scrolls to the main content section.
 */
function smoothScrollToSection() {
  const content = document.getElementById('mainContent');
  if (content) {
    content.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Sets a loading state by changing opacity and pointer events.
 * @param {boolean} isLoading True to show loading, false to hide.
 */
function setLoadingState(isLoading) {
  const content = document.getElementById("mainContent");
  if (content) {
    content.style.opacity = isLoading ? '0.7' : '1';
    content.style.pointerEvents = isLoading ? 'none' : 'auto';
  }
}

/**
 * Initializes Intersection Observer for fade-in animations.
 */
function initIntersectionObserver() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards';
      }
    });
  }, observerOptions);

  return observer;
}

/**
 * Observes new elements added to the DOM for animation.
 */
function observeNewElements() {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => observer.observe(section));
}

/**
 * Enhances particle system with mouse interaction.
 */
function enhanceParticles() {
  const particles = document.querySelectorAll('.particle');
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    particles.forEach((particle, index) => {
      const speed = (index % 3 + 1) * 0.5;
      const x = mouseX * speed * 10;
      const y = mouseY * speed * 10;
      particle.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
}

/**
 * Adds a smooth transition for theme changes.
 */
function addThemeTransition() {
  document.body.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
}

/**
 * Updates the dynamic gradient background.
 */
function updateGradientBackground() {
  const time = Date.now() * 0.0001;
  const x1 = Math.sin(time) * 50 + 50;
  const y1 = Math.cos(time * 0.8) * 50 + 50;
  const x2 = Math.cos(time * 1.2) * 50 + 50;
  const y2 = Math.sin(time * 0.6) * 50 + 50;
  document.body.style.backgroundImage = `
    radial-gradient(circle at ${x1}% ${y1}%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    radial-gradient(circle at ${x2}% ${y2}%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)
  `;
  requestAnimationFrame(updateGradientBackground);
}

// ================= Dynamic Content Event Listeners =================

/**
 * Creates and appends dynamic select menus based on the selected category.
 * @param {HTMLElement} firstSelect The initial select element (e.g., 'firstSelectRanking' or 'firstSelectStat').
 * @param {HTMLElement} selectContainer The container where new selects will be added.
 */
function createDynamicSelectMenus(firstSelect, selectContainer) {
    firstSelect.addEventListener('change', (event) => {
        const selectedValue = event.target.value;
        selectContainer.innerHTML = "";
        
        // Hide previous results container
        const resultsContainer = firstSelect.closest('form').querySelector('.results-container');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }

        if (selectedValue === "moyenne_generale" || selectedValue === "moyenne") {
            const secondSelect = document.createElement('select');
            secondSelect.classList.add("dropdown-select");
            secondSelect.name = "semester";
            secondSelect.innerHTML = `
                <option value="" disabled selected>Choisi un semestre</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
            `;
            selectContainer.appendChild(secondSelect);

            secondSelect.addEventListener("change", (e) => {
                let thirdSelect = selectContainer.querySelector(`.dropdown-select[name="filiere"]`);
                if (thirdSelect) thirdSelect.remove();

                if (e.target.value === "S2") {
                    thirdSelect = document.createElement("select");
                    thirdSelect.classList.add("dropdown-select");
                    thirdSelect.name = "filiere";
                    thirdSelect.innerHTML = `
                        <option value="" disabled selected>Choisi une filière</option>
                        <option value="DSI">DSI</option>
                        <option value="RSS">RSS</option>
                        <option value="DWM">DWM</option>
                    `;
                    selectContainer.appendChild(thirdSelect);
                }
            });
        } else if (selectedValue === "moyenne_du_matiere" || selectedValue === "matiere") {
            const secondSelect = document.createElement('select');
            secondSelect.classList.add("dropdown-select");
            secondSelect.name = "semester";
            secondSelect.innerHTML = `
                <option value="" disabled selected>Choisi un semestre</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
            `;
            selectContainer.appendChild(secondSelect);

            secondSelect.addEventListener("change", (e) => {
                let thirdSelect = selectContainer.querySelector(`.dropdown-select[name="matiere"]`);
                if (thirdSelect) thirdSelect.remove();
                
                let fourthSelect = selectContainer.querySelector(`.dropdown-select[name="filiere"]`);
                if (fourthSelect) fourthSelect.remove();

                if (e.target.value === "S2") {
                    const thirdSelectFiliere = document.createElement("select");
                    thirdSelectFiliere.classList.add("dropdown-select");
                    thirdSelectFiliere.name = "filiere";
                    thirdSelectFiliere.innerHTML = `
                        <option value="" disabled selected>Choisi une filière</option>
                        <option value="DSI">DSI</option>
                        <option value="RSS">RSS</option>
                        <option value="DWM">DWM</option>
                    `;
                    selectContainer.appendChild(thirdSelectFiliere);
                    
                    thirdSelectFiliere.addEventListener("change", () => {
                         let fourthSelect = selectContainer.querySelector(`.dropdown-select[name="matiere"]`);
                         if (fourthSelect) fourthSelect.remove();

                         const fourthSelectMatiere = document.createElement("select");
                         fourthSelectMatiere.classList.add("dropdown-select");
                         fourthSelectMatiere.name = "matiere";
                         let optionsHTML = `<option value="" disabled selected>Choisi une matière</option>`;
                         for (const [key, value] of Object.entries(semesters.S2)) {
                             optionsHTML += `<option value="${value}">${key}</option>`;
                         }
                         fourthSelectMatiere.innerHTML = optionsHTML;
                         selectContainer.appendChild(fourthSelectMatiere);
                    });
                } else if (e.target.value === "S1") {
                    const thirdSelectMatiere = document.createElement("select");
                    thirdSelectMatiere.classList.add("dropdown-select");
                    thirdSelectMatiere.name = "matiere";
                    let optionsHTML = `<option value="" disabled selected>Choisi une matière</option>`;
                    for (const [key, value] of Object.entries(semesters.S1)) {
                        optionsHTML += `<option value="${value}">${key}</option>`;
                    }
                    thirdSelectMatiere.innerHTML = optionsHTML;
                    selectContainer.appendChild(thirdSelectMatiere);
                }
            });
        }
    });
}


/**
 * Sets up event listeners for dynamically loaded content.
 */
function setupPageSpecificListeners() {
    // ================== "Meilleurs" Section Listeners ==================
    const firstSelectRanking = document.getElementById("firstSelectRanking");
    const selectContainerRanking = document.getElementById("selectContainerRanking");
    const rankingForm = document.getElementById("rankingForm");
    const resultsContainerRanking = document.getElementById("resultsContainerRanking");

    if (firstSelectRanking) {
        createDynamicSelectMenus(firstSelectRanking, selectContainerRanking);
    }

    if (rankingForm) {
        rankingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(rankingForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('/api/majorat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const results = await response.json();
                
                displayResults(results, resultsContainerRanking);
            } catch (error) {
                console.error('Erreur:', error);
                resultsContainerRanking.innerHTML = '<p class="error">Erreur lors du chargement des données</p>';
                resultsContainerRanking.style.display = "block";
            }
        });
    }

    // ================== "Statistiques" Section Listeners ==================
    const firstSelectStat = document.getElementById("firstSelectStat");
    const selectContainerStat = document.getElementById("selectContainerStat");
    const statForm = document.getElementById("statForm");
    const resultsContainerStat = document.getElementById("statResults");
    
    if (firstSelectStat) {
        createDynamicSelectMenus(firstSelectStat, selectContainerStat);
    }

    if (statForm) {
        statForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(statForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('/api/stat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Erreur serveur");
                }

                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                resultsContainerStat.innerHTML = `<img src="${url}" style="max-width:100%; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.2)">`;
                resultsContainerStat.style.display = "block";

            } catch (error) {
                console.error('Erreur:', error);
                resultsContainerStat.innerHTML = `<p class="error">Erreur lors du chargement des données: ${error.message}</p>`;
                resultsContainerStat.style.display = "block";
            }
        });
    }
}

/**
 * Displays the ranking results in the specified container.
 * @param {object} results The ranking data.
 * @param {HTMLElement} containerEl The container to display the results in.
 */
function displayResults(results, containerEl) {
    if (results.error) {
        containerEl.innerHTML = `<p class="error">${results.error}</p>`;
        containerEl.style.display = "block";
        return;
    }
    
    let html = '<h3>Classement:</h3>';
    
    if (Object.keys(results).length === 0) {
        html += '<p>Aucun résultat trouvé</p>';
    } else {
        let sortedResults = Object.entries(results).sort((a, b) => b[1] - a[1]);

        let rank = 1;
        for (const [name, score] of sortedResults) {
            html += `
                <div class="result-item">
                    <span class="rank">#${rank} </span>
                    <span class="student-name">${name}</span>
                    <span class="student-score">${score}</span>
                </div>
            `;
            rank++;
        }
    }
    
    containerEl.innerHTML = html;
    containerEl.style.display = "block";
}


// ================= Initialization =================
const observer = initIntersectionObserver();

document.addEventListener('DOMContentLoaded', function() {
  createParticles();
  addRippleEffect();
  addNavHoverEffects();
  enhanceParticles();
  addThemeTransition();
  updateGradientBackground();
  
  const activeNav = document.querySelector('.nav span.active');
  if (activeNav) {
    loadSection('accueil', activeNav);
  }
});