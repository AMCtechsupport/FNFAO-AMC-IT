# AMC-FNFAO Database

<div align="center">
  <img src="public/logo.png" alt="Logo" width="400" height="400">
</div>

***Abinoojiyak Bigiiwewag — Our Children are Coming Home.***

## About The Application

The AMC-FNFAO Database is a system to track information about clients who are served at the First Nations Family Advocate Office.

Features of the application include...
* Creation and management of clients.
* Assign client to advocates, who can edit and update their records.
* Ability to export data and generate reports.

...and more.

### Built With

* [Next.js](https://nextjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Supabase](https://supabase.com/)

## Getting Started

To get a local copy of the application up and running, follow these simple steps.

### Prerequisites

* npm
```sh
npm install npm@latest -g
```

### Installation

1. Request environment variables from the project admin/owner or from passed down documentation
2. Clone the repo
```sh
git clone https://github.com/bitprojectspace/amc-fnfao.git
```
3. Install NPM packages
```sh
npm install
```
4. Create a .env.local file in the root of the project, and add your environment variables there

## Usage

To run the application in development mode, run in the root of the project:
```sh
npm run dev
```

To build the application to be production-ready, run in the root of the project:
```sh
npm run build
```

To run the production build after it's creation, run in the root of the project:
```sh
npm start
```