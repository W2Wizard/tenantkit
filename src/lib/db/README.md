# DB Structure

The DB folder contains everything you need in regards to handling the database.

```
.
└── db/
    ├── schemas/ <= Schemas for the different databases
    │   ├── landlord
    │   └── tenant
    ├── migrate <= Migration file (not really important)
    ├── seed <= Seed script
    ├── tenancy <= Tenancy utility functions (CRUD operations)
    └── utils <= General purpose utilities for DrizzleORM
```
