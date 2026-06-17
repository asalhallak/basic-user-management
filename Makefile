.PHONY: help check-deps install install-ef setup db-up db-down db-logs db-reset migrate run-api run-frontend build-api build-frontend build ci clean status verify verify-api token

help: ## Show available targets
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-16s %s\n", $$1, $$2}'

check-deps: ## Verify Docker, .NET, Node.js, and npm are installed
	./scripts/check-deps.sh

install: install-ef ## Install npm packages, restore .NET dependencies, and ensure dotnet-ef is available
	cd front-end && npm install
	cd UserManagementAPI && dotnet restore

install-ef: ## Install the dotnet-ef global tool if it is not already present
	@if dotnet tool list -g 2>/dev/null | grep -q 'dotnet-ef'; then \
		echo "OK: dotnet-ef already installed"; \
	else \
		echo "Installing dotnet-ef global tool..."; \
		dotnet tool install --global dotnet-ef; \
	fi

setup: db-up migrate ## Start the database and apply migrations (first-time setup)

db-up: ## Start the SQL Server container (docker compose up -d)
	docker compose up -d

db-down: ## Stop the SQL Server container
	docker compose down

db-logs: ## Follow SQL Server container logs (useful when migrations fail)
	docker compose logs -f db

db-reset: ## Wipe the database volume and re-apply migrations
	docker compose down -v
	$(MAKE) setup

run-api: ## Run the ASP.NET Core API (blocks; http://localhost:5000)
	cd UserManagementAPI/UserManagement.API && dotnet run

run-frontend: ## Run the Angular dev server (blocks; http://localhost:4200)
	cd front-end && npm start

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

ci: ## Run the same build steps as GitHub Actions CI (no database required)
	cd UserManagementAPI && dotnet restore && dotnet build --no-restore
	cd front-end && npm ci && npm run build

clean: ## Remove build artifacts (dotnet bin/obj and front-end dist)
	cd UserManagementAPI && dotnet clean
	rm -rf front-end/dist

status: ## Show whether database, API, and front end are running
	./scripts/status.sh

verify: ## Run full stack smoke checks (database, API, front end)
	./scripts/verify-stack.sh

verify-api: ## Run API-only smoke checks (set SKIP_FRONTEND=1)
	SKIP_FRONTEND=1 ./scripts/verify-stack.sh

token: ## Print a JWT from the local API (for curl or manual testing)
	./scripts/get-token.sh
