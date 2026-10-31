# The Fairy Folio Team Portal

Open the folder in VS Code, install the **Live Server** extension, right-click `index.html` and choose **Open with Live Server** (double-clicking index.html also works).

Demo logins (password `fairy123`): ayesha@fairyfolio.com (employee), sara@fairyfolio.com (intern), lead@fairyfolio.com (lead), admin@fairyfolio.com (admin).

Quick test: sign in as admin, Policy Settings, set both breaks to 1 minute, then sign in as an employee and run a break past its limit.

## Important
This build is a working front-end prototype. Data is stored in your browser (localStorage), "server time" is the browser clock, and passwords are plain text. For production, build the backend from SRS section 7 (Next.js, NestJS/Express, PostgreSQL, Prisma) and move the rules in `app.js` (Act, exc, over) to the API.
Not yet built: password reset and change, email notifications, file upload and hosted video, MFA, report version history.
