# SvelteKit Landlord Tenancy Template

This repository is a template for running a multi-tenant application with SvelteKit, leveraging a landlord-tenant architecture where each tenant has its own isolated database. This approach ensures data security and separation for each client.

## Getting Started

> [!WARNING]
> This template is still in development, this readme is more so a place holder for later.

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.
- [Docker](https://www.docker.com/) installed for database containerization.

### Installation and Setup

1. **Clone the Repository**

```bash
git clone <repository-url>
cd <repository-folder>
```

2. **Start the Database**
   Navigate to the `./docker/` folder and run the following command to spin up the database using Docker Compose:

```bash
docker-compose up -d
```

3. Generate your first migration
   In order for the database to have the current schema run:

```bash
# Generate a initial migration
bun run landlord:migration
# Seed the database with utility functions and stuff
bun run landlord:seed
# Apply all or the current migration
# NOTE: You can pass any of drizzles arguments to migrate (e.g: --name "xyz")
bun run landlord:migrate
```

1. **Run the Development Server**
   Start the development server with Bun:

```bash
bun run dev
```

1. **Run Database Migrations**

   After the database is running, apply migrations for the landlord database:

   ```bash
   bun run landlord:migrate
   ```

2. **Seed the Landlord Database**

   Seed the landlord database with initial data:

   ```bash
   bun run landlord:seed
   ```

### Running Migrations for Tenants

After setting up the landlord, you can create tenants, and each tenant will run on its own database. Ensure that tenant migrations are applied appropriately using Drizzle ORM.

### Additional Commands

- **Start Tenant-Specific Database**: Once a tenant is created, use tenant-specific migration commands similar to the landlord.
- **Run in Production**: Use `bun run build` for building the project and start it with `bun run start`.

## Technologies Used

- **[Bun](https://bun.sh/)**: A modern runtime for running JavaScript and TypeScript applications.
- **[SvelteKit](https://kit.svelte.dev/)**: Reactive framework for building web applications.
- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS for styling.
- **[ShadCN UI](https://ui.shadcn.dev/)**: UI component library for modern design.
- **[Drizzle ORM](https://orm.drizzle.team/)**: Manage database schemas and migrations.

## Notes

- Be sure to run the Docker containers to set up the database correctly before starting the server.
- Migrations and seeds are essential to configure the landlord's database before onboarding tenants.

Enjoy building your multi-tenant SvelteKit application with this template!
