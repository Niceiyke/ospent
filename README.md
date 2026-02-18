# Ospent - Intelligence Ledger & Budget Strategist

Ospent is a modern, high-performance financial tracking application built for those who demand precision and aesthetic excellence. It transitions beyond simple tracking into a "Fiscal Strategy" tool with advanced classification and reporting.

![Version](https://img.shields.io/badge/version-1.1.0-emerald)
![Tech](https://img.shields.io/badge/tech-React_18_|_Node_|_SQLite-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Key Features

- **Master Ledger:** Real-time inbound and outbound transaction tracking with Naira (₦) as base currency.
- **Budget Strategy:** Sector-based allocation with visual utilization audits.
- **Intelligence Reports:** 
  - Net Position tracking (Surplus vs. Deficit).
  - Multi-granularity Analysis: Daily, Weekly, Monthly, Quarterly, and Yearly views.
  - Capital vs. Recurring classification for deep fiscal insight.
- **Cyber-Minimalist UI:** A professional Deep Slate & Emerald theme with seamless Dark/Light mode support.
- **Mobile First:** Optimized for high-velocity entry on touch devices with a responsive bottom navigation.
- **Secure Authentication:** JWT-protected sessions with a persistent SQLite backend.

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4.
- **State/Hooks:** Custom Hooks for Transactions, Budgets, Categories, and Auth.
- **Charts:** Recharts for advanced data visualization.
- **Icons:** Lucide React.
- **Backend:** Node.js, Express, Better-SQLite3.
- **Security:** Bcrypt.js, JWT.
- **DevOps:** Docker, Docker Compose, Traefik (Edge Network).

## 🏃‍♂️ Deployment

The application is fully containerized.

```bash
# 1. Clone the repository
git clone git@github.com:Niceiyke/ospent.git
cd ospent

# 2. Start the infrastructure
docker compose up -d --build
```

Access the master node at: `https://ospent.wordlyte.com`

**Default Credentials:**
- **Username:** `testuser`
- **Password:** `testpassword`

## 🧪 Testing

The system includes a suite of Vitest units for core hooks and components.

```bash
npm run test
```

## 🏗 Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the detailed engineering blueprint and data models.

## 🔮 Roadmap

- [ ] CSV / Google Sheets Import Agent.
- [ ] Predictive Spending Forecast (AI-driven).
- [ ] Multi-user Collaboration for shared budgets.
- [ ] Push Notifications for budget alerts.
