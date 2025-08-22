from flask import Flask, render_template, redirect, request, session, jsonify, send_file
import sqlite3 as sql
from werkzeug.security import generate_password_hash, check_password_hash
from sems import sem1, sem2
from generate_pdfs import pdf_S1, pdf_S2
import os
from majorat import trier_moyenne_s1, dsi, rss, dwm, moyenne_matiere
from statistique import statistiqueDeSemesters, statistiqueMatiere
import sys

app = Flask(__name__)
app.secret_key = "votre_cle_secrete"

# ================= Database =================
def connect_to_database():
    """Établit une connexion à la base de données SQLite."""
    conn = sql.connect("etudiants.db")
    conn.row_factory = sql.Row
    return conn

def init_db():
    """Initialise la table 'student' si elle n'existe pas."""
    with connect_to_database() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS student (
                ID TEXT PRIMARY KEY,
                password TEXT NOT NULL
            )
        """)
        conn.commit()

# ================= Routes =================
@app.route("/")
def index():
    """Affiche la page d'accueil."""
    return render_template("index.html", username=session.get("user",""))

@app.route("/register", methods=("GET", "POST"))
def register():
    """Gère l'inscription des nouveaux étudiants."""
    alert = ""
    if request.method == "POST":
        matricule = request.form["matricule"].strip()
        password = request.form["password"]
        confirm_password = request.form["confirm_password"]

        if password == confirm_password:
            hashed_password = generate_password_hash(password)

            with connect_to_database() as conn:
                existing_user = conn.execute(
                    "SELECT ID FROM student WHERE ID = ?", (matricule,)
                ).fetchone()

                if not existing_user:
                    conn.execute(
                        "INSERT INTO student (ID, password) VALUES (?, ?)",
                        (matricule, hashed_password)
                    )
                    conn.commit()
                    return redirect("/login")
                else:
                    alert = "Ce matricule est déjà inscrit."
        else:
            alert = "Les mots de passe ne correspondent pas."

    return render_template("register.html", alert=alert)

@app.route("/login", methods=("GET", "POST"))
def login():
    """Gère la connexion des étudiants."""
    alert = ""
    if request.method == "POST":
        matricule = request.form["matricule"].strip()
        password = request.form["password"]

        with connect_to_database() as conn:
            user = conn.execute(
                "SELECT password FROM student WHERE ID = ?", (matricule,)
            ).fetchone()

            if not user:
                alert = "Vous n'êtes pas inscrit."
            elif check_password_hash(user["password"], password):
                session["user"] = matricule
                return redirect("/")
            else:
                alert = "Mot de passe incorrect."

    return render_template("login.html", alert=alert)

@app.route("/logout")
def logout():
    """Déconnecte l'utilisateur."""
    session.pop("user", None)
    return redirect("/")

# ================= API =================
@app.route("/api/semestre<int:semester>")
def get_semester_data(semester):
    """
    API pour obtenir les notes d'un semestre en HTML.
    Utilise les fonctions importées de 'show_notes_S1_different.py'.
    """
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    matricule = session["user"]

    if semester == 1:
        # Appelle la fonction sem1 pour le semestre 1
        html_content = sem1(matricule)
    elif semester == 2:
        # Appelle la fonction sem2 pour le semestre 2
        html_content = sem2(matricule)
    else:
        # Gère les semestres non implémentés ou invalides
        return jsonify({"error": f"Le semestre {semester} n'est pas encore disponible."}), 404

    # Gère les cas où les fonctions de notes ne trouvent pas le matricule
    if "Notes pour le semestre" in html_content:
        return jsonify({"error": html_content.strip()}), 404
        
    return jsonify({"html": html_content})

