.PHONY: help setup db-up db-down db-reset migrate build-api build-frontend build verify verify-api

help: ## Show available targets
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-16s %s\n", $$1, $$2}'

setup: db-up migrate ## Start the database and apply migrations (first-time setup)

db-up: ## Start the SQL Server container (docker compose up -d)
	docker compose up -d

db-down: ## Stop the SQL Server container
	docker compose down

db-reset: ## Wipe the database volume and re-apply migrations
	docker compose down -v
	$(MAKE) setup

migrate: ## Apply EF Core migrations to the local database
	@echo "Waiting for SQL Server to accept connections..."
	@for i in 1 2 3 4 5 6 7 8 9 10 11 12; do \
		if cd UserManagementAPI/UserManagement.DataAccess.EFCore && \
		   dotnet ef database update --startup-project ../UserManagement.API; then \
			exit 0; \
		fi; \
		echo "  attempt $$i failed; retrying in 5s..."; \
		sleep 5; \
	done; \
	echo "FAIL: migrations did not succeed after 12 attempts"; \
	exit 1

build-api: ## Build the .NET solution
	cd UserManagementAPI && dotnet build

build-frontend: ## Production build of the Angular app
	cd front-end && npm run build

build: build-api build-frontend ## Build API and front end

verify: ## Run full stack smoke checks (database, API, front end)
	./scripts/verify-stack.sh

verify-api: ## Run API-only smoke checks (set SKIP_FRONTEND=1)
	SKIP_FRONTEND=1 ./scripts/verify-stack.sh
