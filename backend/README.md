# Meerai Backend

A production-ready NestJS backend with Fastify, SWC compiler, MongoDB, and comprehensive meal suggestion system.

## 🚀 Features

- **NestJS + Fastify**: High-performance HTTP server with Fastify adapter
- **SWC Compiler**: Rust-based TypeScript compiler for maximum build speed
- **MongoDB Integration**: Mongoose ODM with proper schema design
- **JWT Authentication**: Secure authentication with role-based access control
- **Compression**: Gzip and Brotli compression for optimal performance
- **Swagger Documentation**: Interactive API documentation at `/docs`
- **Docker Support**: Multi-stage Dockerfile with health checks
- **Environment Validation**: Zod-based environment variable validation
- **Database Seeding**: Comprehensive seed system with sample data

## 🏗️ Architecture

### Modules

- **Auth**: JWT-based authentication with bcrypt password hashing
- **Users**: User management with admin/user roles
- **Menus**: Meal menu CRUD with filtering and preferences
- **Preferences**: User dietary preferences and restrictions
- **Schedules**: Meal timing preferences per user
- **Suggestions**: AI-like meal suggestion system based on preferences

### Tech Stack

- **Runtime**: Node.js 20 with Bun package manager
- **Framework**: NestJS with Fastify adapter
- **Database**: MongoDB with Mongoose ODM
- **Authentica