@app.route("/api/pdf_S<int:semester>")
def get_semester_pdf(semester):
    """
    API pour télécharger le PDF d'un semestre.
    Envoie le fichier directement au navigateur.
    """
    if "user" not in session:
        return jsonify({"error": "Unauthorized"}), 401

    matricule = session["user"]
    pdf_path = None

    try:
        if semester == 1:
            pdf_path = pdf_S1(matricule)
        elif semester == 2:
            pdf_path = pdf_S2(matricule)
        # TODO: Ajoutez les autres semestres ici
        # elif semester == 3:
        #     pdf_path = pdf_S3(matricule)
        # elif semester == 4:
        #     pdf_path = pdf_S4(matricule)
        # elif semester == 5:
        #     pdf_path = pdf_S5(matricule)
        else:
            return jsonify({"error": f"PDF pour le semestre {semester} non disponible."}), 404

        if pdf_path and os.path.exists(pdf_path):
            # Envoie le fichier au client avec le bon Content-Type
            return send_file(pdf_path, as_attachment=True, download_name=f"Releve_S{semester}_{matricule}.pdf")
        else:
            # Gère les cas où le fichier n'est pas trouvé
            return jsonify({"error": "PDF non trouvé pour ce matricule. Le matricule n'existe pas ou le PDF est invalide."}), 404
            
    except Exception as e:
        # Capture toutes les erreurs pour éviter que l'application ne s'arrête
        print(f"Erreur lors de la génération ou de l'envoi du PDF : {e}")
        return jsonify({"error": "Erreur interne du serveur lors de la génération du PDF."}), 500



@app.route("/api/majorat", methods=["GET", "POST"])
def majorat():
    if request.method == "POST":
        # Vérifier si les données sont en format JSON ou form-data
        if request.is_json:
            data = request.get_json()
            categorie = data.get("categorie")
            semester = data.get("semester")
            filiere = data.get("filiere")
            matiere = data.get("matiere")
        else:
            categorie = request.form.get("categorie")
            semester = request.form.get("semester")
            filiere = request.form.get("filiere")
            matiere = request.form.get("matiere")

        if not categorie:
            return jsonify({"error": "Catégorie manquante"})

        if categorie == "moyenne_generale":
            if semester == "S1":
                return jsonify(trier_moyenne_s1())
            elif semester == "S2":
                if filiere == "DSI":
                    return jsonify(dsi())
                elif filiere == "RSS":
                    return jsonify(rss())
                elif filiere == "DWM":
                    return jsonify(dwm())
                else:
                    return jsonify({"error": "Filière invalide"})
            else:
                return jsonify({"error": "Semestre invalide"})

        elif categorie == "moyenne_du_matiere":
            if not matiere:
                return jsonify({"error": "Matière manquante"})
            if not semester:
                return jsonify({"error": "Semestre manquant"})

            result = moyenne_matiere(matiere=matiere, semester=semester)
            return jsonify(result)
        else:
            return jsonify({"error": "Catégorie invalide"})

    # Si méthode GET ou autre
    return jsonify({"error": "Méthode non autorisée"})


@app.route("/api/stat", methods=["POST"])
def stat():
    try:
        data = request.get_json()
        categorie = data.get("statType")
        semester = data.get("semester")
        filiere = data.get("filiere")
        matiere = data.get("matiere")

        if categorie == "moyenne":
            if semester == "S2" and not filiere:
                return jsonify({"error": "Veuillez choisir une filière pour le semestre S2."}), 400
            
            # Use try-except to handle potential errors from the statistique function
            if not statistiqueDeSemesters(semester=semester, filiere=filiere):
                return jsonify({"error": "Statistiques non disponibles pour la sélection."}), 500
            
            return send_file("statut.png", mimetype="image/png")

        elif categorie == "matiere":
            # Check if filiere is required but not provided
            if semester == "S2" and not filiere:
                return jsonify({"error": "Veuillez choisir une filière pour le semestre S2."}), 400
                
            # Use try-except to handle potential errors from the statistique function
            if not statistiqueMatiere(semester=semester, filiere=filiere, matiere=int(matiere)):
                return jsonify({"error": "Statistiques non disponibles pour la sélection."}), 500
            
            return send_file("statut.png", mimetype="image/png")

        return jsonify({"error": "Catégorie invalide"}), 400
    
    except Exception as e:
        # Log the error for debugging purposes
        print(f"An error occurred: {e}", file=sys.stderr)
        return jsonify({"error": "Une erreur interne du serveur est survenue."}), 500

#    ========== Run =================
if __name__ == "__main__":
    init_db()
    app.run(debug=True)
