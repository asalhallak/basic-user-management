.PHONY: help db-up db-down migrate build-api build-frontend build verify verify-api

help: ## Show available targets
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-16s %s\n", $$1, $$2}'

db-up: ## Start the SQL Server container (docker compose up -d)
	docker compose up -d

db-down: ## Stop the SQL Server container
	docker compose down

migrate: ## Apply EF Core migrations to the local database
	cd UserManagementAPI/UserManagement.DataAccess.EFCore && \
	dotnet ef database update --startup-project ../UserManagement.API

build-api: ## Build the .NET solution
	cd UserManagementAPI && dotnet build

build-frontend: ## Production build of the Angular app
	cd front-end && npm run build

build: build-api build-frontend ## Build API and front end

verify: ## Run full stack smoke checks (database, API, front end)
	./scripts/verify-stack.sh

verify-api: ## Run API-only smoke checks (set SKIP_FRONTEND=1)
	SKIP_FRONTEND=1 ./scripts/verify-stack.sh
