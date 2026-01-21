# VAII – Semestrálna práca  
**Vývoj aplikácií pre internet a intranet**

Toto je môj semestrálny projekt z predmetu **VAII** (2025/2026?).  
Plnohodnotná webová aplikácia s **Laravel** backendom a **React** frontendom.

## Tech stack

- **Backend**: PHP 8 • Laravel 10/11 • MySQL  
- **Frontend**: React (Vite) • TypeScript • Tailwind CSS (alebo čisté CSS)  
- **Databáza**: MySQL (cez XAMPP / MariaDB)  
- **Server**: Apache (XAMPP) + php artisan serve  
- **Štýly**: Blade (server-side) + moderný React frontend

## Inštalácia a spustenie (lokalne)

1. Naklonuj repozitár  
   ```bash
   git clone https://github.com/IlliaxxxIvanilov/Vaii_semestralna_praca.git
   cd Vaii_semestralna_praca/vaiiko

Spusti XAMPP (Apache + MySQL)
Backend (Laravel)Bashcd backend   
composer install
cp .env.example .env
php artisan key:generateUprav .env – nastav databázu:textDB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nazov_tvojej_databazy
DB_USERNAME=root
DB_PASSWORD=Migrácie + seed (ak existuje):Bashphp artisan migrate --seed
Frontend (React)Bashcd ../frontend    # alebo priamo do priečinka s package.json
npm install
npm run dev       # alebo npm start
Spustenie
Backend → php artisan serve (zvyčajne http://127.0.0.1:8000)
Frontend → npm run dev (zvyčajne http://localhost:5173)
Otvor prehliadač na adrese frontendu (React bude pravdepodobne komunikovať s Laravel API).

Štruktúra projektu
textVaii_semestralna_praca/
├── vaiiko/
│   ├── backend/           
│   │   ├── app/
│   │   ├── routes/
│   │   ├── database/
│   │   └── ...
│   └── frontend/          
│       ├── src/
│       ├── public/
│       └── package.json
└── README.md
Použitie AI
Časť kódu (najmä úvodné generovanie štruktúry, komponentov a niektorých endpointov) bola vytvorená s pomocou AI nástrojov (Grok / Claude / GPT). Následne som všetko manuálne upravoval, testoval, opravoval a prispôsoboval požiadavkám zadania.
Funkcionalita (doplň podľa svojej aplikácie!)

Registrácia / Prihlásenie používateľov
CRUD operácie s hlavnou entitou
Responzívny dizajn
API komunikácia frontend ↔ backend
Autentifikácia (Sanctum / session / JWT)

Autor
Illia Ivanilov
